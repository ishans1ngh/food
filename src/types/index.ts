export interface GroceryItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  image: string;
  unit: string;
  description: string;
}

export interface PlatformPrice {
  platform: string;
  price: number;
  availability: boolean;
  deliveryTime: string;
  inStock: boolean;
  discount?: number;
  originalPrice?: number;
  logo: string;
  color: string;
}

export interface CartItem extends GroceryItem {
  quantity: number;
  platformPrices: PlatformPrice[];
}

export interface PriceComparisonResult {
  item: CartItem;
  cheapestPlatform: PlatformPrice;
  allPlatforms: PlatformPrice[];
}

export interface FilterOptions {
  category: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
  deliveryTime: string;
  availability: boolean;
}