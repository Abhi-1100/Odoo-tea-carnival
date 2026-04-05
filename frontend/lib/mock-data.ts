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
  { id: 1, name: "Pizzas & Pastas", icon: "🍕" },
  { id: 2, name: "Burgers & Sandwiches", icon: "🍔" },
  { id: 3, name: "Cocktails & Drinks", icon: "🍹" },
  { id: 4, name: "Salads & Coffee", icon: "🥗" },
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
  // Pizzas & Pastas
  {
    id: 1,
    name: "Meat Lover's Pizza",
    price: 480,
    categoryId: 1,
    description: "Classic pizza topped with tomatoes, mushrooms, meat, and fresh basil.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.00.54.jpeg",
    emoji: "🍕",
    isPopular: true,
  },
  {
    id: 2,
    name: "Pepperoni Pizza Slices",
    price: 450,
    categoryId: 1,
    description: "Classic wood-fired pizza with spicy pepperoni, fresh tomatoes, and gooey mozzarella.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.02.11.jpeg",
    emoji: "🍕",
  },
  {
    id: 5,
    name: "Baguette Cheese Sub",
    price: 320,
    categoryId: 1,
    description: "Crispy artisan baguette filled with fresh greens, tomatoes, and melted cheese.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.03.05.jpeg",
    emoji: "🥖",
  },
  {
    id: 6,
    name: "Creamy Seafood Linguine",
    price: 580,
    categoryId: 1,
    description: "Linguine pasta tossed in a rich, creamy sauce topped with fresh mussels.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.03.27.jpeg",
    emoji: "🍝",
  },
  {
    id: 7,
    name: "Gourmet Floral Pizza",
    price: 650,
    categoryId: 1,
    description: "An artisan wood-fired crust topped with rich tomato sauce, fresh feta cheese, and delicate edible spring flowers.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.03.40.jpeg",
    emoji: "🍕",
    isPopular: true,
  },

  // Burgers & Sandwiches
  {
    id: 3,
    name: "Creamy Chicken Penne",
    price: 380,
    categoryId: 2,
    description: "Penne pasta with tender chicken bites tossed in a rich and creamy sauce with herbs.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.03.56.jpeg",
    emoji: "🍝",
    isPopular: true,
  },
  {
    id: 8,
    name: "Crispy Chicken Burger",
    price: 420,
    categoryId: 2,
    description: "Crispy fried chicken breast, fresh lettuce, and house sauce in a brioche bun with fries.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.04.28.jpeg",
    emoji: "🍔",
  },
  {
    id: 9,
    name: "Pesto Penne Pasta",
    price: 420,
    categoryId: 2,
    description: "Penne pasta tossed in fresh basil pesto with grilled chicken, served with garlic bread.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.06.18.jpeg",
    emoji: "🍝",
  },
  {
    id: 10,
    name: "Classic Martini",
    price: 260,
    categoryId: 2,
    description: "A classic cocktail served in a martini glass garnished with a cherry.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.10.37.jpeg",
    emoji: "🍸",
  },

  // Cocktails & Drinks
  {
    id: 4,
    name: "Strawberry Sangria",
    price: 350,
    categoryId: 3,
    description: "Refreshing red sangria with fresh strawberries, orange slices, and a dash of mint.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.11.04.jpeg",
    emoji: "🍷",
  },
  {
    id: 11,
    name: "Aperol Spritz",
    price: 290,
    categoryId: 3,
    description: "Classic Italian aperitivo cocktail with Prosecco, Aperol, and soda water.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.11.16.jpeg",
    emoji: "🍹",
    isPopular: true,
  },
  {
    id: 12,
    name: "Tropical Mocktail Trio",
    price: 450,
    categoryId: 3,
    description: "A trio of colourful and refreshing fruit mocktails for the ultimate tasting experience.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.11.46.jpeg",
    emoji: "🍹",
  },
  {
    id: 13,
    name: "Blue Lagoon Slush",
    price: 320,
    categoryId: 3,
    description: "Icy blue slushy mocktail layered with a splash of sweet berry syrup.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.12.03.jpeg",
    emoji: "🧊",
  },

  // Salads & Coffee
  {
    id: 14,
    name: "Berry Margarita",
    price: 480,
    categoryId: 4,
    description: "Vibrant berry-infused margarita with a salted rim and fresh citrus slice.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.12.29.jpeg",
    emoji: "🍸",
    isPopular: true,
  },
  {
    id: 15,
    name: "Orange Sour Cocktail",
    price: 550,
    categoryId: 4,
    description: "A refined cocktail with an egg-white foam cap and a twist of orange peel.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.12.49.jpeg",
    emoji: "🍹",
  },
  {
    id: 16,
    name: "Pistachio Cream Choux",
    price: 520,
    categoryId: 4,
    description: "A delicate choux pastry crown filled generously with rich pistachio cream.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.13.49.jpeg",
    emoji: "🧁",
  },
  {
    id: 17,
    name: "Tomato Herbed Bruschetta",
    price: 490,
    categoryId: 4,
    description: "Toasted artisan bread slathered with cream cheese, topped with cherry tomatoes and microgreens.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.14.19.jpeg",
    emoji: "🥖",
  },
  {
    id: 18,
    name: "Strawberry Spinach Salad",
    price: 620,
    categoryId: 4,
    description: "Fresh spinach leaves with strawberries, grilled halloumi, and heart-shaped sourdough croutons.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.14.40.jpeg",
    emoji: "🥗",
  },
  {
    id: 19,
    name: "Latte Art Trio",
    price: 380,
    categoryId: 4,
    description: "Three cups of freshly brewed lattes showcasing intricate barista leaf art.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.15.17.jpeg",
    emoji: "☕",
  },
  {
    id: 20,
    name: "Classic Flat White",
    price: 410,
    categoryId: 4,
    description: "Rich espresso combined with velvety scalded milk and elegant heart latte art.",
    image: "/assets/WhatsApp Image 2026-04-04 at 17.15.55.jpeg",
    emoji: "☕",
  }
];
