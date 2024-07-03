import { Inject, Service } from 'typedi';

import { Document, FilterQuery, Model } from 'mongoose';
import { TaskId } from '../../domain/task/taskId';
import { TaskMap } from '../../mappers/TaskMap';
import IPickUpAndDeliveryTaskRepo from '../../services/IRepos/IPickUpAndDeliveryTaskRepo';
import { IPickUpAndDeliveryTaskPersistence } from '../../dataschema/task/IPickUpAndDeliveryTaskPersistence';
import { PickUpAndDeliveryTask } from '../../domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTask';

@Service()
export default class PickUpAndDeliveryTaskRepo implements IPickUpAndDeliveryTaskRepo {
  constructor(
    @Inject('pickUpAndDeliveryTaskSchema')
    private pickUpAndDeliveryTaskSchema: Model<IPickUpAndDeliveryTaskPersistence & Document>,
  ) {}

  public async exists(pickUpAndDeliveryTask: PickUpAndDeliveryTask): Promise<boolean> {
    const idX =
      pickUpAndDeliveryTask.id instanceof TaskId
        ? (<TaskId>pickUpAndDeliveryTask.id).toValue()
        : pickUpAndDeliveryTask.id;

    const query = { domainId: idX };
    const pickUpAndDeliveryTaskDocument = await this.pickUpAndDeliveryTaskSchema.findOne(
      query as FilterQuery<IPickUpAndDeliveryTaskPersistence & Document>,
    );

    return !!pickUpAndDeliveryTaskDocument === true;
  }

  public async save(pickUpAndDeliveryTask: PickUpAndDeliveryTask): Promise<PickUpAndDeliveryTask> {
    const query = { domainId: pickUpAndDeliveryTask.id.toString() };

    const pickUpAndDeliveryTaskDocument = await this.pickUpAndDeliveryTaskSchema.findOne(query);

    try {
      // If the pickup and delivery task already exists, return error.
      if (pickUpAndDeliveryTaskDocument !== null) {
        return null;
      }

      const rawPickUpAndDeliveryTask: any = TaskMap.toPickUpAndDeliveryTaskPersistence(pickUpAndDeliveryTask);

      const pickUpAndDeliveryTaskCreated = await this.pickUpAndDeliveryTaskSchema.create(rawPickUpAndDeliveryTask);

      return TaskMap.toPickUpAndDeliveryTaskDomain(pickUpAndDeliveryTaskCreated);
    } catch (err) {
      throw err;
    }
  }

  public async update(pickUpAndDeliveryTask: PickUpAndDeliveryTask): Promise<PickUpAndDeliveryTask> {
    const query = { domainId: pickUpAndDeliveryTask.id.toString() };

    const pickUpAndDeliveryTaskDocument = await this.pickUpAndDeliveryTaskSchema.findOne(query);

    try {
      // If the pickup and delivery task does not exist, return error.
      if (pickUpAndDeliveryTaskDocument === null) {
        return null;
      }

      pickUpAndDeliveryTaskDocument.id = pickUpAndDeliveryTask.id.toString();
      pickUpAndDeliveryTaskDocument.taskState = pickUpAndDeliveryTask.taskState;
      pickUpAndDeliveryTaskDocument.robisepType = pickUpAndDeliveryTask.robisepType.id.toString();
      pickUpAndDeliveryTaskDocument.taskCode = pickUpAndDeliveryTask.taskCode.value;
      pickUpAndDeliveryTaskDocument.email = pickUpAndDeliveryTask.email;
      pickUpAndDeliveryTaskDocument.pickUpPersonContact.name =
        pickUpAndDeliveryTask.pickUpPersonContact.personPersonalName.value;
      pickUpAndDeliveryTaskDocument.pickUpPersonContact.phoneNumber =
        pickUpAndDeliveryTask.pickUpPersonContact.personPhoneNumber.value;
      pickUpAndDeliveryTaskDocument.pickUpRoom = pickUpAndDeliveryTask.pickUpRoom.id.toString();
      pickUpAndDeliveryTaskDocument.deliveryPersonContact.name =
        pickUpAndDeliveryTask.deliveryPersonContact.personPersonalName.value;
      pickUpAndDeliveryTaskDocument.deliveryPersonContact.phoneNumber =
        pickUpAndDeliveryTask.deliveryPersonContact.personPhoneNumber.value;
      pickUpAndDeliveryTaskDocument.deliveryRoom = pickUpAndDeliveryTask.deliveryRoom.id.toString();
      pickUpAndDeliveryTaskDocument.description = pickUpAndDeliveryTask.description.value;
      pickUpAndDeliveryTaskDocument.confirmationCode = pickUpAndDeliveryTask.confirmationCode.value;

      // Allow for null robisep
      if (pickUpAndDeliveryTask.robisep) {
        pickUpAndDeliveryTaskDocument.robisepId = pickUpAndDeliveryTask.robisep.id.toString();
      } else pickUpAndDeliveryTaskDocument.robisepId = null;

      await pickUpAndDeliveryTaskDocument.save();

      return pickUpAndDeliveryTask;
    } catch (err) {
      throw err;
    }
  }
  public async findAll(): Promise<PickUpAndDeliveryTask[]> {
    const pickUpAndDeliveryTaskRecords = await this.pickUpAndDeliveryTaskSchema.find();
    const pickUpAndDeliveryTaskPromises = pickUpAndDeliveryTaskRecords.map(TaskMap.toPickUpAndDeliveryTaskDomain);
    return Promise.all(pickUpAndDeliveryTaskPromises);
  }

  public async findByCode(code: number): Promise<PickUpAndDeliveryTask> {
    const query = { taskCode: code };
    const taskRecord = await this.pickUpAndDeliveryTaskSchema.findOne(query).exec();

    if (taskRecord != null) {
      return TaskMap.toPickUpAndDeliveryTaskDomain(taskRecord);
    }
    return null;
  }

  public async findByState(state: string[]): Promise<PickUpAndDeliveryTask[]> {
    const query = { taskState: { $in: state } };
    const pickUpAndDeliveryTaskRecords = await this.pickUpAndDeliveryTaskSchema.find(query);
    const pickUpAndDeliveryTaskPromises = pickUpAndDeliveryTaskRecords.map(TaskMap.toPickUpAndDeliveryTaskDomain);
    return Promise.all(pickUpAndDeliveryTaskPromises);
  }

  public async findByStateAndRobisepId(state: string[], robisepId: string): Promise<PickUpAndDeliveryTask[]> {
    const query = { taskState: { $in: state }, robisepId: robisepId };
    const pickUpAndDeliveryTaskRecords = await this.pickUpAndDeliveryTaskSchema.find(query);
    const pickUpAndDeliveryTaskPromises = pickUpAndDeliveryTaskRecords.map(TaskMap.toPickUpAndDeliveryTaskDomain);
    return Promise.all(pickUpAndDeliveryTaskPromises);
  }

  public async findByUser(email: string): Promise<PickUpAndDeliveryTask[]> {
    const query = { email: email };
    const pickUpAndDeliveryTaskRecords = await this.pickUpAndDeliveryTaskSchema.find(query);
    const pickUpAndDeliveryTaskPromises = pickUpAndDeliveryTaskRecords.map(TaskMap.toPickUpAndDeliveryTaskDomain);
    return Promise.all(pickUpAndDeliveryTaskPromises);
  }

  public async findByStateAndUserEmail(state: string[], email: string): Promise<PickUpAndDeliveryTask[]> {
    const query = { taskState: { $in: state }, email: email };
    const pickUpAndDeliveryTaskRecords = await this.pickUpAndDeliveryTaskSchema.find(query);
    const pickUpAndDeliveryTaskPromises = pickUpAndDeliveryTaskRecords.map(TaskMap.toPickUpAndDeliveryTaskDomain);
    return Promise.all(pickUpAndDeliveryTaskPromises);
  }

  public async findByStateTypeAndEmail(
    state?: string[],
    robisepType?: string,
    email?: string,
  ): Promise<PickUpAndDeliveryTask[]> {
    const query: any = {};

    if (state && state.length > 0) {
      query.taskState = { $in: state };
    }

    if (robisepType) {
      query.robisepTypeId = robisepType;
    }

    if (email) {
      query.email = email;
    }

    const pickUpAndDeliveryTaskRecords = await this.pickUpAndDeliveryTaskSchema.find(query);
    const pickUpAndDeliveryTaskPromises = pickUpAndDeliveryTaskRecords.map(TaskMap.toPickUpAndDeliveryTaskDomain);
    return Promise.all(pickUpAndDeliveryTaskPromises);
  }
}
