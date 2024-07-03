import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';

import { Guard } from '../../../core/logic/Guard';
import { FailureType, Result } from '../../../core/logic/Result';
import { PhoneNumber } from '../../common/phoneNumber';
import TaskProps, { Task } from '../task';
import { Room } from '../../room/Room';
import { RobisepType } from '../../robisepType/RobisepType';
import { TaskType } from '../../common/TaskType';

interface SurveillanceTaskProps extends TaskProps {
  emergencyPhoneNumber: PhoneNumber;
  startingPointToWatch: Room;
  endingPointToWatch: Room;
}

export class SurveillanceTask extends Task {
  get emergencyPhoneNumber(): PhoneNumber {
    return (this.props as SurveillanceTaskProps).emergencyPhoneNumber;
  }

  get startingPointToWatch(): Room {
    return (this.props as SurveillanceTaskProps).startingPointToWatch;
  }

  get endingPointToWatch(): Room {
    return (this.props as SurveillanceTaskProps).endingPointToWatch;
  }

  private constructor(props: SurveillanceTaskProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: SurveillanceTaskProps, id?: UniqueEntityID): Result<SurveillanceTask> {
    const guardedProps: any = [
      { argument: props.taskState, argumentName: 'taskState' },
      { argument: props.robisepType, argumentName: 'robisepType' },
      { argument: props.taskCode, argumentName: 'taskCode' },
      { argument: props.email, argumentName: 'email' },
      { argument: props.emergencyPhoneNumber, argumentName: 'emergencyPhoneNumber' },
      { argument: props.startingPointToWatch, argumentName: 'startingPointToWatch' },
      { argument: props.endingPointToWatch, argumentName: 'endingPointToWatch' },
    ];

    // Optional props.
    if (props.robisep) {
      guardedProps.push({ argument: props.robisep, argumentName: 'robisep' });
    }

    // Ensure that the props are not null or undefined.
    const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);
    if (!guardResult.succeeded) {
      return Result.fail<SurveillanceTask>(guardResult.message, FailureType.InvalidInput);
    }

    // Ensure that the pickup and delivery rooms are not the same.
    if (SurveillanceTask.arePickUpAndDeliveryRoomsTheSame(props.startingPointToWatch, props.endingPointToWatch)) {
      return Result.fail<SurveillanceTask>(
        'The starting point and ending point to watch cannot be the same.',
        FailureType.InvalidInput,
      );
    }

    // Ensure that the starting and ending points are in the same floor.
    if (
      !SurveillanceTask.areStartingAndEndingPointsInTheSameFloor(props.startingPointToWatch, props.endingPointToWatch)
    ) {
      return Result.fail<SurveillanceTask>(
        'The starting point and ending point to watch must be in the same floor.',
        FailureType.InvalidInput,
      );
    }

    // Ensure that the robot type is capable of surveillance.
    if (!SurveillanceTask.isRobotTypeCapableOfSurveillance(props.robisepType)) {
      return Result.fail<SurveillanceTask>(
        `The robot type ${props.robisepType.designation.value} is not capable of surveillance.`,
        FailureType.InvalidInput,
      );
    }

    const surveillanceTask = new SurveillanceTask(
      {
        ...props,
      },
      id,
    );

    // Return a Result type success.
    return Result.ok<SurveillanceTask>(surveillanceTask);
  }

  /**
   * Ensure that the pickup and delivery rooms are not the same.
   * @param pickUpRoom The room where the pickup will occur.
   * @param deliveryRoom The room where the delivery will occur.
   * @returns true if the pickup and delivery rooms are the same, false otherwise.
   */
  private static arePickUpAndDeliveryRoomsTheSame(pickUpRoom: Room, deliveryRoom: Room): boolean {
    return pickUpRoom.id.equals(deliveryRoom.id);
  }

  /**
   * Ensure that the starting and ending points are in the same floor.
   * @param startingPoint The starting point.
   * @param endingPoint The ending point.
   * @returns true if the starting and ending points are in the same floor, false otherwise.
   */
  private static areStartingAndEndingPointsInTheSameFloor(startingPoint: Room, endingPoint: Room): boolean {
    return startingPoint.floor.id.toString() === endingPoint.floor.id.toString();
  }

  /**
   * Ensure that the robot type is capable of surveillance.
   * @param robisepType The type of robot.
   * @returns true if the robot type is capable of surveillance, false otherwise.
   */
  private static isRobotTypeCapableOfSurveillance(robisepType: RobisepType): boolean {
    return robisepType.tasksType.includes(TaskType.SURVEILLANCE);
  }
}
