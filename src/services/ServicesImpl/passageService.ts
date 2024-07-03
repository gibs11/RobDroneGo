import { Service, Inject } from 'typedi';
import config from '../../../config';

import IPassageService from '../IServices/IPassageService';
import IPassageRepo from '../IRepos/IPassageRepo';
import { PassageMap } from '../../mappers/PassageMap';

import { FailureType, Result } from '../../core/logic/Result';

import IPassageDTO from '../../dto/IPassageDTO';
import IPassageOutDTO from '../../dto/out/IPassageOutDTO';
import IPositionChecker from '../../domain/IServices/IPositionChecker';
import IFloorRepo from '../IRepos/IFloorRepo';
import IBuildingRepo from '../IRepos/IBuildingRepo';
import IPassageBuilder from '../IFactories/IPassageBuilder';
import { Floor } from '../../domain/floor/floor';

@Service()
export default class PassageService implements IPassageService {
  constructor(
    @Inject(config.repos.passage.name) private passageRepo: IPassageRepo,
    @Inject(config.repos.floor.name) private floorRepo: IFloorRepo,
    @Inject(config.repos.building.name) private buildingRepo: IBuildingRepo,
    @Inject(config.services.positionChecker.name) private positionChecker: IPositionChecker,
    @Inject(config.factories.passage.name) private passageBuilder: IPassageBuilder,
    @Inject('logger') private logger,
  ) {}

  public async createPassage(passageDTO: IPassageDTO): Promise<Result<IPassageOutDTO>> {
    try {
      // Verifies if the passage already exists
      const passageExists = await this.passageRepo.findByDomainId(passageDTO.domainId);
      if (passageExists) {
        return Result.fail<IPassageOutDTO>('Passage already exists.', FailureType.EntityAlreadyExists);
      }

      // Verifies if the floors exist
      const startPointFloor = await this.floorRepo.findByDomainId(passageDTO.passageStartPoint.floorId);
      if (!startPointFloor) {
        return Result.fail<IPassageOutDTO>('Start Point Floor not found.', FailureType.EntityDoesNotExist);
      }
      const endPointFloor = await this.floorRepo.findByDomainId(passageDTO.passageEndPoint.floorId);
      if (!endPointFloor) {
        return Result.fail<IPassageOutDTO>('End Point Floor not found.', FailureType.EntityDoesNotExist);
      }
      // Verify if passage already exists with passage floors
      const passageWithFloorsExists = await this.passageRepo.findByFloors(startPointFloor, endPointFloor);
      if (passageWithFloorsExists) {
        return Result.fail<IPassageOutDTO>(
          'Passage already exists between the selected floors.',
          FailureType.EntityAlreadyExists,
        );
      }

      // Verifies if the passage is between floors of the same building
      if (startPointFloor.building.id.toString() === endPointFloor.building.id.toString()) {
        return Result.fail<IPassageOutDTO>(
          "You can't create a passage between floors of the same building.",
          FailureType.InvalidInput,
        );
      }

      // Verify if the between two buildings there only exist passages on different floors
      const isTherePassageBetweenStartFloorAndBuilding = await this.passageRepo.isTherePassageBetweenFloorAndBuilding(
        startPointFloor.id.toString(),
        endPointFloor.building.id.toString(),
      );
      if (isTherePassageBetweenStartFloorAndBuilding) {
        return Result.fail<IPassageOutDTO>(
          'There is already a passage from the floor ' +
            startPointFloor.building.code.value +
            startPointFloor.floorNumber.value +
            ' to the building ' +
            endPointFloor.building.code.value +
            '.',
          FailureType.EntityAlreadyExists,
        );
      }

      const isTherePassageBetweenEndFloorAndBuilding = await this.passageRepo.isTherePassageBetweenFloorAndBuilding(
        endPointFloor.id.toString(),
        startPointFloor.building.id.toString(),
      );
      if (isTherePassageBetweenEndFloorAndBuilding) {
        return Result.fail<IPassageOutDTO>(
          'There is already a passage from the floor ' +
            endPointFloor.building.code.value +
            endPointFloor.floorNumber.value +
            ' to the building ' +
            startPointFloor.building.code.value +
            '.',
          FailureType.EntityAlreadyExists,
        );
      }

      // Verify if the passage positions are occupied
      const coordinates = [
        passageDTO.passageStartPoint.firstCoordinates,
        passageDTO.passageStartPoint.lastCoordinates,
        passageDTO.passageEndPoint.firstCoordinates,
        passageDTO.passageEndPoint.lastCoordinates,
      ];
      for (let i = 0; i < coordinates.length; i++) {
        if (i < 2) {
          const isPositionAvailable1 = await this.positionChecker.isPositionAvailable(
            coordinates[i].x,
            coordinates[i].y,
            startPointFloor,
            null,
          );
          if (!isPositionAvailable1) {
            return Result.fail<IPassageOutDTO>(
              'Coordinates (' + coordinates[i].x + ',' + coordinates[i].y + ') are occupied.',
              FailureType.InvalidInput,
            );
          }
        } else {
          const isPositionAvailable2 = await this.positionChecker.isPositionAvailable(
            coordinates[i].x,
            coordinates[i].y,
            endPointFloor,
            null,
          );
          if (!isPositionAvailable2) {
            return Result.fail<IPassageOutDTO>(
              'Coordinates (' + coordinates[i].x + ',' + coordinates[i].y + ') are occupied.',
              FailureType.InvalidInput,
            );
          }
        }
      }

      // Create passage entity
      const passage = await this.passageBuilder
        .withStartPointFloor(startPointFloor)
        .withEndPointFloor(endPointFloor)
        .withPassageDTO(passageDTO)
        .build();

      // Save passage
      await this.passageRepo.save(passage);

      // Return passageDTO
      const passageDTOResult = PassageMap.toDTO(passage) as IPassageOutDTO;
      return Result.ok<IPassageOutDTO>(passageDTOResult);
    } catch (e) {
      if (e instanceof TypeError) {
        this.logger.error(e);
        return Result.fail<IPassageOutDTO>(e.message, FailureType.InvalidInput);
      }
      this.logger.error(e);
      return Result.fail<IPassageOutDTO>(e.message, FailureType.DatabaseError);
    }
  }

  public async listPassagesBetweenBuildings(
    firstBuildingId: string,
    lastBuildingId: string,
  ): Promise<Result<IPassageOutDTO[]>> {
    try {
      // Verifies if the buildings exist
      const firstBuilding = await this.buildingRepo.findByDomainId(firstBuildingId);
      if (!firstBuilding) {
        return Result.fail<IPassageOutDTO[]>('First Building not found.', FailureType.EntityDoesNotExist);
      }
      const lastBuilding = await this.buildingRepo.findByDomainId(lastBuildingId);
      if (!lastBuilding) {
        return Result.fail<IPassageOutDTO[]>('Last Building not found.', FailureType.EntityDoesNotExist);
      }

      // List passages between buildings
      const passages = await this.passageRepo.findPassagesBetweenBuildings(firstBuildingId, lastBuildingId);

      const passagesDTO = passages.map(passage => PassageMap.toDTO(passage) as IPassageOutDTO);

      return Result.ok<IPassageOutDTO[]>(passagesDTO);
    } catch (e) {
      this.logger.error(e);
      return Result.fail<IPassageOutDTO[]>(e.message, FailureType.DatabaseError);
    }
  }

  public async listPassages(): Promise<Result<IPassageOutDTO[]>> {
    try {
      // List passages
      const passages = await this.passageRepo.findAll();

      const passagesDTO = passages.map(passage => PassageMap.toDTO(passage) as IPassageOutDTO);

      return Result.ok<IPassageOutDTO[]>(passagesDTO);
    } catch (e) {
      this.logger.error(e);
      return Result.fail<IPassageOutDTO[]>(e.message, FailureType.DatabaseError);
    }
  }

  public async editPassage(id: string, passageDTO: IPassageDTO): Promise<Result<IPassageOutDTO>> {
    try {
      // Verify if the passage exists
      const passage = await this.passageRepo.findByDomainId(id);
      if (!passage) {
        return Result.fail<IPassageOutDTO>('Passage not found.', FailureType.EntityDoesNotExist);
      }

      // Verify if any data was changed
      if (!passageDTO.passageStartPoint && !passageDTO.passageEndPoint) {
        return Result.ok<IPassageOutDTO>(PassageMap.toDTO(passage) as IPassageOutDTO);
      }

      // Update the passage start point if it was provided
      if (passageDTO.passageStartPoint) {
        let startPointFloor: Floor;

        if (
          passageDTO.passageStartPoint.floorId &&
          passageDTO.passageStartPoint.floorId !== passage.startPoint.floor.id.toString()
        ) {
          // Verify if the floor exists
          startPointFloor = await this.floorRepo.findByDomainId(passageDTO.passageStartPoint.floorId);
          if (!startPointFloor) {
            return Result.fail<IPassageOutDTO>('Start Point Floor not found.', FailureType.EntityDoesNotExist);
          }

          // Verifies if the passage is between floors of the same building
          if (startPointFloor.building.id.toString() === passage.endPoint.floor.building.id.toString()) {
            return Result.fail<IPassageOutDTO>(
              "You can't create a passage between floors of the same building.",
              FailureType.InvalidInput,
            );
          }

          // Verify if the between two buildings there only exist passages on different floors
          const isTherePassageBetweenStartFloorAndBuilding = await this.passageRepo.isTherePassageBetweenFloorAndBuilding(
            startPointFloor.id.toString(),
            passage.endPoint.floor.building.id.toString(),
          );
          if (isTherePassageBetweenStartFloorAndBuilding) {
            return Result.fail<IPassageOutDTO>(
              'There is already a passage from the floor ' +
                startPointFloor.building.code.value +
                startPointFloor.floorNumber.value +
                ' to the building ' +
                passage.endPoint.floor.building.code.value +
                '.',
              FailureType.EntityAlreadyExists,
            );
          }

          // Verify if passage already exists with passage floors
          const passageWithFloorsExists = await this.passageRepo.findByFloors(startPointFloor, passage.endPoint.floor);
          if (passageWithFloorsExists) {
            return Result.fail<IPassageOutDTO>(
              'Passage already exists between the selected floors.',
              FailureType.EntityAlreadyExists,
            );
          }
        } else {
          // If the floorId is not provided, use the current floor
          passageDTO.passageStartPoint.floorId = passage.startPoint.floor.id.toString();

          // Retrieve the floor
          startPointFloor = await this.floorRepo.findByDomainId(passageDTO.passageStartPoint.floorId);
        }

        // Verify if the firstCoordinates were provided
        if (!passageDTO.passageStartPoint.firstCoordinates) {
          passageDTO.passageStartPoint.firstCoordinates = passage.startPoint.firstCoordinates;
        }

        // Verify if the lastCoordinates were provided
        if (!passageDTO.passageStartPoint.lastCoordinates) {
          passageDTO.passageStartPoint.lastCoordinates = passage.startPoint.lastCoordinates;
        }

        // Verify if the passage positions are occupied
        const coordinates = [
          passageDTO.passageStartPoint.firstCoordinates,
          passageDTO.passageStartPoint.lastCoordinates,
        ];
        for (let i = 0; i < coordinates.length; i++) {
          const isPositionAvailable = await this.positionChecker.isPositionAvailable(
            coordinates[i].x,
            coordinates[i].y,
            startPointFloor,
            id,
          );
          if (!isPositionAvailable) {
            return Result.fail<IPassageOutDTO>(
              'Coordinates (' + coordinates[i].x + ',' + coordinates[i].y + ') are occupied.',
              FailureType.InvalidInput,
            );
          }
        }

        // Update the passage start point
        const startPointOrError = passage.updateStartPoint(
          startPointFloor,
          passageDTO.passageStartPoint.firstCoordinates.x,
          passageDTO.passageStartPoint.firstCoordinates.y,
          passageDTO.passageStartPoint.lastCoordinates.x,
          passageDTO.passageStartPoint.lastCoordinates.y,
        );
        if (startPointOrError.isFailure) {
          return Result.fail<IPassageOutDTO>(startPointOrError.errorMessage(), FailureType.InvalidInput);
        }
      }

      if (passageDTO.passageEndPoint) {
        let endPointFloor: Floor;

        if (
          passageDTO.passageEndPoint.floorId &&
          passageDTO.passageEndPoint.floorId !== passage.endPoint.floor.id.toString()
        ) {
          // Verify if the floor exists
          endPointFloor = await this.floorRepo.findByDomainId(passageDTO.passageEndPoint.floorId);
          if (!endPointFloor) {
            return Result.fail<IPassageOutDTO>('End Point Floor not found.', FailureType.EntityDoesNotExist);
          }

          // Verifies if the passage is between floors of the same building
          if (endPointFloor.building.id.toString() === passage.startPoint.floor.building.id.toString()) {
            return Result.fail<IPassageOutDTO>(
              "You can't create a passage between floors of the same building.",
              FailureType.InvalidInput,
            );
          }

          // Verify if the between two buildings there only exist passages on different floors
          const isTherePassageBetweenEndFloorAndBuilding = await this.passageRepo.isTherePassageBetweenFloorAndBuilding(
            endPointFloor.id.toString(),
            passage.startPoint.floor.building.id.toString(),
          );
          if (isTherePassageBetweenEndFloorAndBuilding) {
            return Result.fail<IPassageOutDTO>(
              'There is already a passage from the floor ' +
                endPointFloor.building.code.value +
                endPointFloor.floorNumber.value +
                ' to the building ' +
                passage.startPoint.floor.building.code.value +
                '.',
              FailureType.EntityAlreadyExists,
            );
          }

          // Verify if passage already exists with passage floors
          const passageWithFloorsExists = await this.passageRepo.findByFloors(passage.startPoint.floor, endPointFloor);
          if (passageWithFloorsExists) {
            return Result.fail<IPassageOutDTO>(
              'Passage already exists between the selected floors.',
              FailureType.EntityAlreadyExists,
            );
          }
        } else {
          // If the floorId is not provided, use the current floor
          passageDTO.passageEndPoint.floorId = passage.endPoint.floor.id.toString();

          // Retrieve the floor
          endPointFloor = await this.floorRepo.findByDomainId(passageDTO.passageEndPoint.floorId);
        }

        // Verify if the firstCoordinates were provided
        if (!passageDTO.passageEndPoint.firstCoordinates) {
          passageDTO.passageEndPoint.firstCoordinates = passage.endPoint.firstCoordinates;
        }

        // Verify if the lastCoordinates were provided
        if (!passageDTO.passageEndPoint.lastCoordinates) {
          passageDTO.passageEndPoint.lastCoordinates = passage.endPoint.lastCoordinates;
        }

        // Verify if the passage positions are occupied
        const coordinates = [passageDTO.passageEndPoint.firstCoordinates, passageDTO.passageEndPoint.lastCoordinates];
        for (let i = 0; i < coordinates.length; i++) {
          const isPositionAvailable = await this.positionChecker.isPositionAvailable(
            coordinates[i].x,
            coordinates[i].y,
            endPointFloor,
            id,
          );
          if (!isPositionAvailable) {
            return Result.fail<IPassageOutDTO>(
              'Coordinates (' + coordinates[i].x + ',' + coordinates[i].y + ') are occupied.',
              FailureType.InvalidInput,
            );
          }
        }

        // Update the passage end point
        const endPointOrError = passage.updateEndPoint(
          endPointFloor,
          passageDTO.passageEndPoint.firstCoordinates.x,
          passageDTO.passageEndPoint.firstCoordinates.y,
          passageDTO.passageEndPoint.lastCoordinates.x,
          passageDTO.passageEndPoint.lastCoordinates.y,
        );
        if (endPointOrError.isFailure) {
          return Result.fail<IPassageOutDTO>(endPointOrError.errorMessage(), FailureType.InvalidInput);
        }
      }

      // Save the passage
      await this.passageRepo.save(passage);

      // Return passageDTO
      const passageDTOResult = PassageMap.toDTO(passage) as IPassageOutDTO;
      return Result.ok<IPassageOutDTO>(passageDTOResult);
    } catch (e) {
      if (e instanceof TypeError) {
        this.logger.error(e);
        return Result.fail<IPassageOutDTO>(e.message, FailureType.InvalidInput);
      } else {
        this.logger.error(e);
        return Result.fail<IPassageOutDTO>(e.message, FailureType.DatabaseError);
      }
    }
  }
}
