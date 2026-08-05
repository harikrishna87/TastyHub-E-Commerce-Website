import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export interface IChatHistory extends Document {
  user: mongoose.Types.ObjectId;
  messages: IChatMessage[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  sender: {
    type: String,
    enum: ['user', 'bot'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const ChatHistorySchema = new Schema<IChatHistory>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One history document per user
    },
    messages: {
      type: [ChatMessageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const ChatHistory = mongoose.model<IChatHistory>('ChatHistory', ChatHistorySchema);
export default ChatHistory;
