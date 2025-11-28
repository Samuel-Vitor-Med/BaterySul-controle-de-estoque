import { Brand } from './types';

export const SUPPORTED_BRANDS: Brand[] = ['Eloforte', 'Pioneiro', 'Heliar', 'Moura', 'Outros'];

export const COMMON_AMPERAGES: number[] = [40, 45, 48, 50, 60, 70, 75, 80, 90, 100, 150, 180];

export const BRAND_COLORS: Record<Brand, string> = {
  Eloforte: 'bg-blue-600',
  Pioneiro: 'bg-green-600',
  Heliar: 'bg-red-600',
  Moura: 'bg-yellow-400 text-blue-950',
  Outros: 'bg-gray-700',
};