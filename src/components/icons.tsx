// src/components/icons.tsx
// Централизованный экспорт иконок, совместимый с React 19
import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';

// Импортируем иконки из lucide-react
import {
  Send as LucideSend,
  Upload as LucideUpload,
  X as LucideX,
  Calculator as LucideCalculator,
  Gift as LucideGift,
  TrendingUp as LucideTrendingUp,
  Check as LucideCheck,
  Zap as LucideZap,
  Clock as LucideClock,
  Award as LucideAward,
  Users as LucideUsers,
  Package as LucidePackage,
  Share2 as LucideShare2,
  RefreshCw as LucideRefreshCw,
  Square as LucideSquare,
  Circle as LucideCircle,
  FileText as LucideFileText,
  Copy as LucideCopy,
  Image as LucideImage,
  // Добавьте сюда все остальные иконки, которые используются в проекте
} from 'lucide-react';

// Реэкспортируем как ComponentType (совместимо с React 19)
export const Send: ComponentType<LucideProps> = LucideSend;
export const Upload: ComponentType<LucideProps> = LucideUpload;
export const X: ComponentType<LucideProps> = LucideX;
export const Calculator: ComponentType<LucideProps> = LucideCalculator;
export const Gift: ComponentType<LucideProps> = LucideGift;
export const TrendingUp: ComponentType<LucideProps> = LucideTrendingUp;
export const Check: ComponentType<LucideProps> = LucideCheck;
export const Zap: ComponentType<LucideProps> = LucideZap;
export const Clock: ComponentType<LucideProps> = LucideClock;
export const Award: ComponentType<LucideProps> = LucideAward;
export const Users: ComponentType<LucideProps> = LucideUsers;
export const Package: ComponentType<LucideProps> = LucidePackage;
export const Share2: ComponentType<LucideProps> = LucideShare2;
export const RefreshCw: ComponentType<LucideProps> = LucideRefreshCw;
export const Square: ComponentType<LucideProps> = LucideSquare;
export const Circle: ComponentType<LucideProps> = LucideCircle;
export const FileText: ComponentType<LucideProps> = LucideFileText;
export const Copy: ComponentType<LucideProps> = LucideCopy;
export const Image: ComponentType<LucideProps> = LucideImage;
