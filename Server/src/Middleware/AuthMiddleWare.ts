import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../Models/Users';
import { IUser } from '../Types';

const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
    return;
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
    req.user = (await User.findById(decoded.id).select('-password')) as IUser;
    
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      return;
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: `User role ${req.user?.role || 'none'} is not authorized to access this route` 
      });
      return;
    }
    next();
  };
};

export { protect, authorizeRoles };