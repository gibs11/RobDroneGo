import { Request, Response } from 'express';
import { Inject, Service } from 'typedi';
import config from '../../config';

import IElevatorController from './IControllers/IElevatorController';
import IElevatorService from '../services/IServices/IElevatorService';
import IElevatorDTO from '../dto/IElevatorDTO';
import IElevatorOutDTO from '../dto/out/IElevatorOutDTO';

import { FailureType, Result } from '../core/logic/Result';
import { Utils } from '../core/logic/Utils';

@Service()
export default class ElevatorController implements IElevatorController {
  constructor(@Inject(config.services.elevator.name) private elevatorServiceInstance: IElevatorService) {}

  public async createElevator(req: Request, res: Response) {
    try {
      // Call the service to create a new elevator.
      const elevatorOrError = (await this.elevatorServiceInstance.createElevator(req.body as IElevatorDTO)) as Result<
        IElevatorOutDTO
      >;

      // If the service fails, return the error.
      if (elevatorOrError.isFailure) {
        return this.returnError(elevatorOrError, res);
      }

      // If the service succeeds, return the created elevator.
      const elevatorDTO = elevatorOrError.getValue();
      return res.status(201).json(elevatorDTO);
    } catch (e) {
      return res.status(401).send('You are not authorized to perform this action');
    }
  }

  public async updateElevator(req: Request, res: Response) {
    try {
      // Call the service to update an elevator.
      const elevatorOrError = (await this.elevatorServiceInstance.updateElevator(
        req.params.elevatorId,
        req.body as IElevatorDTO,
      )) as Result<IElevatorOutDTO>;

      // If the service fails, return the error.
      if (elevatorOrError.isFailure) {
        return this.returnError(elevatorOrError, res);
      }

      // If the service succeeds, return the updated elevator.
      const elevatorDTO = elevatorOrError.getValue();
      return res.status(200).json(elevatorDTO);
    } catch (e) {
      return res.status(401).send('You are not authorized to perform this action');
    }
  }

  public async listElevatorsFromBuilding(req: Request, res: Response) {
    try {
      // Call the service to list all elevators from a building.
      const elevatorOrError = (await this.elevatorServiceInstance.listElevatorsFromBuilding(
        req.params.buildingId,
      )) as Result<IElevatorOutDTO[]>;

      // If the service fails, return the error.
      if (elevatorOrError.isFailure) {
        return this.returnError(elevatorOrError, res);
      }

      // If the service succeeds, return the list of elevators.
      const elevatorDTO = elevatorOrError.getValue();
      return res.status(200).json(elevatorDTO);
    } catch (e) {
      return res.status(401).send('You are not authorized to perform this action');
    }
  }

  public async listAllElevators(req: Request, res: Response) {
    try {
      // Call the service to list all elevators.
      const elevatorOrError = (await this.elevatorServiceInstance.listAllElevators()) as Result<IElevatorOutDTO[]>;

      // If the service fails, return the error.
      if (elevatorOrError.isFailure) {
        return this.returnError(elevatorOrError, res);
      }

      // If the service succeeds, return the list of elevators.
      const elevatorDTO = elevatorOrError.getValue();
      return res.status(200).json(elevatorDTO);
    } catch (e) {
      return res.status(401).send('You are not authorized to perform this action');
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
}
