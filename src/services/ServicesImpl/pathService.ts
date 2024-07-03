import { Inject, Service } from 'typedi';
import IPathService from '../IServices/IPathService';
import config from '../../../config';
import IFloorRepo from '../IRepos/IFloorRepo';
import IRoomRepo from '../IRepos/IRoomRepo';
import { FailureType, Result } from '../../core/logic/Result';
import IPathOutDTO from '../../dto/out/IPathOutDTO';
import IPathGateway from '../../IGateways/IPathGateway';
import { DoorOrientation } from '../../domain/room/DoorOrientation';

@Service()
export default class PathService implements IPathService {
  constructor(
    @Inject(config.repos.floor.name) private floorRepo: IFloorRepo,
    @Inject(config.repos.room.name) private roomRepo: IRoomRepo,
    @Inject(config.gateways.path.name) private pathGateway: IPathGateway,
    @Inject('logger') private logger,
  ) {}

  private getRoomDoorPosition(roomDoorOrientation: DoorOrientation, doorX: number, doorY: number) {
    switch (roomDoorOrientation) {
      case DoorOrientation.SOUTH:
        return { xPosition: doorY + 1, yPosition: doorX };
      case DoorOrientation.NORTH:
        return { xPosition: doorY - 1, yPosition: doorX };
      case DoorOrientation.EAST:
        return { xPosition: doorY, yPosition: doorX + 1 };
      case DoorOrientation.WEST:
        return { xPosition: doorY, yPosition: doorX - 1 };
    }
  }

  public async getLowestCostPath(
    originFloorId: string,
    originRoomId: string,
    destinationFloorId: string,
    destinationRoomId: string,
  ) {
    try {
      // Retrieve the first floor.
      const originFloor = await this.floorRepo.findByDomainId(originFloorId);
      if (!originFloor) {
        return Result.fail<IPathOutDTO[]>('The origin floor does not exist.', FailureType.EntityDoesNotExist);
      }

      // Retrieve the last floor.
      const destinationFloor = await this.floorRepo.findByDomainId(destinationFloorId);
      if (!destinationFloor) {
        return Result.fail<IPathOutDTO[]>('The destination floor does not exist.', FailureType.EntityDoesNotExist);
      }

      // Retrieve the first room.
      const originRoom = await this.roomRepo.findByDomainId(originRoomId);
      if (!originRoom) {
        return Result.fail<IPathOutDTO[]>('The origin room does not exist.', FailureType.EntityDoesNotExist);
      }

      // Retrieve the last room.
      const destinationRoom = await this.roomRepo.findByDomainId(destinationRoomId);
      if (!destinationRoom) {
        return Result.fail<IPathOutDTO[]>('The destination room does not exist.', FailureType.EntityDoesNotExist);
      }

      const originRoomDoorXCoordinate =
        originRoom.doorPosition.xPosition + config.configurableValues.path.prologIncrement;

      const originRoomDoorYCoordinate =
        originRoom.doorPosition.yPosition + config.configurableValues.path.prologIncrement;

      const originRoomCoordinates = this.getRoomDoorPosition(
        originRoom.doorOrientation,
        originRoomDoorXCoordinate,
        originRoomDoorYCoordinate,
      );

      const destinationRoomDoorXCoordinate =
        destinationRoom.doorPosition.xPosition + config.configurableValues.path.prologIncrement;

      const destinationRoomDoorYCoordinate =
        destinationRoom.doorPosition.yPosition + config.configurableValues.path.prologIncrement;

      const destinationRoomCoordinates = this.getRoomDoorPosition(
        destinationRoom.doorOrientation,
        destinationRoomDoorXCoordinate,
        destinationRoomDoorYCoordinate,
      );

      const originCell = `cel(${originRoomCoordinates.yPosition},${originRoomCoordinates.xPosition})`;
      const destinationCell = `cel(${destinationRoomCoordinates.yPosition},${destinationRoomCoordinates.xPosition})`;

      // Path result
      const pathDtoOrError = await this.pathGateway.getLowestCostPath(
        originFloorId,
        originCell,
        destinationFloorId,
        destinationCell,
      );
      if (pathDtoOrError.isFailure) {
        return Result.fail<IPathOutDTO[]>(pathDtoOrError.error, pathDtoOrError.failureType);
      }

      // If it was successful, get the pathDto.
      const pathDto = pathDtoOrError.getValue();
      const pathOutDto = await this.mapPathToOutDTO(pathDto.path, pathDto.cost);

      const pathOutDtoArray: IPathOutDTO[] = [];
      pathOutDtoArray.push(pathOutDto);

      return Result.ok<IPathOutDTO[]>(pathOutDtoArray);
    } catch (e) {
      return Result.fail<IPathOutDTO[]>(e.message, FailureType.InvalidInput);
    }
  }

  private async mapPathToOutDTO(path: string[], cost: number): Promise<IPathOutDTO> {
    // Create the pathDtoArray
    const pathDtoArray: string[] = [];

    // iterate over the path array
    for (const element of path) {
      switch (element.slice(0, 3)) {
        case 'cel':
          pathDtoArray.push(element.replace('cel', 'cell'));
          break;
        case 'cor':
          const formattedCorridor = await this.convertFloorIdToBuildingCodeAndFloorNumberCorridor(element);
          pathDtoArray.push(formattedCorridor);
          break;
        case 'ele':
          const formattedElevator = await this.convertFloorIdToBuildingCodeAndFloorNumberElevator(element);
          pathDtoArray.push(formattedElevator);
          break;
      }
    }

    // Cost with two decimals
    const costFormattedToView = (Math.round(cost * 100) / 100).toString();

    // Add "->" between each element of the array
    const pathFormattedToView = pathDtoArray.join(' - ');

    return { path: pathFormattedToView, cost: costFormattedToView };
  }

  private async convertFloorIdToBuildingCodeAndFloorNumber(floorId: string): Promise<string> {
    const floorExists = await this.floorRepo.findByDomainId(floorId);
    if (!floorExists) {
      throw new Error('The floor does not exist.');
    }

    const buildingCode = floorExists.building.code.value;
    const floorNumber = floorExists.floorNumber.value;

    return `${buildingCode}_${floorNumber}`;
  }

  private async convertFloorIdToBuildingCodeAndFloorNumberElevator(pathElement: string): Promise<string> {
    // Extract the content within the parenthesis considering the format elev(f1,f2).
    const idsWithComma = pathElement.slice(5, pathElement.length - 1);

    // Extract the ids
    const ids = idsWithComma.split(',');

    // Converted Ids array
    const convertedIds: string[] = [];

    for (const id of ids) {
      convertedIds.push(await this.convertFloorIdToBuildingCodeAndFloorNumber(id));
    }

    //append convertedIds
    return `elevator(${convertedIds[0]} > ${convertedIds[1]})`;
  }

  private async convertFloorIdToBuildingCodeAndFloorNumberCorridor(pathElement: string): Promise<string> {
    // Extract the content within the parenthesis considering the format cor(f1,f2).
    const idsWithComma = pathElement.slice(4, pathElement.length - 1);

    // Extract the ids
    const ids = idsWithComma.split(',');

    // Converted Ids array
    const convertedIds: string[] = [];

    for (const id of ids) {
      convertedIds.push(await this.convertFloorIdToBuildingCodeAndFloorNumber(id));
    }

    //append convertedIds in format cor(f1,f2) with string function
    return `passage(${convertedIds[0]} > ${convertedIds[1]})`;
  }
}
