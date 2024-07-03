import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import { Container } from 'typedi';
import IBuildingController from '../../controllers/IControllers/IBuildingController';

import config from '../../../config';
import middlewares from '../middlewares';

const route = Router();
const campusPrefix = config.api.campus_api;

export default (app: Router) => {
  app.use(campusPrefix + '/buildings', route);

  const ctrl = Container.get(config.controllers.building.name) as IBuildingController;

  route.post(
    '',
    celebrate({
      body: Joi.object({
        domainId: Joi.string().allow(null),
        buildingName: Joi.string()
          .min(1)
          .max(config.configurableValues.building.maxNameLength)
          .allow(null)
          .allow(''),
        buildingDimensions: Joi.object({
          width: Joi.number().required(),
          length: Joi.number().required(),
        }).required(),
        buildingDescription: Joi.string()
          .min(1)
          .max(config.configurableValues.building.maxDescriptionLength)
          .allow(null)
          .allow(''),
        buildingCode: Joi.string()
          .min(1)
          .max(config.configurableValues.building.maxCodeLength)
          .required(),
      }),
    }),
    (req, res) => ctrl.createBuilding(req, res),
  );

  route.get(
    '/filter',
    celebrate({
      query: Joi.object().keys({
        minFloors: Joi.number()
          .integer()
          .min(0),
        maxFloors: Joi.number()
          .integer()
          .min(1),
      }),
    }),
    middlewares.validateAccessToken,
    middlewares.checkRequiredPermissions(['manage:campus']),
    (req, res) => {
      ctrl.listBuildingsWithMinAndMaxFloors(req, res);
    },
  );

  route.get(
    '',
    middlewares.validateAccessToken,
    middlewares.checkRequiredPermissions(['manage:campus', 'manage:tasks', 'manage:fleet', 'user:requests']),
    (req, res) => ctrl.listBuildings(res),
  );

  route.patch(
    '/:id',
    celebrate({
      body: Joi.object({
        buildingName: Joi.string()
          .min(1)
          .max(config.configurableValues.building.maxNameLength)
          .allow(null)
          .allow(''),
        buildingDimensions: Joi.object({
          width: Joi.number(),
          length: Joi.number(),
        }).allow(null),
        buildingDescription: Joi.string()
          .min(1)
          .max(config.configurableValues.building.maxDescriptionLength)
          .allow(null)
          .allow(''),
      }),
    }),
    middlewares.validateAccessToken,
    middlewares.checkRequiredPermissions(['manage:campus']),
    (req, res) => ctrl.editBuilding(req, res),
  );
};
