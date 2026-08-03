import { Response } from 'express';
import { IUser } from '../Types';

interface TokenOptions {
  expires?: Date;
  httpOnly: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
  secure?: boolean;
}

const sendToken = (user: IUser, statusCode: number, res: Response, rememberMe: boolean = true, rememberToken?: string) => {
  const token = user.getJwtToken();

  const req = res.req;
  const isSecure = req ? (req.secure || req.headers['x-forwarded-proto'] === 'https') : false;
  const secure = process.env.NODE_ENV === 'production' || !!isSecure;

  const options: TokenOptions = {
    httpOnly: true,
    secure: secure,
    sameSite: secure ? 'none' : 'lax',
  };

  if (rememberMe) {
    const cookieExpireDays = Number(process.env.COOKIE_EXPIRE) || 7;
    options.expires = new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000); // Access token cookie expiration based on COOKIE_EXPIRE
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
      },
      token,
      rememberToken, // Fallback for clients blocking cross-origin third-party cookies
    });
};

export default sendToken;