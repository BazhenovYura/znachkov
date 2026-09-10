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
  Phone as LucidePhone,
  Mail as LucideMail,
  MapPin as LucideMapPin,
  Menu as LucideMenu,
  Home as LucideHome,
  ArrowRight as LucideArrowRight,
  ArrowLeft as LucideArrowLeft,
  Calendar as LucideCalendar,
  Shield as LucideShield,
  Truck as LucideTruck,
  MessageSquare as LucideMessageSquare,
  Sparkles as LucideSparkles,
  Percent as LucidePercent,
  CheckCircle as LucideCheckCircle,
  AlertCircle as LucideAlertCircle,
  Minus as LucideMinus,
  Plus as LucidePlus,
  ZoomIn as LucideZoomIn,
  PiggyBank as LucidePiggyBank,
  Heart as LucideHeart,
  Handshake as LucideHandshake,
  Loader2 as LucideLoader2,
  PanelLeft as LucidePanelLeft,
  Search as LucideSearch,
  ChevronDown as LucideChevronDown,
  ChevronUp as LucideChevronUp,
  ChevronRight as LucideChevronRight,
  Circle as LucideCircleIcon,
  Check as LucideCheckIcon,
  X as LucideXIcon,
  Minus as LucideMinusIcon,
  GripVertical as LucideGripVertical,
  MoreHorizontal as LucideMoreHorizontal,
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
export const Phone: ComponentType<LucideProps> = LucidePhone;
export const Mail: ComponentType<LucideProps> = LucideMail;
export const MapPin: ComponentType<LucideProps> = LucideMapPin;
export const Menu: ComponentType<LucideProps> = LucideMenu;
export const Home: ComponentType<LucideProps> = LucideHome;
export const ArrowRight: ComponentType<LucideProps> = LucideArrowRight;
export const ArrowLeft: ComponentType<LucideProps> = LucideArrowLeft;
export const Calendar: ComponentType<LucideProps> = LucideCalendar;
export const Shield: ComponentType<LucideProps> = LucideShield;
export const Truck: ComponentType<LucideProps> = LucideTruck;
export const MessageSquare: ComponentType<LucideProps> = LucideMessageSquare;
export const Sparkles: ComponentType<LucideProps> = LucideSparkles;
export const Percent: ComponentType<LucideProps> = LucidePercent;
export const CheckCircle: ComponentType<LucideProps> = LucideCheckCircle;
export const AlertCircle: ComponentType<LucideProps> = LucideAlertCircle;
export const Minus: ComponentType<LucideProps> = LucideMinus;
export const Plus: ComponentType<LucideProps> = LucidePlus;
export const ZoomIn: ComponentType<LucideProps> = LucideZoomIn;
export const PiggyBank: ComponentType<LucideProps> = LucidePiggyBank;
export const Heart: ComponentType<LucideProps> = LucideHeart;
export const Handshake: ComponentType<LucideProps> = LucideHandshake;
export const Loader2: ComponentType<LucideProps> = LucideLoader2;
export const PanelLeft: ComponentType<LucideProps> = LucidePanelLeft;
export const Search: ComponentType<LucideProps> = LucideSearch;
export const ChevronDown: ComponentType<LucideProps> = LucideChevronDown;
export const ChevronUp: ComponentType<LucideProps> = LucideChevronUp;
export const ChevronRight: ComponentType<LucideProps> = LucideChevronRight;
export const CircleIcon: ComponentType<LucideProps> = LucideCircleIcon;
export const CheckIcon: ComponentType<LucideProps> = LucideCheckIcon;
export const XIcon: ComponentType<LucideProps> = LucideXIcon;
export const MinusIcon: ComponentType<LucideProps> = LucideMinusIcon;
export const GripVertical: ComponentType<LucideProps> = LucideGripVertical;
export const MoreHorizontal: ComponentType<LucideProps> = LucideMoreHorizontal;

// Экспортируем тип LucideProps для использования в других файлах
export type { LucideProps };
