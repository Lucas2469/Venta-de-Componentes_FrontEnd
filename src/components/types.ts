export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  registrationDate: string;
  rating: number;
  totalTransactions: number;
  credits: number;
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
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  zone: 'norte' | 'centro' | 'sur';
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
  name: string;
  description: string;
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