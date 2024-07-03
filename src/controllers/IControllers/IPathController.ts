import { Request, Response } from 'express';

export default interface IPathController {
  /**
   * Gets the path between two rooms.
   * @param req The request object.
   * @param res The response object.
   * @returns The response object.
   * @throws 400 - Bad request.
   * @throws 401 - Unauthorized.
   * @throws 404 - Not found.
   * @throws 503 - Database error.
   */
  getLowestCostPath(req: Request, res: Response);
}
