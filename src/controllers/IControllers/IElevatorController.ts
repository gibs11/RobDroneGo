import { Request, Response } from 'express';

export default interface IElevatorController {
  /**
   * Creates a new elevator.
   * @param req The request object.
   * @param res The response object.
   * @returns The response object.
   * @throws 400 - Bad request.
   * @throws 401 - Unauthorized.
   * @throws 404 - Not found.
   * @throws 503 - Data Base error.
   **/
  createElevator(req: Request, res: Response);

  /**
   * Updates an elevator.
   *
   * @param req The request object.
   * @param res The response object.
   * @returns The response object.
   * @throws 400 - Bad request.
   * @throws 401 - Unauthorized.
   * @throws 404 - Not found.
   * @throws 503 - Data Base error.
   */
  updateElevator(req: Request, res: Response);

  /**
   * Lists all elevators from a building.
   *
   * @param req The request object.
   * @param res The response object.
   * @returns The response object.
   * @throws 400 - Bad request.
   * @throws 401 - Unauthorized.
   * @throws 404 - Not found.
   * @throws 503 - Data Base error.
   */
  listElevatorsFromBuilding(req: Request, res: Response);

  /**
   * Lists all elevators.
   *
   * @param req The request object.
   * @param res The response object.
   * @returns The response object.
   * @throws 400 - Bad request.
   * @throws 401 - Unauthorized.
   * @throws 503 - Data Base error.
   */
  listAllElevators(req: Request, res: Response);
}
