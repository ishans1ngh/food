import mongoose from 'mongoose';

const priceHistorySchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true,
    index: true
  },
  itemName: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['Amazon', 'BigBasket', 'JioMart', 'Blinkit', 'Flipkart', 'Zepto', 'Swiggy Instamart']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  discount: {
    type: Number,
    min: 0,
    max: 100
  },
  availability: {
    type: Boolean,
    default: true
  },
  inStock: {
    type: Boolean,
    default: true
  },
  deliveryTime: {
    type: String,
    default: '1-2 days'
  },
  productUrl: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
priceHistorySchema.index({ itemId: 1, platform: 1, createdAt: -1 });

export default mongoose.model('PriceHistory', priceHistorySchema);