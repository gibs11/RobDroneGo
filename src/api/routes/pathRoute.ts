import { Router } from 'express';
import config from '../../../config';
import { Container } from 'typedi';
import { celebrate, Joi } from 'celebrate';
import IPathController from '../../controllers/IControllers/IPathController';
import { checkRequiredPermissions, validateAccessToken } from '../middlewares/auth0.middleware';

const route = Router();
const taskPrefix = config.api.task_api;

export default (app: Router) => {
  app.use(taskPrefix + '/path', route);

  const controller = Container.get(config.controllers.path.name) as IPathController;

  route.get(
    '',
    celebrate({
      query: Joi.object().keys({
        originFloorId: Joi.string().required(),
        originRoomId: Joi.string().required(),
        destinationFloorId: Joi.string().required(),
        destinationRoomId: Joi.string().required(),
      }),
    }),
    validateAccessToken,
    checkRequiredPermissions(['manage:tasks']),
    (request, response) => controller.getLowestCostPath(request, response),
  );
};
