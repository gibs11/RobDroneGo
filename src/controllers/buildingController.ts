import { Request, Response } from 'express';
import { Inject, Service } from 'typedi';
import config from '../../config';
import IBuildingController from './IControllers/IBuildingController';
import IBuildingService from '../services/IServices/IBuildingService';
import IBuildingDTO from '../dto/IBuildingDTO';

import { FailureType, Result } from '../core/logic/Result';
import { Utils } from '../core/logic/Utils';

@Service()
export default class BuildingController implements IBuildingController {
  constructor(@Inject(config.services.building.name) private buildingServiceInstance: IBuildingService) {}

  public async createBuilding(req: Request, res: Response) {
    try {
      // Call the service to create a new building.
      const buildingOrError = (await this.buildingServiceInstance.createBuilding(req.body as IBuildingDTO)) as Result<
        IBuildingDTO
      >;

      // Handle any errors from the service.
      if (buildingOrError.isFailure) {
        return this.returnError(buildingOrError, res);
      }

      // If the service succeeds, return the created building.
      const buildingDTO = buildingOrError.getValue();
      return res.status(201).json(buildingDTO);
    } catch (e) {
      return res.status(401).send('You are not authorized to perform this action');
    }
  }

  public async listBuildings(res: Response) {
    try {
      // Call the service to list all buildings.
      const buildings = await this.buildingServiceInstance.listBuildings();

      // If the request succeeds, return the buildings.
      return res.json(buildings).status(200);
    } catch (e) {
      return res.status(503).send(e.message);
    }
  }

  public async editBuilding(req: Request, res: Response) {
    try {
      // Call the service to edit a building.
      const buildingOrError = (await this.buildingServiceInstance.editBuilding(
        req.params.id,
        req.body as IBuildingDTO,
      )) as Result<IBuildingDTO>;

      // Handle any errors from the service.
      if (buildingOrError.isFailure) {
        return this.returnError(buildingOrError, res);
      }

      // If the service succeeds, return the edited building.
      const buildingDTO = buildingOrError.getValue();
      return res.status(200).json(buildingDTO);
    } catch (e) {
      return res.status(401).send('You are not authorized to perform this action');
    }
  }

  public async listBuildingsWithMinAndMaxFloors(req: Request, res: Response) {
    try {
      // Call the service to list all buildings with the given min and max floors.
      const buildings = await this.buildingServiceInstance.listBuildingsWithMinAndMaxFloors(
        parseInt(req.query.minFloors as string),
        parseInt(req.query.maxFloors as string),
      );

      // If the request succeeds, return the buildings.
      return res.status(200).json(buildings);
    } catch (e) {
      return res.status(503).send(e.message);
    }
  }

  private returnError(result: Result<any>, res: Response) {
    const errorDto = Utils.convertToErrorDTO(result.errorValue());
    switch (result.failureType) {
      case FailureType.InvalidInput:
        return res.status(400).send(errorDto);
      case FailureType.EntityDoesNotExist:
        return res.status(404).send(errorDto);
      case FailureType.EntityAlreadyExists:
        return res.status(409).send(errorDto);
      case FailureType.DatabaseError:
        return res.status(503).send(errorDto);
    }
  }
}
