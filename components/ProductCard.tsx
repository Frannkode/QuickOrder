import React from 'react';
import { Product } from '../types';
import { Button } from './Button';
import { Plus, Minus, ShoppingCart, Tag } from 'lucide-react';
import { formatCurrency } from '../utils';

interface ProductCardProps {
  product: Product;
  cartQuantity: number;
  onUpdateQuantity: (id: string, delta: number) => void;
  onAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  cartQuantity, 
  onUpdateQuantity, 
  onAdd 
}) => {
  const isWholesale = (cartQuantity > 0 ? cartQuantity : 1) >= product.wholesaleThreshold;
  const displayPrice = isWholesale ? product.priceWholesale : product.priceRetail;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        {/* Overlay gradient for text readability if needed, or just aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {isWholesale && cartQuantity > 0 && (
          <div className="absolute top-3 left-3 bg-yellow-400/90 backdrop-blur-sm text-yellow-950 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Tag size={10} />
            PRECIO MAYORISTA
          </div>
        )}
        
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-lg shadow-sm text-gray-700">
                Stock: {product.stock}
            </span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow relative">
        <div className="mb-3">
            <div className="flex justify-between items-start mb-1">
                <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {product.category}
                </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-brand-600 transition-colors">
                {product.name}
            </h3>
        </div>
        
        <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-grow leading-relaxed">
            {product.description}
        </p>
        
        <div className="mt-auto pt-4 border-t border-gray-50">
          <div className="flex flex-col mb-4">
            <div className="flex items-baseline gap-2">
                 <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  {formatCurrency(displayPrice)}
                </span>
                {isWholesale && (
                    <span className="text-xs text-gray-400 line-through decoration-gray-300">
                        {formatCurrency(product.priceRetail)}
                    </span>
                )}
            </div>
             <span className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                <span className="w-1 h-1 rounded-full bg-brand-400 inline-block"></span>
                Mayorista desde {product.wholesaleThreshold} un. ({formatCurrency(product.priceWholesale)})
             </span>
          </div>

          {cartQuantity === 0 ? (
            <Button 
                onClick={() => onAdd(product)} 
                fullWidth 
                className="bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200 rounded-xl py-3 group-hover:shadow-xl transition-all"
            >
                <div className="flex items-center justify-center gap-2">
                    <ShoppingCart size={18} className="transition-transform group-hover:scale-110" />
                    <span className="font-bold">Agregar</span>
                </div>
            </Button>
          ) : (
            <div className="flex items-center justify-between bg-brand-50/50 border border-brand-100 rounded-xl p-1.5 backdrop-blur-sm">
                <button 
                    onClick={() => onUpdateQuantity(product.id, -1)} 
                    className="w-10 h-10 flex items-center justify-center bg-white text-brand-700 rounded-lg shadow-sm hover:shadow-md hover:text-brand-800 transition-all border border-brand-100"
                >
                    <Minus size={20} strokeWidth={2.5} />
                </button>
                <span className="text-lg font-bold text-brand-900 w-12 text-center font-mono">
                    {cartQuantity}
                </span>
                <button 
                    onClick={() => onAdd(product)} 
                    className="w-10 h-10 flex items-center justify-center bg-brand-600 text-white rounded-lg shadow-brand-200 shadow-md hover:bg-brand-700 hover:shadow-lg hover:scale-105 transition-all"
                >
                    <Plus size={20} strokeWidth={2.5} />
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};