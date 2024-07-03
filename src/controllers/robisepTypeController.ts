import { Request, Response } from 'express';
import { Inject, Service } from 'typedi';
import config from '../../config';

import IRobisepTypeController from './IControllers/IRobisepTypeController';
import IRobisepTypeService from '../services/IServices/IRobisepTypeService';
import IRobisepTypeDTO from '../dto/IRobisepTypeDTO';

import { FailureType, Result } from '../core/logic/Result';
import { Utils } from '../core/logic/Utils';

@Service()
export default class RobisepTypeController implements IRobisepTypeController {
  constructor(@Inject(config.services.robisepType.name) private robisepTypeService: IRobisepTypeService) {}

  public async createRobisepType(req: Request, res: Response) {
    try {
      const robisepTypeOrError = (await this.robisepTypeService.createRobisepType(
        req.body as IRobisepTypeDTO,
      )) as Result<IRobisepTypeDTO>;

      if (robisepTypeOrError.isFailure) {
        return this.returnError(robisepTypeOrError, res);
      }

      const robisepTypeDTO = robisepTypeOrError.getValue();
      return res.status(201).json(robisepTypeDTO);
    } catch (e) {
      return res.status(401).send(e.message);
    }
  }

  public async listRobisepTypes(res: Response) {
    try {
      const robisepTypes = await this.robisepTypeService.listRobisepTypes();

      // If the request succeeds, return the buildings.
      return res.status(200).json(robisepTypes);
    } catch (e) {
      return res.status(503).send(e.message);
    }
  }

  private returnError(result: Result<any>, res: Response) {
    const errorDto = Utils.convertToErrorDTO(result.errorMessage());
    switch (result.failureType) {
      case FailureType.InvalidInput:
        return res.status(400).send(errorDto);
      case FailureType.EntityAlreadyExists:
        return res.status(409).send(errorDto);
      case FailureType.DatabaseError:
        return res.status(503).send(errorDto);
    }
  }
}
