// models/Venue.js
import mongoose from 'mongoose';

const venueSchema = new mongoose.Schema({
  venueName: { 
    type: String, 
    required: true 
  },
  description: {
    capacity: { 
      type: Number, 
      required: true 
    },
    cateringFacilities: { 
      type: Boolean, 
      default: false 
    },
    parkingWifi: { 
      type: Boolean, 
      default: false 
    },
    brideRoom: { 
      type: Boolean, 
      default: false 
    }
  },
  venueType: { 
    type: String, 
    required: true,
    enum: ['Hotel', 'Garden', 'Hall'] 
  },
  address: { 
    type: String, 
    required: true 
  },
  contactNo: { 
    type: String, 
    required: true 
  },
  landlineNumber: { 
    type: String, 
    required: false 
  },
  charges: { 
    type: String, 
    required: true 
  },
 images: { 
    type: [String], // Brackets mean "Array of Strings"
    required: true,
    validate: {
      validator: function(array) {
        return array.length <= 5 && array.length > 0;
      },
      message: "A venue must have at least 1 image and a maximum of 5 images."
    }
  },
  bookedDates: {
    type: [String],
    default: [] 
  }
}, { timestamps: true });

export default mongoose.model('Venue', venueSchema);