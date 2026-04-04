// Products
export interface ProductVariant {
  name: string;
  values: { label: string; extraPrice: number }[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  tax: number;
  status: "active" | "inactive";
  description?: string;
  emoji: string;
  variants?: ProductVariant[];
}

export const CATEGORIES = ["All", "Pizza", "Pasta", "Burger", "Coffee", "Drinks", "Desserts"];

export const products: Product[] = [
  { id: "p1", name: "Margherita Pizza", category: "Pizza", price: 299, unit: "piece", tax: 5, status: "active", emoji: "🍕", description: "Classic tomato and mozzarella" },
  { id: "p2", name: "Pepperoni Pizza", category: "Pizza", price: 349, unit: "piece", tax: 5, status: "active", emoji: "🍕", description: "With extra pepperoni" },
  { id: "p3", name: "BBQ Chicken Pizza", category: "Pizza", price: 379, unit: "piece", tax: 5, status: "active", emoji: "🍕" },
  { id: "p4", name: "Spaghetti Carbonara", category: "Pasta", price: 249, unit: "plate", tax: 5, status: "active", emoji: "🍝" },
  { id: "p5", name: "Penne Arrabbiata", category: "Pasta", price: 229, unit: "plate", tax: 5, status: "active", emoji: "🍝" },
  { id: "p6", name: "Classic Burger", category: "Burger", price: 199, unit: "piece", tax: 5, status: "active", emoji: "🍔" },
  { id: "p7", name: "Double Cheese Burger", category: "Burger", price: 259, unit: "piece", tax: 5, status: "active", emoji: "🍔" },
  { id: "p8", name: "Crispy Chicken Burger", category: "Burger", price: 239, unit: "piece", tax: 5, status: "active", emoji: "🍔" },
  { id: "p9", name: "Espresso", category: "Coffee", price: 89, unit: "cup", tax: 0, status: "active", emoji: "☕" },
  { id: "p10", name: "Cappuccino", category: "Coffee", price: 129, unit: "cup", tax: 0, status: "active", emoji: "☕", variants: [{ name: "Size", values: [{ label: "Regular", extraPrice: 0 }, { label: "Large", extraPrice: 30 }] }] },
  { id: "p11", name: "Cold Coffee", category: "Coffee", price: 149, unit: "cup", tax: 0, status: "active", emoji: "🥤" },
  { id: "p12", name: "Mango Smoothie", category: "Drinks", price: 159, unit: "glass", tax: 0, status: "active", emoji: "🥭" },
  { id: "p13", name: "Fresh Lime Soda", category: "Drinks", price: 99, unit: "glass", tax: 0, status: "active", emoji: "🍋" },
  { id: "p14", name: "Chocolate Brownie", category: "Desserts", price: 149, unit: "piece", tax: 0, status: "active", emoji: "🍫" },
  { id: "p15", name: "Ice Cream Sundae", category: "Desserts", price: 179, unit: "cup", tax: 0, status: "active", emoji: "🍨" },
  { id: "p16", name: "Garlic Bread", category: "Pasta", price: 99, unit: "plate", tax: 5, status: "inactive", emoji: "🥖" },
];
