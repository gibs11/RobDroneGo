import { Request, Response } from 'express';
import { Inject, Service } from 'typedi';
import config from '../../config';

import { FailureType, Result } from '../core/logic/Result';
import { Utils } from '../core/logic/Utils';

import IPrologCampusController from './IControllers/IPrologCampusController';
import IPrologCampusService from '../services/IServices/IPrologCampusService';

@Service()
export default class PrologCampusController implements IPrologCampusController {
  constructor(@Inject(config.services.prologCampus.name) private prologCampusService: IPrologCampusService) {}

  public async prologCampusFacts(req: Request, res: Response): Promise<Response> {
    try {
      const resultOrError = await this.prologCampusService.prologCampusFacts();

      if (resultOrError.isFailure) {
        return this.returnError(resultOrError, res);
      }

      const result = resultOrError.getValue();
      return res.status(200).json(result);
    } catch (e) {
      return res.status(401).send('You are not authorized to perform this action');
    }
  }

  private returnError(result: Result<any>, res: Response) {
    const errorDto = Utils.convertToErrorDTO(result.errorMessage());
    switch (result.failureType) {
      case FailureType.DatabaseError:
        return res.status(503).send(errorDto);
    }
  }
}
