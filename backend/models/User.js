import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  venue: { type: String, required: true },
  date: { type: String, required: true },
  amount: { type: String, required: true }
});

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  e_mail: {
    type: String,
    required: true,
    unique: true, 
  },
  mobile: {
    type: String,
    required: false, 
  },
  address: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
  
  // 👉 THE MISSING PIECE: The Role Field!
  role: { 
    type: String, 
    enum: ['user', 'admin', 'owner'], // Only allows these specific words
    default: 'user'                   // Normal user signups default to this
  },

  resetOtp: {
    type: String,
    required: false,
  },
  resetOtpExpire: {
    type: Date,
    required: false,
  },
  history: {
    type: [historySchema],
    default: [] 
  }
}, { 
  timestamps: true,
  collection: 'user_table' 
});

// 👉 THE SAFETY FIX: Prevents the "Cannot overwrite `User` model" crash
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;