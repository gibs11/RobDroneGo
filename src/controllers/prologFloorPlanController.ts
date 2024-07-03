import { Request, Response } from 'express';
import { Inject, Service } from 'typedi';

import { FailureType, Result } from '../core/logic/Result';
import config from '../../config';

import IPrologFloorPlanController from './IControllers/IPrologFloorPlanController';
import IPrologFloorPlanService from '../services/IServices/IPrologFloorPlanService';

import IPrologFloorPlanDTO from '../dto/IPrologFloorPlanDTO';
import { Utils } from '../core/logic/Utils';

@Service()
export default class PrologFloorPlanController implements IPrologFloorPlanController {
  constructor(
    @Inject(config.services.prologFloorPlan.name) private prologFloorPlanServiceInstance: IPrologFloorPlanService,
  ) {}

  public async obtainFloorPlan(req: Request, res: Response): Promise<Response> {
    try {
      // Floor ID are required.
      const floorId = req.params.byFloorId;

      // Call the service to obtain the floor plan.
      const floorPlanOrError = await this.prologFloorPlanServiceInstance.obtainFloorPlan(floorId);

      // If the service fails, handle the errors.
      if (floorPlanOrError.isFailure) {
        return this.returnError(floorPlanOrError, res);
      }
      const floorPlanDTO = floorPlanOrError.getValue() as IPrologFloorPlanDTO;
      return res.status(200).json(floorPlanDTO);
    } catch (e) {
      return res.status(401).send(e.message);
    }
  }

  private returnError(result: Result<any>, res: Response) {
    const errorDto = Utils.convertToErrorDTO(result.errorMessage());
    switch (result.failureType) {
      case FailureType.EntityDoesNotExist:
        return res.status(404).send(errorDto);
    }
  }
}
