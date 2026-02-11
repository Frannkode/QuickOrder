import { STORE_CONFIG } from './constants';
import { CartItem, Order } from './types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS', // Using ARS as generic dollar sign usage, interchangeable
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getPrice = (item: CartItem): number => {
  return item.quantity >= item.wholesaleThreshold ? item.priceWholesale : item.priceRetail;
};

export const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + (getPrice(item) * item.quantity), 0);
};

export const generateWhatsAppLink = (order: Order): string => {
  const { customer, items, total, shortId } = order;
  const baseUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}`;

  const header = `🆕 *NUEVO PEDIDO #${shortId}*`;
  const date = `📅 ${new Date(order.createdAt).toLocaleString()}`;
  const clientInfo = `👤 *Cliente:* ${customer.name}\n📞 *Tel:* ${customer.phone}`;
  
  const itemsList = items.map(item => {
    const isWholesale = item.quantity >= item.wholesaleThreshold;
    const price = getPrice(item);
    const label = isWholesale ? '(Mayorista)' : '';
    return `- ${item.quantity}x ${item.name} (${formatCurrency(price)} c/u) ${label}`;
  }).join('\n');

  const notes = customer.notes ? `\n📝 *Notas:* ${customer.notes}` : '';
  const footer = `💰 *TOTAL: ${formatCurrency(total)}*`;

  const message = `${header}\n${date}\n\n${clientInfo}\n\n📋 *Detalle:*\n${itemsList}\n${notes}\n\n${footer}\n\n_Enviado desde ${STORE_CONFIG.name} App_`;

  return `${baseUrl}?text=${encodeURIComponent(message)}`;
};

export const generateOrderId = (): string => {
  // Simple 5 digit alphanumeric ID
  return Math.random().toString(36).substring(2, 7).toUpperCase();
};