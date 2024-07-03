import { Request, Response } from 'express';

export default interface ITaskController {
  /**
   * Creates a new task.
   * @param req The request object.
   * @param res The response object.
   * @returns The response object.
   * @throws 400 - Bad request (Invalid input).
   * @throws 401 - Unauthorized.
   * @throws 409 - Conflict (Entity already exists).
   * @throws 503 - Service unavailable.
   **/
  requestTask(req: Request, res: Response): Promise<Response>;

  /**
   * List all tasks.
   * @param res The response object.
   * @returns The response object.
   * @throws 401 - Unauthorized.
   * @throws 503 - Service unavailable.
   */
  listAllTasks(res: Response): Promise<Response>;

  /**
   * List all tasks by state.
   * @param req The request object.
   * @param res The response object.
   * @returns The response object.
   * @throws 400 - Bad request (Invalid input).
   * @throws 401 - Unauthorized.
   * @throws 503 - Service unavailable.
   */
  listTasksByState(req: Request, res: Response): Promise<Response>;

  /**
   * List all tasks by user.
   * @param req The request object.
   * @param res The response object.
   * @returns The response object.
   * @throws 401 - Unauthorized.
   * @throws 503 - Service unavailable.
   */
  listTasksByUser(req: Request, res: Response): Promise<Response>;

  /**
   *
   * @param req The request object.
   * @param res The response object.
   * @returns The response object.
   * @throws 401 - Unauthorized.
   * @throws 503 - Service unavailable.
   * @throws 404 - Not found.
   */
  rejectDeletedUserTasks(req, res): Promise<Response>;

  /**
   * List all tasks by state or robisepType or person.
   * @param req The request object.
   * @param res The response object.
   * @returns The response object.
   * @throws 400 - Bad request (Invalid input).
   * @throws 401 - Unauthorized.
   * @throws 503 - Service unavailable.
   */
  listTasksByMultipleParameters(req: Request, res: Response): Promise<Response>;

  /**
   * Update the task state.
   * @param req
   * @param res
   */
  updateTaskState(req: Request, res: Response): Promise<Response>;

  /**
   * Get the task sequence for a given robisepId.
   * @param req The request object.
   * @param res The response object.
   * @returns The response object.
   * @throws 400 - Bad request (Invalid input).
   * @throws 401 - Unauthorized.
   * @throws 503 - Service unavailable.
   */
  getTaskSequence(req: Request, res: Response): Promise<Response>;
}
