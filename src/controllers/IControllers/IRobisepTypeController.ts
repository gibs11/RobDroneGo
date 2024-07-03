import { Request, Response } from 'express';

export default interface IRobisepTypeController {
  /**
   * Creates a new robisepType.
   * @param req The request object.
   * @param res The response object.
   * @returns The response object, with 201 status code if successful.
   * @throws 201 - Created.
   * @throws 400 - Bad request.
   * @throws 409 - Conflict, if the robisepType already exists.
   * @throws 401 - Unauthorized.
   * @throws 503 - Service unavailable.
   **/
  createRobisepType(req: Request, res: Response);

  /**
   * Lists all robisepTypes.
   * @param res The response object.
   * @returns The response object, with 200 status code if successful.
   * @throws 200 - OK.
   * @throws 401 - Unauthorized.
   * @throws 503 - Service unavailable.
   */
  listRobisepTypes(res: Response);
}
