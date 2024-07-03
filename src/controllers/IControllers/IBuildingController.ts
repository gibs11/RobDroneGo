import { Request, Response } from 'express';

export default interface IBuildingController {
  /**
   * Creates a new building.
   * @param req The request object.
   * @param res The response object.
   * @returns The response object, with 201 status code if successful.
   * @throws 400 - Bad request.
   * @throws 409 - Conflict, if the building already exists.
   * @throws 401 - Unauthorized.
   * @throws 503 - Service unavailable.
   **/
  createBuilding(req: Request, res: Response);

  /**
   * Lists all buildings.
   * @param res The response object.
   * @returns The response object, with 200 status code if successful.
   * @throws 503 - Service unavailable.
   **/
  listBuildings(res: Response);

  /**
   * Edits a building.
   * @param req The request object.
   * @param res The response object.
   * @returns The response object, with 200 status code if successful.
   * @throws 400 - Bad request.
   * @throws 404 - Not found, if the building does not exist.
   * @throws 503 - Service unavailable.
   **/
  editBuilding(req: Request, res: Response);

  /**
   * Lists all buildings with the given min and max floors.
   *
   * @param req the request object with the minFloors and maxFloors query parameters
   * @param res the response object, with 200 status code if successful
   *
   * @throws 503 - Service unavailable
   */
  listBuildingsWithMinAndMaxFloors(req: Request, res: Response);
}
