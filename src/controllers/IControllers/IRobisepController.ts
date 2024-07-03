import { Request, Response } from 'express';

export default interface IRobisepController {
  /**
   * Creates a new robisepType.
   * @param req The request object.
   * @param res The response object.
   * @returns The response object, with 201 status code if successful.
   * @throws 200 - OK, if successful.
   * @throws 400 - Bad request.
   * @throws 401 - Unauthorized.
   * @throws 409 - Conflict, if the robisepType already exists.
   * @throws 503 - Service unavailable.
   **/
  createRobisep(req: Request, res: Response);

  /**
   * Lists all robisepTypes.
   * @param res The response object.
   * @returns The response object, with 200 status code if successful.
   * @throws 404 - Not found, if no robisepTypes are found.
   * @throws 503 - Service unavailable.
   */
  listRobiseps(res: Response);

  /**
   * Disables a robisepType.
   * @param req - The request object.
   * @param res - The response object.
   * @returns The response object
   * @throws 200 - OK, if successful.
   * @throws 404 - Not found, if the robisepType does not exist.
   * @throws 503 - Service unavailable.
   */
  disableRobisep(req: Request, res: Response);

  /**
   * Lists all robisepTypes by designation or taskType.
   * @param req - The request object.
   * @param res - The response object.
   * @throws 200 - OK, if successful.
   * @throws 503 - Service unavailable.
   */
  listRobisepsByNicknameOrTaskType(req: Request, res: Response);
}
