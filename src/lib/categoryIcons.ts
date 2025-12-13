type IconName =
  | "compass"
  | "tshirt"
  | "baby"
  | "gamepad"
  | "book"
  | "disc"
  | "chip"
  | "camera"
  | "home"
  | "sport"
  | "tent"
  | "bottle"
  | "tools"
  | "car"
  | "ticket"
  | "pet"
  | "flower"
  | "craft";

const slugToIcon: Record<string, IconName> = {
  fashion: "tshirt",
  "fashion-men": "tshirt",
  "fashion-women": "tshirt",
  "baby-kids": "baby",
  "gaming-goods": "gamepad",
  "art-crafts": "craft",
  tickets: "ticket",
  "books-magazines-comics": "book",
  "cd-dvd-bluray": "disc",
  "phones-tablets-pcs": "chip",
  "tv-audio-camera": "camera",
  "home-appliances": "home",
  sports: "sport",
  "outdoor-travel": "tent",
  "beauty-cosmetics": "bottle",
  "health-fitness": "sport",
  "food-drink": "bottle",
  "kitchen-daily": "home",
  "home-interior": "home",
  pets: "pet",
  "diy-tools": "tools",
  "flower-gardening": "flower",
  "handmade-craft": "craft",
  automotive: "car",
};

export function mapSlugToIcon(slug: string): IconName {
  return slugToIcon[slug] ?? "compass";
}

export type { IconName };
