import { Inject, Service } from 'typedi';
import config from '../../../config';
import IPrologTasksService from '../IServices/IPrologTasksService';
import { FailureType, Result } from '../../core/logic/Result';
import IPrologTasksDTO from '../../dto/IPrologTasksDTO';
import ISurveillanceTaskRepo from '../IRepos/ISurveillanceTaskRepo';
import IRobisepRepo from '../IRepos/IRobisepRepo';
import IPickUpAndDeliveryTaskRepo from '../IRepos/IPickUpAndDeliveryTaskRepo';
import { SurveillanceTask } from '../../domain/task/surveillanceTask/surveillanceTask';
import { DoorOrientation } from '../../domain/room/DoorOrientation';
import { Room } from '../../domain/room/Room';
import { PickUpAndDeliveryTask } from '../../domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTask';
import { Robisep } from '../../domain/robisep/Robisep';

@Service()
export default class PrologTasksService implements IPrologTasksService {
  constructor(
    @Inject(config.repos.surveillanceTask.name) private surveillanceTaskRepo: ISurveillanceTaskRepo,
    @Inject(config.repos.pickUpAndDeliveryTask.name) private pickUpAndDeliveryTaskRepo: IPickUpAndDeliveryTaskRepo,
    @Inject(config.repos.robisep.name) private robisepRepo: IRobisepRepo,
    @Inject('logger') private logger,
  ) {}

  public async obtainApprovedTasks(robisepId: string): Promise<Result<IPrologTasksDTO>> {
    // Verify if the robisep exists
    const robisepExists = await this.robisepRepo.findByDomainId(robisepId);
    if (!robisepExists) {
      return Result.fail<IPrologTasksDTO>(
        `The robisep with id ${robisepId} does not exist.`,
        FailureType.EntityDoesNotExist,
      );
    }

    // Fill robot according to prolog format
    const robot = await this.robotString(robisepExists);

    // Fill tasks according to prolog format
    const tasks = await this.findAllApprovedTasksForRobisep(robisepId);

    // Create the prolog tasks dto
    const prologTasksDTO: IPrologTasksDTO = {
      tasks,
      robot,
    };

    // Return the prolog tasks dto
    return Result.ok<IPrologTasksDTO>(prologTasksDTO);
  }

  /**
   * This method finds the robot for a certain robisep.
   * @param robisep The robisep.
   * @private This method is private because it is only used in this class.
   */
  private async robotString(robisep: Robisep): Promise<string> {
    // Robot floor
    const robotFloor = robisep.roomId.floor.id.toString();

    // Robot cell
    const robotCell = this.convertRoomToCell(robisep.roomId);

    // Assemble the robot
    return `robot(${robotFloor},${robotCell})`;
  }

  /**
   * This method finds the robot for a certain robisep.
   * @param robisepId The robisep id.
   * @private This method is private because it is only used in this class.
   */
  private async findAllApprovedTasksForRobisep(robisepId: string): Promise<string[]> {
    // Approved surveillance tasks for the robisep
    const surveillanceTasks = await this.surveillanceTaskRepo.findByStateAndRobisepId(['ACCEPTED'], robisepId);

    // Approved pick up and delivery tasks for the robisep
    const pickUpAndDeliveryTasks = await this.pickUpAndDeliveryTaskRepo.findByStateAndRobisepId(
      ['ACCEPTED'],
      robisepId,
    );

    // Convert the tasks to a string array
    const surveillanceTasksStringArray = this.convertSurveillanceTasksToStringArray(surveillanceTasks);
    const pickUpAndDeliveryTasksStringArray = this.convertPickUpAndDeliveryTasksToStringArray(pickUpAndDeliveryTasks);

    // Assemble the tasks
    return [...surveillanceTasksStringArray, ...pickUpAndDeliveryTasksStringArray];
  }

  /**
   * This method converts the surveillance tasks to a string array.
   * @param surveillanceTasks The surveillance tasks.
   * @private This method is private because it is only used in this class.
   */
  private convertSurveillanceTasksToStringArray(surveillanceTasks: SurveillanceTask[]): string[] {
    const tasks: string[] = [];
    for (const task of surveillanceTasks) {
      // Task code
      const taskCode = task.taskCode.value;

      // Task origin floor
      const originFloor = task.startingPointToWatch.floor.id.toString();

      // Task origin cell
      const originCell = this.convertRoomToCell(task.startingPointToWatch);

      // Task destination floor
      const destinationFloor = task.endingPointToWatch.floor.id.toString();

      // Task destination cell
      const destinationCell = this.convertRoomToCell(task.endingPointToWatch);

      // Assemble the task
      const taskString = `task(${taskCode},${originFloor},${destinationFloor},${originCell},${destinationCell})`;
      tasks.push(taskString);
    }

    return tasks;
  }

  /**
   * This method converts the pickup and delivery tasks to a string array.
   * @param pickUpAndDeliveryTasks The pick up and delivery tasks.
   * @private This method is private because it is only used in this class.
   */
  private convertPickUpAndDeliveryTasksToStringArray(pickUpAndDeliveryTasks: PickUpAndDeliveryTask[]): string[] {
    const tasks: string[] = [];
    for (const task of pickUpAndDeliveryTasks) {
      // Task code
      const taskCode = task.taskCode.value;

      // Task origin floor
      const originFloor = task.pickUpRoom.floor.id.toString();

      // Task origin cell
      const originCell = this.convertRoomToCell(task.pickUpRoom);

      // Task destination floor
      const destinationFloor = task.deliveryRoom.floor.id.toString();

      // Task destination cell
      const destinationCell = this.convertRoomToCell(task.deliveryRoom);

      // Assemble the task
      const taskString = `task(${taskCode},${originFloor},${destinationFloor},${originCell},${destinationCell})`;
      tasks.push(taskString);
    }

    return tasks;
  }

  /**
   * This method converts the room id to a cell.
   * @param room The room.
   * @private This method is private because it is only used in this class.
   */
  private convertRoomToCell(room: Room): string {
    const roomDoorXCoordinate = room.doorPosition.xPosition + config.configurableValues.path.prologIncrement;

    const roomDoorYCoordinate = room.doorPosition.yPosition + config.configurableValues.path.prologIncrement;

    const roomCoordinates = this.getRoomDoorPosition(room.doorOrientation, roomDoorXCoordinate, roomDoorYCoordinate);

    return `cel(${roomCoordinates.yPosition},${roomCoordinates.xPosition})`;
  }

  /**
   * This method obtains the room door position.
   * @param roomDoorOrientation The room door orientation.
   * @param doorX The door x coordinate.
   * @param doorY The door y coordinate.
   * @private This method is private because it is only used in this class.
   */
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
}
