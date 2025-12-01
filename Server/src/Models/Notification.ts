import mongoose, { Schema } from 'mongoose';

const NotificationSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 259200 }
}, { timestamps: true });

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
