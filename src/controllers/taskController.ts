import e, { Response } from 'express';
import { Inject, Service } from 'typedi';
import { FailureType, Result } from '../core/logic/Result';
import { Utils } from '../core/logic/Utils';

import config from '../../config';

import ITaskController from './IControllers/ITaskController';
import ITaskService from '../services/IServices/ITaskService';
import ITaskOutDTO from '../dto/out/ITaskOutDTO';
import ITaskDTO from '../dto/ITaskDTO';
import IUpdateTaskStateDTO from '../dto/IUpdateTaskStateDTO';

@Service()
export default class TaskController implements ITaskController {
  constructor(@Inject(config.services.task.name) private taskServiceInstance: ITaskService) {}

  public async requestTask(req: e.Request, res: e.Response): Promise<e.Response> {
    try {
      // Call the service to request a new task.
      const taskOrError = (await this.taskServiceInstance.requestTask(req.body as ITaskDTO)) as Result<ITaskOutDTO>;

      // If the service fails, handle the errors.
      if (taskOrError.isFailure) {
        return this.returnError(taskOrError, res);
      }

      // If the service succeeds, return the created task.
      const taskDTO = taskOrError.getValue();
      return res.status(201).json(taskDTO);
    } catch (e) {
      return res.status(401).send(e.message);
    }
  }

  public async listAllTasks(res: e.Response): Promise<e.Response> {
    try {
      // Call the service to list all tasks.
      const tasksOutDTO = await this.taskServiceInstance.listAllTasks();

      // If the request succeeds, return the list of tasks.
      return res.status(200).json(tasksOutDTO);
    } catch (e) {
      // Unauthorized
      return res.status(401).send(e.message);
    }
  }

  public async listTasksByState(req: e.Request, res: e.Response): Promise<e.Response> {
    try {
      const taskStates = req.query.state ? req.query.state.toString().split(',') : [];
      // Call the service to list all tasks by state.
      const tasksOutDTO = await this.taskServiceInstance.listTasksByState(taskStates);

      if (tasksOutDTO.isFailure) {
        return this.returnError(tasksOutDTO, res);
      }

      // If the request succeeds, return the list of tasks.
      return res.status(200).json(tasksOutDTO.getValue());
    } catch (e) {
      // Unauthorized
      return res.status(401).send(e.message);
    }
  }

  public async listTasksByUser(req: e.Request, res: e.Response): Promise<e.Response> {
    try {
      // Get the iamId from the request query.
      const iamId = req.query.iamId as string;

      // Call the service to list all tasks by state.
      const tasksOutDTO = await this.taskServiceInstance.listTasksByUser(iamId);

      if (tasksOutDTO.isFailure) {
        return this.returnError(tasksOutDTO, res);
      }

      // If the request succeeds, return the list of tasks.
      return res.status(200).json(tasksOutDTO.getValue());
    } catch (e) {
      // Unauthorized
      return res.status(401).send(e.message);
    }
  }

  public async getTaskSequence(req: e.Request, res: e.Response): Promise<e.Response> {
    try {
      // Obtain the robisepId from the request query.
      const algorithm = req.query.algorithm as string;

      // Call the service to list all tasks.
      const taskSequence = await this.taskServiceInstance.getTaskSequence(algorithm);

      if (taskSequence.isFailure) {
        return this.returnError(taskSequence, res);
      }

      // If the request succeeds, return the list of tasks.
      return res.status(200).json(taskSequence.getValue());
    } catch (e) {
      // Unauthorized
      return res.status(401).send(e.message);
    }
  }

  public async rejectDeletedUserTasks(req: e.Request, res: e.Response): Promise<e.Response> {
    try {
      // Get the iamId from the request query.
      const email = req.query.email as string;

      // Call the service to delete all tasks by user.
      const result = await this.taskServiceInstance.rejectDeletedUserTasks(email);

      if (result.isFailure) {
        return this.returnError(result, res);
      }

      // If the request succeeds, return the list of tasks.
      return res.status(200).json(result.getValue());
    } catch (e) {
      // Unauthorized
      return res.status(401).send(e.message);
    }
  }

  public async listTasksByMultipleParameters(req: e.Request, res: e.Response): Promise<e.Response> {
    try {
      const taskStates = req.query.state ? req.query.state.toString().split(',') : [];

      const tasksOutDTO = await this.taskServiceInstance.listTasksByMultipleParameters(
        taskStates,
        req.query.robisepType as string,
        req.query.personId as string,
      );

      if (tasksOutDTO.isFailure) {
        return this.returnError(tasksOutDTO, res);
      }

      // If the request succeeds, return the list of tasks.
      return res.status(200).json(tasksOutDTO.getValue());
    } catch (e) {
      // Unauthorized
      return res.status(401).send(e.message);
    }
  }

  public async updateTaskState(req: e.Request, res: e.Response): Promise<e.Response> {
    try {
      const result = await this.taskServiceInstance.updateTaskState(
        req.params.taskCode,
        req.body as IUpdateTaskStateDTO,
      );

      if (result.isFailure) {
        return this.returnError(result, res);
      }

      // If the request succeeds, return the updated task.
      return res.status(200).json(result.getValue());
    } catch (e) {
      // Unauthorized
      return res.status(401).send(e.message);
    }
  }

  private returnError(result: Result<any>, res: Response) {
    const errorDto = Utils.convertToErrorDTO(result.errorMessage());
    switch (result.failureType) {
      case FailureType.InvalidInput:
        return res.status(400).send(errorDto);
      case FailureType.Unauthorized:
        return res.status(401).send(errorDto);
      case FailureType.EntityDoesNotExist:
        return res.status(404).send(errorDto);
      case FailureType.EntityAlreadyExists:
        return res.status(409).send(errorDto);
      case FailureType.DatabaseError:
        return res.status(503).send(errorDto);
    }
  }
}
