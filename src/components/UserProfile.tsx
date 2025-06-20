import React, { useState } from 'react';
import { X, User, Settings, Heart, Bell, DollarSign, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    favoriteStores: user?.preferences.favoriteStores || [],
    priceAlerts: user?.preferences.priceAlerts || true,
    maxBudget: user?.preferences.maxBudget || 5000
  });

  const availableStores = ['Amazon', 'BigBasket', 'JioMart', 'Blinkit', 'Flipkart', 'Zepto', 'Swiggy Instamart'];

  const handleStoreToggle = (store: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteStores: prev.favoriteStores.includes(store)
        ? prev.favoriteStores.filter(s => s !== store)
        : [...prev.favoriteStores, store]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await updateProfile({
        name: formData.name,
        preferences: {
          favoriteStores: formData.favoriteStores,
          priceAlerts: formData.priceAlerts,
          maxBudget: formData.maxBudget
        }
      });
      setMessage('Profile updated successfully!');
    } catch (error: any) {
      setMessage(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <User className="h-6 w-6 text-emerald-600" />
            <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('success') 
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Basic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>
            </div>

            {/* Favorite Stores */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Favorite Stores
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {availableStores.map(store => (
                  <button
                    key={store}
                    type="button"
                    onClick={() => handleStoreToggle(store)}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      formData.favoriteStores.includes(store)
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {store}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Price Alerts</label>
                    <p className="text-xs text-gray-500">Get notified when prices drop</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.priceAlerts}
                    onChange={(e) => setFormData(prev => ({ ...prev, priceAlerts: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Maximum Budget: ₹{formData.maxBudget}
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="20000"
                    step="500"
                    value={formData.maxBudget}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxBudget: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>₹1,000</span>
                    <span>₹20,000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Saved Items */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Watchlist</h3>
              {user.savedItems && user.savedItems.length > 0 ? (
                <div className="space-y-2">
                  {user.savedItems.slice(0, 3).map(item => (
                    <div key={item.itemId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">Target: ₹{item.targetPrice}</p>
                      </div>
                    </div>
                  ))}
                  {user.savedItems.length > 3 && (
                    <p className="text-xs text-gray-500">+{user.savedItems.length - 3} more items</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No items in watchlist</p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleLogout}
                className="w-full border border-red-300 text-red-700 py-3 px-4 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;