import React from 'react';
import { StockMovement } from '../types';
import { X, ArrowDownLeft, ArrowUpRight, Plus, Trash2, Clock } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  movements: StockMovement[];
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, movements }) => {
  if (!isOpen) return null;

  const sortedMovements = [...movements].sort((a, b) => b.timestamp - a.timestamp);

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'IN': return <ArrowDownLeft size={16} className="text-green-600" />;
      case 'OUT': return <ArrowUpRight size={16} className="text-red-600" />;
      case 'CREATE': return <Plus size={16} className="text-blue-600" />;
      case 'DELETE': return <Trash2 size={16} className="text-gray-600" />;
      default: return <Clock size={16} className="text-gray-400" />;
    }
  };

  const getMovementLabel = (type: string) => {
    switch (type) {
      case 'IN': return 'Entrada';
      case 'OUT': return 'Saída';
      case 'CREATE': return 'Cadastro';
      case 'DELETE': return 'Remoção';
      default: return 'Registro';
    }
  };

  const getRowStyle = (type: string) => {
    switch (type) {
      case 'IN': return 'bg-green-50 border-green-100';
      case 'OUT': return 'bg-red-50 border-red-100';
      case 'CREATE': return 'bg-blue-50 border-blue-100';
      case 'DELETE': return 'bg-gray-50 border-gray-100';
      default: return 'bg-white border-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-gray-700" />
            <h2 className="text-lg font-bold text-gray-800">Histórico de Movimentações</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {sortedMovements.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Clock size={48} className="mx-auto mb-3 opacity-20" />
              <p>Nenhuma movimentação registrada ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedMovements.map((move) => (
                <div 
                  key={move.id} 
                  className={`flex items-center justify-between p-4 rounded-xl border ${getRowStyle(move.type)} transition-all hover:shadow-sm`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full bg-white shadow-sm`}>
                      {getMovementIcon(move.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{move.brand} {move.amperage}Ah</span>
                        <span className="text-xs text-gray-500 bg-white/50 px-2 py-0.5 rounded-full border border-gray-100">
                          {getMovementLabel(move.type)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Intl.DateTimeFormat('pt-BR', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }).format(new Date(move.timestamp))}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`block text-lg font-bold ${move.quantityDelta > 0 ? 'text-green-600' : move.quantityDelta < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {move.quantityDelta > 0 ? '+' : ''}{move.quantityDelta}
                    </span>
                    <span className="text-xs text-gray-400">unidades</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-center text-xs text-gray-400">
          Mostrando as últimas {sortedMovements.length} movimentações
        </div>
      </div>
    </div>
  );
};