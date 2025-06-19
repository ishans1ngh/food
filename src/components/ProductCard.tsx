import React from 'react';
import { Plus, Star, Truck } from 'lucide-react';
import { GroceryItem } from '../types';

interface ProductCardProps {
  item: GroceryItem;
  onAddToCart: (item: GroceryItem) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ item, onAddToCart }) => {
  const estimatedPrice = Math.round((Math.random() * 100 + 20) * 100) / 100;
  const rating = (Math.random() * 2 + 3).toFixed(1);
  const reviewCount = Math.floor(Math.random() * 500 + 50);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100">
      <div className="relative">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3 bg-white bg-opacity-90 rounded-full px-2 py-1 backdrop-blur-sm">
          <span className="text-xs font-medium text-gray-700">{item.category}</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="font-medium">{item.brand}</span>
            <span className="bg-gray-100 px-2 py-1 rounded-full">{item.unit}</span>
          </div>
        </div>

        <div className="flex items-center mb-3">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm font-medium text-gray-700">{rating}</span>
            <span className="ml-1 text-sm text-gray-500">({reviewCount})</span>
          </div>
          <div className="ml-auto flex items-center text-emerald-600">
            <Truck className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">Fast delivery</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-gray-900">₹{estimatedPrice}</span>
            <p className="text-xs text-gray-500">Price varies by platform</p>
          </div>
          <button
            onClick={() => onAddToCart(item)}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-emerald-700 hover:to-emerald-600 transition-all duration-200 flex items-center space-x-2 transform hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span className="font-medium">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;