import { Request, Response } from 'express';
import { InvalidTokenError, UnauthorizedError, InsufficientScopeError } from 'express-oauth2-jwt-bearer';
import { Utils } from '../../core/logic/Utils';

export const errorHandler = (error: any, request: Request, response: Response) => {
  if (error instanceof InsufficientScopeError) {
    const message = 'Permission denied';

    response.status(error.status).json({ message });

    return;
  }

  if (error instanceof InvalidTokenError) {
    const message = 'Bad credentials';

    response.status(error.status).json({ message });

    return;
  }

  if (error instanceof UnauthorizedError) {
    const message = 'Requires authentication';

    response.status(error.status).json({ message });

    return;
  }

  if (error.name === 'ValidationError') {
    const err = {
      message: Utils.formatCelebrateErrorMessage(error.details[0].message),
    };
    return response
      .status(400)
      .send(err)
      .end();
  }

  const status = 500;
  const message = 'Internal Server Error';

  response.status(status).json({ message });
};
