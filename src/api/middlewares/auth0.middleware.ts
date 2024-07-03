import * as dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import { auth, claimCheck, InsufficientScopeError } from 'express-oauth2-jwt-bearer';

dotenv.config();

export const validateAccessToken = auth({
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  audience: process.env.AUTH0_AUDIENCE,
});

export const checkRequiredPermissions = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const permissionCheck = claimCheck(payload => {
      const permissions = payload.permissions as string[];

      for (const permission of requiredPermissions) {
        if (permissions.includes(permission)) {
          return true;
        }
      }

      throw new InsufficientScopeError();
    });

    permissionCheck(req, res, next);
  };
};
