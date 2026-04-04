import React, { useState } from 'react';

export interface CoffeeItem {
  title: string;
  description: string;
  price: string;
  imageUrl: string;
}

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CoffeeItem | null;
  onAddToCart: () => void;
}

export default function ItemDetailModal({ isOpen, onClose, item, onAddToCart }: ItemDetailModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop overlay clicks will close the modal */}
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-[10px]" onClick={onClose}></div>
      
      <div className="relative w-full max-w-lg bg-surface-container-lowest/95 backdrop-blur-md rounded-[16px] shadow-2xl overflow-hidden border-t-2 border-primary-container/30 flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/50 backdrop-blur flex items-center justify-center hover:bg-white transition-colors border border-outline-variant/20 shadow-sm text-on-surface cursor-pointer">
          <span className="material-symbols-outlined text-on-surface text-xl">close</span>
        </button>
        
        {/* Item Image */}
        <div className="relative h-64 w-full shrink-0">
          <img alt={item.title} className="w-full h-full object-cover" src={item.imageUrl}/>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface-container-lowest to-transparent"></div>
        </div>
        
        {/* Modal Content (Scrollable) */}
        <div className="px-8 pb-32 pt-2 overflow-y-auto custom-scrollbar">
          <div className="mb-8">
            <h2 className="text-4xl font-headline italic text-on-surface mb-2">{item.title}</h2>
            <p className="text-on-surface-variant font-label text-xs leading-relaxed uppercase tracking-wider">{item.description}</p>
          </div>
          
          {/* Options: Select Type */}
          <div className="mb-8">
            <h4 className="font-label text-[10px] uppercase tracking-[0.2em] text-primary font-bold mb-4">Select Type</h4>
            <div className="space-y-3">
              <label className="flex items-center group cursor-pointer">
                <input defaultChecked className="w-4 h-4 text-primary focus:ring-primary border-outline-variant/50" name="coffee-type" type="radio"/>
                <span className="ml-3 font-label text-xs uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface transition-colors">Regular</span>
              </label>
              <label className="flex items-center group cursor-pointer">
                <input className="w-4 h-4 text-primary focus:ring-primary border-outline-variant/50" name="coffee-type" type="radio"/>
                <span className="ml-3 font-label text-xs uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface transition-colors">Decaf</span>
              </label>
              <label className="flex items-center group cursor-pointer">
                <input className="w-4 h-4 text-primary focus:ring-primary border-outline-variant/50" name="coffee-type" type="radio"/>
                <span className="ml-3 font-label text-xs uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface transition-colors">Oat Milk</span>
              </label>
            </div>
          </div>
          
          {/* Options: Add Extras */}
          <div className="mb-4">
            <h4 className="font-label text-[10px] uppercase tracking-[0.2em] text-primary font-bold mb-4">Add Extras</h4>
            <div className="space-y-3">
              <label className="flex items-center group cursor-pointer">
                <input className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant/50" type="checkbox"/>
                <span className="ml-3 font-label text-xs uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface transition-colors">Extra Shot (+$1.50)</span>
              </label>
              <label className="flex items-center group cursor-pointer">
                <input className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant/50" type="checkbox"/>
                <span className="ml-3 font-label text-xs uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface transition-colors">Caramel Drizzle (+$0.50)</span>
              </label>
              <label className="flex items-center group cursor-pointer">
                <input className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant/50" type="checkbox"/>
                <span className="ml-3 font-label text-xs uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface transition-colors">Whipped Cream (+$0.75)</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Sticky Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-surface-container-lowest/95 backdrop-blur border-t border-outline-variant/10 flex items-center gap-4">
          {/* Quantity Stepper */}
          <div className="flex items-center bg-surface-container-low rounded-full px-2 py-1 border border-outline-variant/10">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-lg">remove</span>
            </button>
            <span className="w-10 text-center font-mono font-medium text-on-surface">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-lg">add</span>
            </button>
          </div>
          
          {/* Add to Basket Button */}
          <button 
            onClick={() => { 
                for (let i = 0; i < quantity; i++) onAddToCart();
                onClose(); 
            }} 
            className="cursor-pointer flex-1 bg-gradient-to-br from-[#805600] to-[#b07d5d] hover:brightness-110 text-white h-12 rounded-full font-label text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-[#E8A838]/20 transition-all active:scale-[0.98]"
          >
            Add to Basket — {item.price}
          </button>
        </div>
      </div>
    </div>
  );
}
