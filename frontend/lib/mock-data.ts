export interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  description: string;
  image?: string;
  emoji: string;
  isPopular?: boolean;
}

export const MOCK_CATEGORIES = [
  { id: 1, name: "Signature Coffees", icon: "☕" },
  { id: 2, name: "Artisanal Teas", icon: "🫖" },
  { id: 3, name: "Luxury Pastries", icon: "🥐" },
  { id: 4, name: "Savory Selection", icon: "🥙" },
];

export const MOCK_PAGE_SETTINGS = {
  restaurantName: "Coffee Leo",
  logo: null,
  backgroundImages: [],
  backgroundColor: "#191210",
  tableId: 1,
  tableName: "A7",
  mode: 'online_ordering' as const,
};

export const MOCK_AUTH_USER = {
  id: 1,
  name: "Leo Admin",
  email: "admin@pos.com",
  role: "admin"
};

export const MOCK_TOKEN = "demo-token-123456789";

export const MOCK_PRODUCTS: Product[] = [
  // Signature Coffees
  {
    id: 1,
    name: "Espresso L'Art",
    price: 180,
    categoryId: 1,
    description: "A clinical extraction of hand-picked Arabica beans, featuring notes of dark chocolate and roasted walnut.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.00.54.jpeg",
    emoji: "☕",
    isPopular: true,
  },
  {
    id: 2,
    name: "Velvet Flat White",
    price: 240,
    categoryId: 1,
    description: "Micro-foamed milk poured delicately over a double ristretto shot for a silky, sophisticated finish.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.02.11.jpeg",
    emoji: "🥛",
  },
  {
    id: 5,
    name: "Amber Pour Over",
    price: 320,
    categoryId: 1,
    description: "Single-origin beans brewed through V60 to unlock vibrant acidity and floral aromatic profiles.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.03.05.jpeg",
    emoji: "🧪",
  },
  {
    id: 6,
    name: "Midnight Mocha",
    price: 280,
    categoryId: 1,
    description: "70% dark Criollo cocoa blended with intense espresso and topped with a hint of sea salt.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.03.27.jpeg",
    emoji: "🍫",
  },
  {
    id: 7,
    name: "Rose Gold Latte",
    price: 350,
    categoryId: 1,
    description: "Infused with organic rose petals and topped with 24k gold leaf for the ultimate morning ritual.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.03.40.jpeg",
    emoji: "🌹",
    isPopular: true,
  },

  // Artisanal Teas
  {
    id: 3,
    name: "Ceremonial Matcha",
    price: 380,
    categoryId: 2,
    description: "Stone-ground Uji matcha whisked to perfection, offering a deep umami profile and emerald radiance.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.03.56.jpeg",
    emoji: "🍵",
    isPopular: true,
  },
  {
    id: 8,
    name: "Imperial Earl Grey",
    price: 220,
    categoryId: 2,
    description: "High-altitude black tea leaves scented with cold-pressed bergamot oil from Calabria.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.04.28.jpeg",
    emoji: "🍊",
  },
  {
    id: 9,
    name: "Jasmine Pearl",
    price: 420,
    categoryId: 2,
    description: "Hand-rolled dragon pearls infused with the scent of night-blooming jasmine flowers.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.06.18.jpeg",
    emoji: "⚪",
  },
  {
    id: 10,
    name: "Hibiscus Rouge",
    price: 260,
    categoryId: 2,
    description: "Tart and vibrant infusion of dried hibiscus calyces, sweetened with honeyed nectar.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.10.37.jpeg",
    emoji: "🌺",
  },

  // Luxury Pastries
  {
    id: 4,
    name: "Golden Croissant",
    price: 160,
    categoryId: 3,
    description: "72 layers of grass-fed butter dough, laminated and baked to a shattering, honey-glazed crisp.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.11.04.jpeg",
    emoji: "🥐",
  },
  {
    id: 11,
    name: "Pistachio Éclair",
    price: 290,
    categoryId: 3,
    description: "Choux pastry filled with roasted Bronte pistachio cream and glazed with white chocolate.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.11.16.jpeg",
    emoji: "🥖",
    isPopular: true,
  },
  {
    id: 12,
    name: "Lavender Macaron Set",
    price: 450,
    categoryId: 3,
    description: "A curated trio of lavender and honey-infused macarons with a delicate almond shell.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.11.46.jpeg",
    emoji: "🟣",
  },
  {
    id: 13,
    name: "Truffle Pain au Choc",
    price: 320,
    categoryId: 3,
    description: "Pain au chocolat elevated with a hint of black truffle essence for a sophisticated savory-sweet balance.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.12.03.jpeg",
    emoji: "🥐",
  },

  // Savory Selection
  {
    id: 14,
    name: "Avocado Artisan Toast",
    price: 480,
    categoryId: 4,
    description: "Sourdough rubbed with garlic, topped with hass avocado, chili flakes, and a soft-poached organic egg.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.12.29.jpeg",
    emoji: "🥑",
    isPopular: true,
  },
  {
    id: 15,
    name: "Smoked Salmon Bagel",
    price: 550,
    categoryId: 4,
    description: "Everything bagel with house-cured salmon, caper berries, red onion, and dill cream cheese.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.12.49.jpeg",
    emoji: "🥯",
  },
  {
    id: 16,
    name: "Truffle Mushroom Melt",
    price: 520,
    categoryId: 4,
    description: "Wild portobello mushrooms sautéed in truffle oil, melted with aged Gruyère on ciabatta.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.13.49.jpeg",
    emoji: "🍄",
  },
  {
    id: 17,
    name: "Quiche de la Mer",
    price: 490,
    categoryId: 4,
    description: "Flaky pastry filled with a delicate custard of crab, shrimp, and fresh garden herbs.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.14.19.jpeg",
    emoji: "🥧",
  },
  {
    id: 18,
    name: "Burrata Salad",
    price: 620,
    categoryId: 4,
    description: "Creamy Puglia burrata served with heritage tomatoes, basil oil, and balsamic reduction.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.14.40.jpeg",
    emoji: "🥗",
  },
  {
    id: 19,
    name: "Saffron Arancini",
    price: 380,
    categoryId: 4,
    description: "Golden risotto balls infused with saffron, filled with mozzarella, and served with spicy diavola sauce.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.15.17.jpeg",
    emoji: "🧆",
  },
  {
    id: 20,
    name: "Mediterranean Wrap",
    price: 410,
    categoryId: 4,
    description: "Grilled halloumi, hummus, roasted peppers, and baby spinach in a toasted artisanal wrap.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.15.55.jpeg",
    emoji: "🌯",
  }
];
