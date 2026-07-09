import express from 'express';
import Booking from '../models/Booking.js'; // Adjust the path to wherever your models are saved

const router = express.Router();

// ==========================================
// 1. CUSTOMER ROUTE: Create a New Booking
// ==========================================
// Method: POST
// Endpoint: /api/bookings
router.post('/bookings', async (req, res) => {
  try {
    const { user, venue, phoneNumber, description, eventDate, charges } = req.body;

    // Create the new booking document
    const newBooking = new Booking({
      user,
      venue,
      phoneNumber,
      description,
      eventDate,
      charges
    });

    // Save to the database
    const savedBooking = await newBooking.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Booking request submitted successfully!',
      booking: savedBooking 
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// ==========================================
// 2. ADMIN ROUTE: Get All Bookings
// ==========================================
// Method: GET
// Endpoint: /api/admin/bookings
router.get('/admin/bookings', async (req, res) => {
  try {
    // .populate() pulls the actual data from the User and Venue tables
    // Notice how we use 'first_name', 'last_name', etc., matching your exact User schema
    const bookings = await Booking.find()
      .populate('user', 'first_name last_name e_mail mobile') 
      .populate('venue', 'venueName address contactNo')
      .sort({ createdAt: -1 }); // Sorts by newest bookings first

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// ==========================================
// 3. ADMIN ROUTE: Update Booking Status
// ==========================================
// Method: PUT
// Endpoint: /api/admin/bookings/:id/status
router.put('/admin/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expecting 'Confirmed' or 'Canceled'

    // Validate that the status is one of the allowed enums
    if (!['Pending', 'Confirmed', 'Canceled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update' });
    }

    // Find the booking by ID and update it
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true } // Returns the newly updated document
    ).populate('user', 'first_name e_mail'); // Optional: populate so you can send a confirmation email later

    if (!updatedBooking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: `Booking status updated to ${status}`,
      booking: updatedBooking 
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// ==========================================
// ADMIN ROUTE: Update Booking Details (Edit)
// ==========================================
router.put('/admin/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { guestCount, charges } = req.body;

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { guestCount, charges },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.error('Error updating booking details:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// ==========================================
// 4. CUSTOMER ROUTE: Get User's Specific Bookings
// ==========================================
// Method: GET
// Endpoint: /api/bookings/user/:userId
router.get('/bookings/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find all bookings where the 'user' matches the ID passed in the URL
    // .populate() grabs the venue name and address so we can show it to the user
    const userBookings = await Booking.find({ user: userId })
      .populate('venue', 'venueName address')
      .sort({ createdAt: -1 }); // Sorts by newest bookings first

    res.status(200).json({ success: true, bookings: userBookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;