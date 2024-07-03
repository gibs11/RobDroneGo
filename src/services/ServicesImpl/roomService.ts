import { Inject, Service } from 'typedi';
import IRoomService from '../IServices/IRoomService';
import config from '../../../config';
import IRoomRepo from '../IRepos/IRoomRepo';
import { FailureType, Result } from '../../core/logic/Result';
import IRoomFactory from '../IFactories/IRoomFactory';
import { RoomMap } from '../../mappers/RoomMap';
import IFloorRepo from '../IRepos/IFloorRepo';
import IRoomDTO from '../../dto/IRoomDTO';
import { Room } from '../../domain/room/Room';
import IRoomOutDTO from '../../dto/out/IRoomOutDTO';

@Service()
export default class RoomService implements IRoomService {
  constructor(
    @Inject(config.repos.room.name) private roomRepo: IRoomRepo,
    @Inject(config.repos.floor.name) private floorRepo: IFloorRepo,
    @Inject(config.factories.room.name) private roomFactory: IRoomFactory,
  ) {}

  public async createRoom(roomDTO: IRoomDTO): Promise<Result<IRoomOutDTO>> {
    try {
      // Check if domainId is unique
      if (roomDTO.domainId) {
        const roomExists = await this.roomRepo.findByDomainId(roomDTO.domainId);
        if (roomExists)
          return Result.fail<IRoomOutDTO>(
            `Room with id: ${roomDTO.domainId} already exists.`,
            FailureType.EntityAlreadyExists,
          );
      }

      // Check if floor exists
      const floorExits = await this.floorRepo.findByDomainId(roomDTO.floorId);
      if (!floorExits) {
        return Result.fail<IRoomOutDTO>('Floor not found.', FailureType.EntityDoesNotExist);
      }

      // Check if room already exists - meaning has all the same attributes
      const roomWithNameExists = await this.roomRepo.findByName(roomDTO.name);
      if (roomWithNameExists) {
        return Result.fail<IRoomOutDTO>('Room already exists - name must be unique.', FailureType.EntityAlreadyExists);
      }

      // Create domain entity
      const room = await this.roomFactory.createRoom(roomDTO);

      // Save Room
      await this.roomRepo.save(room);

      // Return RoomDTO
      const roomDTOResult = RoomMap.toDTO(room) as IRoomOutDTO;
      return Result.ok<IRoomOutDTO>(roomDTOResult);
    } catch (e) {
      if (e instanceof TypeError) return Result.fail<IRoomOutDTO>(e.message, FailureType.InvalidInput);

      return Result.fail<IRoomOutDTO>(e.message, FailureType.DatabaseError);
    }
  }

  public async listRooms(): Promise<IRoomOutDTO[]> {
    try {
      // Get all rooms from the database
      const rooms = await this.roomRepo.findAll();

      // Return buildingDTOs
      return rooms.map((room: Room) => RoomMap.toDTO(room) as IRoomOutDTO);
    } catch (e) {
      throw e;
    }
  }

  public async listRoomsByFloor(floorId: string): Promise<Result<IRoomOutDTO[]>> {
    try {
      // Get all rooms from the database
      const rooms = await this.roomRepo.findByFloorId(floorId);

      const floorDTOToReturn = rooms.map((room: Room) => RoomMap.toDTO(room) as IRoomOutDTO);
      return Result.ok<IRoomOutDTO[]>(floorDTOToReturn);
    } catch (e) {
      if (e instanceof TypeError) {
        return Result.fail<IRoomOutDTO[]>(e.message, FailureType.InvalidInput);
      } else {
        return Result.fail<IRoomOutDTO[]>(e.message, FailureType.DatabaseError);
      }
    }
  }
}
