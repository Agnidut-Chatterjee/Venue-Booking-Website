import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; 
import { connectDB } from './Config/db.js'; 
import dns from 'dns';
import User from './models/User.js'; 
import bcrypt from 'bcryptjs'; 
import nodemailer from 'nodemailer';
import adminRoutes from './routes/adminRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

// 👉 1. IMPORT YOUR EXTERNAL ROUTES
import venueRoutes from './routes/venueRoutes.js'; 
import bookingRoutes from './routes/bookingRoutes.js'; // The new booking system

// Required setup to use __dirname in modern ES6 Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ override: true, debug: false });

const app = express();
const port = process.env.PORT || 5000; 

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(cors()); 
app.use(express.json()); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// BASE ROUTE
// ==========================================
app.get('/', (req, res) => {
    res.send('Hello world, the Atithi Appyan backend is running!');
});

// ==========================================
// REGISTER ROUTE
// ==========================================
app.post('/api/auth/register', async (req, res) => {
    const { first_name, last_name, e_mail, mobile, address, password } = req.body;

    try {
        const existingUser = await User.findOne({ e_mail });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            first_name,
            last_name,
            e_mail,
            mobile,
            address,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });
        
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Server error during registration." });
    }
});

// ==========================================
// SECURE LOGIN ROUTE
// ==========================================
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    console.log(`Secure login attempt for: ${email}`);

    try {
        const user = await User.findOne({ e_mail: email });
        
        if (!user) {
            return res.status(404).json({ message: "User not found. Please register first." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials. Incorrect password." });
        }

        res.status(200).json({ 
            message: "Login successful!",
            user: {
                id: user._id,
                name: `${user.first_name} ${user.last_name}`, 
                email: user.e_mail,
                role: user.role // Passing the role to frontend for Admin checks
            }
        });
        
    } catch (error) {
        console.error("Login route error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
});

// ==========================================
// ADMIN ROUTE: GET ALL USERS
// ==========================================
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error fetching users." });
    }
});

// ==========================================
// ADMIN ROUTE: UPDATE USER (EDIT)
// ==========================================
app.put('/api/users/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } 
        );
        
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({ message: "Server error updating user." });
    }
});

// ==========================================
// ADMIN ROUTE: DELETE USER
// ==========================================
app.delete('/api/users/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ message: "Server error deleting user." });
    }
});

// ==========================================
// FORGOT PASSWORD ROUTE (Send Email OTP)
// ==========================================
app.post('/api/auth/forgot-password', async (req, res) => {
    const { e_mail } = req.body;

    try {
        const user = await User.findOne({ e_mail });
        if (!user) {
            return res.status(404).json({ message: "No account found with this email." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.resetOtp = otp;
        user.resetOtpExpire = Date.now() + 10 * 60 * 1000; 
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.e_mail,
            subject: 'Your Password Reset OTP - Atithi Appyan',
            text: `Hello ${user.first_name},\n\nYour OTP for password reset is: ${otp}\n\nThis code is valid for 10 minutes. Please do not share this code with anyone.`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "OTP sent successfully to your email!" });

    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Error sending email. Please try again later." });
    }
});

// ==========================================
// RESET PASSWORD ROUTE (Verify OTP)
// ==========================================
app.post('/api/auth/reset-password', async (req, res) => {
    const { e_mail, otp, newPassword } = req.body;

    try {
        const user = await User.findOne({ e_mail });
        if (!user) {
            return res.status(404).json({ message: "No account found with this email." });
        }

        if (user.resetOtp !== otp) {
            return res.status(400).json({ message: "Invalid OTP. Please check the code and try again." });
        }

        if (user.resetOtpExpire < Date.now()) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.resetOtp = undefined;
        user.resetOtpExpire = undefined;

        await user.save();

        res.status(200).json({ message: "Password reset successful! You can now log in." });

    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Server error during password reset." });
    }
});

// ==========================================
// CONTACT FORM ROUTE
// ==========================================
app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    try {
        // Reusing your existing nodemailer configuration
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER, // The authenticated sender
            to: process.env.EMAIL_USER,   // Sending to the admin (yourself)
            replyTo: email,               // If admin hits 'reply', it replies to the user
            subject: `New ATITHI APPYAN Contact: ${subject}`,
            text: `You have received a new message from the Atithi Appyan contact form.\n\nSender Name: ${name}\nSender Email: ${email}\n\nMessage:\n${message}`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Message sent successfully!" });

    } catch (error) {
        console.error("Contact form error:", error);
        res.status(500).json({ message: "Error sending message. Please try again later." });
    }
});


// ==========================================
// EXTERNAL ROUTE FILES
// ==========================================
app.use('/api/admin', adminRoutes);
app.use('/api/venues', venueRoutes);

// 👉 2. CONNECTED NEW BOOKING ROUTES HERE
app.use('/api', bookingRoutes);


// ==========================================
// START SERVER
// ==========================================
app.listen(port, async () => {
    await connectDB(); 
    
    try {
        await User.collection.dropIndex('email_1');
        console.log("Old email rule deleted successfully!");
    } catch (error) {
        console.log("Old email rule already gone or not found.");
    }

    console.log(`🚀 Server listening on port ${port}`);
});