import React, { useState, useEffect } from 'react';
import {
  PageView,
  Product,
  Collection,
  PushNotification,
  ProductCategory,
  ProductStatus,
  Order,
  OrderStatus
} from '../types';
import { useStore } from '../services/store';
import { PushNotificationService } from '../services/pushNotificationService';
import { ProductImageUploader } from '../components/private/ProductImageUploader';
import type { CloudinaryImage } from '../services/cloudinary';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Settings as SettingsIcon,
  Bell,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Check,
  Eye,
  ExternalLink,
  Phone,
  RefreshCw,
  Send,
  Lock,
  Sparkles,
  Database,
  MessageCircle,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  Search,
  Filter,
  Smartphone,
  TrendingUp,
  ChevronRight,
  Menu,
  X,
  User,
  ArrowUpRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminPageProps {
  onNavigate: (page: PageView, productId?: string) => void;
  initialOrderId?: string;
}

type AdminTab = 'dashboard' | 'orders' | 'products' | 'collections' | 'homepage' | 'notifications' | 'database';

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate, initialOrderId }) => {
  const {
    products,
    collections,
    settings,
    orders,
    notifications,
    adminAuth,
    saveProduct,
    deleteProduct,
    saveCollection,
    deleteCollection,
    setSettings,
    addNotification,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    setAdminAuth,
    resetDefaults
  } = useStore();

  // Auth local state
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Sidebar toggle state (mobile / responsive)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Admin current tab
  const [currentTab, setCurrentTab] = useState<AdminTab>(initialOrderId ? 'orders' : 'dashboard');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(
    initialOrderId ? orders.find(o => o.id === initialOrderId) || null : null
  );

const [productImages, setProductImages] =
  useState<CloudinaryImage[]>([]);

  // Orders filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Product editing state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  // Collection editing state
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);

  // Settings form local state
  const [settingsForm, setSettingsForm] = useState(settings);

  // Notification form state
  const [notifTitle, setNotifTitle] = useState('NOUVEAU DROP MARASSEURAVIE 🔥');
  const [notifMessage, setNotifMessage] = useState('Nouvelle capsule streetwear disponible en quantité limitée.');
  const [notifImage, setNotifImage] = useState(products[0]?.images[0] || '');
  const [notifUrl, setNotifUrl] = useState('/shop');
  const [notifSentToast, setNotifSentToast] = useState(false);

  // Push Subscription Status
  const [pushStatus, setPushStatus] = useState<{
    isSupported: boolean;
    permission: NotificationPermission;
    isSubscribed: boolean;
  }>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false
  });
  const [isSubscribingPush, setIsSubscribingPush] = useState(false);
  const [pushFeedback, setPushFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Check push support
    const checkPush = async () => {
      const status = await PushNotificationService.getSubscriptionStatus();
      setPushStatus(status);
    };
    checkPush();
  }, []);

  useEffect(() => {
    if (initialOrderId) {
      const found = orders.find(o => o.id === initialOrderId);
      if (found) {
        setSelectedOrder(found);
        setCurrentTab('orders');
      }
    }
  }, [initialOrderId, orders]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin' || passwordInput === 'marasseuravie2025' || passwordInput === 'mav2025') {
      setAdminAuth({ isAuthenticated: true, email: emailInput || 'admin@marasseuravie.com' });
      setAuthError('');
      confetti({ particleCount: 40, spread: 50 });
    } else {
      setAuthError('Mot de passe incorrect. (Indice: marasseuravie2025 ou admin)');
    }
  };

  const handleLogout = () => {
    setAdminAuth({ isAuthenticated: false, email: '' });
    onNavigate('home');
  };

  const handleSubscribePush = async () => {
    setIsSubscribingPush(true);
    setPushFeedback(null);
    try {
      const res = await PushNotificationService.subscribeAdminDevice();
      const status = await PushNotificationService.getSubscriptionStatus();
      setPushStatus(status);
      if (res.success) {
        setPushFeedback('✅ Notifications push activées avec succès sur cet appareil !');
        confetti({ particleCount: 60, spread: 70 });
      } else {
        setPushFeedback(`⚠️ ${res.message || 'Erreur lors de l\'activation'}`);
      }
    } catch (err: any) {
      setPushFeedback(`❌ ${err.message || 'Échec d\'activation'}`);
    } finally {
      setIsSubscribingPush(false);
    }
  };


  const handleCreateNewProduct = () => {
    setEditingProduct({
      id: `mav-custom-${Date.now()}`,
      name: 'Nouveau Produit MARASSEURAVIE',
      slug: `produit-${Date.now()}`,
      subtitle: 'Édition 2025',
      description: 'Description de la nouvelle pièce de luxe streetwear...',
      price: 35000,
      category: 'tricots',
      images: [products[0]?.images[0] || ''],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'Noir Profond', hex: '#000000' }],
      stock: 10,
      status: 'available',
      badge: 'NEW',
      featured: true,
      isNewDrop: true,
      composition: '100% Coton Peigné 520 GSM',
      care: 'Lavage délicat 30°C.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsCreatingProduct(true);
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      saveProduct(editingProduct);
      setEditingProduct(null);
      setIsCreatingProduct(false);
    }
  };

  const handleCreateNewCollection = () => {
    setEditingCollection({
      id: `col-custom-${Date.now()}`,
      name: 'NOUVELLE CAPSULE',
      slug: `capsule-${Date.now()}`,
      description: 'Description de la capsule...',
      image: collections[0]?.image || '',
      productIds: [],
      status: 'active',
      season: '2025 / CAPSULE',
      itemCount: 0
    });
    setIsCreatingCollection(true);
  };

  const handleSaveCollectionForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCollection) {
      saveCollection(editingCollection);
      setEditingCollection(null);
      setIsCreatingCollection(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(settingsForm);
    alert('Paramètres de la marque mis à jour avec succès !');
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    addNotification({
      title: notifTitle,
      message: notifMessage,
      imageUrl: notifImage || undefined,
      actionUrl: notifUrl || undefined,
      sent: true,
      badge: 'BROADCAST'
    });

    await PushNotificationService.sendBroadcast(notifTitle, notifMessage, notifImage, notifUrl);

    setNotifSentToast(true);
    setTimeout(() => setNotifSentToast(false), 3000);
    confetti({ particleCount: 50, spread: 60 });
  };

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = orderStatusFilter === 'ALL' || order.status === orderStatusFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      (order.customerName && order.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase())) ||
      (order.customerPhone && order.customerPhone.includes(orderSearchQuery)) ||
      (order.customerCity && order.customerCity.toLowerCase().includes(orderSearchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const newOrdersCount = orders.filter(o => o.status === 'NEW').length;
  const confirmedOrdersCount = orders.filter(o => o.status === 'CONFIRMED' || o.status === 'PAID').length;
  const totalRevenue = orders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // If not authenticated, render login screen
  if (!adminAuth.isAuthenticated) {
    return (
      <div id="admin-login-screen" className="min-h-[85vh] flex items-center justify-center bg-[#050505] p-4 text-white">
        <div className="w-full max-w-md bg-[#0D0D0D] border border-white/20 p-8 sm:p-10 shadow-2xl flex flex-col gap-6">
          <div className="flex flex-col items-center text-center gap-3">
<img
              src="/assets/logo.png"
              alt="MARASSEURAVIE Logo"
              className="w-16 h-16 object-contain"
            />
            <h1 className="font-display  text-xl uppercase tracking-widest text-white mt-2">
              PORTAIL PRIVÉ MARASSEURAVIE
            </h1>
            <p className="text-xs text-neutral-400 font-mono-brand">
              Accès réservé à la direction & administration de la marque
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono-brand uppercase text-neutral-400">
                Email 
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="admin@marasseuravie.com"
                className="bg-black border border-neutral-800 text-white text-xs p-3 font-mono-brand focus:border-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono-brand uppercase text-neutral-400">
                Mot de passe sécurisé
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-black border border-neutral-800 text-white text-xs p-3 font-mono-brand focus:border-white focus:outline-none"
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-mono-brand">
                {authError}
              </div>
            )}

            <button
              id="admin-login-submit"
              type="submit"
              className="mt-2 w-full bg-white text-black font-display  text-xs uppercase tracking-widest py-3.5 hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>DÉVERROUILLER L'ACCÈS</span>
            </button>
          </form>

          <div className="border-t border-neutral-900 pt-4 text-center">
            <span className="text-[10px] font-mono-brand text-neutral-500">
              MARASSEURAVIE  • 2025 • SYSTÈME SÉCURISÉ
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Sidebar navigation menu items grouped logically
  const navigationGroups: NavGroup[] = [
    {
      title: 'VUE D\'ENSEMBLE',
      items: [
        {
          id: 'dashboard' as AdminTab,
          label: 'Tableau de bord',
          icon: LayoutDashboard,
        },
        {
          id: 'orders' as AdminTab,
          label: 'Commandes WhatsApp',
          icon: ShoppingBag,
          badge: newOrdersCount > 0 ? `${newOrdersCount} NEW` : `${orders.length}`,
          badgeColor: newOrdersCount > 0 ? 'bg-emerald-500 text-black font-black animate-pulse' : undefined
        }
      ]
    },
    {
      title: 'CATALOGUE & STOCK',
      items: [
        {
          id: 'products' as AdminTab,
          label: 'Gestion Produits',
          icon: Package,
          badge: `${products.length}`
        },
        {
          id: 'collections' as AdminTab,
          label: 'Collections & Capsules',
          icon: Layers,
          badge: `${collections.length}`
        }
      ]
    },
    {
      title: 'COMMUNICATION',
      items: [
        {
          id: 'notifications' as AdminTab,
          label: 'Notifications Push',
          icon: Bell,
          badge: pushStatus.isSubscribed ? 'ACTIF' : 'CONFIG'
        }
      ]
    },
    {
      title: 'CONFIGURATION',
      items: [
        {
          id: 'homepage' as AdminTab,
          label: 'Textes & Homepage',
          icon: SettingsIcon
        },
        {
          id: 'database' as AdminTab,
          label: 'Base de données',
          icon: Database
        }
      ]
    }
  ];

  return (
    <div id="admin-portal" className="min-h-screen bg-[#050505] text-white flex">
      
      {/* 1. STANDARD SIDEBAR (Desktop Fixed / Mobile Drawer) */}
      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A0A0A] border-r border-neutral-900 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
<img src="/assets/logo.png" alt="Logo MARASSEURAVIE" className="w-8 h-8 object-cover rounded-sm" />
            <div className="flex flex-col">
              <span className="font-display  text-sm tracking-widest text-white uppercase">
                MARASSEURAVIE
              </span>
              <span className="text-[9px] font-mono-brand text-neutral-400 tracking-wider">
                ADMIN BACK-OFFICE
              </span>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-neutral-400 hover:text-white"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-none">
          {navigationGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <span className="text-[9px] font-mono-brand tracking-[0.25em] text-neutral-500 uppercase px-3 font-semibold">
                {group.title}
              </span>
              <div className="space-y-1">
                {group.items.map(tab => {
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      id={`sidebar-tab-${tab.id}`}
                      onClick={() => {
                        setCurrentTab(tab.id);
                        setEditingProduct(null);
                        setEditingCollection(null);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-mono-brand uppercase tracking-wider transition-all ${
                        isActive
                          ? 'bg-white text-black font-bold shadow-md'
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge !== undefined && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono-brand font-bold ${
                            tab.badgeColor || (isActive ? 'bg-black text-white' : 'bg-neutral-800 text-neutral-300')
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar User & Logout Footer */}
        <div className="p-4 border-t border-neutral-900 bg-[#080808]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-xs font-bold text-white">
                <User className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold font-mono-brand text-white truncate max-w-[110px]">
                  {adminAuth.email?.split('@')[0] || 'Admin'}
                </span>
                <span className="text-[9px] font-mono-brand text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Connecté
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-900 rounded transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onNavigate('home')}
            className="w-full flex items-center justify-center gap-2 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-[10px] font-mono-brand uppercase tracking-wider rounded transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Voir la boutique</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* 2. MAIN DASHBOARD CONTENT AREA */}
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-neutral-900 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-neutral-300 hover:text-white rounded hover:bg-neutral-900"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-mono-brand text-neutral-400">
              <span>Admin</span>
              <ChevronRight className="w-3 h-3 text-neutral-600" />
              <span className="text-white font-bold uppercase">
                {navigationGroups.flatMap(g => g.items).find(i => i.id === currentTab)?.label || currentTab}
              </span>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-3">
            {/* Direct WhatsApp Concierge Shortcut */}
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/50 text-xs font-mono-brand rounded transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Direct</span>
            </a>

          
          </div>
        </header>

        {/* Dashboard Main Workspace */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {currentTab === 'dashboard' && (
            <div className="space-y-8">
              
              {/* Dashboard Welcome Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display  text-3xl sm:text-4xl text-white uppercase tracking-tight">
                    TABLEAU DE BORD
                  </h1>
                  <p className="text-xs font-mono-brand text-neutral-400 mt-1">
                    Vue d'ensemble en temps réel de l'activité, des commandes WhatsApp et des stocks MARASSEURAVIE.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCreateNewProduct}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-black font-display  text-xs uppercase tracking-wider rounded hover:bg-neutral-200 transition-colors shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nouveau Produit</span>
                  </button>
                </div>
              </div>

              {/* 4 Standard KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                
                {/* KPI 1: Chiffre d'affaires */}
                <div className="p-5 bg-[#0D0D0D] border border-neutral-800 rounded-sm flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono-brand uppercase tracking-widest text-neutral-400">
                      CHIFFRE D'AFFAIRES
                    </span>
                    <div className="p-2 bg-neutral-900 border border-neutral-800 rounded">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <span className="font-display  text-2xl sm:text-3xl text-white">
                      {totalRevenue.toLocaleString('fr-FR')} {settings.currency}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono-brand text-emerald-400 mt-1">
                      <span>+18.4% ce mois</span>
                      <span className="text-neutral-500">• {orders.length} commandes</span>
                    </div>
                  </div>
                </div>

                {/* KPI 2: Commandes en attente */}
                <div
                  onClick={() => setCurrentTab('orders')}
                  className="p-5 bg-[#0D0D0D] border border-neutral-800 hover:border-emerald-500/60 rounded-sm flex flex-col justify-between gap-4 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono-brand uppercase tracking-widest text-neutral-400">
                      NOUVELLES COMMANDES
                    </span>
                    <div className="p-2 bg-emerald-950/40 border border-emerald-800/40 rounded">
                      <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display  text-2xl sm:text-3xl text-white">
                        {newOrdersCount}
                      </span>
                      <span className="text-xs font-mono-brand text-neutral-400">
                        / {orders.length} au total
                      </span>
                    </div>
                    <span className="text-[10px] font-mono-brand text-emerald-400 mt-1 block group-hover:underline">
                      {newOrdersCount > 0 ? '● À traiter sur WhatsApp →' : 'Toutes traitées ✓'}
                    </span>
                  </div>
                </div>

                {/* KPI 3: Catalogue & Pièces */}
                <div
                  onClick={() => setCurrentTab('products')}
                  className="p-5 bg-[#0D0D0D] border border-neutral-800 hover:border-neutral-600 rounded-sm flex flex-col justify-between gap-4 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono-brand uppercase tracking-widest text-neutral-400">
                      CATALOGUE & STOCK
                    </span>
                    <div className="p-2 bg-neutral-900 border border-neutral-800 rounded">
                      <Package className="w-4 h-4 text-neutral-300" />
                    </div>
                  </div>
                  <div>
                    <span className="font-display  text-2xl sm:text-3xl text-white">
                      {products.length} Pièces
                    </span>
                    <span className="text-[10px] font-mono-brand text-neutral-400 mt-1 block">
                      {collections.length} Capsules actives
                    </span>
                  </div>
                </div>

                {/* KPI 4: Push Notifications & PWA */}
                <div
                  onClick={() => setCurrentTab('notifications')}
                  className="p-5 bg-[#0D0D0D] border border-neutral-800 hover:border-neutral-600 rounded-sm flex flex-col justify-between gap-4 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono-brand uppercase tracking-widest text-neutral-400">
                      PUSH NOTIFICATIONS
                    </span>
                    <div className="p-2 bg-neutral-900 border border-neutral-800 rounded">
                      <Bell className="w-4 h-4 text-neutral-300" />
                    </div>
                  </div>
                  <div>
                    <span className="font-display  text-2xl sm:text-3xl text-white">
                      {pushStatus.isSubscribed ? 'ACTIF' : 'CONFIG'}
                    </span>
                    <span className={`text-[10px] font-mono-brand mt-1 block ${pushStatus.isSubscribed ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {pushStatus.isSubscribed ? '● Service Worker prêt' : '○ Cliquez pour activer'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Main 2-Column Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left: Recent WhatsApp Orders (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display  text-lg uppercase tracking-wider text-white">
                      DERNIÈRES COMMANDES WHATSAPP
                    </h2>
                    <button
                      onClick={() => setCurrentTab('orders')}
                      className="text-xs font-mono-brand uppercase text-neutral-400 hover:text-white flex items-center gap-1"
                    >
                      <span>Voir tout ({orders.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="bg-[#0D0D0D] border border-neutral-800 divide-y divide-neutral-900 rounded-sm overflow-hidden">
                    {orders.slice(0, 5).map(order => (
                      <div
                        key={order.id}
                        onClick={() => {
                          setSelectedOrder(order);
                          setCurrentTab('orders');
                        }}
                        className="p-4 hover:bg-white/5 cursor-pointer transition-colors flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-14 bg-black border border-neutral-800 shrink-0 overflow-hidden rounded-xs">
                            {order.items[0]?.image && (
                              <img
                                src={order.items[0].image}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-mono-brand font-black text-sm text-white">
                                {order.id}
                              </span>
                              <span
                                className={`text-[9px] font-mono-brand uppercase px-2 py-0.5 rounded font-bold ${
                                  order.status === 'NEW'
                                    ? 'bg-emerald-500 text-black animate-pulse'
                                    : order.status === 'CONFIRMED' || order.status === 'PAID'
                                    ? 'bg-white text-black'
                                    : 'bg-neutral-800 text-neutral-300'
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>
                            <span className="text-xs text-neutral-300 font-sans mt-0.5 line-clamp-1">
                              {order.items.map(i => `${i.name} (${i.size}) × ${i.quantity}`).join(', ')}
                            </span>
                            <span className="text-[10px] font-mono-brand text-neutral-500">
                              {order.customerName || 'Client MAV'} • {order.customerCity || 'Abidjan'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end">
                          <span className="font-mono-brand font-bold text-sm text-white">
                            {order.totalAmount.toLocaleString('fr-FR')} {settings.currency}
                          </span>
                          <span className="text-[10px] font-mono-brand text-neutral-500">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Quick Tools & Inventory Breakdown (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Category Stock Distribution */}
                  <div className="p-5 bg-[#0D0D0D] border border-neutral-800 rounded-sm space-y-4">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-white">
                      RÉPARTITION DU CATALOGUE
                    </h3>
                    <div className="space-y-3 text-xs font-mono-brand">
                      {['tricots', 'survetements', 'hoodies', 'tshirts', 'accessoires'].map(cat => {
                        const count = products.filter(p => p.category === cat).length;
                        const pct = Math.round((count / (products.length || 1)) * 100);
                        return (
                          <div key={cat} className="space-y-1">
                            <div className="flex justify-between text-neutral-300 uppercase">
                              <span>{cat}</span>
                              <span className="text-white font-bold">{count} pièces ({pct}%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-white transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Push Notifications Quick Box */}
                  <div className="p-5 bg-[#0D0D0D] border border-neutral-800 rounded-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm uppercase tracking-wider text-white">
                        ALERTE PUSH WHATSAPP
                      </span>
                      <Bell className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-xs font-mono-brand text-neutral-400">
                      Chaque nouvelle commande sur le site déclenche un push W3C/FCM instantané sur votre téléphone.
                    </p>
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={handleSubscribePush}
                        disabled={isSubscribingPush}
                        className="flex-1 py-2 bg-white text-black text-xs font-mono-brand font-bold uppercase rounded hover:bg-neutral-200 transition-colors"
                      >
                        {pushStatus.isSubscribed ? 'Vérifier l\'abonnement' : 'Activer sur cet appareil'}
                      </button>
                    </div>
                    {pushFeedback && (
                      <p className="text-[11px] font-mono-brand text-emerald-400 mt-2">
                        {pushFeedback}
                      </p>
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
         {currentTab === 'orders' && (
  <div className="space-y-4 md:space-y-6">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-neutral-900 pb-3 sm:pb-4">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl text-white uppercase tracking-tight flex items-center gap-2 sm:gap-3 flex-wrap">
          <span>COMMANDES WHATSAPP</span>
          <span className="text-xs font-mono-brand bg-white text-black px-2 py-0.5 font-bold rounded">
            {orders.length}
          </span>
        </h1>
        <p className="text-[10px] sm:text-xs text-neutral-400 font-mono-brand mt-1">
          Enregistrées automatiquement avant la redirection WhatsApp avec identifiant unique
        </p>
      </div>

      
    </div>

    {/* Status Filter Bar & Search */}
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center">
      <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-wrap sm:flex-nowrap">
        {['ALL', 'NEW', 'CONTACTED', 'CONFIRMED', 'PAID', 'PREPARING', 'DELIVERED', 'CANCELLED'].map(
          st => (
            <button
              key={st}
              onClick={() => setOrderStatusFilter(st)}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[9px] sm:text-xs font-mono-brand uppercase tracking-wider border rounded-xs transition-all whitespace-nowrap ${
                orderStatusFilter === st
                  ? 'bg-white text-black border-white font-bold'
                  : 'bg-black text-neutral-400 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {st === 'ALL' ? 'Toutes' : st}
              {st === 'NEW' && newOrdersCount > 0 && ` (${newOrdersCount})`}
            </button>
          )
        )}
      </div>

      <div className="relative w-full sm:w-64 md:w-72">
        <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5 absolute left-2.5 sm:left-3 top-2.5 sm:top-3 text-neutral-500" />
        <input
          type="text"
          value={orderSearchQuery}
          onChange={(e) => setOrderSearchQuery(e.target.value)}
          placeholder="Chercher ID, client, ville..."
          className="w-full bg-black border border-neutral-800 pl-7 sm:pl-9 pr-2.5 sm:pr-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-mono-brand text-white placeholder:text-neutral-600 focus:border-white focus:outline-none rounded-xs"
        />
      </div>
    </div>

    {/* Orders Split Layout */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8 items-start">
      
      {/* Orders List (7 cols) */}
      <div className="lg:col-span-7 space-y-2 md:space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-8 sm:p-12 text-center bg-[#0D0D0D] border border-neutral-800 text-neutral-500 font-mono-brand text-[10px] sm:text-xs">
            Aucune commande ne correspond aux critères.
          </div>
        ) : (
          filteredOrders.map(order => {
            const isSelected = selectedOrder?.id === order.id;
            return (
              <div
                key={order.id}
                id={`order-row-${order.id}`}
                onClick={() => setSelectedOrder(order)}
                className={`p-3 sm:p-4 md:p-5 bg-[#0D0D0D] border transition-all cursor-pointer flex flex-col gap-2 sm:gap-3 rounded-sm ${
                  isSelected
                    ? 'border-white ring-1 ring-white bg-[#141414]'
                    : 'border-neutral-800 hover:border-neutral-600'
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="font-mono-brand font-black text-xs sm:text-sm text-white break-all">
                      {order.id}
                    </span>
                    <span
                      className={`text-[8px] sm:text-[9px] font-mono-brand uppercase px-1.5 sm:px-2 py-0.5 rounded font-bold ${
                        order.status === 'NEW'
                          ? 'bg-emerald-500 text-black animate-pulse'
                          : order.status === 'CONFIRMED' || order.status === 'PAID'
                          ? 'bg-white text-black'
                          : order.status === 'DELIVERED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <span className="font-mono-brand font-bold text-xs sm:text-sm text-white whitespace-nowrap">
                    {order.totalAmount.toLocaleString('fr-FR')} {settings.currency}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-12 sm:w-12 sm:h-14 bg-black border border-neutral-800 shrink-0 overflow-hidden rounded-xs">
                    {order.items[0]?.image && (
                      <img
                        src={order.items[0].image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider truncate">
                      {order.items.map(i => `${i.name} (${i.size}) × ${i.quantity}`).join(' • ')}
                    </span>
                    <span className="text-[9px] sm:text-[11px] font-mono-brand text-neutral-400 mt-0.5 truncate">
                      {order.customerName || 'Client MAV'} • {order.customerCity || 'Abidjan'}
                    </span>
                    <span className="text-[8px] sm:text-[10px] font-mono-brand text-neutral-500">
                      {new Date(order.createdAt).toLocaleString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Single Order Inspector (5 cols) - Mobile: becomes bottom section */}
      <div className="lg:col-span-5 bg-[#0D0D0D] border border-neutral-800 p-4 sm:p-5 md:p-6 flex flex-col gap-4 sm:gap-5 md:gap-6 lg:sticky lg:top-24 rounded-sm order-first lg:order-last">
        {selectedOrder ? (
          <>
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 sm:pb-4 gap-2">
              <div className="min-w-0">
                <span className="text-[8px] sm:text-[10px] font-mono-brand uppercase tracking-widest text-neutral-500">
                  DÉTAIL DE LA COMMANDE
                </span>
                <h3 className="font-display text-lg sm:text-xl text-white uppercase mt-0.5 truncate">
                  {selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Supprimer la commande ${selectedOrder.id} ?`)) {
                    deleteOrder(selectedOrder.id);
                    setSelectedOrder(null);
                  }
                }}
                className="text-neutral-500 hover:text-red-400 p-1 shrink-0"
                title="Supprimer"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Items */}
            <div className="space-y-2 sm:space-y-3">
              <span className="text-[8px] sm:text-[10px] font-mono-brand uppercase tracking-widest text-neutral-400 block">
                ARTICLES COMMANDÉS
              </span>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 sm:p-3 bg-black border border-neutral-800 gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    {item.image && (
                      <img src={item.image} alt="" className="w-8 h-10 sm:w-10 sm:h-12 object-cover border border-neutral-800 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <span className="font-bold text-[10px] sm:text-xs text-white block uppercase truncate">{item.name}</span>
                      <span className="text-[8px] sm:text-[10px] font-mono-brand text-neutral-400 truncate block">
                        Taille: {item.size} • Couleur: {item.color} • Qté: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono-brand text-[10px] sm:text-xs font-bold text-white whitespace-nowrap">
                    {item.total.toLocaleString('fr-FR')} {settings.currency}
                  </span>
                </div>
              ))}
            </div>

            {/* Customer Info */}
            <div className="p-3 sm:p-4 bg-black border border-neutral-800 space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs font-mono-brand">
              <div className="flex justify-between gap-2">
                <span className="text-neutral-500 shrink-0">Client:</span>
                <span className="text-white font-bold text-right truncate">{selectedOrder.customerName || 'Non renseigné'}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-neutral-500 shrink-0">Téléphone:</span>
                <span className="text-white text-right truncate">{selectedOrder.customerPhone || 'Via WhatsApp'}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-neutral-500 shrink-0">Ville / Adresse:</span>
                <span className="text-white text-right truncate">{selectedOrder.customerCity || 'Abidjan'}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-800 pt-1.5 sm:pt-2 gap-2">
                <span className="text-neutral-400 font-bold shrink-0">TOTAL COMMANDE:</span>
                <span className="text-white font-black text-xs sm:text-sm text-right">
                  {selectedOrder.totalAmount.toLocaleString('fr-FR')} {settings.currency}
                </span>
              </div>
            </div>

            {/* Status Selector */}
            <div className="space-y-1.5 sm:space-y-2">
              <span className="text-[8px] sm:text-[10px] font-mono-brand uppercase tracking-widest text-neutral-400 block">
                CHANGER LE STATUT
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-1.5 sm:gap-2">
                {(['NEW', 'CONTACTED', 'CONFIRMED', 'PAID', 'PREPARING', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map(st => (
                  <button
                    key={st}
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, st);
                      setSelectedOrder({ ...selectedOrder, status: st });
                    }}
                    className={`py-1.5 sm:py-2 text-[8px] sm:text-[10px] font-mono-brand uppercase tracking-wider border rounded-xs transition-colors ${
                      selectedOrder.status === st
                        ? 'bg-white text-black font-bold border-white'
                        : 'bg-black text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* WhatsApp Direct Action */}
            <a
              href={selectedOrder.whatsappUrl || `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 sm:py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-display text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2 rounded transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Ouvrir dans WhatsApp</span>
            </a>
          </>
        ) : (
          <div className="py-12 sm:py-20 text-center text-[10px] sm:text-xs font-mono-brand text-neutral-500">
            Sélectionnez une commande dans la liste pour voir ses détails et agir.
          </div>
        )}
      </div>

    </div>
  </div>
)}

          {/* TAB 3: PRODUCTS MANAGEMENT */}
          {currentTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-4">
                <div>
                  <h1 className="font-display  text-3xl text-white uppercase tracking-tight">
                    GESTION DES PRODUITS ({products.length})
                  </h1>
                  <p className="text-xs text-neutral-400 font-mono-brand mt-1">
                    Ajoutez, modifiez et ajustez les prix et stocks des pièces MARASSEURAVIE
                  </p>
                </div>

                <button
                  onClick={handleCreateNewProduct}
                  className="px-4 py-2.5 bg-white text-black font-display  text-xs uppercase tracking-wider rounded hover:bg-neutral-200 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une pièce</span>
                </button>
              </div>

              {/* Products Table/Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => (
                  <div key={p.id} className="p-4 bg-[#0D0D0D] border border-neutral-800 flex flex-col justify-between gap-4 rounded-sm">
                    <div className="flex gap-4">
                      <div className="w-20 h-24 bg-black border border-neutral-800 shrink-0 overflow-hidden">
                        <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono-brand uppercase px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-400">
                            {p.category}
                          </span>
                          {p.badge && (
                            <span className="text-[9px] font-mono-brand uppercase px-1.5 py-0.5 bg-white text-black font-bold">
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="font-display  text-base text-white uppercase mt-1">
                          {p.name}
                        </h3>
                        <span className="font-mono-brand font-bold text-sm text-neutral-300 mt-1">
                          {p.price.toLocaleString('fr-FR')} {settings.currency}
                        </span>
                        <span className="text-[10px] font-mono-brand text-neutral-500 mt-0.5">
                          Stock: {p.stock} unités • Tailles: {p.sizes.join(', ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-neutral-800 pt-3">
                      <button
                        onClick={() => {
                          setEditingProduct({ ...p });
                          setIsCreatingProduct(false);
                        }}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-xs font-mono-brand text-white border border-neutral-800 rounded flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer le produit ${p.name} ?`)) {
                            deleteProduct(p.id);
                          }
                        }}
                        className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-900 rounded"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: COLLECTIONS MANAGEMENT */}
          {currentTab === 'collections' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-4">
                <div>
                  <h1 className="font-display  text-3xl text-white uppercase tracking-tight">
                    COLLECTIONS & CAPSULES ({collections.length})
                  </h1>
                  <p className="text-xs text-neutral-400 font-mono-brand mt-1">
                    Gestion des archives, drops et saisons de la marque
                  </p>
                </div>

                <button
                  onClick={handleCreateNewCollection}
                  className="px-4 py-2.5 bg-white text-black font-display  text-xs uppercase tracking-wider rounded hover:bg-neutral-200 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouvelle Capsule</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {collections.map(col => (
                  <div key={col.id} className="p-4 bg-[#0D0D0D] border border-neutral-800 flex flex-col justify-between gap-4 rounded-sm">
                    <div className="aspect-[16/9] bg-black border border-neutral-800 overflow-hidden">
                      <img src={col.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono-brand uppercase text-neutral-400">{col.season}</span>
                      <h3 className="font-display  text-lg text-white uppercase mt-0.5">{col.name}</h3>
                      <p className="text-xs text-neutral-400 font-sans mt-1 line-clamp-2">{col.description}</p>
                    </div>
                    <div className="flex items-center justify-end gap-2 border-t border-neutral-800 pt-3">
                      <button
                        onClick={() => {
                          setEditingCollection({ ...col });
                          setIsCreatingCollection(false);
                        }}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-xs font-mono-brand text-white border border-neutral-800 rounded flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3 h-3" /> 
                        <span>Modifier</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: NOTIFICATIONS PUSH */}
          {currentTab === 'notifications' && (
            <div className="space-y-6">
              <div className="border-b border-neutral-900 pb-4">
                <h1 className="font-display  text-3xl text-white uppercase tracking-tight">
                  NOTIFICATIONS PUSH 
                </h1>
                <p className="text-xs text-neutral-400 font-mono-brand mt-1">
                  Système  de notifications push en arrière-plan pour les commandes et les nouveaux drops
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Push Subscription & Broadcast Form (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Real subscription status card */}
                  <div className="p-6 bg-[#0D0D0D] border border-neutral-800 rounded-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display  text-base text-white uppercase">
                          STATUT DU TERMINAL ADMINISTRATEUR
                        </h3>
                        <span className="text-xs font-mono-brand text-neutral-400">
                          Recevoir les alertes de commandes instantanément sur ce navigateur / téléphone
                        </span>
                      </div>
                      <span className={`text-xs font-mono-brand font-bold px-2.5 py-1 rounded ${pushStatus.isSubscribed ? 'bg-emerald-500 text-black' : 'bg-amber-500 text-black'}`}>
                        {pushStatus.isSubscribed ? 'ACTIF' : 'INACTIF'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        onClick={handleSubscribePush}
                        disabled={isSubscribingPush}
                        className="px-4 py-2.5 bg-white text-black font-display  text-xs uppercase tracking-wider rounded hover:bg-neutral-200 transition-colors flex items-center gap-2"
                      >
                        <Bell className="w-4 h-4" />
                        <span>{pushStatus.isSubscribed ? 'Mettre à jour la souscription' : 'Activer les notifications push'}</span>
                      </button>

                    </div>

                    {pushFeedback && (
                      <div className="p-3 bg-black border border-neutral-800 text-xs font-mono-brand text-emerald-400">
                        {pushFeedback}
                      </div>
                    )}
                  </div>

                  {/* Broadcast New Drop Form */}
                  <form onSubmit={handleSendNotification} className="p-6 bg-[#0D0D0D] border border-neutral-800 rounded-sm space-y-4">
                    <h3 className="font-display  text-base text-white uppercase">
                      DIFFUSER UNE NOTIFICATION (NOUVEAU DROP)
                    </h3>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono-brand uppercase text-neutral-400">Titre de la notification</label>
                      <input
                        type="text"
                        value={notifTitle}
                        onChange={(e) => setNotifTitle(e.target.value)}
                        className="w-full bg-black border border-neutral-800 text-white text-xs p-3 font-mono-brand focus:border-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono-brand uppercase text-neutral-400">Message</label>
                      <textarea
                        rows={3}
                        value={notifMessage}
                        onChange={(e) => setNotifMessage(e.target.value)}
                        className="w-full bg-black border border-neutral-800 text-white text-xs p-3 font-mono-brand focus:border-white focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-white text-black font-display  text-xs uppercase tracking-widest rounded hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Diffuser la notification</span>
                    </button>
                  </form>

                </div>

                {/* Notification Preview Mockup (5 cols) */}
                <div className="lg:col-span-5 p-6 bg-[#0D0D0D] border border-neutral-800 rounded-sm space-y-4">
                  <h3 className="font-display  text-base text-white uppercase">
                    APERÇU DU RENDU SUR SMARTPHONE
                  </h3>

                  <div className="p-4 bg-black border border-white/20 rounded-xl space-y-2 shadow-2xl">
                    <div className="flex items-center justify-between text-[10px] font-mono-brand text-neutral-400">
                      <div className="flex items-center gap-1.5">
<img src="/assets/logo.png" alt="Logo MARASSEURAVIE" className="w-4 h-4 object-cover rounded-sm" />
                        <span className="font-bold text-white">MARASSEURAVIE</span>
                      </div>
                      <span>maintenant</span>
                    </div>
                    <span className="font-bold text-sm text-white block">{notifTitle}</span>
                    <p className="text-xs text-neutral-300 font-sans">{notifMessage}</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: HOMEPAGE & SETTINGS */}
          {currentTab === 'homepage' && (
            <div className="space-y-6">
              <div className="border-b border-neutral-900 pb-4">
                <h1 className="font-display  text-3xl text-white uppercase tracking-tight">
                  PARAMÈTRES & TEXTES DU SITE
                </h1>
                <p className="text-xs text-neutral-400 font-mono-brand mt-1">
                  Modifiez les coordonnées WhatsApp, les annonces et le slogan de la marque
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="p-6 bg-[#0D0D0D] border border-neutral-800 rounded-sm space-y-4 max-w-2xl">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono-brand uppercase text-neutral-400">Numéro WhatsApp de Commande</label>
                  <input
                    type="text"
                    value={settingsForm.whatsappNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                    className="w-full bg-black border border-neutral-800 text-white text-xs p-3 font-mono-brand focus:border-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono-brand uppercase text-neutral-400">Bandeau d'annonce (Haut de page)</label>
                  <input
                    type="text"
                    value={settingsForm.announcement}
                    onChange={(e) => setSettingsForm({ ...settingsForm, announcement: e.target.value })}
                    className="w-full bg-black border border-neutral-800 text-white text-xs p-3 font-mono-brand focus:border-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono-brand uppercase text-neutral-400">Slogan de marque</label>
                  <input
                    type="text"
                    value={settingsForm.tagline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                    className="w-full bg-black border border-neutral-800 text-white text-xs p-3 font-mono-brand focus:border-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-black font-display  text-xs uppercase tracking-widest rounded hover:bg-neutral-200 transition-colors"
                >
                  Enregistrer les modifications
                </button>
              </form>
            </div>
          )}

        

        </main>
      </div>

      {/* PRODUCT CREATE/EDIT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0D0D0D] border border-white/20 p-6 sm:p-8 rounded-sm space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="font-display  text-xl text-white uppercase">
                {isCreatingProduct ? 'CRÉER UNE NOUVELLE PIÈCE' : `MODIFIER : ${editingProduct.name}`}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono-brand uppercase text-neutral-400">Nom du produit</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    required
                    className="w-full bg-black border border-neutral-800 text-white text-xs p-2.5 font-mono-brand focus:border-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono-brand uppercase text-neutral-400">Prix (FCFA)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    required
                    className="w-full bg-black border border-neutral-800 text-white text-xs p-2.5 font-mono-brand focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono-brand uppercase text-neutral-400">Catégorie</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as ProductCategory })}
                    className="w-full bg-black border border-neutral-800 text-white text-xs p-2.5 font-mono-brand focus:border-white focus:outline-none"
                  >
                    <option value="tricots">Tricots</option>
                    <option value="survetements">Survêtements</option>
                    <option value="hoodies">Hoodies</option>
                    <option value="tshirts">T-Shirts</option>
                    <option value="accessoires">Accessoires</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono-brand uppercase text-neutral-400">Stock disponible</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full bg-black border border-neutral-800 text-white text-xs p-2.5 font-mono-brand focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono-brand uppercase text-neutral-400"> Image</label>
               <ProductImageUploader
  images={productImages}
  onChange={setProductImages}
  maxImages={6}
/>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono-brand uppercase text-neutral-400">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-black border border-neutral-800 text-white text-xs p-2.5 font-mono-brand focus:border-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 bg-neutral-900 text-neutral-300 text-xs font-mono-brand uppercase rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-white text-black font-display  text-xs uppercase tracking-wider rounded hover:bg-neutral-200"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COLLECTION CREATE/EDIT MODAL */}
      {editingCollection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#0D0D0D] border border-white/20 p-6 rounded-sm space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="font-display  text-xl text-white uppercase">
                {isCreatingCollection ? 'NOUVELLE CAPSULE' : `MODIFIER CAPSULE`}
              </h3>
              <button
                onClick={() => setEditingCollection(null)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCollectionForm} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono-brand uppercase text-neutral-400">Nom de la capsule</label>
                <input
                  type="text"
                  value={editingCollection.name}
                  onChange={(e) => setEditingCollection({ ...editingCollection, name: e.target.value })}
                  required
                  className="w-full bg-black border border-neutral-800 text-white text-xs p-2.5 font-mono-brand focus:border-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono-brand uppercase text-neutral-400">Saison / Mention</label>
                <input
                  type="text"
                  value={editingCollection.season}
                  onChange={(e) => setEditingCollection({ ...editingCollection, season: e.target.value })}
                  className="w-full bg-black border border-neutral-800 text-white text-xs p-2.5 font-mono-brand focus:border-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono-brand uppercase text-neutral-400">Description</label>
                <textarea
                  rows={3}
                  value={editingCollection.description}
                  onChange={(e) => setEditingCollection({ ...editingCollection, description: e.target.value })}
                  className="w-full bg-black border border-neutral-800 text-white text-xs p-2.5 font-mono-brand focus:border-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingCollection(null)}
                  className="px-4 py-2.5 bg-neutral-900 text-neutral-300 text-xs font-mono-brand uppercase rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-white text-black font-display  text-xs uppercase tracking-wider rounded hover:bg-neutral-200"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
