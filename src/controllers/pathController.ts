import { Inject, Service } from 'typedi';
import IPathController from './IControllers/IPathController';
import config from '../../config';
import { FailureType, Result } from '../core/logic/Result';
import { Request, Response } from 'express';
import { Utils } from '../core/logic/Utils';
import IPathOutDTO from '../dto/out/IPathOutDTO';
import IPathService from '../services/IServices/IPathService';

@Service()
export default class PathController implements IPathController {
  constructor(@Inject(config.services.path.name) private pathServiceInstance: IPathService) {}

  public async getLowestCostPath(request: Request, response: Response) {
    try {
      // Call the service to find the path between two rooms.
      const pathOrError = (await this.pathServiceInstance.getLowestCostPath(
        request.query.originFloorId as string,
        request.query.originRoomId as string,
        request.query.destinationFloorId as string,
        request.query.destinationRoomId as string,
      )) as Result<IPathOutDTO[]>;
      // If the service fails, return the error.
      if (pathOrError.isFailure) {
        return this.returnError(pathOrError, response);
      }

      // If the service succeeds, return the created path.
      const pathDTO = pathOrError.getValue();

      return response.status(200).json(pathDTO);
    } catch (e) {
      return response.status(401).send(e.message);
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
