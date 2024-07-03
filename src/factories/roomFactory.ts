import config from '../../config';
import { Inject, Service } from 'typedi';
import { UniqueEntityID } from '../core/domain/UniqueEntityID';
import IRoomFactory from '../services/IFactories/IRoomFactory';
import { Room } from '../domain/room/Room';
import IFloorRepo from '../services/IRepos/IFloorRepo';
import { RoomName } from '../domain/room/RoomName';
import { RoomDescription } from '../domain/room/RoomDescription';
import { RoomDimensions } from '../domain/room/RoomDimensions';
import { Position } from '../domain/room/Position';
import { RoomCategory } from '../domain/room/RoomCategory';
import { DoorOrientation } from '../domain/room/DoorOrientation';
import IDoorPositionChecker from '../domain/IServices/IDoorPositionChecker';
import IRoomAreaChecker from '../domain/IServices/IRoomAreaChecker';
import { Floor } from '../domain/floor/floor';

@Service()
export default class RoomFactory implements IRoomFactory {
  constructor(
    @Inject(config.repos.floor.name) private floorRepo: IFloorRepo,
    @Inject(config.services.doorPositionChecker.name) private doorPositionChecker: IDoorPositionChecker,
    @Inject(config.services.roomAreaChecker.name) private roomAreaChecker: IRoomAreaChecker,
  ) {}

  public async createRoom(raw: any): Promise<Room> {
    // Retrieve the Floor
    const floor = await this.floorRepo.findByDomainId(raw.floorId);

    // Verify floor was found
    if (!floor) {
      throw new TypeError('Floor not found');
    }

    // Room Name
    const roomNameOrError = RoomName.create(raw.name);
    if (roomNameOrError.isFailure) {
      throw new TypeError(roomNameOrError.errorMessage());
    }

    // Room Description
    const roomDescriptionOrError = RoomDescription.create(raw.description);
    if (roomDescriptionOrError.isFailure) {
      throw new TypeError(roomDescriptionOrError.errorMessage());
    }

    // Room Category
    let categoryOnError: RoomCategory;
    for (const category in RoomCategory) {
      if (raw.category.trim().toUpperCase() === category) {
        categoryOnError = RoomCategory[category];
        break;
      }
    }
    if (!categoryOnError) {
      throw new TypeError('Invalid Category.');
    }

    // Initial Position
    const initialPositionOrError = Position.create(
      raw.dimensions.initialPosition.xPosition,
      raw.dimensions.initialPosition.yPosition,
    );
    if (initialPositionOrError.isFailure) {
      throw new TypeError(initialPositionOrError.errorMessage());
    }

    // Final Position
    const finalPositionOrError = Position.create(
      raw.dimensions.finalPosition.xPosition,
      raw.dimensions.finalPosition.yPosition,
    );
    if (finalPositionOrError.isFailure) {
      throw new TypeError(finalPositionOrError.errorMessage());
    }

    const roomDimensionsOrError = RoomDimensions.create(
      initialPositionOrError.getValue(),
      finalPositionOrError.getValue(),
    );
    if (roomDimensionsOrError.isFailure) {
      throw new TypeError(roomDimensionsOrError.errorMessage());
    }

    // Door Position
    const doorPositionOrError = Position.create(raw.doorPosition.xPosition, raw.doorPosition.yPosition);
    if (doorPositionOrError.isFailure) {
      throw new TypeError(doorPositionOrError.errorMessage());
    }

    // Room Orientation
    let doorOrientationOnError: DoorOrientation;
    for (const orientation in DoorOrientation) {
      if (raw.doorOrientation.trim().toUpperCase() === orientation) {
        doorOrientationOnError = DoorOrientation[orientation];
        break;
      }
    }
    if (!doorOrientationOnError) {
      throw new TypeError('Invalid Door Orientation.');
    }

    // Validate Dimensions and Door
    await this.validateDimensionsAndDoor(
      roomDimensionsOrError.getValue(),
      doorPositionOrError.getValue(),
      floor,
      doorOrientationOnError,
    );

    // Create Room
    const roomOrError = Room.create(
      {
        name: roomNameOrError.getValue(),
        description: roomDescriptionOrError.getValue(),
        category: categoryOnError,
        dimensions: roomDimensionsOrError.getValue(),
        doorPosition: doorPositionOrError.getValue(),
        doorOrientation: doorOrientationOnError,
        floor: floor,
      },
      new UniqueEntityID(raw.domainId),
    );

    // Verify Room was created
    if (roomOrError.isFailure) {
      throw new TypeError(roomOrError.errorMessage());
    }

    return roomOrError.isSuccess ? roomOrError.getValue() : null;
  }

  private async validateDimensionsAndDoor(
    roomDimensions: RoomDimensions,
    doorPosition: Position,
    floor: Floor,
    doorOrientation: string,
  ) {
    const initialX = roomDimensions.initialPosition.xPosition;
    const initialY = roomDimensions.initialPosition.yPosition;
    const finalX = roomDimensions.finalPosition.xPosition;
    const finalY = roomDimensions.finalPosition.yPosition;
    const doorX = doorPosition.xPosition;
    const doorY = doorPosition.yPosition;

    // Check if the selected area is available for the room
    const isPositionAvailable = await this.roomAreaChecker.checkIfAreaIsAvailableForRoom(
      initialX,
      initialY,
      finalX,
      finalY,
      doorX,
      doorY,
      doorOrientation.toString(),
      floor,
    );
    if (isPositionAvailable.isFailure) {
      throw new TypeError(isPositionAvailable.error.toString());
    }

    // Check if the door position is valid
    const isDoorPositionValid = await this.doorPositionChecker.isPositionValid(
      initialX,
      initialY,
      finalX,
      finalY,
      doorX,
      doorY,
      doorOrientation,
      floor,
    );
    if (isDoorPositionValid.isFailure) throw new TypeError(isDoorPositionValid.error.toString());

    return true;
  }
}
