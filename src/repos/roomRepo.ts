import { Service, Inject } from 'typedi';
import IRoomRepo from '../services/IRepos/IRoomRepo';
import { RoomMap } from '../mappers/RoomMap';
import { Room } from '../domain/room/Room';
import { RoomID } from '../domain/room/RoomID';
import { Document, FilterQuery, Model } from 'mongoose';
import { IRoomPersistence } from '../dataschema/IRoomPersistence';
import { Floor } from '../domain/floor/floor';

@Service()
export default class RoomRepo implements IRoomRepo {
  constructor(@Inject('roomSchema') private roomSchema: Model<IRoomPersistence & Document>) {}

  public async exists(room: Room): Promise<boolean> {
    const idX = room.id instanceof RoomID ? (<RoomID>room.id).toString() : room.id;

    const query = { domainId: idX };
    const roomDocument = await this.roomSchema.findOne(query as FilterQuery<IRoomPersistence & Document>);

    return !!roomDocument === true;
  }

  public async save(room: Room): Promise<Room> {
    const query = { domainId: room.id.toString() };

    const roomDocument = await this.roomSchema.findOne(query);

    try {
      if (roomDocument === null) {
        const rawRoom: any = RoomMap.toPersistence(room);

        const roomCreated = await this.roomSchema.create(rawRoom);

        return RoomMap.toDomain(roomCreated);
      } else {
        roomDocument.name = room.name.value;
        roomDocument.description = room.description.value;
        roomDocument.dimensions = room.dimensions;
        roomDocument.doorPosition = room.doorPosition;
        roomDocument.doorOrientation = room.doorOrientation;
        roomDocument.floorId = room.floor.id.toString();
        await roomDocument.save();

        return room;
      }
    } catch (err) {
      throw err;
    }
  }

  public async findAll(): Promise<Room[]> {
    const roomRecords = await this.roomSchema.find();
    const roomPromises = roomRecords.map(RoomMap.toDomain);
    return Promise.all(roomPromises);
  }

  public async findByDomainId(roomId: RoomID | string): Promise<Room> {
    const query = { domainId: roomId.toString() };
    const roomRecord = await this.roomSchema.findOne(query).exec();

    if (roomRecord != null) {
      return RoomMap.toDomain(roomRecord);
    }
    return null;
  }

  public async findByName(name: string): Promise<Room> {
    const query = { name: name };
    const roomRecord = await this.roomSchema.findOne(query).exec();

    if (roomRecord != null) {
      return RoomMap.toDomain(roomRecord);
    }
    return null;
  }

  public async checkCellAvailability(xPosition: number, yPosition: number, floor: Floor): Promise<boolean> {
    const query = {
      floorId: floor.id.toString(),
      'dimensions.initialPosition.xPosition': { $lte: xPosition },
      'dimensions.finalPosition.xPosition': { $gte: xPosition },
      'dimensions.initialPosition.yPosition': { $lte: yPosition },
      'dimensions.finalPosition.yPosition': { $gte: yPosition },
    };
    const rooms = await this.roomSchema.find(query).exec();

    return rooms.length === 0;
  }

  public async checkIfRoomExistInArea(
    initialX: number,
    initialY: number,
    finalX: number,
    finalY: number,
    floor: Floor,
  ): Promise<boolean> {
    const query = {
      floorId: floor.id.toString(),
      $or: [
        {
          'dimensions.initialPosition.xPosition': { $lte: initialX },
          'dimensions.finalPosition.xPosition': { $gte: initialX },
          'dimensions.initialPosition.yPosition': { $lte: initialY },
          'dimensions.finalPosition.yPosition': { $gte: initialY },
        },
        {
          'dimensions.initialPosition.xPosition': { $lte: finalX },
          'dimensions.finalPosition.xPosition': { $gte: finalX },
          'dimensions.initialPosition.yPosition': { $lte: finalY },
          'dimensions.finalPosition.yPosition': { $gte: finalY },
        },
        {
          'dimensions.initialPosition.xPosition': { $gte: initialX },
          'dimensions.finalPosition.xPosition': { $lte: finalX },
          'dimensions.initialPosition.yPosition': { $gte: initialY },
          'dimensions.finalPosition.yPosition': { $lte: finalY },
        },
      ],
    };

    const rooms = await this.roomSchema.find(query).exec();

    return rooms.length !== 0;
  }

  public async findByFloorId(floorId: string): Promise<Room[]> {
    const query = { floorId: floorId };
    const roomRecords = await this.roomSchema.find(query).exec();

    const roomPromises = roomRecords.map(RoomMap.toDomain);
    return Promise.all(roomPromises);
  }
}
