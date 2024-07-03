import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';

import { Container } from 'typedi';
import IPassageController from '../../controllers/IControllers/IPassageController';

import config from '../../../config';
import { checkRequiredPermissions, validateAccessToken } from '../middlewares/auth0.middleware';

const route = Router();
const campusPrefix = config.api.campus_api;

export default (app: Router) => {
  app.use(campusPrefix + '/passages', route);

  const controller = Container.get(config.controllers.passage.name) as IPassageController;

  route.post(
    '',
    celebrate({
      body: Joi.object({
        domainId: Joi.string().allow(null),
        passageStartPoint: Joi.object({
          floorId: Joi.string().required(),
          firstCoordinates: {
            x: Joi.number().required(),
            y: Joi.number().required(),
          },
          lastCoordinates: {
            x: Joi.number().required(),
            y: Joi.number().required(),
          },
        }).required(),
        passageEndPoint: Joi.object({
          floorId: Joi.string().required(),
          firstCoordinates: {
            x: Joi.number().required(),
            y: Joi.number().required(),
          },
          lastCoordinates: {
            x: Joi.number().required(),
            y: Joi.number().required(),
          },
        }).required(),
      }).required(),
    }),
    validateAccessToken,
    checkRequiredPermissions(['manage:campus']),
    (request, response) => controller.createPassage(request, response),
  );

  route.get(
    '/filter',
    celebrate({
      query: Joi.object().keys({
        firstBuildingId: Joi.string().required(),
        lastBuildingId: Joi.string().required(),
      }),
    }),
    validateAccessToken,
    checkRequiredPermissions(['manage:campus']),
    (request, response) => controller.listPassagesBetweenBuildings(request, response),
  );

  route.get('', validateAccessToken, (request, response) => controller.listPassages(response));

  route.patch(
    '/:id',
    celebrate({
      body: Joi.object({
        passageStartPoint: Joi.object({
          floorId: Joi.string().allow(null),
          firstCoordinates: {
            x: Joi.number().allow(null),
            y: Joi.number().allow(null),
          },
          lastCoordinates: {
            x: Joi.number().allow(null),
            y: Joi.number().allow(null),
          },
        }).allow(null),
        passageEndPoint: Joi.object({
          floorId: Joi.string().allow(null),
          firstCoordinates: {
            x: Joi.number().allow(null),
            y: Joi.number().allow(null),
          },
          lastCoordinates: {
            x: Joi.number().allow(null),
            y: Joi.number().allow(null),
          },
        }).allow(null),
      }),
    }),
    validateAccessToken,
    checkRequiredPermissions(['manage:campus']),
    (request, response) => controller.editPassage(request, response),
  );
};
