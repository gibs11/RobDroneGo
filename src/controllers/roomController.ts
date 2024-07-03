import { Request, Response } from 'express';
import { Inject, Service } from 'typedi';
import config from '../../config';

import { FailureType, Result } from '../core/logic/Result';
import IRoomController from './IControllers/IRoomController';
import IRoomService from '../services/IServices/IRoomService';
import IRoomDTO from '../dto/IRoomDTO';
import IRoomOutDTO from '../dto/out/IRoomOutDTO';
import { Utils } from '../core/logic/Utils';

@Service()
export default class RoomController implements IRoomController {
  constructor(@Inject(config.services.room.name) private roomService: IRoomService) {}

  public async createRoom(req: Request, res: Response) {
    try {
      // Call the service to create a new building.
      const roomOnError = (await this.roomService.createRoom(req.body as IRoomDTO)) as Result<IRoomOutDTO>;

      // Handle any errors from the service.
      if (roomOnError.isFailure) {
        return this.returnError(roomOnError, res);
      }

      // If the service succeeds, return the created building.
      const roomDTO = roomOnError.getValue();
      return res.status(201).json(roomDTO);
    } catch (e) {
      return res.status(401).send('You are not authorized to perform this action');
    }
  }

  public async listRooms(res: Response) {
    try {
      // Call the service to list all rooms.
      const rooms = await this.roomService.listRooms();

      // If the request succeeds, return the rooms.
      return res.json(rooms).status(200);
    } catch (e) {
      return res.status(503).send(e.message);
    }
  }

  public async listRoomsByFloor(req: Request, res: Response) {
    try {
      // Call the service to list all rooms by floor.
      const roomsByFloor = await this.roomService.listRoomsByFloor(req.params.id);

      // If the request succeeds, return the rooms.
      return res.status(200).json(roomsByFloor.getValue());
    } catch (e) {
      return res.status(401).send(e.message);
    }
  }

  private returnError(result: Result<any>, res: Response) {
    const errorDto = Utils.convertToErrorDTO(result.errorMessage());
    switch (result.failureType) {
      case FailureType.InvalidInput:
        return res.status(400).send(errorDto);
      case FailureType.EntityDoesNotExist:
        return res.status(404).send(errorDto);
      case FailureType.EntityAlreadyExists:
        return res.status(409).send(errorDto);
      case FailureType.DatabaseError:
        return res.status(503).send(errorDto);
    }
  }
}
