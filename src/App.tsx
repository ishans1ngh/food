import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import ShoppingCart from './components/ShoppingCart';
import PriceComparison from './components/PriceComparison';
import FilterModal from './components/FilterModal';
import { groceryItems, generatePlatformPrices, basePrices } from './data/mockData';
import { comparePrices } from './utils/priceComparison';
import { GroceryItem, CartItem, FilterOptions, PriceComparisonResult } from './types';

function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [showPriceComparison, setShowPriceComparison] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<PriceComparisonResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'All Categories',
    brand: 'All Brands',
    minPrice: 0,
    maxPrice: 500,
    deliveryTime: 'Any Time',
    availability: false
  });

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    return groceryItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filters.category === 'All Categories' || 
                             item.category === filters.category;
      
      const matchesBrand = filters.brand === 'All Brands' || 
                          item.brand === filters.brand;

      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [searchQuery, filters]);

  const addToCart = (item: GroceryItem) => {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      const basePrice = basePrices[item.id] || 50;
      const platformPrices = generatePlatformPrices(basePrice);
      
      setCartItems([...cartItems, {
        ...item,
        quantity: 1,
        platformPrices
      }]);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(itemId);
    } else {
      setCartItems(cartItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const handleComparePrices = () => {
    const results = comparePrices(cartItems);
    setComparisonResults(results);
    setShowPriceComparison(true);
    setIsCartOpen(false);
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (showPriceComparison) {
    return (
      <PriceComparison
        results={comparisonResults}
        onClose={() => setShowPriceComparison(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        cartItemsCount={cartItemsCount}
        onCartToggle={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFiltersToggle={() => setIsFiltersOpen(true)}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Compare. Save. Shop Smart.
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 mb-8 max-w-3xl mx-auto">
              Find the best prices across all major grocery platforms in one place. 
              Add items to your cart and let us do the comparison for you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-2 text-emerald-100">
                <span className="w-2 h-2 bg-emerald-300 rounded-full"></span>
                <span>Compare across 5+ platforms</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-100">
                <span className="w-2 h-2 bg-emerald-300 rounded-full"></span>
                <span>Real-time price updates</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-100">
                <span className="w-2 h-2 bg-emerald-300 rounded-full"></span>
                <span>Best deal recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Results Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery ? `Results for "${searchQuery}"` : 'All Products'}
            </h2>
            <p className="text-gray-600 mt-1">
              {filteredProducts.length} products available
            </p>
          </div>
          <button
            onClick={() => setIsFiltersOpen(true)}
            className="sm:hidden flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Filters
          </button>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-xl">
                  <span className="text-white font-bold">SB</span>
                </div>
                <h3 className="text-2xl font-bold">SmartBasket</h3>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Your intelligent grocery shopping companion. Compare prices across all major platforms 
                and save money on every purchase.
              </p>
              <div className="text-sm text-gray-500">
                © 2024 SmartBasket. All rights reserved.
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Supported Platforms</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>🛒 Amazon Fresh</li>
                <li>🛍️ BigBasket</li>
                <li>🏪 JioMart</li>
                <li>⚡ Blinkit</li>
                <li>📦 Flipkart Grocery</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Real-time price comparison</li>
                <li>Best deal recommendations</li>
                <li>Smart shopping lists</li>
                <li>Delivery time tracking</li>
                <li>Discount alerts</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onComparePrices={handleComparePrices}
      />

      <FilterModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}

export default App;