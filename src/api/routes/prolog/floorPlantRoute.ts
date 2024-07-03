import { Router } from 'express';
import { Container } from 'typedi';

import IPrologFloorPlanController from '../../../controllers/IControllers/IPrologFloorPlanController';

import config from '../../../../config';

const route = Router();
const prologPrefix = config.api.prolog_api;

export default (app: Router) => {
  // Define the route name
  app.use(prologPrefix + '/floorPlants', route);

  // Get the controller instance
  const controller = Container.get(config.controllers.prologFloorPlan.name) as IPrologFloorPlanController;

  /**
   * Get request to obtain the floor plan for a floor in a building.
   * @param req The request object.
   * @param res The response object.
   */
  route.get('/:byFloorId', (req, res) => controller.obtainFloorPlan(req, res));
};
