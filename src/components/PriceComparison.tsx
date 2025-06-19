import React from 'react';
import { ArrowRight, Award, TrendingDown, ExternalLink, Star } from 'lucide-react';
import { PriceComparisonResult } from '../types';
import { calculatePlatformTotals, getBestDealRecommendation } from '../utils/priceComparison';

interface PriceComparisonProps {
  results: PriceComparisonResult[];
  onClose: () => void;
}

const PriceComparison: React.FC<PriceComparisonProps> = ({ results, onClose }) => {
  const platformTotals = calculatePlatformTotals(results);
  const bestDeal = getBestDealRecommendation(results);
  const totalSavings = platformTotals.length > 1 ? 
    Math.round((platformTotals[platformTotals.length - 1].total - platformTotals[0].total) * 100) / 100 : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Price Comparison Results</h1>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              ← Back to Shopping
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100">Best Platform</p>
                <p className="text-2xl font-bold">{platformTotals[0]?.platform}</p>
                <p className="text-emerald-100">₹{platformTotals[0]?.total}</p>
              </div>
              <Award className="h-12 w-12 text-emerald-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Items</p>
                <p className="text-2xl font-bold">{results.length}</p>
                <p className="text-blue-100">Products compared</p>
              </div>
              <Star className="h-12 w-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Potential Savings</p>
                <p className="text-2xl font-bold">₹{totalSavings}</p>
                <p className="text-orange-100">vs highest price</p>
              </div>
              <TrendingDown className="h-12 w-12 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Platform Comparison */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Platform Totals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {platformTotals.map((platform, index) => (
              <div
                key={platform.platform}
                className={`p-4 rounded-lg border-2 ${
                  index === 0 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium" style={{ color: platform.color }}>
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
                    <span>Buy from {platform.platform}</span>
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
            {results.map((result) => (
              <div key={result.item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={result.item.image}
                    alt={result.item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{result.item.name}</h3>
                    <p className="text-sm text-gray-600">{result.item.brand} • {result.item.unit}</p>
                    <p className="text-sm text-gray-500">Quantity: {result.item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Best price:</p>
                    <p className="text-lg font-bold text-emerald-600">
                      ₹{(result.cheapestPlatform.price * result.item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">on {result.cheapestPlatform.platform}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {result.allPlatforms.map((platform) => (
                    <div
                      key={platform.platform}
                      className={`p-3 rounded-lg border ${
                        platform.platform === result.cheapestPlatform.platform
                          ? 'border-emerald-500 bg-emerald-50'
                          : platform.availability && platform.inStock
                          ? 'border-gray-200 bg-white'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: platform.color }}>
                          {platform.logo} {platform.platform}
                        </span>
                        {platform.platform === result.cheapestPlatform.platform && (
                          <Award className="h-4 w-4 text-emerald-500" />
                        )}
                      </div>
                      
                      {platform.availability && platform.inStock ? (
                        <>
                          <div className="mb-1">
                            {platform.discount && platform.originalPrice ? (
                              <div>
                                <span className="text-xs text-gray-500 line-through">
                                  ₹{(platform.originalPrice * result.item.quantity).toFixed(2)}
                                </span>
                                <span className="ml-1 text-xs bg-red-100 text-red-800 px-1 rounded">
                                  {platform.discount}% off
                                </span>
                              </div>
                            ) : null}
                            <p className="font-semibold text-gray-900">
                              ₹{(platform.price * result.item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{platform.deliveryTime}</p>
                          {platform.platform === result.cheapestPlatform.platform ? (
                            <button className="w-full bg-emerald-600 text-white py-1 px-2 rounded text-xs font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-1">
                              <span>Buy Now</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          ) : (
                            <button className="w-full border border-gray-300 text-gray-700 py-1 px-2 rounded text-xs font-medium hover:bg-gray-50 transition-colors">
                              View Details
                            </button>
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
                Save ₹{totalSavings} by shopping smart across platforms
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

export default PriceComparison;