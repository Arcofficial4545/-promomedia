import {
  Blocks,
  Bot,
  Calculator,
  Cloud,
  ListChecks,
  Megaphone,
  PenTool,
  ShoppingCart,
  Tag,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  bot: Bot,
  blocks: Blocks,
  cloud: Cloud,
  calculator: Calculator,
  "shopping-cart": ShoppingCart,
  "pen-tool": PenTool,
  "list-checks": ListChecks,
  megaphone: Megaphone,
  tag: Tag,
};

type CategoryIconProps = {
  name: string;
  className?: string;
};

/** Maps a category's stored lucide icon name to the actual icon. */
export function CategoryIcon({ name, className }: CategoryIconProps) {
  const Icon = iconMap[name] ?? Tag;
  return <Icon className={className} aria-hidden="true" />;
}
