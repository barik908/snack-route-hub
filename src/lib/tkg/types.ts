export type OrderStatus =
  | "Pending"
  | "Preparing"
  | "Ready for Pickup"
  | "Assigned to Rider"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export type RiderStatus = "Available" | "On Delivery" | "Offline";

export interface Settings {
  siteName: string;
  logoUrl: string;
  phone: string;
  location: string;
  deliveryCharge: number;
  adminPassword: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Shop {
  id: string;
  name: string;
  logo: string;
  ownerPhone: string;
  address: string;
  active: boolean;
  password: string;
}

export interface Item {
  id: string;
  shopId: string;
  categoryId: string;
  name: string;
  description: string;
  ingredients: string;
  price: number;
  image: string;
  inStock: boolean;
  rating: number;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  license: string;
  password: string;
  status: RiderStatus;
}

export interface OrderLine {
  itemId: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  shopId: string;
  lines: OrderLine[];
  customerName: string;
  phone: string;
  phone2: string;
  address: string;
  landmark: string;
  subtotal: number;
  delivery: number;
  total: number;
  status: OrderStatus;
  riderId: string | null;
  createdAt: number;
}

export interface DB {
  settings: Settings;
  categories: Category[];
  shops: Shop[];
  items: Item[];
  riders: Rider[];
  orders: Order[];
}
