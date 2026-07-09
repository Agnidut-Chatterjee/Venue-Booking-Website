// models/Booking.js
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  // The Bridge: Links directly to your exact User and Venue models
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  venue: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Venue', 
    required: true 
  },
  
  // Specific details for the admin to see
  phoneNumber: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String,
    required: false 
  },
  eventDate: { 
    type: Date, 
    required: true 
  },
  charges: { 
    type: String, // Kept as String to match your Venue schema
    required: true 
  },
  
  // 👉 NEW: Added guest count for the admin to track and edit
  guestCount: {
    type: Number,
    default: 0
  },
  
  // The Admin Control Field
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Canceled'], 
    default: 'Pending' 
  }
}, { 
  timestamps: true, // Automatically adds createdAt (Book Date) and updatedAt
  collection: 'booking_table'
});

// The same safety fix you used for the User model
const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

export default Booking;