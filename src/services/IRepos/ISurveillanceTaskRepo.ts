import { Repo } from '../../core/infra/Repo';
import { SurveillanceTask } from '../../domain/task/surveillanceTask/surveillanceTask';

export default interface ISurveillanceTaskRepo extends Repo<SurveillanceTask> {
  /**
   * Saves a surveillance task.
   * @param surveillanceTask The surveillance task to be saved.
   */
  save(surveillanceTask: SurveillanceTask): Promise<SurveillanceTask>;

  /**
   * Updates a surveillance task.
   * @param surveillanceTask The surveillance task to be updated.
   */
  update(surveillanceTask: SurveillanceTask): Promise<SurveillanceTask>;

  /**
   * Finds all surveillance tasks.
   */
  findAll(): Promise<SurveillanceTask[]>;

  /**
   * Finds a surveillance tasks by state
   * @param state The state of the surveillance task.
   */
  findByState(state: string[]): Promise<SurveillanceTask[]>;

  /**
   * Finds a surveillance tasks by state and robisep id
   * @param state The state of the surveillance task.
   * @param robisepId The robisep id.
   */
  findByStateAndRobisepId(state: string[], robisepId: string): Promise<SurveillanceTask[]>;

  /**
   * Finds a surveillance tasks by user
   * @param email The email of the user.
   */
  findByUser(email: string): Promise<SurveillanceTask[]>;

  /**
   * Finds a surveillance tasks by robisep id
   * @param code The robisep id.
   */
  findByCode(code: number): Promise<SurveillanceTask>;

  /*
   * Finds a surveillance tasks by state and user email
   * @param state The state of the surveillance task.
   * @param email The email of the user.
   */
  findByStateAndUserEmail(state: string[], email: string): Promise<SurveillanceTask[]>;

  /**
   * Finds a surveillance tasks by state, type and email
   * @param state The state of the surveillance task.
   * @param robisepId The robisep id.
   * @param email The email of the user.
   */
  findByStateTypeAndEmail(state?: string[], robisepId?: string, email?: string): Promise<SurveillanceTask[]>;
}
