import { Inject, Service } from 'typedi';

import { Document, FilterQuery, Model } from 'mongoose';
import ISurveillanceTaskRepo from '../../services/IRepos/ISurveillanceTaskRepo';
import { SurveillanceTask } from '../../domain/task/surveillanceTask/surveillanceTask';
import { TaskId } from '../../domain/task/taskId';
import { ISurveillanceTaskPersistence } from '../../dataschema/task/ISurveillanceTaskPersistence';
import { TaskMap } from '../../mappers/TaskMap';

@Service()
export default class SurveillanceTaskRepo implements ISurveillanceTaskRepo {
  constructor(
    @Inject('surveillanceTaskSchema') private surveillanceTaskSchema: Model<ISurveillanceTaskPersistence & Document>,
  ) {}

  public async exists(surveillanceTask: SurveillanceTask): Promise<boolean> {
    const idX = surveillanceTask.id instanceof TaskId ? (<TaskId>surveillanceTask.id).toValue() : surveillanceTask.id;

    const query = { domainId: idX };
    const surveillanceTaskDocument = await this.surveillanceTaskSchema.findOne(
      query as FilterQuery<ISurveillanceTaskPersistence & Document>,
    );

    return !!surveillanceTaskDocument === true;
  }

  public async save(surveillanceTask: SurveillanceTask): Promise<SurveillanceTask> {
    const query = { domainId: surveillanceTask.id.toString() };

    const surveillanceTaskDocument = await this.surveillanceTaskSchema.findOne(query);

    try {
      // If the surveillance task already exists, return error.
      if (surveillanceTaskDocument !== null) {
        return null;
      }

      const rawSurveillanceTask: any = TaskMap.toSurveillanceTaskPersistence(surveillanceTask);

      const surveillanceTaskCreated = await this.surveillanceTaskSchema.create(rawSurveillanceTask);

      return TaskMap.toSurveillanceTaskDomain(surveillanceTaskCreated);
    } catch (err) {
      throw err;
    }
  }

  public async update(surveillanceTask: SurveillanceTask): Promise<SurveillanceTask> {
    const query = { domainId: surveillanceTask.id.toString() };

    const surveillanceTaskDocument = await this.surveillanceTaskSchema.findOne(query);

    try {
      // If the surveillance task does not exist, return error.
      if (surveillanceTaskDocument === null) {
        return null;
      }

      surveillanceTaskDocument.id = surveillanceTask.id.toString();
      surveillanceTaskDocument.taskState = surveillanceTask.taskState;
      surveillanceTaskDocument.robisepType = surveillanceTask.robisepType.id.toString();
      surveillanceTaskDocument.taskCode = surveillanceTask.taskCode.value;
      surveillanceTaskDocument.email = surveillanceTask.email;
      surveillanceTaskDocument.emergencyPhoneNumber = surveillanceTask.emergencyPhoneNumber.value;
      surveillanceTaskDocument.startingPointToWatch = surveillanceTask.startingPointToWatch.id.toString();
      surveillanceTaskDocument.endingPointToWatch = surveillanceTask.endingPointToWatch.id.toString();

      // Allow for null robisep
      if (surveillanceTask.robisep) {
        surveillanceTaskDocument.robisepId = surveillanceTask.robisep.id.toString();
      } else surveillanceTaskDocument.robisepId = null;

      await surveillanceTaskDocument.save();

      return surveillanceTask;
    } catch (err) {
      throw err;
    }
  }

  public async findAll(): Promise<SurveillanceTask[]> {
    const surveillanceTaskRecords = await this.surveillanceTaskSchema.find();
    const surveillanceTaskPromises = surveillanceTaskRecords.map(TaskMap.toSurveillanceTaskDomain);
    return Promise.all(surveillanceTaskPromises);
  }

  public async findByState(state: string[]): Promise<SurveillanceTask[]> {
    const query = { taskState: { $in: state } };
    const surveillanceTaskRecords = await this.surveillanceTaskSchema.find(query);
    const surveillanceTaskPromises = surveillanceTaskRecords.map(TaskMap.toSurveillanceTaskDomain);
    return Promise.all(surveillanceTaskPromises);
  }

  public async findByStateAndRobisepId(state: string[], robisepId: string): Promise<SurveillanceTask[]> {
    const query = { taskState: { $in: state }, robisepId };
    const surveillanceTaskRecords = await this.surveillanceTaskSchema.find(query);
    const surveillanceTaskPromises = surveillanceTaskRecords.map(TaskMap.toSurveillanceTaskDomain);
    return Promise.all(surveillanceTaskPromises);
  }

  public async findByUser(email: string): Promise<SurveillanceTask[]> {
    const query = { email };
    const surveillanceTaskRecords = await this.surveillanceTaskSchema.find(query);
    const surveillanceTaskPromises = surveillanceTaskRecords.map(TaskMap.toSurveillanceTaskDomain);
    return Promise.all(surveillanceTaskPromises);
  }

  public async findByStateAndUserEmail(state: string[], email: string): Promise<SurveillanceTask[]> {
    const query = { taskState: { $in: state }, email };
    const surveillanceTaskRecords = await this.surveillanceTaskSchema.find(query);
    const surveillanceTaskPromises = surveillanceTaskRecords.map(TaskMap.toSurveillanceTaskDomain);
    return Promise.all(surveillanceTaskPromises);
  }

  public async findByStateTypeAndEmail(
    state?: string[],
    robisepId?: string,
    email?: string,
  ): Promise<SurveillanceTask[]> {
    const query: any = {};

    if (state && state.length > 0) {
      query.taskState = { $in: state };
    }

    if (robisepId) {
      query.robisepTypeId = robisepId;
    }

    if (email) {
      query.email = email;
    }

    const surveillanceTaskRecords = await this.surveillanceTaskSchema.find(query);
    const surveillanceTaskPromises = surveillanceTaskRecords.map(TaskMap.toSurveillanceTaskDomain);
    return Promise.all(surveillanceTaskPromises);
  }

  public async findByCode(code: number): Promise<SurveillanceTask> {
    const query = { taskCode: code };
    const taskRecord = await this.surveillanceTaskSchema.findOne(query).exec();

    if (taskRecord != null) {
      return TaskMap.toSurveillanceTaskDomain(taskRecord);
    }
    return null;
  }
}
