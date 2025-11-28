
export type Brand = 'Eloforte' | 'Pioneiro' | 'Heliar' | 'Moura' | 'Outros';

export interface Battery {
  id: string;
  brand: Brand;
  amperage: number; // e.g., 40, 60, 100
  quantity: number;
  minStock: number; // Threshold for low stock warning
  price?: number;
  alertEnabled: boolean; // Controls if low stock alerts are active for this item
}

export interface InventoryStats {
  totalBatteries: number;
  lowStockCount: number;
  valueEstimate: number;
}

export type MovementType = 'IN' | 'OUT' | 'CREATE' | 'DELETE' | 'SALE';

export interface StockMovement {
  id: string;
  batteryId: string;
  brand: Brand;
  amperage: number;
  type: MovementType;
  quantityDelta: number;
  timestamp: number;
}

export type TransactionType = 'SALE' | 'SCRAP_PURCHASE' | 'ADJUSTMENT';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // Positive for income, negative for expense
  description: string;
  timestamp: number;
  relatedBatteryId?: string;
  scrapWeight?: number; // Weight in kg involved in the transaction
}
