import { Mapper } from '../core/infra/Mapper';
import { UniqueEntityID } from '../core/domain/UniqueEntityID';
import { Container } from 'typedi';
import { Room } from '../domain/room/Room';
import { RoomName } from '../domain/room/RoomName';
import { RoomDescription } from '../domain/room/RoomDescription';
import { RoomDimensions } from '../domain/room/RoomDimensions';
import { Position } from '../domain/room/Position';
import FloorRepo from '../repos/floorRepo';
import { RoomCategory } from '../domain/room/RoomCategory';
import IRoomOutDTO from '../dto/out/IRoomOutDTO';
import { FloorMap } from './FloorMap';
import { DoorOrientation } from '../domain/room/DoorOrientation';

export class RoomMap extends Mapper<Room> {
  public static toDTO(room: Room): IRoomOutDTO {
    return {
      domainId: room.id.toString(),
      name: room.name.value,
      description: room.description.value,
      category: room.category.toString(),
      dimensions: {
        initialPosition: {
          xPosition: room.dimensions.initialPosition.xPosition,
          yPosition: room.dimensions.initialPosition.yPosition,
        },
        finalPosition: {
          xPosition: room.dimensions.finalPosition.xPosition,
          yPosition: room.dimensions.finalPosition.yPosition,
        },
      },
      doorPosition: {
        xPosition: room.doorPosition.xPosition,
        yPosition: room.doorPosition.yPosition,
      },
      doorOrientation: room.doorOrientation.toString(),
      floor: FloorMap.toDTO(room.floor),
    };
  }

  public static async toDomain(room: any): Promise<Room> {
    // Room Name
    const roomNameOrError = RoomName.create(room.name);
    if (roomNameOrError.isFailure) {
      throw new TypeError(roomNameOrError.errorMessage());
    }

    // Room Description
    const roomDescriptionOrError = RoomDescription.create(room.description);
    if (roomDescriptionOrError.isFailure) {
      throw new TypeError(roomDescriptionOrError.errorMessage());
    }

    // Room Category
    let categoryOnError: RoomCategory;
    for (const category in RoomCategory) {
      if (room.category === category) {
        categoryOnError = RoomCategory[category];
      }
    }

    // Room Dimensions
    const roomDimensionsOrError = RoomDimensions.create(room.dimensions.initialPosition, room.dimensions.finalPosition);
    if (roomDimensionsOrError.isFailure) {
      throw new TypeError(roomDimensionsOrError.errorMessage());
    }

    const doorPositionOrError = Position.create(room.doorPosition.xPosition, room.doorPosition.yPosition);
    if (doorPositionOrError.isFailure) {
      throw new TypeError(doorPositionOrError.errorMessage());
    }

    // door Orientation
    let doorOrientationOnError: DoorOrientation;
    for (const doorOrientation in DoorOrientation) {
      if (room.doorOrientation === doorOrientation) {
        doorOrientationOnError = DoorOrientation[doorOrientation];
      }
    }

    // Room Repo
    const floorRepo = Container.get(FloorRepo);
    const floorOnError = await floorRepo.findByDomainId(room.floorId);

    if (!floorOnError) {
      throw new TypeError('Room not found.');
    }

    // Room
    const robisepOrError = Room.create(
      {
        name: roomNameOrError.getValue(),
        description: roomDescriptionOrError.getValue(),
        category: categoryOnError,
        dimensions: roomDimensionsOrError.getValue(),
        doorPosition: doorPositionOrError.getValue(),
        doorOrientation: doorOrientationOnError,
        floor: floorOnError,
      },
      new UniqueEntityID(room.domainId),
    );

    robisepOrError.isFailure ? console.log(robisepOrError.error) : '';

    return robisepOrError.isSuccess ? robisepOrError.getValue() : null;
  }

  public static toPersistence(room: Room): any {
    return {
      domainId: room.id.toString(),
      name: room.name.value,
      description: room.description.value,
      category: room.category.toString(),
      dimensions: {
        initialPosition: {
          xPosition: room.dimensions.initialPosition.xPosition,
          yPosition: room.dimensions.initialPosition.yPosition,
        },
        finalPosition: {
          xPosition: room.dimensions.finalPosition.xPosition,
          yPosition: room.dimensions.finalPosition.yPosition,
        },
      },
      doorPosition: {
        xPosition: room.doorPosition.xPosition,
        yPosition: room.doorPosition.yPosition,
      },
      doorOrientation: room.doorOrientation.toString(),
      floorId: room.floor.id.toString(),
    };
  }
}
