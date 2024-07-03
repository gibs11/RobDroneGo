import { Request, Response } from 'express';

export default interface IFloorController {
  /**
   * Creates a new floor for a certain building.
   * @param req The request object.
   * @param res The response object.
   * @returns The response object.
   * @throws 400 - Bad request (Invalid input).
   * @throws 409 - Conflict (Entity already exists).
   **/
  createBuildingFloor(req: Request, res: Response): Promise<Response>;

  /**
   * List all floors associated to a certain building.
   * @param req The request object.
   * @param res The response object.
   * @returns The response object.
   * @returns 404 - Not found (Entity does not exist), for the case where the building does not exist.
   * @returns 503 - Service unavailable (Database error).
   */
  listBuildingFloors(req: Request, res: Response): Promise<Response>;

  /**
   * Updates a certain floor.
   * It can either update the floor number and/or the floor description.
   * @param req The request object.
   * @param res The response object.
   */
  updateBuildingFloor(req: Request, res: Response): Promise<Response>;

  /**
   * Retrieves all floors served by an elevator in a certain building.
   * @param req The request object.
   * @param res The response object.
   */
  listFloorsWithElevatorByBuildingId(req: Request, res: Response): Promise<Response>;

  /**
   * Retrieves all floors served by at least a passage in a certain building.
   * @param req The request object.
   * @param res The response object.
   */
  listFloorsWithPassageByBuildingId(req: Request, res: Response): Promise<Response>;

  /**
   * Retrieves all floors.
   * @param res The response object.
   */
  listFloors(res: Response): Promise<Response>;

  /**
   * Retrieves the map of a certain floor.
   * @param req The request object.
   * @param res The response object.
   */
  getFloorMap(req: Request, res: Response): Promise<Response>;
}
