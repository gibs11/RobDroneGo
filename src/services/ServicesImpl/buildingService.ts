import { Service, Inject } from 'typedi';
import config from '../../../config';
import IBuildingService from '../IServices/IBuildingService';
import IBuildingRepo from '../IRepos/IBuildingRepo';
import { FailureType, Result } from '../../core/logic/Result';
import IBuildingDTO from '../../dto/IBuildingDTO';
import { BuildingMap } from '../../mappers/BuildingMap';
import { BuildingDimensions } from '../../domain/building/buildingDimensions';

@Service()
export default class BuildingService implements IBuildingService {
  constructor(
    @Inject(config.repos.building.name) private buildingRepo: IBuildingRepo,
    @Inject('logger') private logger,
  ) {}

  /**
   * Creates a new building.
   * @param buildingDTO - The building DTO.
   * @returns A promise that resolves to a Result object indicating success or failure, with the created building DTO as the value.
   */
  public async createBuilding(buildingDTO: IBuildingDTO): Promise<Result<IBuildingDTO>> {
    try {
      const { buildingCode } = buildingDTO;

      // Check if the building already exists with the domainId
      let buildingExists = await this.buildingRepo.findByDomainId(buildingDTO.domainId);
      if (buildingExists) {
        return Result.fail<IBuildingDTO>(
          `Another Building already exists with id=${buildingDTO.domainId}`,
          FailureType.EntityAlreadyExists,
        );
      }

      // Check if the building already exists with the buildingCode
      buildingExists = await this.buildingRepo.findByBuildingCode(buildingCode);
      if (buildingExists) {
        return Result.fail<IBuildingDTO>(
          `Another Building already exists with code=${buildingCode}`,
          FailureType.EntityAlreadyExists,
        );
      }

      // Create building entity
      const building = await BuildingMap.toDomain(buildingDTO);

      // Save building entity
      await this.buildingRepo.save(building);

      // Return buildingDTO
      const buildingDTOResult = BuildingMap.toDTO(building) as IBuildingDTO;
      return Result.ok<IBuildingDTO>(buildingDTOResult);
    } catch (e) {
      if (e instanceof TypeError) {
        this.logger.error(e);
        return Result.fail<IBuildingDTO>(e.message, FailureType.InvalidInput);
      }
      this.logger.error(e);
      return Result.fail<IBuildingDTO>(e.message, FailureType.DatabaseError);
    }
  }

  /**
   * Lists all buildings.
   * @returns A promise that resolves to an array of building DTOs.
   */
  public async listBuildings(): Promise<IBuildingDTO[]> {
    try {
      // Get all buildings from the database
      const buildings = await this.buildingRepo.findAll();

      // Return buildingDTOs
      return buildings.map(building => BuildingMap.toDTO(building) as IBuildingDTO);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  /**
   * Edits an existing building.
   * @param id - The ID of the building to edit.
   * @param buildingDTO - The updated building DTO.
   * @returns A promise that resolves to a Result object indicating success or failure, with the updated building DTO as the value.
   */
  public async editBuilding(id: string, buildingDTO: IBuildingDTO): Promise<Result<IBuildingDTO>> {
    try {
      // Check if the building exists
      const building = await this.buildingRepo.findByDomainId(id);
      if (!building) {
        return Result.fail<IBuildingDTO>('Building does not exist.', FailureType.EntityDoesNotExist);
      }

      // Update the description
      building.updateDescription(buildingDTO.buildingDescription);
      // Update the name
      building.updateName(buildingDTO.buildingName);
      // Update the dimensions if they were provided
      if (buildingDTO.buildingDimensions) {
        let newLen, newWid;
        if (buildingDTO.buildingDimensions.length) {
          newLen = buildingDTO.buildingDimensions.length;
        } else {
          if (buildingDTO.buildingDimensions.length === 0) {
            return Result.fail<IBuildingDTO>('Length must be greater than 0.', FailureType.InvalidInput);
          }
          newLen = building.dimensions.length;
        }
        // Update the width if it was provided
        if (buildingDTO.buildingDimensions.width) {
          newWid = buildingDTO.buildingDimensions.width;
        } else {
          if (buildingDTO.buildingDimensions.width === 0) {
            return Result.fail<IBuildingDTO>('Width must be greater than 0.', FailureType.InvalidInput);
          }
          newWid = building.dimensions.width;
        }
        const BuildingDimensionsResult = BuildingDimensions.create({ width: newWid, length: newLen });
        if (BuildingDimensionsResult.isFailure) {
          return Result.fail<IBuildingDTO>(BuildingDimensionsResult.errorMessage(), FailureType.InvalidInput);
        } else {
          building.dimensions = BuildingDimensionsResult.getValue();
        }
      }

      // If it succeeds, save the updated building
      await this.buildingRepo.save(building);

      // Return the buildingDTO
      const buildingDTOResult = BuildingMap.toDTO(building) as IBuildingDTO;
      return Result.ok<IBuildingDTO>(buildingDTOResult);
    } catch (e) {
      if (e instanceof TypeError) {
        this.logger.error(e);
        return Result.fail<IBuildingDTO>(e.message, FailureType.InvalidInput);
      } else {
        this.logger.error(e);
        return Result.fail<IBuildingDTO>(e.message, FailureType.DatabaseError);
      }
    }
  }

  public async verifyBuildingExists(buildingId: string): Promise<Result<boolean>> {
    // Check if building exists with buildingCode
    const buildingExists = await this.buildingRepo.findByDomainId(buildingId);

    if (!buildingExists) {
      return null;
    }

    return Result.ok<boolean>(true);
  }

  public async listBuildingsWithMinAndMaxFloors(minFloors: number, maxFloors: number): Promise<IBuildingDTO[]> {
    try {
      // Get all the buildings with the given min and max floors from the database
      const buildings = await this.buildingRepo.findWithMinAndMaxFloors(minFloors, maxFloors);

      // Return buildingDTOs
      return buildings.map(building => BuildingMap.toDTO(building) as IBuildingDTO);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
