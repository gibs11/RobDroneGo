import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import { Container } from 'typedi';

import IFloorController from '../../controllers/IControllers/IFloorController';

import config from '../../../config';
import { checkRequiredPermissions, validateAccessToken } from '../middlewares/auth0.middleware';

const route = Router();
const campusPrefix = config.api.campus_api;

export default (app: Router) => {
  // Define the route name
  app.use(campusPrefix + '/floors', route);

  // Get the controller instance
  const controller = Container.get(config.controllers.floor.name) as IFloorController;

  // Define the action for a POST request to the route
  route.post(
    '',
    celebrate({
      body: Joi.object({
        // Allow null for the id
        domainId: Joi.string().allow(null),
        // Verify if the building id is not empty
        buildingId: Joi.string().required(),
        // Verify if the floor description is not empty and is not longer than the max length
        floorDescription: Joi.string()
          .min(1)
          .max(config.configurableValues.floor.maxFloorDescriptionLength)
          .allow(null),
        // Verify if the floor number is a number
        floorNumber: Joi.number().required(),
      }),
    }),
    validateAccessToken,
    checkRequiredPermissions(['manage:campus']),
    (req, res) => controller.createBuildingFloor(req, res),
  );

  // Define the action for a GET request
  route.get(
    '/floorPlan',
    celebrate({
      query: Joi.object().keys({
        buildingCode: Joi.string().required(),
        floorNumber: Joi.number().required(),
      }),
    }),
    validateAccessToken,
    checkRequiredPermissions(['manage:campus', 'manage:tasks']),
    (req, res) => controller.getFloorMap(req, res),
  );

  // Define the action for a GET request to the route
  route.get(
    '/:byBuildingId',
    validateAccessToken,
    checkRequiredPermissions(['manage:campus', 'manage:tasks', 'manage:fleet', 'user:requests']),
    (req, res) => controller.listBuildingFloors(req, res),
  );

  // Define the action for a PATCH request (update floor information) to the route
  route.patch(
    '/:floorId',
    celebrate({
      body: Joi.object({
        // Allow null for the floor number
        floorNumber: Joi.number().allow(null),
        // Allow null for the floor description
        floorDescription: Joi.string()
          .min(1)
          .max(config.configurableValues.floor.maxFloorDescriptionLength)
          .allow(null),
        // Floor Plan
        floorPlan: Joi.object({
          planFloorNumber: Joi.number().required(),

          planFloorSize: Joi.object({
            width: Joi.number()
              .min(config.configurableValues.floor.minFloorPlanWidth)
              .required(),
            height: Joi.number()
              .min(config.configurableValues.floor.minFloorPlanHeight)
              .required(),
          }).required(),

          floorPlanGrid: Joi.array()
            .items(
              Joi.array()
                .items(Joi.number().required())
                .required(),
            )
            .required(),

          floorPlanRooms: Joi.array()
            .items(
              Joi.object({
                roomName: Joi.string().required(),
                roomCoordinates: Joi.array()
                  .items(
                    Joi.object({
                      x: Joi.number()
                        .min(config.configurableValues.floor.minFloorPlanLength)
                        .required(),
                      y: Joi.number()
                        .min(config.configurableValues.floor.minFloorPlanLength)
                        .required(),
                    }),
                  )
                  .length(config.configurableValues.floor.numberOfRoomCoordinates)
                  .required(),
              }),
              Joi.object({
                roomDoorOrientation: Joi.string().required(),
                roomDoorCoordinates: Joi.object({
                  x: Joi.number()
                    .min(config.configurableValues.floor.minFloorPlanLength)
                    .required(),
                  y: Joi.number()
                    .min(config.configurableValues.floor.minFloorPlanLength)
                    .required(),
                }).required(),
              }),
            )
            .allow(null),

          floorPlanElevator: Joi.array()
            .items(
              Joi.object({
                elevatorNumber: Joi.number().required(),
                elevatorCoordinates: Joi.object({
                  x: Joi.number().required(),
                  y: Joi.number().required(),
                }).required(),
                elevatorOrientation: Joi.string().required(),
              }),
            )
            .allow(null),

          floorPlanPassages: Joi.array()
            .items(
              Joi.object({
                toFloor: Joi.string().required(),
                passageCoordinates: Joi.object({
                  x: Joi.number().required(),
                  y: Joi.number().required(),
                }).required(),
              }),
            )
            .allow(null),
          // Textures - mandatory???
          floorGroundTexture: Joi.string()
            .min(1)
            .required(),

          floorWallTexture: Joi.string()
            .min(1)
            .required(),

          floorDoorTexture: Joi.string()
            .min(1)
            .required(),

          floorElevatorTexture: Joi.string()
            .min(1)
            .required(),

          initialPosition: Joi.object({
            x: Joi.number().required(),
            y: Joi.number().required(),
          }).required(),

          initialDirection: Joi.number().required(),
        }).allow(null),
      }),
    }),
    validateAccessToken,
    checkRequiredPermissions(['manage:campus']),
    (req, res) => controller.updateBuildingFloor(req, res),
  );

  // Define the action for a GET request to retrieve floors served by an elevator in a specific building
  route.get(
    '/inBuilding/:buildingId/withElevator',
    validateAccessToken,
    checkRequiredPermissions(['manage:campus']),
    (req, res) => controller.listFloorsWithElevatorByBuildingId(req, res),
  );

  // Define the action for a GET request to retrieve floors from a specific building that have passages to other floors
  route.get(
    '/inBuilding/:buildingId/withPassage',
    validateAccessToken,
    checkRequiredPermissions(['manage:campus']),
    (req, res) => controller.listFloorsWithPassageByBuildingId(req, res),
  );

  // Define the action for a GET request to retrieve all floors
  route.get('', validateAccessToken, checkRequiredPermissions(['manage:campus']), (req, res) =>
    controller.listFloors(res),
  );
};
