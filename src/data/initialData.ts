import heroImg from '../assets/images/hero_editorial_back_1787092200741.jpg';
import tricot01Img from '../assets/images/tricot_mav_01_1787092212832.jpg';
import survetement01Img from '../assets/images/survetement_mav_01_1787092223944.jpg';
import hoodie01Img from '../assets/images/hoodie_mav_01_1787092237076.jpg';
import tshirt01Img from '../assets/images/tshirt_mav_01_1787092250882.jpg';
import tricot02Img from '../assets/images/tricot_mav_02_1787092264428.jpg';
import survetement02Img from '../assets/images/survetement_mav_02_1787092292636.jpg';
import storyGroupImg from '../assets/images/story_editorial_group_1787092278536.jpg';
import { BrandSettings, Campaign, Collection, Product, PushNotification } from '../types';

export const INITIAL_SETTINGS: BrandSettings = {
  brandName: 'MARASSEURAVIE',
  foundedYear: '2025',
  tagline: 'WEAR YOUR STORY.',
  subTagline: 'STREETWEAR ÉDITORIAL — ABIDJAN & MONDE',
  whatsappNumber: '2250504272827',
  whatsappFormatted: '+225 07 15 38 22 64',
  instagram: 'https://instagram.com/marasseuravie',
  tiktok: 'https://www.tiktok.com/@mav.streetwear?_r=1&_t=ZS-991LZbLYjtY',
  facebook: 'https://facebook.com/marasseuravie',
  email: 'marasseuravie@gmail.com',
  location: 'Abidjan, Côte d\'Ivoire',
  currency: 'FCFA',
  announcement: 'DROP 01 DISPONIBLE — TRICOTS SIGNATURE EN ÉDITION LIMITÉE — LIVRAISON ABIDJAN & INTERNATIONAL',
  heroHeadline: 'MARASSEURAVIE',
  heroSubheadline: 'SINCE 2025',
  heroImage: heroImg,
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'mav-knit',
    name: 'TRICOT MAV ',
    slug: 'tricot-mav',
    subtitle: 'Tricot Signature Noir 520 GSM — Coupe Boxy',
    description: 'La pièce emblématique MARASSEURAVIE. Tricot confectionné en maille dense premium noire avec grand logo circulaire emblème et typographie MAV sur la manche. Finition haute précision.',
    details: [
      'Maille lourde 100% coton peigné 520 GSM',
      'Coupe boxy décontractée avec tombé rigide',
      'Emblème circulaire MAV imprimé haute tenue',
      'Détail signature sur la manche'
    ],
    price: 35000,
    category: 'tshirts',
    images: [tricot01Img, heroImg],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Noir', hex: '#000000' }
    ],
    stock: 15,
    status: 'available',
    badge: 'NEW',
    featured: true,
    isNewDrop: true,
    composition: '100% Coton Peigné Maille Lourde',
    care: 'Lavage délicat à la main ou à froid 30°C.',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-02-01T12:00:00Z'
  },

];

export const INITIAL_COLLECTIONS: Collection[] = [

  {
    id: 'col-tshirts',
    name: 'T-SHIRTS',
    slug: 'tshirts',
    description: 'Coupes boxy franches, jersey épais 280 GSM et tombé architectural indémodable.',
    image: tshirt01Img,
    productIds: ['mav-tshirt-01'],
    status: 'active',
    season: '2025 / ESSENTIALS',
    itemCount: 2
  },
  {
    id: 'col-hoodies',
    name: 'HOODIES',
    slug: 'hoodies',
    description: 'French Terry lourd 500 GSM et architecture sans cordon pour un confort sculptural.',
    image: hoodie01Img,
    productIds: ['mav-hoodie-01'],
    status: 'active',
    season: '2025 / PERMANENT',
    itemCount: 3
  },
];

export const INITIAL_CAMPAIGN: Campaign = {
  id: 'campaign-01',
  title: 'CAMPAIGN 01',
  subtitle: 'MARASSEURAVIE — 2025',
  year: '2025',
  season: 'INAUGURAL DROP',
  coverImage: storyGroupImg,
  statement: 'MARASSEURAVIE incarne une rupture assumée avec le prêt-à-porter standardisé. Conçue pour ceux qui imposent leur trajectoire sans faire de concessions.',
  shots: [
    {
      id: 'shot-01',
      url: heroImg,
      title: 'THE PROTAGONIST',
      caption: 'Tricot Signature Noir 520 GSM.',
      aspect: 'wide',
      location: 'Abidjan'
    },
    {
      id: 'shot-02',
      url: tricot01Img,
      title: 'TACTILE SILENCE',
      caption: 'Maille dense et coupe géométrique.',
      aspect: 'tall',
      location: 'Studio Nocturne'
    },
    {
      id: 'shot-03',
      url: survetement01Img,
      title: 'FUTURE TRACKSUIT CONCEPT',
      caption: 'Survêtement Drop 01 — Silhouette grise et présence urbaine.',
      aspect: 'tall',
      location: 'Studio Archive'
    },
    {
      id: 'shot-04',
      url: storyGroupImg,
      title: 'MOVE DIFFERENT',
      caption: 'Une même rigueur stylistique.',
      aspect: 'wide',
      location: 'Abidjan Studio'
    }
  ]
};

export const INITIAL_NOTIFICATIONS: PushNotification[] = [
  {
    id: 'notif-1',
    title: 'NEW DROP 🔥',
    message: 'Le Tricot Signature MARASSEURAVIE 2025 est désormais disponible en quantité limitée.',
    imageUrl: tricot01Img,
    actionUrl: '/product/mav-knit-01',
    date: 'Aujourd\'hui',
    sent: true,
    badge: 'DROP'
  },
  {
    id: 'notif-2',
    title: 'SURVÊTEMENTS MAV 01 DISPONIBLE',
    message: 'L\'ensemble survêtement gris MAV 01 est disponible dès maintenant.',
    imageUrl: survetement01Img,
    actionUrl: '/product/mav-tracksuit-01',
    date: 'Hier',
    sent: true,
    badge: 'NEW'
  }
];
