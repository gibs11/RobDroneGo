import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import { Container } from 'typedi';

import ITaskController from '../../controllers/IControllers/ITaskController';

import config from '../../../config';
import { checkRequiredPermissions, validateAccessToken } from '../middlewares/auth0.middleware';

const route = Router();
const tasksPrefix = config.api.task_api;

export default (app: Router) => {
  // Define the route name
  app.use(tasksPrefix + '/tasks', route);

  // Get the controller instance
  const controller = Container.get(config.controllers.task.name) as ITaskController;

  // Define the action for a POST request to the route
  route.post(
    '',
    celebrate({
      body: Joi.object({
        // Allow null for the id
        domainId: Joi.string().allow(null),

        // Device that is able to perform the task
        robisepType: Joi.string().required(),

        // User that requested the task
        iamId: Joi.string().required(),

        // PickUp&Delivery task
        pickUpAndDeliveryTask: Joi.object({
          pickUpPersonContact: Joi.object({
            name: Joi.string().required(),
            phoneNumber: Joi.string().required(),
          }).required(),

          deliveryPersonContact: Joi.object({
            name: Joi.string().required(),
            phoneNumber: Joi.string().required(),
          }).required(),

          description: Joi.string()
            .min(1)
            .max(config.configurableValues.task.pickUpAndDeliveryTask.descriptionMaxLength)
            .required(),

          confirmationCode: Joi.number().required(),

          pickUpRoom: Joi.string().required(),

          deliveryRoom: Joi.string().required(),
        }).allow(null),

        // Surveillance task
        surveillanceTask: Joi.object({
          emergencyPhoneNumber: Joi.string().required(),

          // Starting point to watch
          startingPointToWatch: Joi.string().required(),

          // Ending point to watch
          endingPointToWatch: Joi.string().required(),
        }).allow(null),
      }),
    }),
    validateAccessToken,
    checkRequiredPermissions(['user:requests']),
    (req, res) => controller.requestTask(req, res),
  );

  // Define the action for a GET request to retrieve all tasks filtered by State (one or more)
  route.get(
    '/state',
    celebrate({
      query: Joi.object({
        state: Joi.string().required(),
      }),
    }),
    validateAccessToken,
    checkRequiredPermissions(['manage:tasks']),
    (req, res) => controller.listTasksByState(req, res),
  );

  // Define the action for a GET request to retrieve all tasks filtered by User
  route.get(
    '/filter',
    celebrate({
      query: Joi.object({
        iamId: Joi.string().required(),
      }),
    }),
    validateAccessToken,
    checkRequiredPermissions(['user:requests', 'manage:tasks']),
    (req, res) => controller.listTasksByUser(req, res),
  );

  // Define the action for a GET request to retrieve the task sequence for a given robisepId
  route.get(
    '/sequence',
    celebrate({
      query: Joi.object({
        algorithm: Joi.string()
          .valid('PERMUTATION', 'GENETIC')
          .required(),
      }),
    }),
    validateAccessToken,
    checkRequiredPermissions(['manage:tasks']),
    (req, res) => controller.getTaskSequence(req, res),
  );

  route.patch(
    '/reject',
    celebrate({
      query: Joi.object({
        email: Joi.string().required(),
      }),
    }),
    validateAccessToken,
    checkRequiredPermissions(['user:requests', 'manage:tasks']),
    (req, res) => controller.rejectDeletedUserTasks(req, res),
  );

  // Degine the action for a GET request to retrieve all tasks that can be filtered by multiple parameters
  route.get(
    '',
    validateAccessToken,
    checkRequiredPermissions(['manage:tasks']),
    celebrate({
      query: Joi.object({
        state: Joi.string(),
        robisepType: Joi.string(),
        personId: Joi.string(),
      }),
    }),
    (req, res) => controller.listTasksByMultipleParameters(req, res),
  );

  route.patch(
    '/:taskCode',
    celebrate({
      body: Joi.object({
        robisepCode: Joi.string().allow(null),
        newTaskState: Joi.string().required(),
        taskType: Joi.string().required(),
      }),
    }),
    validateAccessToken,
    checkRequiredPermissions(['manage:tasks']),
    (req, res) => controller.updateTaskState(req, res),
  );
};
