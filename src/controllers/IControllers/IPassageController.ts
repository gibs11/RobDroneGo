import { Request, Response } from 'express';

export default interface IPassageController {
  /**
   * Creates a new passage.
   * @param req The request object.
   * @param res The response object.
   * @returns The response object.
   * @throws 400 - Bad request.
   * @throws 401 - Unauthorized.
   * @throws 404 - Not found.
   * @throws 409 - Already exists.
   * @throws 503 - Database error.
   **/
  createPassage(req: Request, res: Response);

  /**
   * Lists all passages between two buildings.
   * @param req The request object.
   * @param res The response object.
   * @returns The response object.
   * @throws 400 - Bad request.
   * @throws 401 - Unauthorized.
   * @throws 404 - Not found.
   * @throws 503 - Database error.
   */
  listPassagesBetweenBuildings(req: Request, res: Response);

  /**
   * Lists all passages.
   * @param res The response object.
   * @returns The response object.
   * @throws 401 - Unauthorized.
   * @throws 503 - Database error.
   */
  listPassages(res: Response);

  /**
   * Edits a passage.
   * @param req
   * @param res
   * @throws 400 - Bad request.
   * @throws 401 - Unauthorized.
   * @throws 404 - Not found.
   * @throws 409 - Already exists.
   * @throws 503 - Database error.
   */
  editPassage(req: Request, res: Response);
}
