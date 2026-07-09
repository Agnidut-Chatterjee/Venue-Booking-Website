import express from 'express';
import bcrypt from 'bcryptjs'; 
import nodemailer from 'nodemailer'; 
import jwt from 'jsonwebtoken'; 
import User from '../Models/User.js'; 

const router = express.Router();

// ==========================================
// 1. SEND OTP ROUTE
// ==========================================
router.post('/send-otp', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const admin = await User.findOne({ e_mail: email });
        if (!admin) return res.status(404).json({ message: "Admin account not found." });

        if (admin.role !== 'owner' && admin.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Admin permissions required." });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials." });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        admin.resetOtp = otp;
        admin.resetOtpExpire = Date.now() + 10 * 60 * 1000;
        await admin.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: admin.e_mail,
            subject: 'Admin Login Security Code - Atithi Appyan',
            text: `Your Admin Security Code is: ${otp}\n\nValid for 10 minutes.`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "OTP sent successfully!" });
        
    } catch (error) {
        res.status(500).json({ message: "Server error while sending OTP." });
    }
});

// ==========================================
// 2. VERIFY OTP & LOGIN ROUTE
// ==========================================
router.post('/login', async (req, res) => {
    const { email, securityCode } = req.body;
    
    try {
        const admin = await User.findOne({ e_mail: email });
        if (!admin) return res.status(404).json({ message: "Admin account not found." });

        if (admin.resetOtp !== securityCode) {
            return res.status(400).json({ message: "Invalid Security Code." });
        }

        if (admin.resetOtpExpire < Date.now()) {
            return res.status(400).json({ message: "Security Code has expired." });
        }

        admin.resetOtp = undefined;
        admin.resetOtpExpire = undefined;
        await admin.save();

        // 👉 Optimized Token: Includes both ID and Role
        const token = jwt.sign(
            { 
                id: admin._id,
                role: admin.role 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.status(200).json({ 
            message: "Admin login successful!",
            admin: {
                id: admin._id,
                name: `${admin.first_name} ${admin.last_name}`, 
                email: admin.e_mail,
                role: admin.role,
                token: token
            }
        });
        
    } catch (error) {
        res.status(500).json({ message: "Server error during login." });
    }
});

export default router;