import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function() {
      return !this.oauthProvider;
    },
  },
  phone: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  oauthProvider: {
    type: String,
    enum: ['google', 'facebook'],
  },
  oauthId: {
    type: String,
  },
  addresses: [
    {
      type: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home',
      },
      line1: String,
      line2: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;