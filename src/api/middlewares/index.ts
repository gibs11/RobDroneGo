import attachCurrentUser from './attachCurrentUser';
import isAuth from './isAuth';
import { validateAccessToken, checkRequiredPermissions } from './auth0.middleware';

export default {
  attachCurrentUser,
  isAuth,
  validateAccessToken,
  checkRequiredPermissions,
};
