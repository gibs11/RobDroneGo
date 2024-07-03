import { Inject, Service } from 'typedi';

import config from '../../../config';

import { FailureType, Result } from '../../core/logic/Result';

import IFloorService from '../IServices/IFloorService';
import IBuildingService from '../IServices/IBuildingService';
import IFloorRepo from '../IRepos/IFloorRepo';
import IFloorDTO from '../../dto/IFloorDTO';

import { FloorMap } from '../../mappers/FloorMap';
import IFloorFactory from '../IFactories/IFloorFactory';
import IFloorPlanValidator from '../../domain/IServices/IFloorPlanValidator';
import IFloorOutDTO from '../../dto/out/IFloorOutDTO';
import IFloorMapOutDTO from '../../dto/out/IFloorMapOutDTO';
import IFloorMapGenerator from '../IServices/IFloorMapGenerator';

@Service()
export default class FloorService implements IFloorService {
  constructor(
    @Inject(config.repos.floor.name) private floorRepo: IFloorRepo,
    @Inject(config.services.building.name) private buildingService: IBuildingService,
    @Inject(config.services.floorPlanJSONValidator.name) private floorPlanValidator: IFloorPlanValidator,
    @Inject(config.factories.floor.name) private floorFactory: IFloorFactory,
    @Inject(config.services.floorMapGenerator.name) private floorMapCalculator: IFloorMapGenerator,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject('logger') private logger: any,
  ) {}

  public async createBuildingFloor(floorDTO: IFloorDTO): Promise<Result<IFloorOutDTO>> {
    try {
      // Check if the building exists
      const buildingExists = await this.buildingService.verifyBuildingExists(floorDTO.buildingId);
      if (!buildingExists) {
        return Result.fail<IFloorOutDTO>(
          `Building with id ${floorDTO.buildingId} does not exist`,
          FailureType.EntityDoesNotExist,
        );
      }

      // Verify that the domainId comes in the DTO
      if (floorDTO.domainId) {
        // Check if a floor with same domainId exists
        const floorWithIdExists = await this.floorRepo.findByDomainId(floorDTO.domainId);
        if (floorWithIdExists) {
          return Result.fail<IFloorOutDTO>(
            `Floor with id ${floorDTO.domainId} already exists`,
            FailureType.EntityAlreadyExists,
          );
        }
      }

      // Check if there is already a floor with the same floorNumber in the building
      const floorWithNumberExists = await this.floorRepo.findByFloorNumberAndBuildingId(
        floorDTO.floorNumber,
        floorDTO.buildingId,
      );
      if (floorWithNumberExists) {
        return Result.fail<IFloorOutDTO>(
          `Floor already exists with number ${floorDTO.floorNumber} for that building`,
          FailureType.EntityAlreadyExists,
        );
      }

      // Create floor using the floor factory
      const floor = await this.floorFactory.createFloor(floorDTO);

      // Save floor
      await this.floorRepo.save(floor);

      // Return floorDTO
      const floorDTOToReturn = FloorMap.toDTO(floor) as IFloorOutDTO;
      return Result.ok<IFloorOutDTO>(floorDTOToReturn);
    } catch (e) {
      if (e instanceof TypeError) {
        this.logger.error(e);
        return Result.fail<IFloorOutDTO>(e.message, FailureType.InvalidInput);
      } else {
        this.logger.error(e);
        return Result.fail<IFloorOutDTO>(e.message, FailureType.DatabaseError);
      }
    }
  }

  public async listBuildingFloors(buildingId: string): Promise<Result<IFloorOutDTO[]>> {
    try {
      // Verify that the building exists
      const buildingExists = await this.buildingService.verifyBuildingExists(buildingId);

      if (!buildingExists) {
        return Result.fail<IFloorOutDTO[]>(
          `Building with id ${buildingId} does not exist`,
          FailureType.EntityDoesNotExist,
        );
      }

      // Get the floors for the building
      const floors = await this.floorRepo.findByBuildingId(buildingId);

      // Verify that there are floors for the building
      if (floors.length === 0) {
        return Result.ok<IFloorOutDTO[]>([]);
      }

      // Return the floorDTOs
      return Result.ok<IFloorOutDTO[]>(floors.map(floor => FloorMap.toDTO(floor) as IFloorOutDTO));
    } catch (e) {
      this.logger.error(e);
      return Result.fail<IFloorOutDTO[]>(e.message, FailureType.DatabaseError);
    }
  }

  public async updateBuildingFloor(floorId: string, floorDTO: IFloorDTO): Promise<Result<IFloorOutDTO>> {
    try {
      // Verify if the floor exists
      const floorExists = await this.floorRepo.findByDomainId(floorId);
      if (!floorExists) {
        return Result.fail<IFloorOutDTO>(`Floor with id ${floorId} does not exist`, FailureType.EntityDoesNotExist);
      }

      // Verify if any information was changed
      if (
        (floorDTO.floorNumber === null || floorDTO.floorNumber === undefined) &&
        !floorDTO.floorDescription &&
        !floorDTO.floorPlan
      ) {
        return Result.ok<IFloorOutDTO>(FloorMap.toDTO(floorExists) as IFloorOutDTO);
      }

      // Check if floor number was changed
      if (floorDTO.floorNumber !== null && floorDTO.floorNumber !== undefined) {
        // Check if there is already a floor with the same floorNumber in the building
        const floorWithSameNumberExists = await this.floorRepo.findByFloorNumberAndBuildingId(
          floorDTO.floorNumber,
          floorExists.building.id.toString(),
        );

        if (floorWithSameNumberExists && floorWithSameNumberExists.id.toString() !== floorId) {
          return Result.fail<IFloorOutDTO>(
            `Floor already exists with number ${floorDTO.floorNumber} for that building`,
            FailureType.EntityAlreadyExists,
          );
        }

        // Update the floor number
        floorExists.updateNumber(floorDTO.floorNumber);
      }

      // Check if floor description was changed
      if (floorDTO.floorDescription) {
        // Update the floor description
        floorExists.updateDescription(floorDTO.floorDescription);
      }

      // Check if floor plan was changed
      if (floorDTO.floorPlan) {
        // Validate the floor plan
        const floorPlanIsValid = this.floorPlanValidator.isFloorPlanValid(floorDTO, floorExists);

        if (!floorPlanIsValid) {
          return Result.fail<IFloorOutDTO>('The floor plan is not valid!', FailureType.InvalidInput);
        }

        // Update the floor plan
        floorExists.updatePlan(JSON.stringify(floorDTO.floorPlan));
      }

      // Save the floor
      await this.floorRepo.save(floorExists);

      // Return the floorDTO
      const floorDTOToReturn = FloorMap.toDTO(floorExists) as IFloorOutDTO;
      return Result.ok<IFloorOutDTO>(floorDTOToReturn);
    } catch (e) {
      if (e instanceof TypeError) {
        this.logger.error(e);
        return Result.fail<IFloorOutDTO>(e.message, FailureType.InvalidInput);
      } else {
        this.logger.error(e);
        return Result.fail<IFloorOutDTO>(e.message, FailureType.DatabaseError);
      }
    }
  }

  public async listFloorsWithElevatorByBuildingId(buildingId: string): Promise<Result<IFloorOutDTO[]>> {
    try {
      // Verify that the building exists
      const buildingExists = await this.buildingService.verifyBuildingExists(buildingId);
      if (!buildingExists) {
        return Result.fail<IFloorOutDTO[]>(`The building does not exist.`, FailureType.EntityDoesNotExist);
      }

      // Get the floors from the building that have an elevator
      const floors = await this.floorRepo.findFloorsWithElevatorByBuildingId(buildingId);

      // Return the floorDTOs
      return Result.ok<IFloorOutDTO[]>(floors.map(floor => FloorMap.toDTO(floor) as IFloorOutDTO));
    } catch (e) {
      this.logger.error(e);
      return Result.fail<IFloorOutDTO[]>(e.message, FailureType.DatabaseError);
    }
  }

  public async listFloorsWithPassageByBuildingId(buildingId: string): Promise<Result<IFloorOutDTO[]>> {
    try {
      // Verify that the building exists
      const buildingExists = await this.buildingService.verifyBuildingExists(buildingId);
      if (!buildingExists) {
        return Result.fail<IFloorOutDTO[]>(`The building does not exist.`, FailureType.EntityDoesNotExist);
      }

      // Get the floors from the building that have a passage
      const floors = await this.floorRepo.findFloorsWithPassageByBuildingId(buildingId);

      // Return the floorDTOs
      return Result.ok<IFloorOutDTO[]>(floors.map(floor => FloorMap.toDTO(floor) as IFloorOutDTO));
    } catch (e) {
      this.logger.error(e);
      return Result.fail<IFloorOutDTO[]>(e.message, FailureType.DatabaseError);
    }
  }

  public async listFloors(): Promise<IFloorOutDTO[]> {
    try {
      // Get all the floors
      const floors = await this.floorRepo.findAll();

      // Return floorDTO[]
      return floors.map(floor => FloorMap.toDTO(floor) as IFloorOutDTO);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async getFloorMap(buildingCode: string, floorNumber: number): Promise<Result<IFloorMapOutDTO>> {
    try {
      // Verify that the floor exists
      const floorExists = await this.floorRepo.findByBuildingCodeAndFloorNumber(buildingCode, floorNumber);
      if (!floorExists) {
        return Result.fail<IFloorMapOutDTO>(
          `Floor with number ${floorNumber} does not exist in building with code ${buildingCode}`,
          FailureType.EntityDoesNotExist,
        );
      }

      // Get the floor map
      const floorMap = await this.floorMapCalculator.calculateFloorMap(floorExists);

      // Return the floor map
      return Result.ok<IFloorMapOutDTO>(floorMap);
    } catch (e) {
      this.logger.error(e);
      return Result.fail<IFloorMapOutDTO>(e.message, FailureType.DatabaseError);
    }
  }
}
