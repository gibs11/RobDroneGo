import { Result } from '../../core/logic/Result';
import { PickUpAndDeliveryTask } from '../../domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTask';
import { SurveillanceTask } from '../../domain/task/surveillanceTask/surveillanceTask';

export default interface ITaskFactory {
  /**
   * Creates a new surveillance task from the raw data.
   * @param raw The raw data to create the surveillance task from. View the SurveillanceTask class for more information.
   * @param email The email of the user that created the surveillance task.
   * @returns {Promise<SurveillanceTask>} The created surveillance task.
   * @throws {TypeError}
   */
  createSurveillanceTask(raw: any, email: string): Promise<Result<SurveillanceTask>>;

  /**
   * Creates a new pickup and delivery task from the raw data.
   * @param raw The raw data to create the pickup and delivery task from. View the PickUpAndDeliveryTask class for more information.
   * @param email The email of the user that created the pickup and delivery task.
   * @returns {Promise<PickUpAndDeliveryTask>} The created pick up and delivery task.
   * @throws {TypeError}
   */
  createPickUpAndDeliveryTask(raw: any, email: string): Promise<Result<PickUpAndDeliveryTask>>;
}
