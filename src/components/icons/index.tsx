import type { ComponentType } from 'react'
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  ChartColumn,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Flag,
  Globe,
  House,
  Info,
  Languages,
  LayoutGrid,
  Lightbulb,
  List,
  Minus,
  Monitor,
  Moon,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sun,
  Target,
  Trash2,
  TriangleAlert,
  X,
} from 'lucide-react'

export interface IconProps {
  size?: number
  className?: string
  title?: string
  strokeWidth?: number
}

type LucideLike = ComponentType<{
  size?: number | string
  strokeWidth?: number
  className?: string
  'aria-hidden'?: boolean
  'aria-label'?: string
  role?: string
}>

function createIcon(Icon: LucideLike) {
  return function IconComponent({ size = 20, className, title, strokeWidth = 1.75 }: IconProps) {
    return (
      <Icon
        size={size}
        strokeWidth={strokeWidth}
        className={className}
        aria-hidden={title ? undefined : true}
        aria-label={title}
        role={title ? 'img' : undefined}
      />
    )
  }
}

export const HomeIcon = createIcon(House)
export const PlayIcon = createIcon(Play)
export const BookIcon = createIcon(BookOpen)
export const FlagIcon = createIcon(Flag)
export const ClockIcon = createIcon(Clock)
export const GridIcon = createIcon(LayoutGrid)
export const ChartIcon = createIcon(ChartColumn)
export const SettingsIcon = createIcon(Settings)
export const SunIcon = createIcon(Sun)
export const MoonIcon = createIcon(Moon)
export const MonitorIcon = createIcon(Monitor)
export const ChevronLeftIcon = createIcon(ChevronLeft)
export const ChevronRightIcon = createIcon(ChevronRight)
export const ChevronDownIcon = createIcon(ChevronDown)
export const CheckIcon = createIcon(Check)
export const CloseIcon = createIcon(X)
export const PlusIcon = createIcon(Plus)
export const MinusIcon = createIcon(Minus)
export const RefreshIcon = createIcon(RefreshCw)
export const DownloadIcon = createIcon(Download)
export const TrashIcon = createIcon(Trash2)
export const InfoIcon = createIcon(Info)
export const AlertTriangleIcon = createIcon(TriangleAlert)
export const SearchIcon = createIcon(Search)
export const ListIcon = createIcon(List)
export const TargetIcon = createIcon(Target)
export const GlobeIcon = createIcon(Globe)
export const ArrowRightIcon = createIcon(ArrowRight)
export const BookmarkIcon = createIcon(Bookmark)
export const LightbulbIcon = createIcon(Lightbulb)
export const LanguagesIcon = createIcon(Languages)
