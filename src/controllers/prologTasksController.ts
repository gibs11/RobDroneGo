import { Request, Response } from 'express';
import { Inject, Service } from 'typedi';

import { FailureType, Result } from '../core/logic/Result';
import config from '../../config';
import { Utils } from '../core/logic/Utils';
import IPrologTasksController from './IControllers/IPrologTasksController';
import IPrologTasksDTO from '../dto/IPrologTasksDTO';
import IPrologTasksService from '../services/IServices/IPrologTasksService';

@Service()
export default class PrologTasksController implements IPrologTasksController {
  constructor(@Inject(config.services.prologTasks.name) private prologTasksServiceInstance: IPrologTasksService) {}

  public async obtainApprovedTasks(req: Request, res: Response): Promise<Response> {
    try {
      // Robisep id.
      const robisepId = req.params.byRobisepId;

      // Call the service to obtain the approved tasks.
      const tasksOrError = await this.prologTasksServiceInstance.obtainApprovedTasks(robisepId);

      // If the service fails, handle the errors.
      if (tasksOrError.isFailure) {
        return this.returnError(tasksOrError, res);
      }
      const tasksDTO = tasksOrError.getValue() as IPrologTasksDTO;
      return res.status(200).json(tasksDTO);
    } catch (e) {
      return res.status(401).send(e.message);
    }
  }

  private returnError(result: Result<any>, res: Response) {
    const errorDto = Utils.convertToErrorDTO(result.errorMessage());
    switch (result.failureType) {
      case FailureType.EntityDoesNotExist:
        return res.status(404).send(errorDto);
      case FailureType.DatabaseError:
        return res.status(503).send(errorDto);
    }
  }
}
