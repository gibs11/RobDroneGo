import { Router } from 'express';
import auth from './routes/userRoute';
import user from './routes/userRoute';
import role from './routes/roleRoute';
import robisepType from './routes/robisepTypeRoute';
import robisep from './routes/robisepRoute';
import building from './routes/buildingRoute';
import floor from './routes/floorRoute';
import room from './routes/roomRoute';
import elevator from './routes/elevatorRoute';
import passage from './routes/passageRoute';
import prologFloorPlan from './routes/prolog/floorPlantRoute';
import campus from './routes/prolog/campusRoute';
import path from './routes/pathRoute';
import task from './routes/taskRoute';
import prologTasks from './routes/prolog/tasksRoute';
import { errorHandler } from './middlewares/error.middleware';

export default () => {
  const app = Router();

  auth(app);
  user(app);
  role(app);
  building(app);
  robisepType(app);
  robisep(app);
  floor(app);
  elevator(app);
  room(app);
  passage(app);
  prologFloorPlan(app);
  campus(app);
  path(app);
  task(app);
  prologTasks(app);
  app.use(errorHandler);

  return app;
};
