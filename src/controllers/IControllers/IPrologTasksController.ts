import { Request, Response } from 'express';

export default interface IPrologTasksController {
  /**
   * Return the approved tasks, associated to a certain Robisep.
   * @param req The request object.
   * @param res The response object.
   * @returns The response object.
   * @returns 200 - OK (Success).
   * @returns 404 - Not found (Entity does not exist), for the case where the robisep does not exist.
   * @returns 503 - Service unavailable (Database error).
   */
  obtainApprovedTasks(req: Request, res: Response): Promise<Response>;
}
