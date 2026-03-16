export type Category =
  | "cafe"
  | "restaurant"
  | "gallery"
  | "workshop"
  | "shop"
  | "parking"
  | "restroom"
  | "convenience";

export interface Store {
  id: string;
  name: string;
  category: Category;
  description: string;
  story?: string;
  image?: string;
  position: { x: number; y: number }; // percentage-based position on map (0-100)
  tags: string[];
  openHours?: string;
  phone?: string;
}

export const CATEGORY_CONFIG: Record<
  Category,
  { label: string; color: string; icon: string }
> = {
  cafe: { label: "카페", color: "#8B4513", icon: "☕" },
  restaurant: { label: "음식점", color: "#D32F2F", icon: "🍽️" },
  gallery: { label: "갤러리·전시", color: "#7B1FA2", icon: "🎨" },
  workshop: { label: "공방·체험", color: "#1976D2", icon: "🔨" },
  shop: { label: "소품샵·의류", color: "#388E3C", icon: "🛍️" },
  parking: { label: "주차장", color: "#616161", icon: "🅿️" },
  restroom: { label: "화장실", color: "#0097A7", icon: "🚻" },
  convenience: { label: "편의시설", color: "#F57C00", icon: "🏪" },
};
