import { Inject, Service } from 'typedi';

import config from '../../config';

import { UniqueEntityID } from '../core/domain/UniqueEntityID';
import { SurveillanceTask } from '../domain/task/surveillanceTask/surveillanceTask';
import ITaskFactory from '../services/IFactories/ITaskFactory';
import { PhoneNumber } from '../domain/common/phoneNumber';
import { TaskState } from '../domain/task/taskState';
import IRobisepTypeRepo from '../services/IRepos/IRobisepTypeRepo';
import { Result } from '../core/logic/Result';
import { PickUpAndDeliveryTask } from '../domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTask';
import IRoomRepo from '../services/IRepos/IRoomRepo';
import { PickUpAndDeliveryTaskPersonContact } from '../domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTaskPersonContact';
import { PickUpAndDeliveryTaskDescription } from '../domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTaskDescription';
import { PickUpAndDeliveryTaskConfirmationCode } from '../domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTaskConfirmationCode';
import { PersonalName } from '../domain/common/personalName';
import ISurveillanceTaskRepo from '../services/IRepos/ISurveillanceTaskRepo';
import IPickUpAndDeliveryTaskRepo from '../services/IRepos/IPickUpAndDeliveryTaskRepo';
import { TaskCode } from '../domain/task/taskCode';

@Service()
export default class TaskFactory implements ITaskFactory {
  constructor(
    @Inject(config.repos.robisepType.name) private robisepTypeRepo: IRobisepTypeRepo,
    @Inject(config.repos.room.name) private roomRepo: IRoomRepo,
    @Inject(config.repos.surveillanceTask.name) private surveillanceTaskRepo: ISurveillanceTaskRepo,
    @Inject(config.repos.pickUpAndDeliveryTask.name) private pickUpAndDeliveryTaskRepo: IPickUpAndDeliveryTaskRepo,
  ) {}

  public async createSurveillanceTask(raw: any, email: string): Promise<Result<SurveillanceTask>> {
    // Task state (default: REQUESTED)
    const taskState = TaskState.REQUESTED;

    // Retrieve RobisepType
    const robisepType = await this.robisepTypeRepo.findByDomainId(raw.robisepType);
    if (!robisepType) {
      throw new TypeError('RobisepType not found');
    }

    // Determine the task code
    const taskCodeNumber = await this.determineTaskCode();
    const taskCode = TaskCode.create(taskCodeNumber);
    if (taskCode.isFailure) {
      throw new TypeError(taskCode.errorMessage());
    }

    // Create emergency phone number
    const emergencyPhoneNumberOrError = PhoneNumber.create(raw.surveillanceTask.emergencyPhoneNumber);
    if (emergencyPhoneNumberOrError.isFailure) {
      throw new TypeError(emergencyPhoneNumberOrError.errorMessage());
    }

    // Retrieve the origin surveillance room
    const startingPointToWatch = await this.roomRepo.findByDomainId(raw.surveillanceTask.startingPointToWatch);
    if (!startingPointToWatch) {
      throw new TypeError('Starting point to watch not found');
    }

    // Retrieve the destination surveillance room
    const endingPointToWatch = await this.roomRepo.findByDomainId(raw.surveillanceTask.endingPointToWatch);
    if (!endingPointToWatch) {
      throw new TypeError('Ending point to watch not found');
    }

    // Create SurveillanceTask
    const surveillanceTaskOrError = SurveillanceTask.create(
      {
        taskState: taskState,
        robisepType: robisepType,
        taskCode: taskCode.getValue(),
        email: email,
        emergencyPhoneNumber: emergencyPhoneNumberOrError.getValue(),
        startingPointToWatch: startingPointToWatch,
        endingPointToWatch: endingPointToWatch,
      },
      new UniqueEntityID(raw.domainId),
    );

    return surveillanceTaskOrError.isSuccess
      ? Result.ok(surveillanceTaskOrError.getValue())
      : Result.fail(surveillanceTaskOrError.error);
  }

  public async createPickUpAndDeliveryTask(raw: any, email: string): Promise<Result<PickUpAndDeliveryTask>> {
    // Task state (default: REQUESTED)
    const taskState = TaskState.REQUESTED;

    // Retrieve RobisepType
    const robisepType = await this.robisepTypeRepo.findByDomainId(raw.robisepType);
    if (!robisepType) {
      throw new TypeError('RobisepType not found');
    }

    // Determine the task code
    const taskCodeNumber = await this.determineTaskCode();
    const taskCode = TaskCode.create(taskCodeNumber);
    if (taskCode.isFailure) {
      throw new TypeError(taskCode.errorMessage());
    }

    // Retrieve the Pickup Room
    const pickUpRoom = await this.roomRepo.findByDomainId(raw.pickUpAndDeliveryTask.pickUpRoom);
    if (!pickUpRoom) {
      throw new TypeError('Pick Up Room not found');
    }

    // Retrieve the Delivery Room
    const deliveryRoom = await this.roomRepo.findByDomainId(raw.pickUpAndDeliveryTask.deliveryRoom);
    if (!deliveryRoom) {
      throw new TypeError('Delivery Room not found');
    }

    // Create the Pickup Person Personal Name
    const pickUpPersonPersonalNameOrError = PersonalName.create(raw.pickUpAndDeliveryTask.pickUpPersonContact.name);
    if (pickUpPersonPersonalNameOrError.isFailure) {
      throw new TypeError(pickUpPersonPersonalNameOrError.errorMessage());
    }

    // Create the Pickup Person Phone Number
    const pickUpPersonPhoneNumberOrError = PhoneNumber.create(
      raw.pickUpAndDeliveryTask.pickUpPersonContact.phoneNumber,
    );
    if (pickUpPersonPhoneNumberOrError.isFailure) {
      throw new TypeError(pickUpPersonPhoneNumberOrError.errorMessage());
    }

    // Create the Pickup Person Contact
    const pickUpPersonContactOrError = PickUpAndDeliveryTaskPersonContact.create({
      personPersonalName: pickUpPersonPersonalNameOrError.getValue(),
      personPhoneNumber: pickUpPersonPhoneNumberOrError.getValue(),
    });

    // Create the Delivery Person Personal Name
    const deliveryPersonPersonalNameOrError = PersonalName.create(raw.pickUpAndDeliveryTask.deliveryPersonContact.name);
    if (deliveryPersonPersonalNameOrError.isFailure) {
      throw new TypeError(deliveryPersonPersonalNameOrError.errorMessage());
    }

    // Create the Delivery Person Phone Number
    const deliveryPersonPhoneNumberOrError = PhoneNumber.create(
      raw.pickUpAndDeliveryTask.deliveryPersonContact.phoneNumber,
    );
    if (deliveryPersonPhoneNumberOrError.isFailure) {
      throw new TypeError(deliveryPersonPhoneNumberOrError.errorMessage());
    }

    // Create the Delivery Person Contact
    const deliveryPersonContactOrError = PickUpAndDeliveryTaskPersonContact.create({
      personPersonalName: deliveryPersonPersonalNameOrError.getValue(),
      personPhoneNumber: deliveryPersonPhoneNumberOrError.getValue(),
    });

    // Create the Pickup and Delivery Task Description
    const pickUpAndDeliveryTaskDescriptionOrError = PickUpAndDeliveryTaskDescription.create(
      raw.pickUpAndDeliveryTask.description,
    );
    if (pickUpAndDeliveryTaskDescriptionOrError.isFailure) {
      throw new TypeError(pickUpAndDeliveryTaskDescriptionOrError.errorMessage());
    }

    // Create the Pickup and Delivery Task Confirmation Code
    const pickUpAndDeliveryTaskConfirmationCodeOrError = PickUpAndDeliveryTaskConfirmationCode.create(
      raw.pickUpAndDeliveryTask.confirmationCode,
    );
    if (pickUpAndDeliveryTaskConfirmationCodeOrError.isFailure) {
      throw new TypeError(pickUpAndDeliveryTaskConfirmationCodeOrError.errorMessage());
    }

    // Create PickUpAndDeliveryTask
    const pickUpAndDeliveryTaskOrError = PickUpAndDeliveryTask.create(
      {
        taskState: taskState,
        robisepType: robisepType,
        taskCode: taskCode.getValue(),
        email: email,
        pickUpPersonContact: pickUpPersonContactOrError.getValue(),
        pickUpRoom: pickUpRoom,
        deliveryPersonContact: deliveryPersonContactOrError.getValue(),
        deliveryRoom: deliveryRoom,
        description: pickUpAndDeliveryTaskDescriptionOrError.getValue(),
        confirmationCode: pickUpAndDeliveryTaskConfirmationCodeOrError.getValue(),
      },
      new UniqueEntityID(raw.domainId),
    );

    return pickUpAndDeliveryTaskOrError.isSuccess
      ? Result.ok(pickUpAndDeliveryTaskOrError.getValue())
      : Result.fail(pickUpAndDeliveryTaskOrError.error);
  }

  /**
   * This method is used to determine the task code.
   * It will get all the tasks, and determine the next task code.
   * @private
   */
  private async determineTaskCode(): Promise<number> {
    // Get all the surveillance tasks
    const surveillanceTasks = await this.surveillanceTaskRepo.findAll();

    // Get all the pickup and delivery tasks
    const pickUpAndDeliveryTasks = await this.pickUpAndDeliveryTaskRepo.findAll();

    // Length of the tasks
    const tasksLength = this.tasksListsLength(surveillanceTasks, pickUpAndDeliveryTasks);

    // Return the length + 1
    return tasksLength + 1;
  }

  /**
   * This method was created to merge all the tasks.
   * It is intended to be private.
   * This is also a helper method to avoid code duplication and something that is though to be scalable.
   * @param surveillanceTasks A list of surveillance tasks.
   * @param pickUpAndDeliveryTasks A list of pickup and delivery tasks.
   */
  private tasksListsLength(
    surveillanceTasks: SurveillanceTask[],
    pickUpAndDeliveryTasks: PickUpAndDeliveryTask[],
  ): number {
    // Merge the tasks
    const tasks = [...surveillanceTasks, ...pickUpAndDeliveryTasks];

    // Return the length of the tasks
    return tasks.length;
  }
}
