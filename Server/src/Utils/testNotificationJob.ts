import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

// Load environment variables immediately before any other imports
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function run() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    // Dynamically import database and notification modules to prevent import hoisting bugs
    const connectDB = (await import('../Config/Database_Connection')).default;
    const { sendScheduledDealsNotifications } = await import('../Controller/NotificationController');

    await connectDB();
    
    console.log('🔔 Triggering sendScheduledDealsNotifications()...');
    await sendScheduledDealsNotifications();
    
    console.log('🔌 Closing MongoDB connection...');
    await mongoose.connection.close();
    console.log('👋 Done!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Critical error in test script:', error);
    process.exit(1);
  }
}

run();
