import { Repo } from '../../core/infra/Repo';
import { PickUpAndDeliveryTask } from '../../domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTask';

export default interface IPickUpAndDeliveryTaskRepo extends Repo<PickUpAndDeliveryTask> {
  /**
   * Saves a pickup and delivery task.
   * @param pickUpAndDeliveryTask The pickup and delivery task to be saved.
   */
  save(pickUpAndDeliveryTask: PickUpAndDeliveryTask): Promise<PickUpAndDeliveryTask>;

  /**
   * Updates a pickup and delivery task.
   * @param pickUpAndDeliveryTask The pickup and delivery task to be updated.
   */
  update(pickUpAndDeliveryTask: PickUpAndDeliveryTask): Promise<PickUpAndDeliveryTask>;

  /**
   * Finds all pickup and delivery tasks.
   */
  findAll(): Promise<PickUpAndDeliveryTask[]>;

  /**
   * Finds a pickup and delivery tasks by state
   * @param state The state of the pickup and delivery task.
   */
  findByState(state: string[]): Promise<PickUpAndDeliveryTask[]>;

  /**
   * Finds a pickup and delivery tasks by state and robisep id
   * @param state The state of the pickup and delivery task.
   * @param robisepId The robisep id.
   */
  findByStateAndRobisepId(state: string[], robisepId: string): Promise<PickUpAndDeliveryTask[]>;

  /**
   * Finds a pickup and delivery tasks by user
   * @param email The email of the user.
   */
  findByUser(email: string): Promise<PickUpAndDeliveryTask[]>;

  /**
   * Finds a pickup and delivery tasks by robisep id
   * @param code The robisep id.
   */
  findByCode(code: number): Promise<PickUpAndDeliveryTask>;

  /**
   *
   * @param state The state of the pickup and delivery task.
   * @param email The email of the user.
   */
  findByStateAndUserEmail(state: string[], email: string): Promise<PickUpAndDeliveryTask[]>;

  /**
   * Finds a pickup and delivery tasks by state, type and email
   * @param state The state of the pickup and delivery task.
   * @param robisepId The robisep id.
   * @param email The email of the user.
   */
  findByStateTypeAndEmail(state?: string[], robisepId?: string, email?: string): Promise<PickUpAndDeliveryTask[]>;
}
