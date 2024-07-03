import { Inject, Service } from 'typedi';
import IUserGateway from '../IGateways/IUserGateway';
import fetch from 'node-fetch';
import config from '../../config';
import { FailureType, Result } from '../core/logic/Result';

@Service()
export default class UserGateway implements IUserGateway {
  constructor(@Inject('logger') private logger: any) {}

  public async getEmailByIamId(iamId: string): Promise<Result<string>> {
    // Variables to build the URL.
    const host = config.userManagementApiHost;
    const prefix = config.configurableValues.userManagement.urlPrefix;
    const users = config.configurableValues.userManagement.urlUsers;
    const ids = config.configurableValues.userManagement.urlIds;
    const iamIdParam = config.configurableValues.userManagement.urlIamId;

    // Build the URL.
    const url = `${host}${prefix}${users}${ids}?${iamIdParam}${iamId}`;

    // Call the API.
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.userManagementApiToken}`,
        'Content-Type': 'application/json',
      },
    });

    // If the request fails, throw an error.
    if (!response.ok) {
      switch (response.status) {
        case 401:
          return Result.fail<string>('Unauthorized.', FailureType.Unauthorized);
        case 404:
          return Result.fail<string>('User not found.', FailureType.EntityDoesNotExist);
        default:
          return Result.fail<string>('Something went wrong.');
      }
    }

    // Get the response body.
    const body = await response.json();

    // Return the email.
    return Result.ok<string>(body.email);
  }
}
