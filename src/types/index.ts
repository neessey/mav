export type ProductCategory =  'tshirts' | 'hoodies' ;

export type ProductStatus = 'available' | 'sold_out' | 'preorder' | 'coming_soon' | 'archived';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  subtitle?: string;
  description: string;
  details?: string[];
  price: number; // in FCFA
  category: ProductCategory;
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  stock: number;
  status: ProductStatus;
  badge?: 'NEW' | 'LIMITED' | 'SOLD OUT' | 'COMING SOON' | 'DROP 01' | 'EXCLUSIVE';
  featured: boolean;
  isNewDrop: boolean;
  composition?: string;
  care?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productIds: string[];
  status: 'active' | 'coming_soon' | 'hidden';
  season: string;
  itemCount?: number;
}

export interface BrandSettings {
  brandName: string;
  foundedYear: string;
  tagline: string;
  subTagline: string;
  whatsappNumber: string;
  whatsappFormatted: string;
  instagram: string;
  tiktok: string;
  facebook: string;
  email: string;
  location: string;
  currency: string;
  announcement: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroImage: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  imageUrl?: string;
  actionUrl?: string;
  date: string;
  sent: boolean;
  badge?: string;
}

export interface LookbookShot {
  id: string;
  url: string;
  title?: string;
  caption?: string;
  aspect: 'tall' | 'wide' | 'square';
  location?: string;
}

export interface Campaign {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  season: string;
  coverImage: string;
  statement: string;
  shots: LookbookShot[];
}

export type OrderStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'CONFIRMED'
  | 'PAID'
  | 'PREPARING'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  productId: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  total: number;
  image?: string;
}

export interface Order {
  id: string; // e.g. MAV-2025-0842
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  customerName?: string;
  customerPhone?: string;
  customerCity?: string;
  whatsappMessage: string;
  whatsappUrl: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  deliveryAddress?: string;
  deliveryInstructions?: string;

}

export interface CartItem {
  id: string; // product.id + size + color
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export type PageView =
  | 'home'
  | 'shop'
  | 'collections'
  | 'product'
  | 'about'
  | 'campaign'
  | 'admin';
