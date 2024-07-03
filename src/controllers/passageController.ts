import { Request, Response } from 'express';
import { Inject, Service } from 'typedi';
import config from '../../config';

import IPassageController from './IControllers/IPassageController';
import IPassageService from '../services/IServices/IPassageService';
import IPassageDTO from '../dto/IPassageDTO';
import IPassageOutDTO from '../dto/out/IPassageOutDTO';

import { FailureType, Result } from '../core/logic/Result';
import { Utils } from '../core/logic/Utils';

@Service()
export default class PassageController implements IPassageController {
  constructor(@Inject(config.services.passage.name) private passageServiceInstance: IPassageService) {}

  public async createPassage(request: Request, response: Response) {
    try {
      // Call the service to create a new passage.
      const passageOrError = (await this.passageServiceInstance.createPassage(request.body as IPassageDTO)) as Result<
        IPassageOutDTO
      >;
      // If the service fails, return the error.
      if (passageOrError.isFailure) {
        return this.returnError(passageOrError, response);
      }

      // If the service succeeds, return the created passage.
      const passageDTO = passageOrError.getValue();

      return response.status(201).json(passageDTO);
    } catch (e) {
      return response.status(401).send(e.message);
    }
  }

  public async listPassagesBetweenBuildings(request: Request, response: Response) {
    try {
      // Call the service to list all passages between two buildings.
      const passagesBetweenBuildings = (await this.passageServiceInstance.listPassagesBetweenBuildings(
        request.query.firstBuildingId as string,
        request.query.lastBuildingId as string,
      )) as Result<IPassageOutDTO[]>;
      // If the service fails, return the error.
      if (passagesBetweenBuildings.isFailure) {
        return this.returnError(passagesBetweenBuildings, response);
      }

      return response.status(200).json(passagesBetweenBuildings.getValue());
    } catch (e) {
      return response.status(401).send(e.message);
    }
  }

  public async listPassages(response: Response) {
    try {
      // Call the service to list all passages.
      const passages = (await this.passageServiceInstance.listPassages()) as Result<IPassageOutDTO[]>;
      // If the service fails, return the error.
      if (passages.isFailure) {
        return this.returnError(passages, response);
      }

      return response.status(200).json(passages.getValue());
    } catch (e) {
      return response.status(401).send(e.message);
    }
  }

  public async editPassage(request: Request, response: Response) {
    try {
      // Call the service to edit a passage.
      const passageOrError = (await this.passageServiceInstance.editPassage(
        request.params.id,
        request.body as IPassageDTO,
      )) as Result<IPassageOutDTO>;

      // Handle errors from the service.
      if (passageOrError.isFailure) {
        return this.returnError(passageOrError, response);
      }

      // If the service succeeds, return the edited passage.
      const passageDTO = passageOrError.getValue();
      return response.status(200).json(passageDTO);
    } catch (e) {
      return response.status(401).send('You are not authorized to perform this action');
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
