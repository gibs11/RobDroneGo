import { Inject, Service } from 'typedi';
import { FailureType, Result } from '../../core/logic/Result';
import ITaskService from '../IServices/ITaskService';
import ITaskDTO from '../../dto/ITaskDTO';
import ITaskOutDTO from '../../dto/out/ITaskOutDTO';
import ISurveillanceTaskRepo from '../IRepos/ISurveillanceTaskRepo';
import IPickUpAndDeliveryTaskRepo from '../IRepos/IPickUpAndDeliveryTaskRepo';
import { TaskType } from '../../domain/common/TaskType';
import ITaskFactory from '../IFactories/ITaskFactory';
import { TaskMap } from '../../mappers/TaskMap';
import { SurveillanceTask } from '../../domain/task/surveillanceTask/surveillanceTask';
import { PickUpAndDeliveryTask } from '../../domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTask';
import { TaskState } from '../../domain/task/taskState';
import IUserGateway from '../../IGateways/IUserGateway';
import config from '../../../config';
import ITaskGateway from '../../IGateways/ITaskGateway';
import ITaskSequenceOutDTO, { SequenceDTO } from '../../dto/out/ITaskSequenceOutDto';
import ITaskSequenceDTO from '../../dto/out/ITaskSequenceDTO';
import IRobisepRepo from '../IRepos/IRobisepRepo';
import { Robisep } from '../../domain/robisep/Robisep';
import IUpdateTaskStateDTO from '../../dto/IUpdateTaskStateDTO';

@Service()
export default class TaskService implements ITaskService {
  constructor(
    @Inject(config.factories.task.name) private taskFactory: ITaskFactory,
    @Inject(config.repos.surveillanceTask.name) private surveillanceTaskRepo: ISurveillanceTaskRepo,
    @Inject(config.repos.pickUpAndDeliveryTask.name) private pickUpAndDeliveryRepo: IPickUpAndDeliveryTaskRepo,
    @Inject(config.repos.robisep.name) private robisepRepo: IRobisepRepo,
    @Inject(config.gateways.user.name) private userGateway: IUserGateway,
    @Inject(config.gateways.task.name) private taskGateway: ITaskGateway,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject('logger') private logger: any,
  ) {}

  private PICK_UP_AND_DELIVERY_TASK = 'TRANSPORT';
  private SURVEILLANCE_TASK = 'SURVEILLANCE';

  public async requestTask(taskDTO: ITaskDTO): Promise<Result<ITaskOutDTO>> {
    // Check the task type
    const taskTypeOrError = this.retrieveTaskType(taskDTO);
    if (taskTypeOrError.isFailure) {
      return Promise.resolve(Result.fail<ITaskOutDTO>(taskTypeOrError.error, taskTypeOrError.failureType));
    }

    // Retrieve the user email
    const userEmailOrError = await this.userGateway.getEmailByIamId(taskDTO.iamId);
    if (userEmailOrError.isFailure) {
      return Promise.resolve(Result.fail<ITaskOutDTO>(userEmailOrError.error, userEmailOrError.failureType));
    }

    // Define the method to be called
    switch (taskTypeOrError.getValue()) {
      case TaskType.SURVEILLANCE:
        return await this.requestSurveillanceTask(taskDTO, userEmailOrError.getValue());
      case TaskType.TRANSPORT:
        return await this.requestPickUpAndDeliveryTask(taskDTO, userEmailOrError.getValue());
      default:
        return Promise.resolve(Result.fail<ITaskOutDTO>('Task type not found.', FailureType.InvalidInput));
    }
  }

  /**
   * Request a new surveillance task.
   * This method is intended to be private. It should only be called by the requestTask method.
   * @param surveillanceTaskDTO The surveillance task data transfer object.
   * @param email The user's email.
   */
  private async requestSurveillanceTask(surveillanceTaskDTO: ITaskDTO, email: string): Promise<Result<ITaskOutDTO>> {
    try {
      // Create the surveillance task
      const surveillanceTaskOrError = await this.taskFactory.createSurveillanceTask(surveillanceTaskDTO, email);
      if (surveillanceTaskOrError.isFailure) {
        return Result.fail<ITaskOutDTO>(surveillanceTaskOrError.error, FailureType.InvalidInput);
      }

      // Save the surveillance task
      const savedSurveillanceTask = await this.surveillanceTaskRepo.save(surveillanceTaskOrError.getValue());
      if (!savedSurveillanceTask) {
        return Result.fail<ITaskOutDTO>(
          `Task with ${surveillanceTaskOrError.getValue().id.toString()} already exists.`,
          FailureType.EntityAlreadyExists,
        );
      }

      const surveillanceTaskDTOToReturn = TaskMap.toDTO(savedSurveillanceTask) as ITaskOutDTO;
      return Result.ok<ITaskOutDTO>(surveillanceTaskDTOToReturn);
    } catch (error) {
      if (error instanceof TypeError) {
        this.logger.error(error);
        return Result.fail<ITaskOutDTO>(error.message, FailureType.InvalidInput);
      } else {
        this.logger.error(error);
        return Result.fail<ITaskOutDTO>(error.message, FailureType.DatabaseError);
      }
    }
  }

  /**
   * Request a new pickup and delivery task.
   * This method is intended to be private. It should only be called by the requestTask method.
   * @param pickUpAndDeliveryTaskDTO The pick up and delivery task data transfer object.
   * @param email The user's email.
   */
  private async requestPickUpAndDeliveryTask(
    pickUpAndDeliveryTaskDTO: ITaskDTO,
    email: string,
  ): Promise<Result<ITaskOutDTO>> {
    try {
      // Create the pickup and delivery task
      const pickUpAndDeliveryTaskOrError = await this.taskFactory.createPickUpAndDeliveryTask(
        pickUpAndDeliveryTaskDTO,
        email,
      );
      if (pickUpAndDeliveryTaskOrError.isFailure) {
        return Result.fail<ITaskOutDTO>(pickUpAndDeliveryTaskOrError.error, FailureType.InvalidInput);
      }

      // Save the pickup and delivery task
      const savedPickUpAndDeliveryTask = await this.pickUpAndDeliveryRepo.save(pickUpAndDeliveryTaskOrError.getValue());
      if (!savedPickUpAndDeliveryTask) {
        return Result.fail<ITaskOutDTO>(
          `Task with ${pickUpAndDeliveryTaskOrError.getValue().id.toString()} already exists.`,
          FailureType.EntityAlreadyExists,
        );
      }

      const pickUpAndDeliveryTaskDTOToReturn = TaskMap.toDTO(savedPickUpAndDeliveryTask) as ITaskOutDTO;
      return Result.ok<ITaskOutDTO>(pickUpAndDeliveryTaskDTOToReturn);
    } catch (error) {
      if (error instanceof TypeError) {
        this.logger.error(error);
        return Result.fail<ITaskOutDTO>(error.message, FailureType.InvalidInput);
      } else {
        this.logger.error(error);
        return Result.fail<ITaskOutDTO>(error.message, FailureType.DatabaseError);
      }
    }
  }

  public async listAllTasks(): Promise<ITaskOutDTO[]> {
    try {
      // Get all the surveillance tasks
      const surveillanceTasks = await this.surveillanceTaskRepo.findAll();

      // Get all the pickup and delivery tasks
      const pickUpAndDeliveryTasks = await this.pickUpAndDeliveryRepo.findAll();

      // Return the taskDTO[]
      return this.mergeTasksToList(surveillanceTasks, pickUpAndDeliveryTasks);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async listTasksByState(state: string[]): Promise<Result<ITaskOutDTO[]>> {
    try {
      // Check if the states array is null or empty
      if (!state || state.length === 0) {
        return Result.fail<ITaskOutDTO[]>('At least one state must be chosen.', FailureType.InvalidInput);
      }

      // Place the states in uppercase
      state = state.map(state => state.toUpperCase().trim());

      // Check if the states exist
      const validStates: string[] = Object.values(TaskState).filter(value => typeof value === 'string');
      const invalidStates = state.filter(state => !validStates.includes(state));
      if (invalidStates.length > 0) {
        return Result.fail<ITaskOutDTO[]>(
          `The following states do not exist: ${invalidStates.join(', ')}. Valid states are: ${validStates.join(
            ', ',
          )}.`,
          FailureType.InvalidInput,
        );
      }

      // Get all the surveillance tasks
      const surveillanceTasks = await this.surveillanceTaskRepo.findByState(state);

      // Get all the pickup and delivery tasks
      const pickUpAndDeliveryTasks = await this.pickUpAndDeliveryRepo.findByState(state);

      // Return the taskDTO[]
      const result = this.mergeTasksToList(surveillanceTasks, pickUpAndDeliveryTasks);
      return Result.ok<ITaskOutDTO[]>(result);
    } catch (e) {
      this.logger.error(e);
      return Result.fail<ITaskOutDTO[]>(e.message, FailureType.DatabaseError);
    }
  }

  public async listTasksByUser(iamId: string): Promise<Result<ITaskOutDTO[]>> {
    try {
      // Call the gateway to get the user's email
      const emailOrError = await this.userGateway.getEmailByIamId(iamId);
      if (emailOrError.isFailure) {
        return Result.fail<ITaskOutDTO[]>(emailOrError.error, emailOrError.failureType);
      }

      // Get all the surveillance tasks
      const surveillanceTasks = await this.surveillanceTaskRepo.findByUser(emailOrError.getValue());

      // Get all the pickup and delivery tasks
      const pickUpAndDeliveryTasks = await this.pickUpAndDeliveryRepo.findByUser(emailOrError.getValue());

      // Return the taskDTO[]
      const result = this.mergeTasksToList(surveillanceTasks, pickUpAndDeliveryTasks);
      return Result.ok<ITaskOutDTO[]>(result);
    } catch (e) {
      this.logger.error(e);
      return Result.fail<ITaskOutDTO[]>(e.message, FailureType.DatabaseError);
    }
  }

  public async rejectDeletedUserTasks(email: string): Promise<Result<ITaskOutDTO[]>> {
    try {
      // Update the state of the surveillance and pickup and delivery tasks for rejected
      const surveillanceTasks = await this.surveillanceTaskRepo.findByStateAndUserEmail([TaskState.REQUESTED], email);
      const pickupTasks = await this.pickUpAndDeliveryRepo.findByStateAndUserEmail([TaskState.REQUESTED], email);

      for (const task of surveillanceTasks) {
        task.refuse();
        await this.surveillanceTaskRepo.update(task);
      }

      for (const task of pickupTasks) {
        task.refuse();
        await this.pickUpAndDeliveryRepo.update(task);
      }

      return Result.ok<ITaskOutDTO[]>(this.mergeTasksToList(surveillanceTasks, pickupTasks));
    } catch (e) {
      this.logger.error(e);
      return Result.fail<ITaskOutDTO[]>(e.message, FailureType.DatabaseError);
    }
  }

  public async listRobisepIds(): Promise<Result<string[]>> {
    try {
      // Get all the surveillance tasks
      const surveillanceTasks = await this.surveillanceTaskRepo.findByState([TaskState.ACCEPTED]);

      // Get all the pickup and delivery tasks
      const pickUpAndDeliveryTasks = await this.pickUpAndDeliveryRepo.findByState([TaskState.ACCEPTED]);

      // Return the taskDTO[]
      const result = this.mergeRobisepIdsToList(surveillanceTasks, pickUpAndDeliveryTasks);
      return Result.ok<string[]>(result);
    } catch (e) {
      this.logger.error(e);
      return Result.fail<string[]>(e.message, FailureType.DatabaseError);
    }
  }

  public async getTaskSequence(algorithm: string): Promise<Result<ITaskSequenceOutDTO[]>> {
    try {
      const result: ITaskSequenceOutDTO[] = [];
      const robisepIdsOrError = await this.listRobisepIds();

      // Check if the robisep id exists
      if (!robisepIdsOrError || robisepIdsOrError.getValue().length === 0) {
        return Result.fail<ITaskSequenceOutDTO[]>('There are no tasks to be sequenced.', FailureType.InvalidInput);
      }

      const robisepIds = robisepIdsOrError.getValue();
      for (const robisepId of robisepIds) {
        // Call the Task gateway to get the sequence for the robisep id
        const sequenceOrError = await this.taskGateway.getTaskSequeceByRobisepId(robisepId, algorithm);
        // Check if the sequence has some error
        if (sequenceOrError.isFailure) {
          const robisep: Robisep = await this.robisepRepo.findByDomainId(robisepId);
          result.push({
            robisepNickname: robisep.nickname.value,
            Sequence: [],
            cost: 0,
          });

          // Skip the rest of the loop
          continue;
        }

        const sequenceDTO: SequenceDTO[] = [];
        const pickUpAndDeliveryTasks: PickUpAndDeliveryTask[] = [];
        const surveillanceTasks: SurveillanceTask[] = [];
        await this.obtainCorrespondingTasks(
          sequenceOrError.getValue(),
          pickUpAndDeliveryTasks,
          surveillanceTasks,
          sequenceDTO,
        );

        // Create the task sequence DTO
        const tasks = this.mergeTasksToList(surveillanceTasks, pickUpAndDeliveryTasks);
        const taskSequenceDTO: ITaskSequenceOutDTO = {
          robisepNickname: tasks[0].robisep.nickname,
          Sequence: sequenceDTO,
          cost: sequenceOrError.getValue().cost,
        };

        // Add the task sequence to the list
        result.push(taskSequenceDTO);
      }

      // Return the sequence
      return Result.ok<ITaskSequenceOutDTO[]>(result);
    } catch (e) {
      this.logger.error(e);
      return Result.fail<ITaskSequenceOutDTO[]>(e.message, FailureType.DatabaseError);
    }
  }

  /**
   * This method was created to retrieve the task type.
   * It is intended to be private. It should only be called by the requestTask method.
   * This is also a helper method to avoid code duplication and something that is though to be scalable.
   * @param taskDTO the task data transfer object.
   */
  private retrieveTaskType(taskDTO: ITaskDTO): Result<TaskType> {
    // Check the desired task type
    const hasPickUpAndDeliveryTask = !!taskDTO.pickUpAndDeliveryTask;
    const hasSurveillanceTask = !!taskDTO.surveillanceTask;

    // Check if the task has no task type
    if (!hasPickUpAndDeliveryTask && !hasSurveillanceTask) {
      return Result.fail<TaskType>('The requesting task must have a task type.', FailureType.InvalidInput);
    }

    // Array with a map of the boolean value and the task type
    const taskTypes = [
      { hasPickUpAndDeliveryTask, taskType: TaskType.TRANSPORT },
      { hasSurveillanceTask, taskType: TaskType.SURVEILLANCE },
    ];

    // Check if the task has more than one task type or if it has no task type
    const validSelection = taskTypes.filter(taskType => Object.values(taskType).includes(true)).length === 1;
    if (!validSelection) {
      return Result.fail<TaskType>('The requesting task must have only one task type.', FailureType.InvalidInput);
    }

    // Return the task type
    return Result.ok<TaskType>(
      taskTypes.filter(taskType => Object.values(taskType).includes(true))[0].taskType as TaskType,
    );
  }

  /**
   * This method was created to merge all the tasks.
   * It is intended to be private. It should only be called by the listAllTasks method.
   * This is also a helper method to avoid code duplication and something that is though to be scalable.
   * @param surveillanceTasks A list of surveillance tasks.
   * @param pickUpAndDeliveryTasks A list of pickup and delivery tasks.
   */
  private mergeTasksToList(
    surveillanceTasks: SurveillanceTask[],
    pickUpAndDeliveryTasks: PickUpAndDeliveryTask[],
  ): ITaskOutDTO[] {
    // Merge the tasks
    const tasks = [...surveillanceTasks, ...pickUpAndDeliveryTasks];

    // Return the taskDTO[]
    return tasks.map(task => TaskMap.toDTO(task) as ITaskOutDTO);
  }

  public async listTasksByMultipleParameters(
    state: string[] | null,
    robisepType: string | null,
    iamId: string | null,
  ): Promise<Result<ITaskOutDTO[]>> {
    try {
      let email: string;

      if (iamId) {
        // ARRANGE USER EMAIL
        const emailOrError = await this.userGateway.getEmailByIamId(iamId);
        if (emailOrError.isFailure) {
          return Result.fail<ITaskOutDTO[]>(emailOrError.error, emailOrError.failureType);
        }
        email = emailOrError.getValue();
      }

      if (state && state.length > 0) {
        // Place the states in uppercase
        state = state.map(state => state.toUpperCase().trim());

        // Check if the states exist
        const validStates: string[] = Object.values(TaskState).filter(value => typeof value === 'string');
        const invalidStates = state.filter(state => !validStates.includes(state));
        if (invalidStates.length > 0) {
          return Result.fail<ITaskOutDTO[]>(
            `The following states do not exist: ${invalidStates.join(', ')}. Valid states are: ${validStates.join(
              ', ',
            )}.`,
            FailureType.InvalidInput,
          );
        }
      }

      let surveillanceTasks = await this.surveillanceTaskRepo.findByStateTypeAndEmail(state, robisepType, email);

      let pickUpAndDeliveryTasks = await this.pickUpAndDeliveryRepo.findByStateTypeAndEmail(state, robisepType, email);

      // Remove duplicates
      surveillanceTasks = Array.from(new Set(surveillanceTasks));
      pickUpAndDeliveryTasks = Array.from(new Set(pickUpAndDeliveryTasks));

      // Merge tasks and return the result
      const result = this.mergeTasksToList(surveillanceTasks, pickUpAndDeliveryTasks);

      return Result.ok<ITaskOutDTO[]>(result);
    } catch (e) {
      this.logger.error(e);
      return Result.fail<ITaskOutDTO[]>(e.message, FailureType.DatabaseError);
    }
  }

  public async updateTaskState(
    taskCode: string,
    updateTaskStateDto: IUpdateTaskStateDTO,
  ): Promise<Result<ITaskOutDTO>> {
    try {
      let taskRepo: ISurveillanceTaskRepo | IPickUpAndDeliveryTaskRepo;
      // Get the task
      let task: SurveillanceTask | PickUpAndDeliveryTask;
      if (updateTaskStateDto.taskType === this.PICK_UP_AND_DELIVERY_TASK) {
        task = await this.pickUpAndDeliveryRepo.findByCode(parseInt(taskCode));
        taskRepo = this.pickUpAndDeliveryRepo;
      } else if (updateTaskStateDto.taskType === this.SURVEILLANCE_TASK) {
        task = await this.surveillanceTaskRepo.findByCode(parseInt(taskCode));
        taskRepo = this.surveillanceTaskRepo;
      } else {
        return Promise.resolve(Result.fail<ITaskOutDTO>('Task type not found.', FailureType.InvalidInput));
      }

      // Check if the task exists
      if (!task) {
        return Promise.resolve(
          Result.fail<ITaskOutDTO>('Task not found with taskcode .' + taskCode, FailureType.InvalidInput),
        );
      }

      // Change the task state
      if (updateTaskStateDto.newTaskState === TaskState.ACCEPTED) {
        await this.handleAcceptTask(task, updateTaskStateDto);
      } else if (updateTaskStateDto.newTaskState === TaskState.REFUSED) {
        task.refuse();
      } else {
        return Promise.resolve(Result.fail<ITaskOutDTO>('Task state not found.', FailureType.InvalidInput));
      }

      // Update the task
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await taskRepo.update(task);

      // Return the task
      const taskDTO = TaskMap.toDTO(task) as ITaskOutDTO;
      return Result.ok<ITaskOutDTO>(taskDTO);
    } catch (error) {
      if (error instanceof TypeError) {
        this.logger.error(error);
        return Result.fail<ITaskOutDTO>(error.message, FailureType.InvalidInput);
      } else if (error instanceof Error) {
        this.logger.error(error);
        return Result.fail<ITaskOutDTO>(error.message, FailureType.InvalidInput);
      } else {
        this.logger.error(error);
        return Result.fail<ITaskOutDTO>(error.message, FailureType.DatabaseError);
      }
    }
  }

  private async handleAcceptTask(
    task: SurveillanceTask | PickUpAndDeliveryTask,
    updateTaskStateDto: IUpdateTaskStateDTO,
  ) {
    // Get the robisep
    const robisep = await this.robisepRepo.findByCode(updateTaskStateDto.robisepCode);
    // Check if the robisep exists
    if (!robisep) throw new TypeError('Robisep not found.');

    // Get the tasktypes of the robisep
    const taskTypesOfTheRobisep = robisep.robisepType.tasksType;
    // Convert the taskType of the dto into a taskType
    const taskType = TaskType[updateTaskStateDto.taskType];
    // Check if the tasktypes of the robisep contains the task type
    if (!taskTypesOfTheRobisep.includes(taskType))
      throw new TypeError('The selected robisep cannot perform this task.');

    // Associate a robisep to a task
    task.assignRobisep(robisep);
    // Accept the task
    task.accept();
  }

  /**
   * Should return a list of robisepIds and should not have duplicates
   * @param surveillanceTasks
   * @param pickUpAndDeliveryTasks
   * @private
   */
  private mergeRobisepIdsToList(
    surveillanceTasks: SurveillanceTask[],
    pickUpAndDeliveryTasks: PickUpAndDeliveryTask[],
  ) {
    const robisepIds = new Set<string>();

    // Add the robisepIds from the surveillance tasks
    surveillanceTasks.forEach(task => {
      const robisepId = task.robisep.id ? task.robisep.id.toString() : null;
      if (robisepId) {
        robisepIds.add(robisepId);
      }
    });

    // Add the robisepIds from the pickup and delivery tasks
    pickUpAndDeliveryTasks.forEach(task => {
      const robisepId = task.robisep.id ? task.robisep.id.toString() : null;
      if (robisepId) {
        robisepIds.add(robisepId);
      }
    });

    // Return the list of robisepIds
    return Array.from(robisepIds);
  }

  private async obtainCorrespondingTasks(
    sequenceOrError: ITaskSequenceDTO,
    pickUpAndDeliveryTasks: PickUpAndDeliveryTask[],
    surveillanceTasks: SurveillanceTask[],
    sequenceDTO: SequenceDTO[],
  ) {
    const taskSequence = sequenceOrError.Sequence;
    for (let taskCode = 1; taskCode < taskSequence.length - 1; taskCode++) {
      const taskCodeNumber = Number(taskSequence[taskCode]);
      const pickUpAndDeliveryTask = await this.pickUpAndDeliveryRepo.findByCode(taskCodeNumber);
      // If task is found, add it to the taskSequenceOutDto sequence
      if (pickUpAndDeliveryTask) {
        pickUpAndDeliveryTasks.push(pickUpAndDeliveryTask);

        // Mark the task as planned
        pickUpAndDeliveryTask.markAsPlanned();
        await this.pickUpAndDeliveryRepo.update(pickUpAndDeliveryTask);

        // Add the task to the sequenceDTO
        sequenceDTO.push({
          taskCode: taskCodeNumber,
          taskType: TaskType.TRANSPORT,
          robisepType: pickUpAndDeliveryTask.robisepType.designation.value,
          taskState: TaskState.PLANNED,
          goal:
            'start: ' +
            pickUpAndDeliveryTask.pickUpRoom.name.value +
            ' - End: ' +
            pickUpAndDeliveryTask.deliveryRoom.name.value,
        });

        // Skip the next task because it is the delivery task
        continue;
      }

      const surveillanceTask = await this.surveillanceTaskRepo.findByCode(taskCodeNumber);
      // If task is found, add it to the taskSequenceOutDto sequence
      if (surveillanceTask) {
        surveillanceTasks.push(surveillanceTask);

        // Mark the task as planned
        surveillanceTask.markAsPlanned();
        // Update the task
        await this.surveillanceTaskRepo.update(surveillanceTask);

        // Add the task to the sequenceDTO
        sequenceDTO.push({
          taskCode: taskCodeNumber,
          taskType: TaskType.SURVEILLANCE,
          robisepType: surveillanceTask.robisepType.designation.value,
          taskState: TaskState.PLANNED,
          goal:
            'start: ' +
            surveillanceTask.startingPointToWatch.name.value +
            ' - End: ' +
            surveillanceTask.endingPointToWatch.name.value,
        });
      }
    }
  }
}
