import { Inject, Service } from 'typedi';
import IRobisepTypeRepo from '../IRepos/IRobisepTypeRepo';
import IRobisepTypeService from '../IServices/IRobisepTypeService';
import IRobisepTypeDTO from '../../dto/IRobisepTypeDTO';
import RobisepTypeOutDTO from '../../dto/out/IRobisepTypeOutDTO';
import { FailureType, Result } from '../../core/logic/Result';
import { RobisepTypeMap } from '../../mappers/RobisepTypeMap';
import config from '../../../config';

@Service()
export default class RobisepTypeService implements IRobisepTypeService {
  constructor(@Inject(config.repos.robisepType.name) private robisepTypeRepo: IRobisepTypeRepo) {}

  public async createRobisepType(robisepTypeDTO: IRobisepTypeDTO): Promise<Result<RobisepTypeOutDTO>> {
    try {
      // Check if robisepType already exists - same domainID
      const robisepTypeExistsDomainId = await this.robisepTypeRepo.findByDomainId(robisepTypeDTO.domainId);
      if (robisepTypeExistsDomainId) {
        return Result.fail<RobisepTypeOutDTO>(
          'RobisepType already exists - domainId must be unique.',
          FailureType.EntityAlreadyExists,
        );
      }

      // Check if robisepType already exists - same designation
      const robisepTypeExists = await this.robisepTypeRepo.findByDesignation(robisepTypeDTO.designation);
      if (robisepTypeExists) {
        return Result.fail<RobisepTypeOutDTO>(
          'RobisepType already exists - designation must be unique.',
          FailureType.EntityAlreadyExists,
        );
      }

      // Create domain entity
      const robisepType = await RobisepTypeMap.toDomain(robisepTypeDTO);

      // Save RobisepType
      await this.robisepTypeRepo.save(robisepType);

      // Return RobisepTypeDTO
      const robisepTypeDTOResult = RobisepTypeMap.toDTO(robisepType) as RobisepTypeOutDTO;
      return Result.ok<RobisepTypeOutDTO>(robisepTypeDTOResult);
    } catch (e) {
      if (e instanceof TypeError) return Result.fail<RobisepTypeOutDTO>(e.message, FailureType.InvalidInput);

      return Result.fail<RobisepTypeOutDTO>(e.message, FailureType.DatabaseError);
    }
  }

  public async listRobisepTypes(): Promise<RobisepTypeOutDTO[]> {
    try {
      // Get all robisepTypes
      const robisepTypes = await this.robisepTypeRepo.findAll();

      // Return robisepTypesDTO
      return robisepTypes.map(robisepType => RobisepTypeMap.toDTO(robisepType) as RobisepTypeOutDTO);
    } catch (e) {
      throw e;
    }
  }
}
