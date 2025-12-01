import { Response } from 'express';
import { IUser } from '../Types';

interface TokenOptions {
  expires: Date;
  httpOnly: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
  secure?: boolean;
}

const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const token = user.getJwtToken();

  const cookieExpireDays = Number(process.env.COOKIE_EXPIRE) || 7;

  const options: TokenOptions = {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

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
      },
      token,
    });
};

export default sendToken;