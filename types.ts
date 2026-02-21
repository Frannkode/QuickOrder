export interface Product {
  id: string;
  name: string;
  description: string;
  priceRetail: number;
  priceWholesale: number;
  wholesaleThreshold: number; // Qty required to trigger wholesale price
  category: string;
  imageUrl: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address?: string; // Optional for simple pickup
  notes: string;
}

export type OrderStatus = 'pending_payment' | 'received' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  shortId: string; // Friendly ID for humans (e.g., #4921)
  items: CartItem[];
  customer: CustomerInfo;
  total: number;
  status: OrderStatus;
  createdAt: string; // ISO String
  notes?: string; // Admin internal notes
}

export interface StoreConfig {
  name: string;
  whatsappNumber: string; // International format without +
  currencySymbol: string;
  minOrderAmount: number;
  openHours: string;
  logoText: string;
  adminPin: string;
  adminEmails: string[];
}