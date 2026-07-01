import { Request, Response } from 'express';
import crypto from 'crypto';
import UserSession from '../Models/UserSession';
import mongoose from 'mongoose';

export const createUserSession = async (userId: mongoose.Types.ObjectId, req: Request, res: Response, rememberMe: boolean = true): Promise<string | undefined> => {
  // Session creation/refresh tokens removed as per request.
  // JWT expires in 365 days instead.
  return undefined;
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
