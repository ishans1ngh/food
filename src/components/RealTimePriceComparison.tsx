import React, { useState, useEffect } from 'react';
import { ArrowRight, Award, TrendingDown, ExternalLink, Star, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { CartItem } from '../types';
import axios from 'axios';

interface PlatformPrice {
  platform: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  availability: boolean;
  inStock: boolean;
  deliveryTime: string;
  productUrl: string;
  rating: number;
  reviewCount: number;
  logo: string;
  color: string;
}

interface PriceComparisonData {
  itemId: string;
  itemName: string;
  timestamp: string;
  platforms: PlatformPrice[];
  bestDeal: PlatformPrice;
  summary: {
    lowestPrice: number;
    highestPrice: number;
    averagePrice: number;
    availablePlatforms: number;
  };
}

interface BulkComparisonResult {
  timestamp: string;
  itemCount: number;
  comparisons: Array<{
    item: CartItem;
    platforms: PlatformPrice[];
    bestDeal: PlatformPrice;
  }>;
  platformTotals: Array<{
    platform: string;
    total: number;
    items: number;
    logo: string;
    color: string;
  }>;
  bestOverallPlatform: {
    platform: string;
    total: number;
    items: number;
    logo: string;
    color: string;
  };
  totalSavings: number;
}

interface RealTimePriceComparisonProps {
  cartItems: CartItem[];
  onClose: () => void;
}

const RealTimePriceComparison: React.FC<RealTimePriceComparisonProps> = ({ cartItems, onClose }) => {
  const [comparisonData, setComparisonData] = useState<BulkComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPriceComparison = async () => {
    setLoading(true);
    setError(null);

    try {
      const items = cartItems.map(item => ({
        itemId: item.id,
        itemName: item.name,
        basePrice: 50, // You can calculate this from your existing data
        quantity: item.quantity
      }));

      const response = await axios.post('/prices/compare', { items });
      setComparisonData(response.data);
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error('Price comparison error:', error);
      setError(error.response?.data?.message || 'Failed to fetch price comparison');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cartItems.length > 0) {
      fetchPriceComparison();
    }
  }, [cartItems]);

  const handleRefresh = () => {
    fetchPriceComparison();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-50">
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Comparing Prices</h3>
            <p className="text-gray-600">Fetching real-time prices from all platforms...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-50">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Prices</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex space-x-3">
              <button
                onClick={handleRefresh}
                className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!comparisonData) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Real-Time Price Comparison</h1>
              {lastUpdated && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  Updated {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                ← Back to Shopping
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100">Best Platform</p>
                <p className="text-2xl font-bold">{comparisonData.bestOverallPlatform.platform}</p>
                <p className="text-emerald-100">₹{comparisonData.bestOverallPlatform.total}</p>
              </div>
              <Award className="h-12 w-12 text-emerald-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Items</p>
                <p className="text-2xl font-bold">{comparisonData.itemCount}</p>
                <p className="text-blue-100">Products compared</p>
              </div>
              <Star className="h-12 w-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Potential Savings</p>
                <p className="text-2xl font-bold">₹{comparisonData.totalSavings}</p>
                <p className="text-orange-100">vs highest price</p>
              </div>
              <TrendingDown className="h-12 w-12 text-orange-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Platforms</p>
                <p className="text-2xl font-bold">{comparisonData.platformTotals.length}</p>
                <p className="text-purple-100">Available stores</p>
              </div>
              <ExternalLink className="h-12 w-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Platform Comparison */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Platform Totals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {comparisonData.platformTotals.map((platform, index) => (
              <div
                key={platform.platform}
                className={`p-4 rounded-lg border-2 ${
                  index === 0 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium flex items-center" style={{ color: platform.color }}>
                    <span className="mr-2">{platform.logo}</span>
                    {platform.platform}
                  </span>
                  {index === 0 && (
                    <Award className="h-5 w-5 text-emerald-500" />
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900">₹{platform.total}</p>
                <p className="text-sm text-gray-600">{platform.items} items</p>
                {index === 0 && (
                  <button className="w-full mt-3 bg-emerald-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-1">
                    <span>Shop from {platform.platform}</span>
                    <ExternalLink className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Item Comparison */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Item-wise Price Comparison</h2>
          <div className="space-y-6">
            {comparisonData.comparisons.map((comparison) => (
              <div key={comparison.item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={comparison.item.image}
                    alt={comparison.item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{comparison.item.name}</h3>
                    <p className="text-sm text-gray-600">{comparison.item.brand} • {comparison.item.unit}</p>
                    <p className="text-sm text-gray-500">Quantity: {comparison.item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Best price:</p>
                    <p className="text-lg font-bold text-emerald-600">
                      ₹{(comparison.bestDeal.price * comparison.item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">on {comparison.bestDeal.platform}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {comparison.platforms.map((platform) => (
                    <div
                      key={platform.platform}
                      className={`p-3 rounded-lg border ${
                        platform.platform === comparison.bestDeal.platform
                          ? 'border-emerald-500 bg-emerald-50'
                          : platform.availability && platform.inStock
                          ? 'border-gray-200 bg-white'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium flex items-center" style={{ color: platform.color }}>
                          <span className="mr-1">{platform.logo}</span>
                          {platform.platform}
                        </span>
                        {platform.platform === comparison.bestDeal.platform && (
                          <Award className="h-4 w-4 text-emerald-500" />
                        )}
                      </div>
                      
                      {platform.availability && platform.inStock ? (
                        <>
                          <div className="mb-1">
                            {platform.discount && platform.originalPrice ? (
                              <div>
                                <span className="text-xs text-gray-500 line-through">
                                  ₹{(platform.originalPrice * comparison.item.quantity).toFixed(2)}
                                </span>
                                <span className="ml-1 text-xs bg-red-100 text-red-800 px-1 rounded">
                                  {platform.discount}% off
                                </span>
                              </div>
                            ) : null}
                            <p className="font-semibold text-gray-900">
                              ₹{(platform.price * comparison.item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center mb-2">
                            <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                            <span className="text-xs text-gray-600">{platform.rating} ({platform.reviewCount})</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{platform.deliveryTime}</p>
                          {platform.platform === comparison.bestDeal.platform ? (
                            <a
                              href={platform.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-emerald-600 text-white py-1 px-2 rounded text-xs font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-1"
                            >
                              <span>Buy Now</span>
                              <ArrowRight className="h-3 w-3" />
                            </a>
                          ) : (
                            <a
                              href={platform.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full border border-gray-300 text-gray-700 py-1 px-2 rounded text-xs font-medium hover:bg-gray-50 transition-colors text-center block"
                            >
                              View Details
                            </a>
                          )}
                        </>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-500 mb-2">Not available</p>
                          <div className="w-full bg-gray-200 py-1 px-2 rounded text-xs text-gray-500 text-center">
                            Out of stock
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Footer */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ready to checkout?</h3>
              <p className="text-gray-600">
                Save ₹{comparisonData.totalSavings} by shopping smart across platforms
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Add More Items
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-600 transition-all duration-200 flex items-center space-x-2">
                <span>Proceed with Best Deals</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimePriceComparison;