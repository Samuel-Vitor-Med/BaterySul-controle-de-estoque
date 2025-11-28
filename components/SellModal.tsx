import React, { useState, useEffect } from 'react';
import { Battery } from '../types';
import { X, DollarSign, Calculator, Tag } from 'lucide-react';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  battery: Battery | null;
  onConfirmSale: (batteryId: string, finalPrice: number, quantity: number) => void;
}

export const SellModal: React.FC<SellModalProps> = ({ isOpen, onClose, battery, onConfirmSale }) => {
  const [price, setPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  
  useEffect(() => {
    if (battery) {
      setPrice(battery.price || 0);
      setDiscount(0);
    }
  }, [battery]);

  if (!isOpen || !battery) return null;

  const finalPrice = Math.max(0, price - discount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSale(battery.id, finalPrice, 1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-green-600">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <DollarSign size={20} /> Registrar Venda
          </h2>
          <button onClick={onClose} className="text-green-100 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{battery.brand}</span>
            <div className="text-3xl font-black text-gray-800">{battery.amperage} Ah</div>
            <div className="text-sm text-gray-500">Estoque atual: {battery.quantity}</div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor Unitário</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-gray-200 text-lg font-bold text-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
              <Tag size={12} /> Desconto
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400 font-bold">- R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full pl-12 pr-3 py-3 rounded-xl border-2 border-gray-200 text-lg font-bold text-red-600 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-gray-500">Valor Final</span>
              <span className="text-2xl font-black text-green-600">
                R$ {finalPrice.toFixed(2)}
              </span>
            </div>
            
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-600/20 transition-all active:scale-[0.98] uppercase tracking-wide flex items-center justify-center gap-2"
            >
              <Calculator size={20} /> Confirmar Venda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};