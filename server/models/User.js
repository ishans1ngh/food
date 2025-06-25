import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number']
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  avatar: {
    type: String,
    default: ''
  },
  preferences: {
    favoriteStores: [{
      type: String,
      enum: ['Amazon', 'BigBasket', 'JioMart', 'Blinkit', 'Flipkart', 'Zepto', 'Swiggy Instamart']
    }],
    priceAlerts: {
      type: Boolean,
      default: true
    },
    maxBudget: {
      type: Number,
      default: 5000
    }
  },
  savedItems: [{
    itemId: String,
    name: String,
    targetPrice: Number,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  return userObject;
};

export default mongoose.model('User', userSchema);