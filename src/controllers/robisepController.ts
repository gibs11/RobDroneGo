import { Request, Response } from 'express';
import { Inject, Service } from 'typedi';
import config from '../../config';
import IRobisepController from './IControllers/IRobisepController';
import IRobisepService from '../services/IServices/IRobisepService';
import { FailureType, Result } from '../core/logic/Result';
import IRobisepDTO from '../dto/IRobisepDTO';
import IRobisepOutDTO from '../dto/out/IRobisepOutDTO';
import { Utils } from '../core/logic/Utils';

@Service()
export default class RobisepController implements IRobisepController {
  constructor(@Inject(config.services.robisep.name) private robisepService: IRobisepService) {}

  public async createRobisep(req: Request, res: Response) {
    try {
      const robisepOrError = (await this.robisepService.createRobisep(req.body)) as Result<IRobisepOutDTO>;

      if (robisepOrError.isFailure) {
        return this.returnError(robisepOrError, res);
      }

      const robisepTypeDTO = robisepOrError.getValue();
      return res.status(201).json(robisepTypeDTO);
    } catch (e) {
      return res.status(401).send(e.message);
    }
  }

  public async listRobiseps(res: Response) {
    try {
      const robiseps = await this.robisepService.listRobiseps();

      return res.status(200).json(robiseps);
    } catch (e) {
      return res.status(503).send(e.message);
    }
  }

  public async disableRobisep(req: Request, res: Response) {
    try {
      const robisepOrError = (await this.robisepService.disableRobisep(
        req.params.id,
        req.body as IRobisepDTO,
      )) as Result<IRobisepOutDTO>;

      if (robisepOrError.isFailure) {
        return this.returnError(robisepOrError, res);
      }

      // IF the result is a success, return the edited robisep.
      const robisepTypeDTO = robisepOrError.getValue();
      return res.status(200).json(robisepTypeDTO);
    } catch (e) {
      return res.status(401).send(e.message);
    }
  }

  public async listRobisepsByNicknameOrTaskType(req: Request, res: Response) {
    try {
      const robisepResult = await this.robisepService.listRobisepsByNicknameOrTaskType(
        req.query.nickname ? req.query.nickname.toString() : null,
        req.query.taskType ? req.query.taskType.toString().split(',') : null,
      );

      if (robisepResult.isFailure) {
        return this.returnError(robisepResult, res);
      }

      const robiseps = robisepResult.getValue();

      return res.status(200).json(robiseps);
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
