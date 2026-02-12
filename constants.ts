import { Product, StoreConfig } from './types';
import productsData from './src/data/products.json';

export const STORE_CONFIG: StoreConfig = {
  name: "Distribuidora de Vasos & Termos",
  logoText: "Muná",
  whatsappNumber: "5491112345678", // Reemplazar con tu número real
  currencySymbol: "$",
  minOrderAmount: 20000, // Ajustado a un valor razonable según los precios
  openHours: "Lun-Vie: 9:00 - 18:00 | Sáb: 9:00 - 13:00",
  adminPin: "1234",
};

// Products imported from JSON file
export const PRODUCTS: Product[] = productsData as Product[];

// Extract unique categories from products
export const CATEGORIES = Array.from(new Set(PRODUCTS.map(p => p.category)));
