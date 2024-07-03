import { Router } from 'express';

import config from '../../../../config';

import { Container } from 'typedi';
import IPrologCampusController from '../../../controllers/IControllers/IPrologCampusController';

const route = Router();
const prologPrefix = config.api.prolog_api;

export default (app: Router) => {
  app.use(prologPrefix + '/campus', route);

  const ctrl = Container.get(config.controllers.prologCampus.name) as IPrologCampusController;

  // Define the action for a GET request to the route
  route.get('', (req, res) => ctrl.prologCampusFacts(req, res));
};
