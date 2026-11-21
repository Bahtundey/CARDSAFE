import { Request, Response } from 'express';
import { getAuthenticatedUser } from '../middleware/auth';
import { AppContext } from '../types/context';

export async function buildContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<AppContext> {
  const user = await getAuthenticatedUser(req);
  return { req, res, user };
}
