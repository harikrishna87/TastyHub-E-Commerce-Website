import { IUser } from '../Types';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {};