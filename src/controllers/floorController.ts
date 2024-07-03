import e, { Request, Response } from 'express';
import { Inject, Service } from 'typedi';

import { FailureType, Result } from '../core/logic/Result';
import config from '../../config';

import IFloorController from './IControllers/IFloorController';
import IFloorService from '../services/IServices/IFloorService';
import IFloorDTO from '../dto/IFloorDTO';
import IFloorOutDTO from '../dto/out/IFloorOutDTO';
import { Utils } from '../core/logic/Utils';

@Service()
export default class FloorController implements IFloorController {
  constructor(@Inject(config.services.floor.name) private floorServiceInstance: IFloorService) {}

  public async createBuildingFloor(req: Request, res: Response) {
    try {
      // Call the service to create a new floor.
      const floorOrError = (await this.floorServiceInstance.createBuildingFloor(req.body as IFloorDTO)) as Result<
        IFloorOutDTO
      >;

      // If the service fails, handle the errors.
      if (floorOrError.isFailure) {
        return this.returnError(floorOrError, res);
      }

      // If the service succeeds, return the created floor.
      const floorDTO = floorOrError.getValue();
      return res.status(201).json(floorDTO);
    } catch (e) {
      return res.status(401).send(e.message);
    }
  }

  public async listBuildingFloors(req: e.Request, res: e.Response) {
    try {
      // Call the service to list all floors for a certain building.
      const floorOrError = await this.floorServiceInstance.listBuildingFloors(req.params.byBuildingId);

      // If the service fails, handle the errors.
      if (floorOrError.isFailure) {
        switch (floorOrError.failureType) {
          case FailureType.EntityDoesNotExist:
            return res.status(404).send(floorOrError.errorValue());
          case FailureType.DatabaseError:
            return res.status(503).send(floorOrError.errorValue());
        }
      }

      // If the service succeeds, return the list of floors.
      const floorDTO = floorOrError.getValue();
      return res.status(200).json(floorDTO);
    } catch (e) {
      // Unauthorized
      return res.status(401).send(e.message);
    }
  }

  public async updateBuildingFloor(req: e.Request, res: e.Response) {
    try {
      // Call the service to update a floor.
      const floorOrError = await this.floorServiceInstance.updateBuildingFloor(
        req.params.floorId,
        req.body as IFloorDTO,
      );

      // If the service fails, handle the errors.
      if (floorOrError.isFailure) {
        return this.returnError(floorOrError, res);
      }

      // If the service succeeds, return the updated floor.
      const floorDTO = floorOrError.getValue();
      return res.status(200).json(floorDTO);
    } catch (e) {
      return res.status(401).send(e.message);
    }
  }

  public async listFloorsWithElevatorByBuildingId(req: e.Request, res: e.Response) {
    try {
      // Call the service to list all floors served by an elevator in a certain building.
      const floorOrError = await this.floorServiceInstance.listFloorsWithElevatorByBuildingId(req.params.buildingId);

      // If the service fails, handle the errors.
      if (floorOrError.isFailure) {
        return this.returnError(floorOrError, res);
      }

      // If the service succeeds, return the list of floors.
      const floorDTO = floorOrError.getValue();
      return res.status(200).json(floorDTO);
    } catch (e) {
      // Unauthorized
      return res.status(401).send(e.message);
    }
  }

  public async listFloorsWithPassageByBuildingId(req: e.Request, res: e.Response) {
    try {
      // Call the service to list all floors served by at least a passage in a certain building.
      const floorOrError = await this.floorServiceInstance.listFloorsWithPassageByBuildingId(req.params.buildingId);

      // If the service fails, handle the errors.
      if (floorOrError.isFailure) {
        return this.returnError(floorOrError, res);
      }

      // If the service succeeds, return the list of floors.
      const floorDTO = floorOrError.getValue();
      return res.status(200).json(floorDTO);
    } catch (e) {
      // Unauthorized
      return res.status(401).send(e.message);
    }
  }

  public async listFloors(res: e.Response) {
    try {
      // Call the service to list all floors.
      const floorOrError = await this.floorServiceInstance.listFloors();

      // If the request succeeds, return the floors.
      return res.json(floorOrError).status(200);
    } catch (e) {
      // Unauthorized
      return res.status(401).send(e.message);
    }
  }

  private returnError(result: Result<any>, res: Response) {
    const errorDto = Utils.convertToErrorDTO(result.errorMessage());
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

  public async getFloorMap(req: Request, res: Response) {
    try {
      // Call the service to list all floors.
      const floorOrError = await this.floorServiceInstance.getFloorMap(
        req.query.buildingCode as string,
        parseInt(req.query.floorNumber as string),
      );

      // If the service fails, handle the errors.
      if (floorOrError.isFailure) {
        return this.returnError(floorOrError, res);
      }

      // If the request succeeds, return the floors.
      return res.json(floorOrError.getValue()).status(200);
    } catch (e) {
      // Unauthorized
      return res.status(401).send(e.message);
    }
  }
}
