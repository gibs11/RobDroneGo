import IRoomAreaChecker from '../IServices/IRoomAreaChecker';
import { Inject, Service } from 'typedi';
import config from '../../../config';
import IRoomRepo from '../../services/IRepos/IRoomRepo';
import { Floor } from '../floor/floor';
import IElevatorRepo from '../../services/IRepos/IElevatorRepo';
import IPassageRepo from '../../services/IRepos/IPassageRepo';
import { FailureType, Result } from '../../core/logic/Result';

@Service()
export default class RoomAreaChecker implements IRoomAreaChecker {
  constructor(
    @Inject(config.repos.room.name) private roomRepo: IRoomRepo,
    @Inject(config.repos.elevator.name) private elevatorRepo: IElevatorRepo,
    @Inject(config.repos.passage.name) private passageRepo: IPassageRepo,
  ) {}

  public async checkIfAreaIsAvailableForRoom(
    initialX: number,
    initialY: number,
    finalX: number,
    finalY: number,
    doorX: number,
    doorY: number,
    doorOrientation: string,
    floor: Floor,
  ): Promise<Result<boolean>> {
    const roomCheck = await this.roomRepo.checkIfRoomExistInArea(initialX, initialY, finalX, finalY, floor);
    if (roomCheck) {
      return Result.fail<boolean>('A room already exists in the given area.', FailureType.InvalidInput);
    }

    const elevatorCheck = await this.elevatorRepo.checkIfElevatorExistInArea(initialX, initialY, finalX, finalY, floor);
    if (elevatorCheck) {
      return Result.fail<boolean>('An elevator already exists in the given area.', FailureType.InvalidInput);
    }

    const passageCheck = await this.passageRepo.checkIfPassageExistInArea(initialX, initialY, finalX, finalY, floor);
    if (passageCheck) {
      return Result.fail<boolean>('A passage already exists in the given area.', FailureType.InvalidInput);
    }

    // Room's outcell
    const roomOutCell = this.calculateOutCell(doorX, doorY, doorOrientation);

    const rooms = await this.roomRepo.findByFloorId(floor.id.toString());
    for (const room of rooms) {
      const outCell = this.calculateOutCell(
        room.doorPosition.xPosition,
        room.doorPosition.yPosition,
        room.doorOrientation,
      );

      // Check if outCell is within the border of the room - if it is, then the room is blocking another's door
      if (outCell.x >= initialX && outCell.x <= finalX && outCell.y >= initialY && outCell.y <= finalY) {
        return Result.fail<boolean>("The room is blocking another's door.", FailureType.InvalidInput);
      }

      // Check if the outcell is the same as the new room's door - if it is, then the room is blocking another's door
      if (roomOutCell.x === outCell.x && roomOutCell.y === outCell.y) {
        return Result.fail<boolean>("The room is blocking another's door.", FailureType.InvalidInput);
      }
    }

    return Result.ok<boolean>(true);
  }

  /**
   * Calculate the out cell of a room based on the door position and orientation
   * The out cell is the cell right in front of the door of the room
   *
   * @param doorX
   * @param doorY
   * @param doorOrientation
   * @private
   */
  private calculateOutCell(doorX: number, doorY: number, doorOrientation: string) {
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
        return null;
    }

    return { x: newX, y: newY };
  }
}
