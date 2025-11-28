
import React, { useState } from 'react';
import { Transaction } from '../types';
import { X, TrendingUp, TrendingDown, DollarSign, Recycle, Calendar, Plus, Minus, Settings } from 'lucide-react';

interface CashFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  currentBalance: number;
  onBuyScrap: (cost: number, weight: number, description: string) => void;
  onManualScrap: (weightDelta: number, description: string) => void;
  onUpdateScrapPrice: (price: number) => void;
  scrapWeight: number;
  scrapPrice: number;
}

export const CashFlowModal: React.FC<CashFlowModalProps> = ({ 
  isOpen, 
  onClose, 
  transactions, 
  currentBalance,
  onBuyScrap,
  onManualScrap,
  onUpdateScrapPrice,
  scrapWeight,
  scrapPrice
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'scrap'>('history');
  
  // States for Scrap Purchase
  const [scrapInputWeight, setScrapInputWeight] = useState('');
  const [scrapInputCost, setScrapInputCost] = useState('');
  const [scrapDesc, setScrapDesc] = useState('');

  // States for Manual Adjust
  const [manualWeight, setManualWeight] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [isAdding, setIsAdding] = useState(true);

  if (!isOpen) return null;

  const sortedTransactions = [...transactions].sort((a, b) => b.timestamp - a.timestamp);

  const handleBuySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weight = Number(scrapInputWeight);
    const cost = Number(scrapInputCost);
    if (weight > 0 && cost >= 0) {
      onBuyScrap(cost, weight, scrapDesc || 'Compra de Sucata');
      setScrapInputWeight('');
      setScrapInputCost('');
      setScrapDesc('');
      setActiveTab('history');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weight = Number(manualWeight);
    if (weight > 0) {
      onManualScrap(isAdding ? weight : -weight, manualDesc || (isAdding ? 'Ajuste Manual (Entrada)' : 'Ajuste Manual (Saída)'));
      setManualWeight('');
      setManualDesc('');
      setActiveTab('history');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-200 bg-blue-950 text-white flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <DollarSign className="text-yellow-400" /> Controle Financeiro & Sucata
            </h2>
            <p className="text-blue-200 text-sm mt-1">Gerencie fluxo de caixa e estoque de sucata</p>
          </div>
          <button onClick={onClose} className="text-blue-300 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Top Summaries */}
        <div className="grid grid-cols-2 divide-x divide-gray-100 bg-white border-b border-gray-100 shadow-sm z-10">
          <div className="p-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Caixa (R$)</p>
            <div className={`text-2xl font-black ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-6 bg-orange-50/30">
            <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Sucata (Kg)</p>
            <div className="text-2xl font-black text-orange-600 flex items-center gap-2">
              {scrapWeight} kg
              <span className="text-sm font-medium text-orange-400 bg-orange-100 px-2 py-0.5 rounded-md">
                 ≈ R$ {(scrapWeight * scrapPrice).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'history' ? 'text-blue-900 border-b-2 border-blue-900 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Extrato
          </button>
          <button
            onClick={() => setActiveTab('scrap')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'scrap' ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Gestão de Sucata
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {activeTab === 'history' ? (
            <div className="space-y-3">
              {sortedTransactions.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <DollarSign size={48} className="mx-auto mb-3 opacity-20" />
                  <p>Nenhuma transação registrada.</p>
                </div>
              ) : (
                sortedTransactions.map((tx) => (
                  <div key={tx.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${tx.amount >= 0 && tx.type !== 'ADJUSTMENT' ? 'bg-green-100 text-green-600' : tx.amount < 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                        {tx.type === 'SCRAP_PURCHASE' ? <Recycle size={20} /> : tx.amount >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{tx.description}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-0.5">
                          <span className="flex items-center gap-1">
                             <Calendar size={10} />
                             {new Date(tx.timestamp).toLocaleDateString('pt-BR')} • {new Date(tx.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {tx.scrapWeight && tx.scrapWeight !== 0 && (
                            <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">
                              {tx.scrapWeight > 0 ? '+' : ''}{tx.scrapWeight}kg Sucata
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {tx.amount !== 0 && (
                        <span className={`font-black text-lg ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.amount >= 0 ? '+' : '-'} R$ {Math.abs(tx.amount).toFixed(2)}
                        </span>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-8 max-w-lg mx-auto">
              
              {/* Configuration */}
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-orange-800 font-bold text-sm">
                      <Settings size={16} /> Cotação da Sucata (Kg)
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-lg border border-orange-200 px-3 py-1">
                      <span className="text-gray-500 font-bold">R$</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={scrapPrice}
                        onChange={(e) => onUpdateScrapPrice(Number(e.target.value))}
                        className="w-16 font-bold text-gray-900 outline-none text-right"
                      />
                  </div>
              </div>

              {/* Purchase Section */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold border-b pb-2">
                    <Recycle className="text-green-600" />
                    <h3>Comprar Sucata (Saída de Caixa)</h3>
                </div>
                
                <form onSubmit={handleBuySubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Peso (Kg)</label>
                        <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            required
                            value={scrapInputWeight}
                            onChange={(e) => {
                                setScrapInputWeight(e.target.value);
                                // Auto-calculate suggestion if empty or logic allows
                                if (!scrapInputCost && e.target.value) {
                                    setScrapInputCost((Number(e.target.value) * scrapPrice).toFixed(2));
                                }
                            }}
                            className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none font-bold"
                            placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total a Pagar (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={scrapInputCost}
                            onChange={(e) => setScrapInputCost(e.target.value)}
                            className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none font-bold text-red-600"
                            placeholder="0,00"
                        />
                      </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Detalhes (Opcional)</label>
                    <input
                      type="text"
                      value={scrapDesc}
                      onChange={(e) => setScrapDesc(e.target.value)}
                      className="w-full p-3 rounded-lg border-2 border-gray-200 outline-none text-sm"
                      placeholder="Ex: Bateria de Caminhão"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-600/20 transition-all active:scale-95"
                  >
                    Confirmar Compra
                  </button>
                </form>
              </div>

              {/* Manual Adjustment Section */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                 <div className="flex items-center gap-2 mb-4 text-gray-600 font-bold border-b pb-2">
                    <Settings className="text-gray-400" />
                    <h3>Ajuste Manual de Estoque (Kg)</h3>
                </div>

                <form onSubmit={handleManualSubmit} className="space-y-4">
                     <div className="flex bg-gray-100 p-1 rounded-lg mb-2">
                        <button
                            type="button"
                            onClick={() => setIsAdding(true)}
                            className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all ${isAdding ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                        >
                            <Plus size={16} /> Adicionar
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all ${!isAdding ? 'bg-white shadow-sm text-red-600' : 'text-gray-400'}`}
                        >
                            <Minus size={16} /> Remover
                        </button>
                     </div>

                     <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                required
                                value={manualWeight}
                                onChange={(e) => setManualWeight(e.target.value)}
                                className="w-full p-3 rounded-lg border-2 border-gray-200 outline-none font-bold"
                                placeholder="Kg"
                            />
                        </div>
                        <div className="col-span-2">
                             <input
                                type="text"
                                value={manualDesc}
                                onChange={(e) => setManualDesc(e.target.value)}
                                className="w-full p-3 rounded-lg border-2 border-gray-200 outline-none text-sm"
                                placeholder="Motivo do ajuste..."
                            />
                        </div>
                     </div>
                     
                     <button
                        type="submit"
                        className={`w-full font-bold py-3 rounded-xl transition-all active:scale-95 ${isAdding ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                     >
                        {isAdding ? 'Adicionar ao Estoque' : 'Remover do Estoque'}
                     </button>
                </form>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
