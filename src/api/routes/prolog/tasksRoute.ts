import { Router } from 'express';

import config from '../../../../config';

import { Container } from 'typedi';
import IPrologTasksController from '../../../controllers/IControllers/IPrologTasksController';

const route = Router();
const prologPrefix = config.api.prolog_api;

export default (app: Router) => {
  app.use(prologPrefix + '/tasks', route);

  const controller = Container.get(config.controllers.prologTasks.name) as IPrologTasksController;

  /**
   * Get request to obtain the approved tasks, associated to a certain Robisep.
   * @param req The request object.
   * @param res The response object.
   */
  route.get('/:byRobisepId', (req, res) => controller.obtainApprovedTasks(req, res));
};
