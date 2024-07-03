import { Mapper } from '../core/infra/Mapper';
import RobisepTypeRepo from '../repos/robisepTypeRepo';
import { Container } from 'typedi';
import { UniqueEntityID } from '../core/domain/UniqueEntityID';
import ITaskOutDTO from '../dto/out/ITaskOutDTO';
import { Task } from '../domain/task/task';
import { RobisepTypeMap } from './RobisepTypeMap';
import { TaskType } from '../domain/common/TaskType';
import { SurveillanceTask } from '../domain/task/surveillanceTask/surveillanceTask';
import { PickUpAndDeliveryTask } from '../domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTask';
import { TaskState } from '../domain/task/taskState';
import { PhoneNumber } from '../domain/common/phoneNumber';
import { RoomMap } from './RoomMap';
import RoomRepo from '../repos/roomRepo';
import { PickUpAndDeliveryTaskPersonContact } from '../domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTaskPersonContact';
import { PickUpAndDeliveryTaskDescription } from '../domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTaskDescription';
import { PickUpAndDeliveryTaskConfirmationCode } from '../domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTaskConfirmationCode';
import { PersonalName } from '../domain/common/personalName';
import { TaskCode } from '../domain/task/taskCode';
import { RobisepMap } from './RobisepMap';
import { Robisep } from '../domain/robisep/Robisep';
import RobisepRepo from '../repos/robisepRepo';

export class TaskMap extends Mapper<Task> {
  public static toDTO(task: Task): ITaskOutDTO {
    const taskDTO: ITaskOutDTO = {
      domainId: task.id.toString(),
      robisepType: RobisepTypeMap.toDTO(task.robisepType),
      taskCode: task.taskCode.value,
      email: task.email,
      state: task.taskState,
    };

    if (task.robisep) {
      taskDTO.robisep = RobisepMap.toDTO(task.robisep);
    }

    // Retrieve the task type
    const taskType = this.retrieveTaskTypeFromTask(task);

    // According to the task type, fill the DTO with the corresponding content
    switch (taskType) {
      case TaskType.SURVEILLANCE:
        return this.toSurveillanceTaskDTO(task as SurveillanceTask, taskDTO);
      case TaskType.TRANSPORT:
        return this.toPickUpAndDeliveryTaskDTO(task as PickUpAndDeliveryTask, taskDTO);
      default:
        throw new TypeError('Invalid Task Type');
    }
  }

  /**
   * This method is intended to be private. It is responsible for filling the DTO with the surveillance task specific content.
   * @param task the task to fill the DTO with
   * @param taskDTO the common task DTO content
   * @returns the task DTO with the surveillance task specific content
   */
  private static toSurveillanceTaskDTO(task: SurveillanceTask, taskDTO: ITaskOutDTO): ITaskOutDTO {
    return {
      ...taskDTO,
      surveillanceTask: {
        emergencyPhoneNumber: task.emergencyPhoneNumber.value,
        startingPointToWatch: RoomMap.toDTO(task.startingPointToWatch),
        endingPointToWatch: RoomMap.toDTO(task.endingPointToWatch),
      },
    };
  }

  /**
   * This method is intended to be private. It is responsible for filling the DTO with the pickup and delivery task specific content.
   * @param task the task to fill the DTO with
   * @param taskDTO the common task DTO content
   * @returns the task DTO with the pickup and delivery task specific content
   */
  private static toPickUpAndDeliveryTaskDTO(task: PickUpAndDeliveryTask, taskDTO: ITaskOutDTO): ITaskOutDTO {
    return {
      ...taskDTO,
      pickUpAndDeliveryTask: {
        pickUpPersonContact: {
          name: task.pickUpPersonContact.personPersonalName.value,
          phoneNumber: task.pickUpPersonContact.personPhoneNumber.value,
        },
        pickUpRoom: RoomMap.toDTO(task.pickUpRoom),

        deliveryPersonContact: {
          name: task.deliveryPersonContact.personPersonalName.value,
          phoneNumber: task.deliveryPersonContact.personPhoneNumber.value,
        },
        deliveryRoom: RoomMap.toDTO(task.deliveryRoom),

        description: task.description.value,
        confirmationCode: task.confirmationCode.value,
      },
    };
  }

  /**
   * This is a helper method to retrieve the TaskType from a Task.
   * If the future holds more Task types, this method should be updated. To do so, add a case for the new Task type.
   * @param task the task to retrieve the type from
   */
  private static retrieveTaskTypeFromTask(task: Task): TaskType {
    switch (true) {
      case task instanceof SurveillanceTask:
        return TaskType.SURVEILLANCE;
      case task instanceof PickUpAndDeliveryTask:
        return TaskType.TRANSPORT;
      default:
        throw new TypeError('Invalid Task Type');
    }
  }

  public static async toSurveillanceTaskDomain(surveillanceTask: any): Promise<SurveillanceTask> {
    // Retrieve the Robisep type
    const robisepTypeRepo = Container.get(RobisepTypeRepo);
    const robisepType = await robisepTypeRepo.findByDomainId(surveillanceTask.robisepTypeId);
    if (!robisepType) {
      throw new ReferenceError('Robisep type not found');
    }

    // Retrieve the Robisep
    let robisep: Robisep;
    if (surveillanceTask.robisepId) {
      const robisepRepo = Container.get(RobisepRepo);
      robisep = await robisepRepo.findByDomainId(surveillanceTask.robisepId);
      if (!robisep) {
        throw new ReferenceError('Robisep not found');
      }
    }

    // Task Code
    const taskCodeNumber = surveillanceTask.taskCode;
    const taskCodeOrError = TaskCode.create(taskCodeNumber);
    if (taskCodeOrError.isFailure) {
      throw new TypeError(taskCodeOrError.errorMessage());
    }

    // Task state
    let surveillanceTaskState: any;
    for (const taskState in TaskState) {
      if (surveillanceTask.taskState.toUpperCase().trim() === taskState) {
        surveillanceTaskState = TaskState[taskState];
      }
    }
    // Verify task state was found
    if (!surveillanceTaskState) {
      throw new TypeError(
        'Invalid task state provided - ' +
          surveillanceTask.taskState.toUpperCase() +
          '. Valid values are: ' +
          Object.values(TaskState),
      );
    }

    // Retrieve the starting point to watch
    const roomRepo = Container.get(RoomRepo);
    const startingPointToWatch = await roomRepo.findByDomainId(surveillanceTask.startingPointToWatchId);
    if (!startingPointToWatch) {
      throw new ReferenceError('Starting point to watch not found');
    }

    // Retrieve the ending point to watch
    const endingPointToWatch = await roomRepo.findByDomainId(surveillanceTask.endingPointToWatchId);
    if (!endingPointToWatch) {
      throw new ReferenceError('Ending point to watch not found');
    }

    // Create the Emergency phone number
    const emergencyPhoneNumberOrError = PhoneNumber.create(surveillanceTask.emergencyPhoneNumber);
    if (emergencyPhoneNumberOrError.isFailure) {
      throw new TypeError(emergencyPhoneNumberOrError.errorMessage());
    }

    // Create Surveillance task
    const surveillanceTaskOrError = SurveillanceTask.create(
      {
        taskState: surveillanceTaskState,
        robisepType: robisepType,
        robisep: robisep ? robisep : null,
        taskCode: taskCodeOrError.getValue(),
        email: surveillanceTask.email,
        emergencyPhoneNumber: emergencyPhoneNumberOrError.getValue(),
        startingPointToWatch: startingPointToWatch,
        endingPointToWatch: endingPointToWatch,
      },
      new UniqueEntityID(surveillanceTask.domainId),
    );

    return surveillanceTaskOrError.isSuccess ? surveillanceTaskOrError.getValue() : null;
  }

  public static async toPickUpAndDeliveryTaskDomain(pickUpAndDeliveryTask: any): Promise<PickUpAndDeliveryTask> {
    // Retrieve the Robisep type
    const robisepTypeRepo = Container.get(RobisepTypeRepo);
    const robisepType = await robisepTypeRepo.findByDomainId(pickUpAndDeliveryTask.robisepTypeId);
    if (!robisepType) {
      throw new ReferenceError('Robisep type not found');
    }

    // Retrieve the Robisep
    let robisep: Robisep;
    if (pickUpAndDeliveryTask.robisepId) {
      const robisepRepo = Container.get(RobisepRepo);
      robisep = await robisepRepo.findByDomainId(pickUpAndDeliveryTask.robisepId);
      if (!robisep) {
        throw new ReferenceError('Robisep not found');
      }
    }

    // Task Code
    const taskCodeNumber = pickUpAndDeliveryTask.taskCode;
    const taskCodeOrError = TaskCode.create(taskCodeNumber);
    if (taskCodeOrError.isFailure) {
      throw new TypeError(taskCodeOrError.errorMessage());
    }

    // Task state
    let pickUpAndDeliveryTaskState: any;
    for (const taskState in TaskState) {
      if (pickUpAndDeliveryTask.taskState.toUpperCase().trim() === taskState) {
        pickUpAndDeliveryTaskState = TaskState[taskState];
      }
    }
    // Verify task state was found
    if (!pickUpAndDeliveryTaskState) {
      throw new TypeError(
        'Invalid task state provided - ' +
          pickUpAndDeliveryTask.taskState.toUpperCase() +
          '. Valid values are: ' +
          Object.values(TaskState),
      );
    }

    // Retrieve the Pickup Room
    const roomRepo = Container.get(RoomRepo);
    const pickUpRoom = await roomRepo.findByDomainId(pickUpAndDeliveryTask.pickUpRoom);
    if (!pickUpRoom) {
      throw new ReferenceError(`Room with id ${pickUpAndDeliveryTask.pickUpRoom} not found`);
    }

    // Retrieve the Delivery Room
    const deliveryRoom = await roomRepo.findByDomainId(pickUpAndDeliveryTask.deliveryRoom);
    if (!deliveryRoom) {
      throw new ReferenceError(`Room with id ${pickUpAndDeliveryTask.deliveryRoom} not found`);
    }

    // Create the Pickup Person Personal Name
    const pickUpPersonPersonalNameOrError = PersonalName.create(pickUpAndDeliveryTask.pickUpPersonContact.name);
    if (pickUpPersonPersonalNameOrError.isFailure) {
      throw new TypeError(pickUpPersonPersonalNameOrError.errorMessage());
    }

    // Create the Pickup Person Phone Number
    const pickUpPersonPhoneNumberOrError = PhoneNumber.create(pickUpAndDeliveryTask.pickUpPersonContact.phoneNumber);
    if (pickUpPersonPhoneNumberOrError.isFailure) {
      throw new TypeError(pickUpPersonPhoneNumberOrError.errorMessage());
    }

    // Create the Pickup Person Contact
    const pickUpPersonContactOrError = PickUpAndDeliveryTaskPersonContact.create({
      personPersonalName: pickUpPersonPersonalNameOrError.getValue(),
      personPhoneNumber: pickUpPersonPhoneNumberOrError.getValue(),
    });
    if (pickUpPersonContactOrError.isFailure) {
      throw new TypeError(pickUpPersonContactOrError.errorMessage());
    }

    // Create the Delivery Person Personal Name
    const deliveryPersonPersonalNameOrError = PersonalName.create(pickUpAndDeliveryTask.deliveryPersonContact.name);
    if (deliveryPersonPersonalNameOrError.isFailure) {
      throw new TypeError(deliveryPersonPersonalNameOrError.errorMessage());
    }

    // Create the Delivery Person Phone Number
    const deliveryPersonPhoneNumberOrError = PhoneNumber.create(
      pickUpAndDeliveryTask.deliveryPersonContact.phoneNumber,
    );
    if (deliveryPersonPhoneNumberOrError.isFailure) {
      throw new TypeError(deliveryPersonPhoneNumberOrError.errorMessage());
    }

    // Create the Delivery Person Contact
    const deliveryPersonContactOrError = PickUpAndDeliveryTaskPersonContact.create({
      personPersonalName: deliveryPersonPersonalNameOrError.getValue(),
      personPhoneNumber: deliveryPersonPhoneNumberOrError.getValue(),
    });
    if (deliveryPersonContactOrError.isFailure) {
      throw new TypeError(deliveryPersonContactOrError.errorMessage());
    }

    // Create the Pickup and Delivery Task Description
    const pickUpAndDeliveryTaskDescriptionOrError = PickUpAndDeliveryTaskDescription.create(
      pickUpAndDeliveryTask.description,
    );
    if (pickUpAndDeliveryTaskDescriptionOrError.isFailure) {
      throw new TypeError(pickUpAndDeliveryTaskDescriptionOrError.errorMessage());
    }

    // Create the Pickup and Delivery Task Confirmation Code
    const pickUpAndDeliveryTaskConfirmationCodeOrError = PickUpAndDeliveryTaskConfirmationCode.create(
      pickUpAndDeliveryTask.confirmationCode,
    );
    if (pickUpAndDeliveryTaskConfirmationCodeOrError.isFailure) {
      throw new TypeError(pickUpAndDeliveryTaskConfirmationCodeOrError.errorMessage());
    }

    // Create the Pickup and Delivery Task
    const pickUpAndDeliveryTaskOrError = PickUpAndDeliveryTask.create(
      {
        taskState: pickUpAndDeliveryTaskState,
        robisepType: robisepType,
        robisep: robisep ? robisep : null,
        taskCode: taskCodeOrError.getValue(),
        email: pickUpAndDeliveryTask.email,
        pickUpPersonContact: pickUpPersonContactOrError.getValue(),
        pickUpRoom: pickUpRoom,
        deliveryPersonContact: deliveryPersonContactOrError.getValue(),
        deliveryRoom: deliveryRoom,
        description: pickUpAndDeliveryTaskDescriptionOrError.getValue(),
        confirmationCode: pickUpAndDeliveryTaskConfirmationCodeOrError.getValue(),
      },
      new UniqueEntityID(pickUpAndDeliveryTask.domainId),
    );

    return pickUpAndDeliveryTaskOrError.isSuccess ? pickUpAndDeliveryTaskOrError.getValue() : null;
  }

  public static toSurveillanceTaskPersistence(surveillanceTask: SurveillanceTask): any {
    return {
      domainId: surveillanceTask.id.toString(),
      robisepTypeId: surveillanceTask.robisepType.id.toString(),
      robisepId: surveillanceTask.robisep ? surveillanceTask.robisep.id.toString() : null,
      taskCode: surveillanceTask.taskCode.value,
      email: surveillanceTask.email,
      taskState: surveillanceTask.taskState,
      emergencyPhoneNumber: surveillanceTask.emergencyPhoneNumber.value,
      startingPointToWatchId: surveillanceTask.startingPointToWatch.id.toString(),
      endingPointToWatchId: surveillanceTask.endingPointToWatch.id.toString(),
    };
  }

  public static toPickUpAndDeliveryTaskPersistence(pickUpAndDeliveryTask: PickUpAndDeliveryTask): any {
    return {
      domainId: pickUpAndDeliveryTask.id.toString(),
      robisepTypeId: pickUpAndDeliveryTask.robisepType.id.toString(),
      robisepId: pickUpAndDeliveryTask.robisep ? pickUpAndDeliveryTask.robisep.id.toString() : null,
      taskCode: pickUpAndDeliveryTask.taskCode.value,
      email: pickUpAndDeliveryTask.email,
      taskState: pickUpAndDeliveryTask.taskState,
      pickUpPersonContact: {
        name: pickUpAndDeliveryTask.pickUpPersonContact.personPersonalName.value,
        phoneNumber: pickUpAndDeliveryTask.pickUpPersonContact.personPhoneNumber.value,
      },
      pickUpRoom: pickUpAndDeliveryTask.pickUpRoom.id.toString(),
      deliveryPersonContact: {
        name: pickUpAndDeliveryTask.deliveryPersonContact.personPersonalName.value,
        phoneNumber: pickUpAndDeliveryTask.deliveryPersonContact.personPhoneNumber.value,
      },
      deliveryRoom: pickUpAndDeliveryTask.deliveryRoom.id.toString(),
      description: pickUpAndDeliveryTask.description.value,
      confirmationCode: pickUpAndDeliveryTask.confirmationCode.value,
    };
  }
}
