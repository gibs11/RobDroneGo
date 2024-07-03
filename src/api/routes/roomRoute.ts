import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import { Container } from 'typedi';

import config from '../../../config';
import IRoomController from '../../controllers/IControllers/IRoomController';
import { checkRequiredPermissions, validateAccessToken } from '../middlewares/auth0.middleware';

const route = Router();
const campusPrefix = config.api.campus_api;

export default (app: Router) => {
  // Define the route name
  app.use(campusPrefix + '/rooms', route);

  // Get the controller instance
  const controller = Container.get(config.controllers.room.name) as IRoomController;

  // Define the action for a POST request to the route
  route.post(
    '',
    celebrate({
      body: Joi.object({
        // Allow null for the id
        domainId: Joi.string().allow(null),
        name: Joi.string().required(),
        description: Joi.string().required(),
        category: Joi.string().required(),
        dimensions: Joi.object({
          initialPosition: Joi.object({
            xPosition: Joi.number().required(),
            yPosition: Joi.number().required(),
          }).required(),
          finalPosition: Joi.object({
            xPosition: Joi.number().required(),
            yPosition: Joi.number().required(),
          }).required(),
        }).required(),
        doorPosition: Joi.object({
          xPosition: Joi.number().required(),
          yPosition: Joi.number().required(),
        }).required(),
        doorOrientation: Joi.string()
          .valid('NORTH', 'SOUTH', 'WEST', 'EAST')
          .required(),
        floorId: Joi.string().required(),
      }),
    }),
    validateAccessToken,
    checkRequiredPermissions(['manage:campus']),
    (req, res) => controller.createRoom(req, res),
  );

  // Define the action for a GET request to the route
  route.get('', validateAccessToken, checkRequiredPermissions(['manage:campus']), (req, res) =>
    controller.listRooms(res),
  );

  // Define the action for a GET request to the route
  route.get(
    '/:id',
    validateAccessToken,
    checkRequiredPermissions(['manage:campus', 'manage:tasks', 'manage:fleet', 'user:requests']),
    (req, res) => controller.listRoomsByFloor(req, res),
  );
};
