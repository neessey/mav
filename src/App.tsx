import React, { useState, useEffect } from 'react';
import { PageView } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { SearchModal } from './components/SearchModal';
import { QuickCartDrawer } from './components/QuickCartDrawer';
import { PWAInstallBanner } from './components/PWAInstallBanner';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AboutPage } from './pages/AboutPage';
import { CampaignPage } from './pages/CampaignPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [selectedProductId, setSelectedProductId] = useState<string>('mav-knit-01');
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync with window path and hash for realistic routing and push notification deep links
  useEffect(() => {
    const handleRouting = () => {
      const path = window.location.pathname;
      const hash = window.location.hash.replace('#', '');

      if (path.startsWith('/admin/orders/') || hash.startsWith('admin/orders/')) {
        const oId = path.startsWith('/admin/orders/')
          ? path.replace('/admin/orders/', '')
          : hash.replace('admin/orders/', '');
        setSelectedOrderId(oId);
        setCurrentPage('admin');
      } else if (path === '/admin' || path === '/admin/orders' || hash === 'admin' || hash === 'admin/orders') {
        setCurrentPage('admin');
      } else if (hash.startsWith('product/')) {
        const pId = hash.replace('product/', '');
        setSelectedProductId(pId);
        setCurrentPage('product');
      } else if (hash.startsWith('shop/')) {
        const cat = hash.replace('shop/', '');
        setCategoryFilter(cat);
        setCurrentPage('shop');
      } else if (['shop', 'collections', 'about', 'campaign', 'admin'].includes(hash)) {
        setCurrentPage(hash as PageView);
      } else if (!hash || hash === '/' || hash === 'home') {
        setCurrentPage('home');
      }
    };

    handleRouting();
    window.addEventListener('hashchange', handleRouting);
    window.addEventListener('popstate', handleRouting);
    return () => {
      window.removeEventListener('hashchange', handleRouting);
      window.removeEventListener('popstate', handleRouting);
    };
  }, []);

  const handleNavigate = (page: PageView, productId?: string, catFilter?: string) => {
    setCurrentPage(page);
    if (productId) {
      setSelectedProductId(productId);
      window.location.hash = `product/${productId}`;
    } else if (catFilter) {
      setCategoryFilter(catFilter);
      window.location.hash = `shop/${catFilter}`;
    } else {
      window.location.hash = page === 'home' ? '' : page;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (productId: string) => {
    handleNavigate('product', productId);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F2F2F0] flex flex-col font-sans selection:bg-white selection:text-black">
      
      {/* Global Header (Navbar) */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Page View Content */}
      <main className="flex-1 w-full flex flex-col">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'shop' && (
          <ShopPage
            initialCategory={categoryFilter}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'collections' && (
          <CollectionsPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'product' && (
          <ProductDetailPage
            productId={selectedProductId}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'campaign' && (
          <CampaignPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'admin' && (
          <AdminPage onNavigate={handleNavigate} initialOrderId={selectedOrderId} />
        )}
      </main>

      {/* Global Footer - Excluded on Admin Dashboard as requested */}
      {currentPage !== 'admin' && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* WhatsApp Floating Trigger & Modal */}
      {currentPage !== 'admin' && (
        <WhatsAppFloat onNavigate={handleNavigate} />
      )}

      {/* Search Overlay Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
        onNavigate={handleNavigate}
      />

      {/* Slide-over Cart / WhatsApp Batch Order Drawer */}
      <QuickCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* PWA Mobile Installation Prompt Banner */}
      <PWAInstallBanner />

    </div>
  );
}
