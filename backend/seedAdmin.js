import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; 
import dotenv from 'dotenv';
import dns from 'dns';
import { connectDB } from './config/db.js'; // 👉 IMPORT YOUR WORKING CONNECTION!
import User from './models/User.js'; 

// Mirroring your server.js setup exactly
dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ override: true, debug: false });

async function createDummyAdmin() {
  try {
    // 1. Fire up the exact same connection your server uses
    console.log("Attempting to connect using Config/db.js...");
    await connectDB(); 

    // 2. Hash the temporary password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Agni1900', salt);

    // 3. Create the dummy user document
    const dummyAdmin = new User({
      first_name: 'Dummy',      
      last_name: 'Admin',
      e_mail: 'test123agni@gmail.com',
      mobile: '0000000000',
      address: 'Admin Portal',
      password: hashedPassword,
      role: 'owner' 
    });

    // 4. Save to database
    await dummyAdmin.save();
    console.log('✅ Dummy admin successfully created!');

  } catch (error) {
    console.error('❌ Error during creation:', error);
  } finally {
    // Gracefully close the connection so the script ends
    mongoose.disconnect();
  }
}

createDummyAdmin();