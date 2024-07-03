import { Request, Response } from 'express';

export default interface IRoomController {
  /**
   * Creates a new room.
   * @param req The request object.
   * @param res The response object.
   * @returns The response object, with 201 status code if successful.
   * @throws 400 - Bad request.
   * @throws 409 - Conflict, if the room already exists.
   * @throws 401 - Unauthorized.
   * @throws 503 - Service unavailable.
   **/
  createRoom(req: Request, res: Response);

  /**
   * Lists all rooms.
   * @param res The response object.
   * @returns The response object, with 200 status code if successful.
   * @throws 503 - Service unavailable.
   **/
  listRooms(res: Response): void;

  /**
   * Lists all rooms by floor.
   * @param req The request object.
   * @param res The response object.
   * @returns The response object, with 200 status code if successful.
   * @throws 503 - Service unavailable.
   **/
  listRoomsByFloor(req: Request, res: Response): void;
}
