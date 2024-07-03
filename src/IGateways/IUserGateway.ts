import { Result } from '../core/logic/Result';

export default interface IUserGateway {
  /**
   * Ge the email of the user, using the IAM ID.
   * @returns The response object.
   * @param iamId - The IAM ID of the user.
   */
  getEmailByIamId(iamId: string): Promise<Result<string>>;
}
