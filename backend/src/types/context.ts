import { Request, Response } from 'express';
import { IUser } from '../models';

export interface AppContext {
  req: Request;
  res: Response;
  user: IUser | null;
}
