import React, { useState } from 'react';
import { Brand } from '../types';
import { SUPPORTED_BRANDS, COMMON_AMPERAGES } from '../constants';
import { X, Bell } from 'lucide-react';

interface AddBatteryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { brand: Brand; amperage: number; quantity: number; minStock: number; price: number; alertEnabled: boolean }) => void;
}

export const AddBatteryModal: React.FC<AddBatteryModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [brand, setBrand] = useState<Brand>('Moura');
  const [amperage, setAmperage] = useState<number>(60);
  const [quantity, setQuantity] = useState<number>(10);
  const [minStock, setMinStock] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [alertEnabled, setAlertEnabled] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ brand, amperage, quantity, minStock, price, alertEnabled });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-blue-950">
          <h2 className="text-lg font-bold text-white">Adicionar Nova Bateria</h2>
          <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
          
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Marca</label>
            <div className="grid grid-cols-3 gap-2">
              {SUPPORTED_BRANDS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBrand(b)}
                  className={`px-2 py-3 rounded-lg text-sm font-bold border-2 transition-all shadow-sm ${
                    brand === b 
                      ? 'border-blue-900 bg-blue-900 text-white' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Amperagem (Ah)</label>
            <div className="relative">
              <select
                value={amperage}
                onChange={(e) => setAmperage(Number(e.target.value))}
                className="w-full rounded-lg border-2 border-gray-300 bg-white p-3 text-gray-900 font-medium focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
              >
                {COMMON_AMPERAGES.map((amp) => (
                  <option key={amp} value={amp}>{amp} Ah</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Qtd. Atual</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full rounded-lg border-2 border-gray-300 bg-white p-3 text-gray-900 font-medium focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Estoque Mín.</label>
              <input
                type="number"
                min="1"
                value={minStock}
                onChange={(e) => setMinStock(Number(e.target.value))}
                className="w-full rounded-lg border-2 border-gray-300 bg-white p-3 text-gray-900 font-medium focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-800 mb-2">Preço Sugerido (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full rounded-lg border-2 border-gray-300 bg-white p-3 text-gray-900 font-medium focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
              />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAlertEnabled(!alertEnabled)}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 text-sm font-bold transition-colors ${alertEnabled ? 'bg-blue-50 border-blue-600 text-blue-800' : 'bg-gray-100 border-gray-300 text-gray-500'}`}
            >
              <Bell size={18} className={alertEnabled ? "fill-blue-800" : ""} />
              {alertEnabled ? 'Alertas Ativados' : 'Alertas Desativados'}
            </button>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-extrabold py-4 rounded-xl shadow-md transition-all active:scale-[0.98] uppercase tracking-wide"
            >
              Confirmar Adição
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};