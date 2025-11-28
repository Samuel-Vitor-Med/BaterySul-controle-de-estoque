
import React, { useState, useEffect, useMemo } from 'react';
import { Battery, Brand, StockMovement, MovementType, Transaction } from './types';
import { SUPPORTED_BRANDS } from './constants';
import { BatteryCard } from './components/BatteryCard';
import { AddBatteryModal } from './components/AddBatteryModal';
import { HistoryModal } from './components/HistoryModal';
import { SellModal } from './components/SellModal';
import { CashFlowModal } from './components/CashFlowModal';
import { generateStockAnalysis } from './services/geminiService';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Search, 
  Zap, 
  BrainCircuit, 
  Filter,
  PackageX,
  History,
  DollarSign,
  Recycle
} from 'lucide-react';

const App: React.FC = () => {
  // --- STATE ---
  const [inventory, setInventory] = useState<Battery[]>(() => {
    const saved = localStorage.getItem('battery_inventory');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((b: any) => ({
        ...b,
        alertEnabled: b.alertEnabled ?? true
      }));
    }
    return [];
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem('battery_movements');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('cash_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [cashBalance, setCashBalance] = useState<number>(() => {
    const saved = localStorage.getItem('cash_balance');
    return saved ? parseFloat(saved) : 0;
  });

  // Scrap State
  const [scrapWeight, setScrapWeight] = useState<number>(() => {
    const saved = localStorage.getItem('scrap_weight');
    return saved ? parseFloat(saved) : 0;
  });

  const [scrapPrice, setScrapPrice] = useState<number>(() => {
    const saved = localStorage.getItem('scrap_price');
    return saved ? parseFloat(saved) : 4.20;
  });
  
  // --- UI STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCashOpen, setIsCashOpen] = useState(false);
  const [sellModalData, setSellModalData] = useState<Battery | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterBrand, setFilterBrand] = useState<Brand | 'All'>('All');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- EFFECTS ---
  useEffect(() => {
    localStorage.setItem('battery_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('battery_movements', JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem('cash_transactions', JSON.stringify(transactions));
    localStorage.setItem('cash_balance', cashBalance.toString());
  }, [transactions, cashBalance]);

  useEffect(() => {
    localStorage.setItem('scrap_weight', scrapWeight.toString());
    localStorage.setItem('scrap_price', scrapPrice.toString());
  }, [scrapWeight, scrapPrice]);

  // --- LOGIC HELPERS ---
  const logMovement = (
    batteryId: string, 
    brand: Brand, 
    amperage: number, 
    type: MovementType, 
    quantityDelta: number
  ) => {
    const newMovement: StockMovement = {
      id: crypto.randomUUID(),
      batteryId,
      brand,
      amperage,
      type,
      quantityDelta,
      timestamp: Date.now()
    };
    setMovements(prev => [newMovement, ...prev]);
  };

  const logTransaction = (
    amount: number,
    type: 'SALE' | 'SCRAP_PURCHASE' | 'ADJUSTMENT',
    description: string,
    relatedBatteryId?: string,
    scrapDelta?: number
  ) => {
    const newTx: Transaction = {
      id: crypto.randomUUID(),
      amount,
      type,
      description,
      timestamp: Date.now(),
      relatedBatteryId,
      scrapWeight: scrapDelta
    };
    setTransactions(prev => [newTx, ...prev]);
    setCashBalance(prev => prev + amount);
  };

  // --- HANDLERS ---
  const handleAddBattery = (data: Omit<Battery, 'id'>) => {
    const newBattery: Battery = {
      ...data,
      id: crypto.randomUUID(),
    };
    setInventory(prev => [...prev, newBattery]);
    logMovement(newBattery.id, newBattery.brand, newBattery.amperage, 'CREATE', newBattery.quantity);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + delta);
        if (newQuantity !== item.quantity) {
           const type = delta > 0 ? 'IN' : 'OUT';
           logMovement(item.id, item.brand, item.amperage, type, delta);
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const handleConfirmSale = (batteryId: string, finalPrice: number, qty: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === batteryId) {
        // 1. Decrease Inventory
        const newQuantity = Math.max(0, item.quantity - qty);
        
        // 2. Log Inventory Movement
        logMovement(item.id, item.brand, item.amperage, 'SALE', -qty);
        
        // 3. Log Financial Transaction
        logTransaction(
          finalPrice, 
          'SALE', 
          `Venda: ${item.brand} ${item.amperage}Ah`, 
          item.id
        );

        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  // Compra de sucata (Sai dinheiro, entra peso)
  const handleBuyScrap = (cost: number, weight: number, description: string) => {
    // Negative amount for expense
    logTransaction(-Math.abs(cost), 'SCRAP_PURCHASE', description, undefined, weight);
    setScrapWeight(prev => prev + weight);
  };

  // Ajuste manual de sucata (Só peso, sem dinheiro)
  const handleManualScrap = (weightDelta: number, description: string) => {
    // Transaction with 0 amount just to record the history
    logTransaction(0, 'ADJUSTMENT', description, undefined, weightDelta);
    setScrapWeight(prev => Math.max(0, prev + weightDelta));
  };

  const handleUpdateScrapPrice = (newPrice: number) => {
    setScrapPrice(newPrice);
  };

  const handleToggleAlert = (id: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, alertEnabled: !item.alertEnabled };
      }
      return item;
    }));
  };

  const handleDelete = (id: string) => {
    const battery = inventory.find(i => i.id === id);
    if (battery && confirm('Tem certeza que deseja remover este item do sistema?')) {
      logMovement(battery.id, battery.brand, battery.amperage, 'DELETE', -battery.quantity);
      setInventory(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleAnalyze = async () => {
    if (inventory.length === 0) return;
    setIsAnalyzing(true);
    setAiAnalysis(null);
    const result = await generateStockAnalysis(inventory);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  // --- FILTERING ---
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesBrand = filterBrand === 'All' || item.brand === filterBrand;
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        item.brand.toLowerCase().includes(query) || 
        item.amperage.toString().includes(query);
      return matchesBrand && matchesSearch;
    }).sort((a, b) => {
        if (a.brand !== b.brand) return a.brand.localeCompare(b.brand);
        return a.amperage - b.amperage;
    });
  }, [inventory, filterBrand, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: inventory.reduce((acc, curr) => acc + curr.quantity, 0),
      lowStock: inventory.filter(i => i.alertEnabled && i.quantity <= i.minStock).length,
      inventoryValue: inventory.reduce((acc, curr) => acc + (curr.quantity * (curr.price || 0)), 0),
      scrapValue: scrapWeight * scrapPrice
    };
  }, [inventory, scrapWeight, scrapPrice]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20">
      
      {/* Header */}
      <header className="bg-blue-950 border-b border-blue-900 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 p-2.5 rounded-xl text-blue-950 shadow-lg shadow-yellow-500/20">
              <Zap size={24} fill="currentColor" strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight hidden sm:block">
                Batery<span className="text-yellow-400">Sul</span>
              </h1>
              <h1 className="text-xl font-bold text-white sm:hidden">BaterySul</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
             <button
              onClick={() => setIsCashOpen(true)}
              className="flex items-center gap-2 bg-blue-900/50 hover:bg-blue-800 text-green-300 border border-blue-800 px-4 py-2.5 rounded-lg font-bold transition-all mr-2"
              title="Controle de Caixa"
            >
              <DollarSign size={18} />
              <span className="hidden sm:inline">R$ {cashBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </button>

            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-2 bg-blue-900/50 hover:bg-blue-800 text-blue-100 border border-blue-800 px-3 sm:px-4 py-2.5 rounded-lg font-medium transition-all"
              title="Histórico de Estoque"
            >
              <History size={18} />
              <span className="hidden lg:inline">Histórico</span>
            </button>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-blue-950 px-3 sm:px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-yellow-500/20 active:scale-95"
            >
              <PlusCircle size={20} strokeWidth={2.5} />
              <span className="hidden sm:inline">Nova Bateria</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Stock */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-full w-1 bg-blue-600"></div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total em Estoque</p>
              <p className="text-4xl font-black text-blue-950 mt-2">{stats.total}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
              <LayoutDashboard size={28} />
            </div>
          </div>
          
          {/* Low Stock Alerts */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden group">
            <div className={`absolute right-0 top-0 h-full w-1 ${stats.lowStock > 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Alertas</p>
              <p className={`text-4xl font-black mt-2 ${stats.lowStock > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stats.lowStock}
              </p>
            </div>
            <div className={`p-4 rounded-2xl group-hover:scale-110 transition-transform ${stats.lowStock > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              <PackageX size={28} />
            </div>
          </div>
          
          {/* Inventory Value */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-full w-1 bg-yellow-400"></div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Patrimônio</p>
              <p className="text-3xl font-black text-blue-950 mt-2">
                <span className="text-lg align-top font-bold text-gray-400 mr-1">R$</span>
                {stats.inventoryValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-2xl text-yellow-600 font-bold text-2xl group-hover:scale-110 transition-transform">
              $
            </div>
          </div>

          {/* Scrap Value - NEW CARD */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-full w-1 bg-orange-500"></div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Sucata ({scrapWeight}kg)</p>
              <p className="text-3xl font-black text-orange-600 mt-2">
                <span className="text-lg align-top font-bold text-orange-300 mr-1">R$</span>
                {stats.scrapValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-2xl text-orange-600 font-bold text-2xl group-hover:scale-110 transition-transform">
              <Recycle size={28} />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por marca ou amperagem..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none font-medium transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <Filter size={18} className="text-gray-400 flex-shrink-0 mr-2" />
            <button 
              onClick={() => setFilterBrand('All')}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap shadow-sm ${filterBrand === 'All' ? 'bg-blue-950 text-white shadow-blue-900/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              Todas
            </button>
            {SUPPORTED_BRANDS.map(brand => (
              <button 
                key={brand}
                onClick={() => setFilterBrand(brand)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap shadow-sm ${filterBrand === brand ? 'bg-yellow-500 text-blue-950 shadow-yellow-500/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="mb-8">
           <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || inventory.length === 0}
            className="group flex items-center gap-3 bg-white hover:bg-blue-50 border border-blue-100 hover:border-blue-200 px-5 py-3 rounded-xl text-blue-800 font-bold transition-all shadow-sm disabled:opacity-50"
           >
             <div className="bg-blue-100 p-1.5 rounded-lg group-hover:bg-blue-200 transition-colors">
                <BrainCircuit size={20} className="text-blue-600" />
             </div>
             {isAnalyzing ? 'Analisando Estoque...' : 'Gerar Análise IA de Estoque'}
           </button>
           
           {aiAnalysis && (
             <div className="mt-4 bg-gradient-to-br from-white to-blue-50 border border-blue-100 p-6 rounded-2xl animate-fade-in shadow-sm">
               <h3 className="text-blue-900 font-bold mb-4 flex items-center gap-2 text-lg">
                 <BrainCircuit size={24} className="text-blue-600" />
                 Relatório do Consultor Virtual
               </h3>
               <div className="prose prose-blue max-w-none text-blue-900/80 leading-relaxed whitespace-pre-wrap font-medium">
                 {aiAnalysis}
               </div>
             </div>
           )}
        </div>

        {/* Inventory Grid */}
        {filteredInventory.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="text-gray-300" size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Nenhum item encontrado</h3>
            <p className="text-gray-500 mt-2">Adicione novas baterias ou ajuste seus filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredInventory.map(item => (
              <BatteryCard 
                key={item.id} 
                battery={item} 
                onUpdateQuantity={handleUpdateQuantity}
                onDelete={handleDelete}
                onToggleAlert={handleToggleAlert}
                onSell={(bat) => setSellModalData(bat)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <AddBatteryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddBattery} 
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        movements={movements}
      />

      <SellModal
        isOpen={!!sellModalData}
        onClose={() => setSellModalData(null)}
        battery={sellModalData}
        onConfirmSale={handleConfirmSale}
      />

      <CashFlowModal
        isOpen={isCashOpen}
        onClose={() => setIsCashOpen(false)}
        transactions={transactions}
        currentBalance={cashBalance}
        onBuyScrap={handleBuyScrap}
        onManualScrap={handleManualScrap}
        scrapWeight={scrapWeight}
        scrapPrice={scrapPrice}
        onUpdateScrapPrice={handleUpdateScrapPrice}
      />
    </div>
  );
};

export default App;
