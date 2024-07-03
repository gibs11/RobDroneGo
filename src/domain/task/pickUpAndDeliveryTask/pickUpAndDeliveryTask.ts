import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';

import { Guard } from '../../../core/logic/Guard';
import { FailureType, Result } from '../../../core/logic/Result';
import { Room } from '../../room/Room';

import TaskProps, { Task } from '../task';
import { PickUpAndDeliveryTaskConfirmationCode } from './pickUpAndDeliveryTaskConfirmationCode';
import { PickUpAndDeliveryTaskDescription } from './pickUpAndDeliveryTaskDescription';
import { PickUpAndDeliveryTaskPersonContact } from './pickUpAndDeliveryTaskPersonContact';
import { RobisepType } from '../../robisepType/RobisepType';
import { TaskType } from '../../common/TaskType';

interface PickUpAndDeliveryTaskProps extends TaskProps {
  pickUpPersonContact: PickUpAndDeliveryTaskPersonContact;
  pickUpRoom: Room;
  deliveryPersonContact: PickUpAndDeliveryTaskPersonContact;
  deliveryRoom: Room;
  description: PickUpAndDeliveryTaskDescription;
  confirmationCode: PickUpAndDeliveryTaskConfirmationCode;
}

export class PickUpAndDeliveryTask extends Task {
  get pickUpPersonContact(): PickUpAndDeliveryTaskPersonContact {
    return (this.props as PickUpAndDeliveryTaskProps).pickUpPersonContact;
  }

  get pickUpRoom(): Room {
    return (this.props as PickUpAndDeliveryTaskProps).pickUpRoom;
  }

  get deliveryPersonContact(): PickUpAndDeliveryTaskPersonContact {
    return (this.props as PickUpAndDeliveryTaskProps).deliveryPersonContact;
  }

  get deliveryRoom(): Room {
    return (this.props as PickUpAndDeliveryTaskProps).deliveryRoom;
  }

  get description(): PickUpAndDeliveryTaskDescription {
    return (this.props as PickUpAndDeliveryTaskProps).description;
  }

  get confirmationCode(): PickUpAndDeliveryTaskConfirmationCode {
    return (this.props as PickUpAndDeliveryTaskProps).confirmationCode;
  }

  private constructor(props: PickUpAndDeliveryTaskProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: PickUpAndDeliveryTaskProps, id?: UniqueEntityID): Result<PickUpAndDeliveryTask> {
    const guardedProps: any = [
      { argument: props.taskState, argumentName: 'taskState' },
      { argument: props.robisepType, argumentName: 'robisepType' },
      { argument: props.taskCode, argumentName: 'taskCode' },
      { argument: props.email, argumentName: 'email' },
      { argument: props.pickUpPersonContact, argumentName: 'pickUpPersonContact' },
      { argument: props.pickUpRoom, argumentName: 'pickUpRoom' },
      { argument: props.deliveryPersonContact, argumentName: 'deliveryPersonContact' },
      { argument: props.deliveryRoom, argumentName: 'deliveryRoom' },
      { argument: props.description, argumentName: 'description' },
      { argument: props.confirmationCode, argumentName: 'confirmationCode' },
    ];

    // Optional props.
    if (props.robisep) {
      guardedProps.push({ argument: props.robisep, argumentName: 'robisep' });
    }

    // Ensure that the props are not null or undefined.
    const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);
    if (!guardResult.succeeded) {
      return Result.fail<PickUpAndDeliveryTask>(guardResult.message, FailureType.InvalidInput);
    }

    // Ensure that the pickup and delivery rooms are not the same.
    if (PickUpAndDeliveryTask.arePickUpAndDeliveryRoomsTheSame(props.pickUpRoom, props.deliveryRoom)) {
      return Result.fail<PickUpAndDeliveryTask>(
        'The pick up and delivery rooms are the same.',
        FailureType.InvalidInput,
      );
    }

    // Ensure that the robot type is capable of transport.
    if (!PickUpAndDeliveryTask.isRobotTypeCapableOfTransport(props.robisepType)) {
      return Result.fail<PickUpAndDeliveryTask>(
        `The robot type ${props.robisepType.designation.value} is not capable of surveillance.`,
        FailureType.InvalidInput,
      );
    }

    const pickUpAndDeliveryTask = new PickUpAndDeliveryTask(
      {
        ...props,
      },
      id,
    );

    // Return a Result type success.
    return Result.ok<PickUpAndDeliveryTask>(pickUpAndDeliveryTask);
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
   * Ensure that the robot type is capable of transport.
   * @param robisepType The type of robot.
   * @returns true if the robot type is capable of transport, false otherwise.
   */
  private static isRobotTypeCapableOfTransport(robisepType: RobisepType): boolean {
    return robisepType.tasksType.includes(TaskType.TRANSPORT);
  }
}
