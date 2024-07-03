import { Inject, Service } from 'typedi';
import IPathGateway from '../IGateways/IPathGateway';
import fetch from 'node-fetch';
import config from '../../config';
import IPathDTO from '../dto/IPathDTO';
import { FailureType, Result } from '../core/logic/Result';

@Service()
export default class PathGateway implements IPathGateway {
  constructor(@Inject('logger') private logger) {}

  public async getLowestCostPath(
    originFloorId: string,
    originCell: string,
    destinationFloorId: string,
    destinationCell: string,
  ): Promise<Result<IPathDTO>> {
    // Variables to build the URL.
    const host = config.pathApiHost;
    const prefix = config.configurableValues.path.urlPrefix;
    const paths = config.configurableValues.path.urlPaths;
    const prologApi = config.configurableValues.path.urlPrologApi;
    const originFloor = config.configurableValues.path.urlOriginFloor;
    const destinationFloor = config.configurableValues.path.urlDestinationFloor;
    const origCel = config.configurableValues.path.urlOriginCel;
    const destCel = config.configurableValues.path.urlDestinationCel;

    const response = await fetch(
      `${host}${prefix}${prologApi}${paths}?${originFloor}${originFloorId}&${destinationFloor}${destinationFloorId}&${origCel}${originCell}&${destCel}${destinationCell}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    // If the request fails, throw an error.
    if (!response.ok) {
      switch (response.status) {
        case 400:
          const bodyError = await response.json();
          return Result.fail<IPathDTO>(bodyError.error, FailureType.InvalidInput);
        default:
          return Result.fail<IPathDTO>('Something went wrong.');
      }
    }

    // Get the response body.
    const body = await response.json();

    // Return body.
    return Result.ok<IPathDTO>(body);
  }
}
