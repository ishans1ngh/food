import { GroceryItem, PlatformPrice } from '../types';

export const groceryItems: GroceryItem[] = [
  {
    id: '1',
    name: 'Basmati Rice',
    category: 'Grains & Rice',
    brand: 'India Gate',
    image: 'https://images.pexels.com/photos/33783/rice-thai-jasmine-rice-rice-grain.jpg?auto=compress&cs=tinysrgb&w=300',
    unit: '1kg',
    description: 'Premium quality basmati rice with long grains'
  },
  {
    id: '2',
    name: 'Organic Bananas',
    category: 'Fruits & Vegetables',
    brand: 'Fresh Farm',
    image: 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=300',
    unit: '1 dozen',
    description: 'Fresh organic bananas, naturally ripened'
  },
  {
    id: '3',
    name: 'Whole Wheat Bread',
    category: 'Bakery',
    brand: 'Britannia',
    image: 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=300',
    unit: '400g',
    description: '100% whole wheat bread, soft and nutritious'
  },
  {
    id: '4',
    name: 'Fresh Milk',
    category: 'Dairy',
    brand: 'Amul',
    image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=300',
    unit: '1L',
    description: 'Fresh full cream milk, rich in calcium'
  },
  {
    id: '5',
    name: 'Extra Virgin Olive Oil',
    category: 'Cooking Essentials',
    brand: 'Figaro',
    image: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=300',
    unit: '500ml',
    description: 'Cold-pressed extra virgin olive oil'
  },
  {
    id: '6',
    name: 'Red Apples',
    category: 'Fruits & Vegetables',
    brand: 'Kashmir Fresh',
    image: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=300',
    unit: '1kg',
    description: 'Fresh red apples from Kashmir, crisp and sweet'
  },
  {
    id: '7',
    name: 'Greek Yogurt',
    category: 'Dairy',
    brand: 'Epigamia',
    image: 'https://images.pexels.com/photos/1346999/pexels-photo-1346999.jpeg?auto=compress&cs=tinysrgb&w=300',
    unit: '200g',
    description: 'Thick and creamy Greek yogurt, high in protein'
  },
  {
    id: '8',
    name: 'Green Tea Bags',
    category: 'Beverages',
    brand: 'Twinings',
    image: 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=300',
    unit: '25 bags',
    description: 'Premium green tea bags for a healthy lifestyle'
  }
];

export const generatePlatformPrices = (basePrice: number): PlatformPrice[] => {
  const platforms = [
    { name: 'Amazon', logo: '🛒', color: '#FF9900' },
    { name: 'BigBasket', logo: '🛍️', color: '#84C341' },
    { name: 'JioMart', logo: '🏪', color: '#0066CC' },
    { name: 'Blinkit', logo: '⚡', color: '#F8CA00' },
    { name: 'Flipkart', logo: '📦', color: '#2874F0' }
  ];

  return platforms.map(platform => {
    const priceVariation = (Math.random() - 0.5) * 0.3; // ±15% variation
    const price = Math.round((basePrice * (1 + priceVariation)) * 100) / 100;
    const discount = Math.random() > 0.7 ? Math.round(Math.random() * 20) : 0;
    const originalPrice = discount > 0 ? Math.round((price / (1 - discount / 100)) * 100) / 100 : price;
    
    return {
      platform: platform.name,
      price,
      availability: Math.random() > 0.1, // 90% availability
      deliveryTime: ['Same day', '1-2 days', '2-3 days'][Math.floor(Math.random() * 3)],
      inStock: Math.random() > 0.05, // 95% in stock
      discount: discount > 0 ? discount : undefined,
      originalPrice: discount > 0 ? originalPrice : undefined,
      logo: platform.logo,
      color: platform.color
    };
  });
};

export const basePrices: { [key: string]: number } = {
  '1': 89.99, // Basmati Rice
  '2': 45.00, // Bananas
  '3': 32.50, // Bread
  '4': 28.00, // Milk
  '5': 185.00, // Olive Oil
  '6': 95.00, // Apples
  '7': 55.00, // Greek Yogurt
  '8': 125.00  // Green Tea
};