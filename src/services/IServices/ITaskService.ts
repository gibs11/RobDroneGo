import { Result } from '../../core/logic/Result';
import ITaskDTO from '../../dto/ITaskDTO';
import ITaskOutDTO from '../../dto/out/ITaskOutDTO';
import IUpdateTaskStateDTO from '../../dto/IUpdateTaskStateDTO';
import ITaskSequenceOutDTO from '../../dto/out/ITaskSequenceOutDto';

export default interface ITaskService {
  /**
   * Request a new task.
   * This is the public method that should be called by the controller.
   * It exposed to create an abstraction layer between the controller and the service.
   * @param taskDTO The task requisition data transfer object.
   */
  requestTask(taskDTO: ITaskDTO): Promise<Result<ITaskOutDTO>>;

  /**
   * Update a task state.
   * @param taskCode
   * @param changeTaskStateDto
   */
  updateTaskState(taskCode: string, changeTaskStateDto: IUpdateTaskStateDTO): Promise<Result<ITaskOutDTO>>;

  /**
   * List all tasks.
   * This is the public method that should be called by the controller.
   * It will return a list with tasks of all types.
   */
  listAllTasks(): Promise<ITaskOutDTO[]>;

  /**
   * List all tasks by state.
   * This is the public method that should be called by the controller.
   * It will return a list with tasks depending on the state.
   * @param state - The state of the task.
   */
  listTasksByState(state: string[]): Promise<Result<ITaskOutDTO[]>>;

  /**
   * List all tasks by user.
   * This is the public method that should be called by the controller.
   * It will return a list with tasks depending on the user.
   * @param iamId - The IAM ID of the user.
   */
  listTasksByUser(iamId: string): Promise<Result<ITaskOutDTO[]>>;

  /**
   * Delete all tasks by deleted user.
   * @param email - The email of the user.
   */
  rejectDeletedUserTasks(email: string): Promise<Result<ITaskOutDTO[]>>;

  /**
   * List all tasks by state or robisepType or person.
   * This is the public method that should be called by the controller.
   * It will return a list with tasks depending on the state or robisepType or person.
   * @param state - The state of the task.
   * @param robisepType - The robisepType of the task.
   * @param personId - The personId of the task.
   */
  listTasksByMultipleParameters(state: string[], robisepType: string, personId: string): Promise<Result<ITaskOutDTO[]>>;

  /**
   * List all tasks by robisep id.
   * This is the public method that should be called by the controller.
   * It will return a list with tasks depending on the robisep id.
   */
  listRobisepIds(): Promise<Result<string[]>>;

  /**
   * Get the task sequence.
   * This is the public method that should be called by the controller.
   * It will return the task sequence for a given robisep id.
   * @param algorithm - The algorithm to use.
   */
  getTaskSequence(algorithm: string): Promise<Result<ITaskSequenceOutDTO[]>>;
}
