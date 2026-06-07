import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSession extends Document {
  user: mongoose.Types.ObjectId;
  rememberToken: string;
  expiresAt: Date;
}

const UserSessionSchema = new Schema<IUserSession>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rememberToken: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index: auto-delete document when expired
  }
}, { timestamps: true });

const UserSession = mongoose.model<IUserSession>('UserSession', UserSessionSchema);
export default UserSession;
