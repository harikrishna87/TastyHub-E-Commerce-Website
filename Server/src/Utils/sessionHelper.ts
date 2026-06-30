import { Request, Response } from 'express';
import crypto from 'crypto';
import UserSession from '../Models/UserSession';
import mongoose from 'mongoose';

export const createUserSession = async (userId: mongoose.Types.ObjectId, req: Request, res: Response) => {
  try {
    // Delete any existing session for the user first to keep DB clean
    await UserSession.deleteMany({ user: userId });

    // Generate a secure random token
    const rememberToken = crypto.randomBytes(40).toString('hex');
    
    // Set expiration based on COOKIE_EXPIRE environment variable (default 365 days)
    const cookieExpireDays = Number(process.env.COOKIE_EXPIRE) || 365;
    const expiresAt = new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000);
    
    // Extract client IP address and User-Agent
    const ipAddress = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || req.ip || '').split(',')[0].trim();
    const userAgent = req.headers['user-agent'] || '';

    // Save to database
    await UserSession.create({
      user: userId,
      rememberToken,
      ipAddress,
      userAgent,
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
