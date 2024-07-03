import { Inject, Service } from 'typedi';
import IRobisepService from '../IServices/IRobisepService';
import config from '../../../config';
import IRobisepRepo from '../IRepos/IRobisepRepo';
import IRobisepDTO from '../../dto/IRobisepDTO';
import IRobisepOutDTO from '../../dto/out/IRobisepOutDTO';
import { FailureType, Result } from '../../core/logic/Result';
import { RobisepMap } from '../../mappers/RobisepMap';
import IRobisepTypeFactory from '../IFactories/IRobisepTypeFactory';
import { RobisepState } from '../../domain/robisep/RobisepState';
import { TaskType } from '../../domain/common/TaskType';

@Service()
export default class RobisepService implements IRobisepService {
  constructor(
    @Inject(config.repos.robisep.name) private robisepRepo: IRobisepRepo,
    @Inject(config.factories.robisep.name) private robisepFactory: IRobisepTypeFactory,
  ) {}

  public async createRobisep(robisepDTO: IRobisepDTO): Promise<Result<IRobisepOutDTO>> {
    try {
      // Verify if the domainId comes in the DTO
      if (robisepDTO.domainId) {
        // Check if robisep already exists - same domainID
        const robisepExistsDomainId = await this.robisepRepo.findByDomainId(robisepDTO.domainId);
        if (robisepExistsDomainId) {
          return Result.fail<IRobisepOutDTO>(
            'Robisep already exists - domainId must be unique.',
            FailureType.EntityAlreadyExists,
          );
        }
      }

      // Check if code is unique
      const codeAlreadyExists = await this.robisepRepo.findByCode(robisepDTO.code);
      if (codeAlreadyExists) {
        return Result.fail<IRobisepOutDTO>('Code already exists.', FailureType.EntityAlreadyExists);
      }

      // Check if serial number is unique withing the same robisep type
      const serialNumberAlreadyExists = await this.robisepRepo.findARobisepTypeWithSameSerialNumber(
        robisepDTO.serialNumber,
        robisepDTO.robisepTypeId,
      );
      if (serialNumberAlreadyExists) {
        return Result.fail<IRobisepOutDTO>(
          'Serial number already exists for this robisep type.',
          FailureType.EntityAlreadyExists,
        );
      }

      // Create domain entity
      const robisep = await this.robisepFactory.createRobisep(robisepDTO);

      // Save RobisepType
      await this.robisepRepo.save(robisep);

      // Return RobisepTypeDTO
      const robisepDTOResult = RobisepMap.toDTO(robisep) as IRobisepOutDTO;
      return Result.ok<IRobisepOutDTO>(robisepDTOResult);
    } catch (e) {
      if (e instanceof TypeError) return Result.fail<IRobisepOutDTO>(e.message, FailureType.InvalidInput);
      else if (e instanceof ReferenceError)
        return Result.fail<IRobisepOutDTO>(e.message, FailureType.EntityDoesNotExist);

      return Result.fail<IRobisepOutDTO>(e.message, FailureType.DatabaseError);
    }
  }

  public async listRobiseps(): Promise<IRobisepOutDTO[]> {
    // Get all RobisepTypes from the database
    const robiseps = await this.robisepRepo.findAll();

    // Return RobisepTypeDTOs
    return robiseps.map(robisep => RobisepMap.toDTO(robisep) as IRobisepOutDTO);
  }

  public async disableRobisep(id: string, robisepDTO: IRobisepDTO): Promise<Result<IRobisepOutDTO>> {
    try {
      // Get robisep from database
      const robisep = await this.robisepRepo.findByDomainId(id);
      if (!robisep) {
        return Result.fail<IRobisepOutDTO>(`No robisep found with id=${id}`, FailureType.EntityDoesNotExist);
      }

      if (robisep.state === RobisepState.INACTIVE) {
        return Result.fail<IRobisepOutDTO>('Robisep is already disabled.', FailureType.InvalidInput);
      }

      if (robisepDTO.state != RobisepState.INACTIVE) {
        return Result.fail<IRobisepOutDTO>('Invalid state.', FailureType.InvalidInput);
      }

      // Disable robisep
      robisep.disable();

      // Save robisep
      await this.robisepRepo.save(robisep);

      // Return robisepDTO
      const robisepDTOResult = RobisepMap.toDTO(robisep) as IRobisepOutDTO;
      return Result.ok<IRobisepOutDTO>(robisepDTOResult);
    } catch (e) {
      return Result.fail<IRobisepOutDTO>(e.message, FailureType.DatabaseError);
    }
  }

  public async listRobisepsByNicknameOrTaskType(
    nickname: string,
    taskTypes: string[],
  ): Promise<Result<IRobisepOutDTO[]>> {
    // Validate input
    if (nickname === null && taskTypes === null) {
      return Result.fail<IRobisepOutDTO[]>('Nickname or one taskType are required.', FailureType.InvalidInput);
    }

    if (nickname && taskTypes) {
      return Result.fail<IRobisepOutDTO[]>('Nickname and taskType are mutually exclusive.', FailureType.InvalidInput);
    }

    if (nickname) {
      // Get all robiseps from the database with the given nickname
      const robiseps = await this.robisepRepo.findByNickname(nickname);

      // Map robiseps to DTOs and return them
      return Result.ok<IRobisepOutDTO[]>(robiseps.map(robisep => RobisepMap.toDTO(robisep) as IRobisepOutDTO));
    }

    // TasksType
    const tasksType = [];

    // Create a set of valid TaskType values
    const validTaskTypes = new Set(Object.values(TaskType));

    for (const taskType of taskTypes) {
      const normalizedTaskType = taskType.toUpperCase().trim();

      if (validTaskTypes.has(TaskType[normalizedTaskType])) {
        tasksType.push(normalizedTaskType);
      } else {
        return Result.fail<IRobisepOutDTO[]>(
          `Invalid tasksType provided - ${normalizedTaskType}. Valid values are: ${Array.from(validTaskTypes).join(
            ', ',
          )}`,
          FailureType.InvalidInput,
        );
      }
    }

    // Get all robiseps from the database with the given taskType
    const robiseps = await this.robisepRepo.findByTaskType(tasksType);

    // Map robiseps to DTOs and return them
    return Result.ok<IRobisepOutDTO[]>(robiseps.map(robisep => RobisepMap.toDTO(robisep) as IRobisepOutDTO));
  }
}
