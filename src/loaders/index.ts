import expressLoader from './express';
import dependencyInjectorLoader from './dependencyInjector';
import mongooseLoader from './mongoose';
import Logger from './logger';

import config from '../../config';

export default async ({ expressApp }) => {
  const mongoConnection = await mongooseLoader();
  Logger.info('✌️ DB loaded and connected!');

  const userSchema = {
    // compare with the approach followed in repos and services
    name: 'userSchema',
    schema: '../persistence/schemas/userSchema',
  };

  const roleSchema = {
    // compare with the approach followed in repos and services
    name: 'roleSchema',
    schema: '../persistence/schemas/roleSchema',
  };

  const buildingSchema = {
    name: 'buildingSchema',
    schema: '../persistence/schemas/buildingSchema',
  };

  const floorSchema = {
    name: 'floorSchema',
    schema: '../persistence/schemas/floorSchema',
  };

  const robisepTypeSchema = {
    name: 'robisepTypeSchema',
    schema: '../persistence/schemas/robisepTypeSchema',
  };

  const robisepSchema = {
    name: 'robisepSchema',
    schema: '../persistence/schemas/robisepSchema',
  };

  const elevatorSchema = {
    name: 'elevatorSchema',
    schema: '../persistence/schemas/elevatorSchema',
  };

  const roomSchema = {
    name: 'roomSchema',
    schema: '../persistence/schemas/roomSchema',
  };

  const passageSchema = {
    name: 'passageSchema',
    schema: '../persistence/schemas/passageSchema',
  };

  const surveillanceTaskSchema = {
    name: 'surveillanceTaskSchema',
    schema: '../persistence/schemas/task/surveillanceTaskSchema',
  };

  const pickUpAndDeliveryTaskSchema = {
    name: 'pickUpAndDeliveryTaskSchema',
    schema: '../persistence/schemas/task/pickUpAndDeliveryTaskSchema',
  };

  const roleController = {
    name: config.controllers.role.name,
    path: config.controllers.role.path,
  };

  const buildingController = {
    name: config.controllers.building.name,
    path: config.controllers.building.path,
  };

  const robisepTypeController = {
    name: config.controllers.robisepType.name,
    path: config.controllers.robisepType.path,
  };

  const robisepController = {
    name: config.controllers.robisep.name,
    path: config.controllers.robisep.path,
  };

  const floorController = {
    name: config.controllers.floor.name,
    path: config.controllers.floor.path,
  };

  const elevatorController = {
    name: config.controllers.elevator.name,
    path: config.controllers.elevator.path,
  };

  const roomController = {
    name: config.controllers.room.name,
    path: config.controllers.room.path,
  };

  const passageController = {
    name: config.controllers.passage.name,
    path: config.controllers.passage.path,
  };

  const prologFloorPlanController = {
    name: config.controllers.prologFloorPlan.name,
    path: config.controllers.prologFloorPlan.path,
  };

  const prologCampusController = {
    name: config.controllers.prologCampus.name,
    path: config.controllers.prologCampus.path,
  };

  const pathController = {
    name: config.controllers.path.name,
    path: config.controllers.path.path,
  };

  const taskController = {
    name: config.controllers.task.name,
    path: config.controllers.task.path,
  };

  const prologTasksController = {
    name: config.controllers.prologTasks.name,
    path: config.controllers.prologTasks.path,
  };

  const roleRepo = {
    name: config.repos.role.name,
    path: config.repos.role.path,
  };

  const userRepo = {
    name: config.repos.user.name,
    path: config.repos.user.path,
  };

  const buildingRepo = {
    name: config.repos.building.name,
    path: config.repos.building.path,
  };

  const robisepTypeRepo = {
    name: config.repos.robisepType.name,
    path: config.repos.robisepType.path,
  };

  const robisepRepo = {
    name: config.repos.robisep.name,
    path: config.repos.robisep.path,
  };

  const floorRepo = {
    name: config.repos.floor.name,
    path: config.repos.floor.path,
  };

  const elevatorRepo = {
    name: config.repos.elevator.name,
    path: config.repos.elevator.path,
  };

  const roomRepo = {
    name: config.repos.room.name,
    path: config.repos.room.path,
  };

  const passageRepo = {
    name: config.repos.passage.name,
    path: config.repos.passage.path,
  };

  const surveillanceTaskRepo = {
    name: config.repos.surveillanceTask.name,
    path: config.repos.surveillanceTask.path,
  };

  const pickUpAndDeliveryTaskRepo = {
    name: config.repos.pickUpAndDeliveryTask.name,
    path: config.repos.pickUpAndDeliveryTask.path,
  };

  const elevatorFactory = {
    name: config.factories.elevator.name,
    path: config.factories.elevator.path,
  };

  const roleService = {
    name: config.services.role.name,
    path: config.services.role.path,
  };

  const buildingService = {
    name: config.services.building.name,
    path: config.services.building.path,
  };

  const robisepTypeService = {
    name: config.services.robisepType.name,
    path: config.services.robisepType.path,
  };

  const robisepService = {
    name: config.services.robisep.name,
    path: config.services.robisep.path,
  };

  const floorService = {
    name: config.services.floor.name,
    path: config.services.floor.path,
  };

  const roomService = {
    name: config.services.room.name,
    path: config.services.room.path,
  };

  const elevatorService = {
    name: config.services.elevator.name,
    path: config.services.elevator.path,
  };

  const passageService = {
    name: config.services.passage.name,
    path: config.services.passage.path,
  };

  const prologFloorPlanService = {
    name: config.services.prologFloorPlan.name,
    path: config.services.prologFloorPlan.path,
  };

  const prologCampusService = {
    name: config.services.prologCampus.name,
    path: config.services.prologCampus.path,
  };

  const prologTasksService = {
    name: config.services.prologTasks.name,
    path: config.services.prologTasks.path,
  };

  // PositionChecker
  const positionCheckerService = {
    name: config.services.positionChecker.name,
    path: config.services.positionChecker.path,
  };

  const elevatorPositionChecker = {
    name: config.services.elevatorPositionChecker.name,
    path: config.services.elevatorPositionChecker.path,
  };

  const passagePositionChecker = {
    name: config.services.passagePositionChecker.name,
    path: config.services.passagePositionChecker.path,
  };

  const roomPositionChecker = {
    name: config.services.roomPositionChecker.name,
    path: config.services.roomPositionChecker.path,
  };

  const doorPositionChecker = {
    name: config.services.doorPositionChecker.name,
    path: config.services.doorPositionChecker.path,
  };

  const roomAreaChecker = {
    name: config.services.roomAreaChecker.name,
    path: config.services.roomAreaChecker.path,
  };

  // Floor Plan Validator
  const floorPlanJSONValidator = {
    name: config.services.floorPlanJSONValidator.name,
    path: config.services.floorPlanJSONValidator.path,
  };

  const pathService = {
    name: config.services.path.name,
    path: config.services.path.path,
  };

  const floorMapGenerator = {
    name: config.services.floorMapGenerator.name,
    path: config.services.floorMapGenerator.path,
  };

  const taskRequisitionService = {
    name: config.services.task.name,
    path: config.services.task.path,
  };

  const robisepFactory = {
    name: config.factories.robisep.name,
    path: config.factories.robisep.path,
  };

  const floorFactory = {
    name: config.factories.floor.name,
    path: config.factories.floor.path,
  };
  const roomFactory = {
    name: config.factories.room.name,
    path: config.factories.room.path,
  };

  const passageBuilder = {
    name: config.factories.passage.name,
    path: config.factories.passage.path,
  };

  const taskFactory = {
    name: config.factories.task.name,
    path: config.factories.task.path,
  };

  const pathGateway = {
    name: config.gateways.path.name,
    path: config.gateways.path.path,
  };

  const userGateway = {
    name: config.gateways.user.name,
    path: config.gateways.user.path,
  };

  const taskGateway = {
    name: config.gateways.task.name,
    path: config.gateways.task.path,
  };

  dependencyInjectorLoader({
    mongoConnection,
    schemas: [
      userSchema,
      roleSchema,
      buildingSchema,
      robisepTypeSchema,
      robisepSchema,
      floorSchema,
      elevatorSchema,
      roomSchema,
      passageSchema,
      surveillanceTaskSchema,
      pickUpAndDeliveryTaskSchema,
    ],
    controllers: [
      roleController,
      buildingController,
      robisepTypeController,
      robisepController,
      floorController,
      elevatorController,
      roomController,
      passageController,
      prologFloorPlanController,
      prologCampusController,
      pathController,
      taskController,
      prologTasksController,
    ],
    repos: [
      roleRepo,
      userRepo,
      buildingRepo,
      robisepTypeRepo,
      robisepRepo,
      floorRepo,
      elevatorRepo,
      roomRepo,
      passageRepo,
      surveillanceTaskRepo,
      pickUpAndDeliveryTaskRepo,
    ],
    services: [
      floorPlanJSONValidator,
      elevatorPositionChecker,
      passagePositionChecker,
      roomPositionChecker,
      positionCheckerService,
      doorPositionChecker,
      roomAreaChecker,
      floorMapGenerator,
      roleService,
      buildingService,
      robisepTypeService,
      robisepService,
      floorService,
      elevatorService,
      roomFactory,
      roomService,
      passageService,
      prologFloorPlanService,
      prologCampusService,
      pathService,
      taskRequisitionService,
      prologTasksService,
    ],
    factories: [floorFactory, robisepFactory, elevatorFactory, passageBuilder, taskFactory],
    gateways: [pathGateway, userGateway, taskGateway],
  });
  Logger.info('✌️ Schemas, Controllers, Repositories, Services, Factories, etc. loaded');

  await expressLoader({ app: expressApp });
  Logger.info('✌️ Express loaded');
};
