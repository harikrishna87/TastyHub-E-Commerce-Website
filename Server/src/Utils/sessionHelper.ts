import { Response } from 'express';
import crypto from 'crypto';
import UserSession from '../Models/UserSession';
import mongoose from 'mongoose';

export const createUserSession = async (userId: mongoose.Types.ObjectId, res: Response) => {
  try {
    // Delete any existing session for the user first to keep DB clean
    await UserSession.deleteMany({ user: userId });

    // Generate a secure random token
    const rememberToken = crypto.randomBytes(40).toString('hex');
    
    // Set expiration to 30 days from now
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    // Save to database
    await UserSession.create({
      user: userId,
      rememberToken,
      expiresAt
    });
    
    // Set HttpOnly cookie
    const cookieOptions = {
      expires: expiresAt,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as any,
    };
    
    res.cookie('tastyhub_remember_me', rememberToken, cookieOptions);
  } catch (error) {
    console.error('Error creating user session in DB:', error);
  }
};

export const clearUserSession = async (rememberToken: string, res: Response) => {
  try {
    if (rememberToken && rememberToken !== 'none') {
      await UserSession.deleteOne({ rememberToken });
    }
  } catch (error) {
    console.error('Error clearing user session in DB:', error);
  } finally {
    res.cookie('tastyhub_remember_me', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as any,
    });
  }
};
