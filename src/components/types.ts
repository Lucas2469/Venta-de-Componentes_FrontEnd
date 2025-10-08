// src/components/types.ts
export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  tipo_usuario: 'admin' | 'vendedor' | 'comprador';
  creditos_disponibles: number;
  fecha_registro: string;
  estado: 'activo' | 'inactivo';
  // Propiedades opcionales para compatibilidad
  username?: string;
  role?: 'user' | 'admin';
  registrationDate?: string;
  rating?: number;
  totalTransactions?: number;
  total_intercambios_comprador?: number;
  credits?: number;
  isSeller?: boolean;
  isBuyer?: boolean;
  isActive?: boolean;
}

export interface WeeklySchedule {
  [key: string]: string[];
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  meetingPoints: string[];
  availableDates: string[];
  weeklySchedule: WeeklySchedule;
  status: 'active' | 'inactive' | 'sold' | 'pending' | 'rejected';
  createdAt: string;
  views: number;
  rejectionReason?: string;
  disableReason?: string;
}

export interface MeetingPoint {
  id: string;
  nombre: string;
  direccion: string;
  referencias?: string;
  coordenadas_lat: number | string;
  coordenadas_lng: number | string;
  estado: 'activo' | 'inactivo';
  fecha_creacion?: string;
}


export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  qrCodeUrl: string;
  popular?: boolean;
  bonus?: number;
}

export interface CreditPurchase {
  id: string;
  userId: string;
  packageId: string;
  amount: number;
  proofImageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  rejectionReason?: string;
}

export interface Category {
  id: string;
  nombre: string;
  descripcion?: string;
  estado: 'activo' | 'inactivo';
  product_count?: number;
}

export interface Rating {
  id: string;
  sellerId: string;
  buyerId: string;
  productId: string;
  rating: number;
  feedback: string;
  createdAt: string;
  meetingDate: string;
  meetingPointId: string;
  type: 'seller' | 'buyer'; // Indica si es calificación para vendedor o comprador
}