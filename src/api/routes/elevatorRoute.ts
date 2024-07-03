import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import { Container } from 'typedi';
import IElevatorController from '../../controllers/IControllers/IElevatorController';
import config from '../../../config';
import { checkRequiredPermissions, validateAccessToken } from '../middlewares/auth0.middleware';

const route = Router();
const campusPrefix = config.api.campus_api;

export default (app: Router) => {
  app.use(campusPrefix + '/elevators', route);

  const ctrl = Container.get(config.controllers.elevator.name) as IElevatorController;

  // Define the action for a POST request to the route
  route.post(
    '',
    celebrate({
      body: Joi.object({
        domainId: Joi.string().allow(null),
        brand: Joi.string().allow(null),
        model: Joi.string().allow(null),
        serialNumber: Joi.string().allow(null),
        description: Joi.string().allow(null),
        elevatorPosition: Joi.object({
          xposition: Joi.number().required(),
          yposition: Joi.number().required(),
        }).required(),
        orientation: Joi.string()
          .valid('NORTH', 'SOUTH', 'WEST', 'EAST')
          .required(),
        floors: Joi.array()
          .items(Joi.string())
          .required(),
        building: Joi.string().required(),
      }),
    }),
    validateAccessToken,
    checkRequiredPermissions(['manage:campus']),
    (req, res) => ctrl.createElevator(req, res),
  );

  // Define the action for a PATCH request to the route
  route.patch(
    '/:elevatorId',
    celebrate({
      body: Joi.object({
        brand: Joi.string().allow(null),
        model: Joi.string().allow(null),
        serialNumber: Joi.string().allow(null),
        description: Joi.string().allow(null),
        elevatorPosition: Joi.object({
          xposition: Joi.number().allow(null),
          yposition: Joi.number().allow(null),
        }).allow(null),
        orientation: Joi.string()
          .valid('NORTH', 'SOUTH', 'WEST', 'EAST')
          .allow(null),
        floors: Joi.array()
          .items(Joi.string())
          .allow(null),
      }),
    }),
    validateAccessToken,
    checkRequiredPermissions(['manage:campus']),
    (req, res) => ctrl.updateElevator(req, res),
  );

  // Define the action for a GET request to the route
  route.get('/inBuilding/:buildingId', validateAccessToken, checkRequiredPermissions(['manage:campus']), (req, res) =>
    ctrl.listElevatorsFromBuilding(req, res),
  );

  // Define the action for a GET request to the route
  route.get('', validateAccessToken, checkRequiredPermissions(['manage:campus']), (req, res) =>
    ctrl.listAllElevators(req, res),
  );
};
