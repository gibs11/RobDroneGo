import { Inject, Service } from 'typedi';
import { FailureType, Result } from '../core/logic/Result';
import ITaskGateway from '../IGateways/ITaskGateway';
import ITaskSequenceDTO from '../dto/out/ITaskSequenceDTO';
import fetch from 'node-fetch';
import config from '../../config';

@Service()
export default class TaskGateway implements ITaskGateway {
  constructor(@Inject('logger') private logger: any) {}

  public async getTaskSequeceByRobisepId(robisepId: string, algorithm: string): Promise<Result<ITaskSequenceDTO>> {
    // Variables to build the URL.
    const host = config.pathApiHost;
    const prefix = config.configurableValues.taskGateway.urlPrefix;
    const prolog = config.configurableValues.taskGateway.urlProlog;
    const taskSequencePermutations = config.configurableValues.taskGateway.urlPermutations;
    const taskSequenceGeneticAlgorithm = config.configurableValues.taskGateway.urlGenetic;
    const robisepIdParam = config.configurableValues.taskGateway.urlRobisepId;

    // Build the URL
    let url;
    if (algorithm.toUpperCase() == 'PERMUTATION') {
      url = `${host}${prefix}${prolog}${taskSequencePermutations}?${robisepIdParam}=${robisepId}`;
    } else if (algorithm.toUpperCase() == 'GENETIC') {
      url = `${host}${prefix}${prolog}${taskSequenceGeneticAlgorithm}?${robisepIdParam}=${robisepId}`;
    }

    // Call the API.
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Get the response body.
    const body = await response.json();

    // If the request fails, throw an error.
    if (!response.ok) {
      switch (response.status) {
        case 400:
          return Result.fail<ITaskSequenceDTO>(body.error, FailureType.InvalidInput);
        case 401:
          return Result.fail<ITaskSequenceDTO>('Unauthorized.', FailureType.Unauthorized);
        case 404:
          return Result.fail<ITaskSequenceDTO>('Robisep not found.', FailureType.EntityDoesNotExist);
        default:
          return Result.fail<ITaskSequenceDTO>('Something went wrong.');
      }
    }

    // Return the email.
    return Result.ok<ITaskSequenceDTO>(body);
  }
}
