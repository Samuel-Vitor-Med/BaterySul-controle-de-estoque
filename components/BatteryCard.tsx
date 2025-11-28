import React from 'react';
import { Battery } from '../types';
import { BRAND_COLORS } from '../constants';
import { Plus, Minus, AlertTriangle, Battery as BatteryIcon, Bell, BellOff, DollarSign } from 'lucide-react';

interface BatteryCardProps {
  battery: Battery;
  onUpdateQuantity: (id: string, delta: number) => void;
  onDelete: (id: string) => void;
  onToggleAlert: (id: string) => void;
  onSell: (battery: Battery) => void;
}

export const BatteryCard: React.FC<BatteryCardProps> = ({ battery, onUpdateQuantity, onDelete, onToggleAlert, onSell }) => {
  const isLowStock = battery.alertEnabled && battery.quantity <= battery.minStock;
  const isOutOfStock = battery.quantity === 0;

  return (
    <div className={`relative bg-white rounded-xl shadow-md border overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${isLowStock ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'}`}>
      <div className={`h-3 w-full ${BRAND_COLORS[battery.brand]}`} />
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 text-xs font-bold rounded-md uppercase tracking-wide ${BRAND_COLORS[battery.brand]} ${battery.brand === 'Moura' ? '' : 'text-white'}`}>
                {battery.brand}
              </span>
              {isLowStock && (
                <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full animate-pulse border border-red-100">
                  <AlertTriangle size={12} />
                  {isOutOfStock ? 'Sem Estoque' : 'Baixo'}
                </span>
              )}
              {!battery.alertEnabled && (
                <span className="flex items-center gap-1 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
                  <BellOff size={10} />
                  Off
                </span>
              )}
            </div>
            <h3 className="text-3xl font-black text-gray-800 mt-2 flex items-center gap-2 tracking-tight">
              {battery.amperage} <span className="text-lg font-bold text-gray-400">Ah</span>
            </h3>
            {battery.price && (
              <p className="text-sm font-semibold text-gray-500 mt-1">
                R$ {battery.price.toFixed(2)}
              </p>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <button
               onClick={() => onToggleAlert(battery.id)}
               className={`p-2 rounded-full transition-colors ${battery.alertEnabled ? 'text-gray-300 hover:text-blue-600 hover:bg-blue-50' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-100'}`}
               title={battery.alertEnabled ? "Desativar alertas" : "Ativar alertas"}
            >
              {battery.alertEnabled ? <Bell size={18} /> : <BellOff size={18} />}
            </button>
            <div className="text-center mt-1">
              <span className={`block text-4xl font-black ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                {battery.quantity}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button 
            onClick={() => onDelete(battery.id)}
            className="text-xs text-red-400 hover:text-red-600 font-bold px-2 py-1.5 rounded hover:bg-red-50 transition-colors uppercase tracking-wider"
          >
            Remover
          </button>

          <div className="flex items-center gap-2">
             {/* Simple quantity adjustment */}
             <div className="flex items-center bg-gray-100 rounded-xl mr-2">
                <button
                  onClick={() => onUpdateQuantity(battery.id, -1)}
                  disabled={battery.quantity <= 0}
                  className="w-9 h-10 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-gray-200 rounded-l-xl transition-colors disabled:opacity-30"
                  title="Ajuste de estoque (-)"
                >
                  <Minus size={16} />
                </button>
                <div className="w-px h-6 bg-gray-300"></div>
                <button
                  onClick={() => onUpdateQuantity(battery.id, 1)}
                  className="w-9 h-10 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-r-xl transition-colors"
                  title="Ajuste de estoque (+)"
                >
                  <Plus size={16} />
                </button>
             </div>

             {/* Sales Button */}
             <button
              onClick={() => onSell(battery)}
              disabled={battery.quantity <= 0}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-xl font-bold shadow-md shadow-green-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Vender Bateria"
             >
                <DollarSign size={16} strokeWidth={3} />
                <span className="text-sm">Vender</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};