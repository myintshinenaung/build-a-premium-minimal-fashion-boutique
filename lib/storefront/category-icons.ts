import {
  Baby,
  Briefcase,
  Footprints,
  Gem,
  Shirt,
  ShoppingBag,
  Sparkles,
  Watch,
  type LucideIcon
} from "lucide-react";

const iconByCategory: Record<string, LucideIcon> = {
  Dresses: Sparkles,
  Tops: Shirt,
  Pants: Briefcase,
  Jeans: Briefcase,
  Bags: ShoppingBag,
  Shoes: Footprints,
  Accessories: Gem,
  Knitwear: Shirt,
  Outerwear: Shirt,
  Jewelry: Gem,
  Kids: Baby,
  Beauty: Sparkles,
  "New Arrival": Sparkles,
  Women: Sparkles,
  Men: Shirt,
  "Street Wear": Shirt
};

export function getCategoryIcon(category: string): LucideIcon {
  return iconByCategory[category] ?? Watch;
}
