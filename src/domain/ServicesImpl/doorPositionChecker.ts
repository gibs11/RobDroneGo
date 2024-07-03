import { Inject, Service } from 'typedi';
import config from '../../../config';
import { Floor } from '../floor/floor';
import IDoorPositionChecker from '../IServices/IDoorPositionChecker';
import { inRange } from 'lodash';
import IBuildingRepo from '../../services/IRepos/IBuildingRepo';
import IPositionChecker from '../IServices/IPositionChecker';
import LoggerInstance from '../../loaders/logger';
import { FailureType, Result } from '../../core/logic/Result';

@Service()
export default class DoorPositionChecker implements IDoorPositionChecker {
  constructor(
    @Inject(config.services.positionChecker.name) private positionChecker: IPositionChecker,
    @Inject(config.repos.building.name) private buildingRepo: IBuildingRepo,
  ) {}

  public async isPositionValid(
    initialX: number,
    initialY: number,
    finalX: number,
    finalY: number,
    doorX: number,
    doorY: number,
    doorOrientation: string,
    floor: Floor,
  ): Promise<Result<boolean>> {
    // Door has to belong to the border of the room
    if (
      !(
        ((doorX === initialX || doorX === finalX) && doorY >= initialY && doorY <= finalY) ||
        ((doorY === initialY || doorY === finalY) && doorX >= initialX && doorX <= finalX)
      )
    ) {
      LoggerInstance.error('Door is not in the border of the room.');
      return Result.fail<boolean>('Door is not in the border of the room.', FailureType.InvalidInput);
    }

    let newX: number;
    let newY: number;

    switch (doorOrientation) {
      case 'NORTH':
        newX = doorX;
        newY = doorY - 1;
        break;
      case 'SOUTH':
        newX = doorX;
        newY = doorY + 1;
        break;
      case 'WEST':
        newX = doorX - 1;
        newY = doorY;
        break;
      case 'EAST':
        newX = doorX + 1;
        newY = doorY;
        break;
      default:
        return Result.fail<boolean>('Invalid Door Orientation.', FailureType.InvalidInput);
    }

    // Check if the door has the right orientation for the given position
    if (newX >= initialX && newX <= finalX && newY >= initialY && newY <= finalY)
      return Result.fail<boolean>('Invalid door orientation, it should face the outside of the room.');

    // Check if door is facing the outside of the building
    const building = await this.buildingRepo.findByDomainId(floor.building.id.toString());
    if (!inRange(newX, 0, building.dimensions.width) || !inRange(newY, 0, building.dimensions.length)) {
      LoggerInstance.error('Door is facing the outside of the building.');
      return Result.fail<boolean>('Door is facing the outside of the building.', FailureType.InvalidInput);
    }

    // Check if door is facing a room, passage or elevator - returns true if it's not facing any of those
    const isValid = await this.positionChecker.isPositionAvailable(newX, newY, floor, null);
    if (!isValid) {
      LoggerInstance.error('Door is facing a room, passage or elevator.');
      return Result.fail<boolean>('Door is facing a room, passage or elevator.', FailureType.InvalidInput);
    }

    return Result.ok<boolean>(true);
  }
}
