// routes/venueRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import Venue from '../models/Venue.js';

const router = express.Router();

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Saves files to the 'uploads' folder you just created
  },
  filename: function (req, file, cb) {
    // Adds a timestamp to the file name so multiple files with the same name don't overwrite each other
    cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_')); 
  }
});

// Middleware that allows up to 5 images to be uploaded under the field name 'images'
const upload = multer({ storage: storage });


// ==========================================
// 1. CREATE: Add a new venue (NOW WITH IMAGES)
// ==========================================
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    // 1. Get the URLs/paths of the newly saved files
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    
    // 2. Reconstruct the data. (Because FormData sends everything as text, 
    // we have to parse the 'description' back into a JSON object)
    const venueData = {
      ...req.body,
      images: imageUrls,
      description: JSON.parse(req.body.description) 
    };

    const newVenue = new Venue(venueData);
    const savedVenue = await newVenue.save();
    res.status(201).json(savedVenue);
  } catch (error) {
    res.status(400).json({ message: "Error adding venue", error: error.message });
  }
});

// ==========================================
// 2. READ ALL: Get all venues
// ==========================================
router.get('/', async (req, res) => {
  try {
    const venues = await Venue.find().sort({ createdAt: -1 }); 
    res.status(200).json(venues);
  } catch (error) {
    res.status(500).json({ message: "Error fetching venues", error: error.message });
  }
});

// ==========================================
// 3. READ ONE: Get a single venue by ID
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ message: "Venue not found" });
    res.status(200).json(venue);
  } catch (error) {
    res.status(500).json({ message: "Error fetching venue", error: error.message });
  }
});

// ==========================================
// 4. UPDATE: Edit an existing venue (NOW HANDLES NEW IMAGES)
// ==========================================
router.put('/:id', upload.array('images', 5), async (req, res) => {
  try {
    let updateData = {
      ...req.body,
      description: JSON.parse(req.body.description)
    };

    // If the user uploaded NEW files during the edit, update the images array
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const updatedVenue = await Venue.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true } 
    );

    if (!updatedVenue) return res.status(404).json({ message: "Venue not found to update" });
    
    res.status(200).json(updatedVenue);
  } catch (error) {
    res.status(400).json({ message: "Error updating venue", error: error.message });
  }
});

// ==========================================
// 5. DELETE: Remove a venue
// ==========================================
router.delete('/:id', async (req, res) => {
  try {
    const deletedVenue = await Venue.findByIdAndDelete(req.params.id);
    if (!deletedVenue) return res.status(404).json({ message: "Venue not found" });
    res.status(200).json({ message: "Venue successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting venue", error: error.message });
  }
});

// ==========================================
// 6. BOOK VENUE: Add a date to bookedDates
// @route   POST /api/venues/:id/book
// ==========================================
router.post('/:id/book', async (req, res) => {
  try {
    const { date } = req.body; // Expects a string like '2026-06-15'
    
    // 1. Find the venue
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ message: "Venue not found" });

    // 2. Check if the date is already in the array (Security check)
    if (venue.bookedDates.includes(date)) {
      return res.status(400).json({ message: "This date is already booked!" });
    }

    // 3. Add the date and save
    venue.bookedDates.push(date);
    await venue.save();

    res.status(200).json({ message: "Booking successful!", venue });
  } catch (error) {
    res.status(500).json({ message: "Error booking venue", error: error.message });
  }
});

export default router;