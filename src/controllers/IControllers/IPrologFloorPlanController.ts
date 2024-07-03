import { Request, Response } from 'express';

export default interface IPrologFloorPlanController {
  /**
   * Return the floor plan for a floor in a building.
   * @param req The request object.
   * @param res The response object.
   * @returns The response object.
   * @returns 404 - Not found (Entity does not exist), for the case where the building does not exist.
   * @returns 404 - Not found (Entity does not exist), for the case where the floor does not exist.
   * @returns 503 - Service unavailable (Database error).
   */
  obtainFloorPlan(req: Request, res: Response): Promise<Response>;
}
