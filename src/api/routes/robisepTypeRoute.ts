import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import { Container } from 'typedi';
import IRobisepTypeController from '../../controllers/IControllers/IRobisepTypeController';
import config from '../../../config';
import { checkRequiredPermissions, validateAccessToken } from '../middlewares/auth0.middleware';

const route = Router();
const fleetPrefix = config.api.fleet_api;

export default (app: Router) => {
  app.use(fleetPrefix + '/robisepsType', route);

  const ctrl = Container.get(config.controllers.robisepType.name) as IRobisepTypeController;

  route.post(
    '',
    celebrate({
      body: Joi.object({
        domainId: Joi.string().allow(null),
        designation: Joi.string().required(),
        brand: Joi.string().required(),
        model: Joi.string().required(),
        tasksType: Joi.array()
          .items(Joi.string())
          .required(),
      }),
    }),
    validateAccessToken,
    checkRequiredPermissions(['manage:fleet']),
    (req, res) => ctrl.createRobisepType(req, res),
  );

  route.get(
    '',
    validateAccessToken,
    checkRequiredPermissions(['manage:fleet', 'user:requests', 'manage:tasks']),
    (req, res) => ctrl.listRobisepTypes(res),
  );
};
