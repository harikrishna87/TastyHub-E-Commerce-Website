import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminNotification extends Document {
    type: 'new_user' | 'new_order';
    title: string;
    message: string;
    userId?: mongoose.Types.ObjectId;
    orderId?: mongoose.Types.ObjectId;
    userName?: string;
    userEmail?: string;
    orderAmount?: number;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AdminNotificationSchema: Schema = new Schema(
    {
        type: {
            type: String,
            enum: ['new_user', 'new_order'],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        },
        userName: {
            type: String,
        },
        userEmail: {
            type: String,
        },
        orderAmount: {
            type: Number,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            index: { expires: 0 }
        }
    },
    { timestamps: true }
);

const AdminNotification = mongoose.model<IAdminNotification>('AdminNotification', AdminNotificationSchema);

export default AdminNotification;
