import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import { Container } from 'typedi';
import config from '../../../config';
import IRobisepController from '../../controllers/IControllers/IRobisepController';
import { checkRequiredPermissions, validateAccessToken } from '../middlewares/auth0.middleware';

const route = Router();
const fleetPrefix = config.api.fleet_api;

export default (app: Router) => {
  app.use(fleetPrefix + '/robiseps', route);

  const ctrl = Container.get(config.controllers.robisep.name) as IRobisepController;

  route.post(
    '',
    celebrate({
      body: Joi.object({
        domainId: Joi.string().allow(null),
        nickname: Joi.string()
          .min(1)
          .max(config.configurableValues.robisep.nicknameMaxLength)
          .required(),
        serialNumber: Joi.string()
          .min(1)
          .max(config.configurableValues.robisep.serialNumberMaxLength)
          .required(),
        code: Joi.string()
          .min(1)
          .max(config.configurableValues.robisep.codeMaxLength)
          .required(),
        description: Joi.string()
          .optional()
          .allow(null),
        robisepTypeId: Joi.string().required(),
        roomId: Joi.string().required(),
      }),
    }),
    validateAccessToken,
    checkRequiredPermissions(['manage:fleet']),
    (req, res) => ctrl.createRobisep(req, res),
  );

  route.get('', (req, res) => ctrl.listRobiseps(res));

  route.patch(
    '/:id',
    celebrate({
      body: Joi.object({
        state: Joi.string()
          .valid('INACTIVE')
          .required(),
      }),
    }),
    validateAccessToken,
    checkRequiredPermissions(['manage:fleet']),
    (req, res) => ctrl.disableRobisep(req, res),
  );

  route.get(
    '/filter',
    celebrate({
      query: Joi.object().keys({
        nickname: Joi.string().allow(null),
        taskType: Joi.string().allow(null),
      }),
    }),
    validateAccessToken,
    checkRequiredPermissions(['manage:fleet']),
    (req, res) => ctrl.listRobisepsByNicknameOrTaskType(req, res),
  );
};
