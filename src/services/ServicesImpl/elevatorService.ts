import { Service, Inject } from 'typedi';
import config from '../../../config';
import { FailureType, Result } from '../../core/logic/Result';

import IElevatorService from '../IServices/IElevatorService';
import IElevatorRepo from '../IRepos/IElevatorRepo';
import IBuildingRepo from '../IRepos/IBuildingRepo';
import IFloorRepo from '../IRepos/IFloorRepo';
import IElevatorFactory from '../IFactories/IElevatorFactory';
import IPositionChecker from '../../domain/IServices/IPositionChecker';
import IElevatorDTO from '../../dto/IElevatorDTO';
import { ElevatorMap } from '../../mappers/ElevatorMap';
import IElevatorOutDTO from '../../dto/out/IElevatorOutDTO';
import { ElevatorOrientation } from '../../domain/elevator/elevatorOrientation';
import { Elevator } from '../../domain/elevator/elevator';
import { Floor } from '../../domain/floor/floor';

@Service()
export default class ElevatorService implements IElevatorService {
  constructor(
    @Inject(config.repos.building.name) private buildingRepo: IBuildingRepo,
    @Inject(config.repos.elevator.name) private elevatorRepo: IElevatorRepo,
    @Inject(config.factories.elevator.name) private elevatorFactory: IElevatorFactory,
    @Inject(config.repos.floor.name) private floorRepo: IFloorRepo,
    @Inject(config.services.positionChecker.name) private positionCheckerInstance: IPositionChecker,
    @Inject('logger') private logger: any,
  ) {}

  /**
   *
   *  This method creates an elevator from a elevatorDTO
   *
   * @param elevatorDTO the elevatorDTO to be created
   * @returns
   */
  public async createElevator(elevatorDTO: IElevatorDTO): Promise<Result<IElevatorOutDTO>> {
    try {
      // Check if the domainId comes in the DTO and if it is unique
      if (elevatorDTO.domainId) {
        const elevatorWithIdExists = await this.elevatorRepo.findByDomainId(elevatorDTO.domainId);
        if (elevatorWithIdExists) {
          return Result.fail<IElevatorOutDTO>(
            'The domainId for this elevator is not unique.',
            FailureType.EntityAlreadyExists,
          );
        }
      }

      const MIN_X_POSITION = config.configurableValues.elevator.minXPosition;
      const MIN_Y_POSITION = config.configurableValues.elevator.minYPosition;

      // Check if the xpos and ypos are valid and a positive integer
      if (
        elevatorDTO.elevatorPosition.xposition < MIN_X_POSITION ||
        elevatorDTO.elevatorPosition.yposition < MIN_Y_POSITION ||
        !Number.isInteger(elevatorDTO.elevatorPosition.xposition) ||
        !Number.isInteger(elevatorDTO.elevatorPosition.yposition)
      ) {
        return Result.fail<IElevatorOutDTO>('The elevator position is invalid.', FailureType.InvalidInput);
      }

      // Check if the building exists
      const buildingExists = await this.buildingRepo.findByDomainId(elevatorDTO.building);
      if (!buildingExists) {
        return Result.fail<IElevatorOutDTO>('The building does not exist.', FailureType.EntityDoesNotExist);
      }

      //Check if xpos and ypos are inside the building width and height
      if (
        elevatorDTO.elevatorPosition.xposition > buildingExists.dimensions.width - 1 ||
        elevatorDTO.elevatorPosition.yposition > buildingExists.dimensions.length - 1
      ) {
        return Result.fail<IElevatorOutDTO>('The elevator position is outside the building.', FailureType.InvalidInput);
      }

      // Check if the orientation is valid

      if (
        elevatorDTO.orientation === 'SOUTH' &&
        elevatorDTO.elevatorPosition.yposition + 1 > buildingExists.dimensions.length - 1
      ) {
        return Result.fail<IElevatorOutDTO>(
          'The elevator door orientation is outside the building.',
          FailureType.InvalidInput,
        );
      }

      if (elevatorDTO.orientation === 'NORTH' && elevatorDTO.elevatorPosition.yposition - 1 < MIN_Y_POSITION) {
        return Result.fail<IElevatorOutDTO>(
          'The elevator door orientation is outside the building.',
          FailureType.InvalidInput,
        );
      }

      if (
        elevatorDTO.orientation === 'EAST' &&
        elevatorDTO.elevatorPosition.xposition + 1 > buildingExists.dimensions.width - 1
      ) {
        return Result.fail<IElevatorOutDTO>(
          'The elevator door orientation is outside the building.',
          FailureType.InvalidInput,
        );
      }

      if (elevatorDTO.orientation === 'WEST' && elevatorDTO.elevatorPosition.xposition - 1 < MIN_X_POSITION) {
        return Result.fail<IElevatorOutDTO>(
          'The elevator door orientation is outside the building.',
          FailureType.InvalidInput,
        );
      }

      if (!['SOUTH', 'NORTH', 'EAST', 'WEST'].includes(elevatorDTO.orientation)) {
        return Result.fail<IElevatorOutDTO>('Invalid Door Orientation', FailureType.InvalidInput);
      }

      /* Removed after news about beeing able to have more than one elevator in a building

        //Check if the building does not have an elevator
        const elevatorExists = await this.elevatorRepo.findByBuildingId(buildingExists.id.toString());
        if (elevatorExists) {
            return Result.fail<IElevatorDTO>('The building already has an elevator.', FailureType.EntityAlreadyExists);
        }
        */

      // Get Sequencial Unique Number In Building
      const elevatorsInBuilding = await this.elevatorRepo.findByBuildingId(elevatorDTO.building);
      if (!elevatorsInBuilding) {
        elevatorDTO.uniqueNumber = 1;
      } else {
        elevatorDTO.uniqueNumber = elevatorsInBuilding.length + 1;
      }

      // Check if there is a duplicate floor
      const duplicateFloor = elevatorDTO.floors.some((floor, index) => elevatorDTO.floors.indexOf(floor) !== index);
      if (duplicateFloor) {
        return Result.fail<IElevatorOutDTO>('There is a duplicate floor.', FailureType.InvalidInput);
      }

      //Check if the floors exist and are from the building
      for (const floor of elevatorDTO.floors) {
        const floorExists = await this.floorRepo.findByDomainId(floor);
        if (!floorExists) {
          return Result.fail<IElevatorOutDTO>('The floor does not exist.', FailureType.EntityDoesNotExist);
        }
        if (floorExists.building.code.value !== buildingExists.code.value) {
          return Result.fail<IElevatorOutDTO>('The floor does not belong to the building.', FailureType.InvalidInput);
        }

        // Check if top and door position is available in that floor
        const positionAvailable = await this.positionCheckerInstance.isPositionAvailable(
          elevatorDTO.elevatorPosition.xposition,
          elevatorDTO.elevatorPosition.yposition,
          floorExists,
          null,
        );

        let positionAvailable2;

        switch (elevatorDTO.orientation.toUpperCase()) {
          case ElevatorOrientation.SOUTH:
            positionAvailable2 = await this.positionCheckerInstance.isPositionAvailable(
              elevatorDTO.elevatorPosition.xposition,
              elevatorDTO.elevatorPosition.yposition + 1,
              floorExists,
              null,
            );
            break;
          case ElevatorOrientation.NORTH:
            positionAvailable2 = await this.positionCheckerInstance.isPositionAvailable(
              elevatorDTO.elevatorPosition.xposition,
              elevatorDTO.elevatorPosition.yposition - 1,
              floorExists,
              null,
            );
            break;
          case ElevatorOrientation.EAST:
            positionAvailable2 = await this.positionCheckerInstance.isPositionAvailable(
              elevatorDTO.elevatorPosition.xposition + 1,
              elevatorDTO.elevatorPosition.yposition,
              floorExists,
              null,
            );
            break;
          case ElevatorOrientation.WEST:
            positionAvailable2 = await this.positionCheckerInstance.isPositionAvailable(
              elevatorDTO.elevatorPosition.xposition - 1,
              elevatorDTO.elevatorPosition.yposition,
              floorExists,
              null,
            );
            break;
        }

        if (!positionAvailable) {
          return Result.fail<IElevatorOutDTO>('The position is not available in the floor.', FailureType.InvalidInput);
        }

        if (!positionAvailable2) {
          return Result.fail<IElevatorOutDTO>(
            'Position not available using this orientation.',
            FailureType.InvalidInput,
          );
        }
      }

      // Create elevator
      const elevatorResult = await this.elevatorFactory.createElevator(elevatorDTO);

      // Save elevator
      await this.elevatorRepo.save(elevatorResult);

      // Return elevatorDTO
      const elevatorDTOResult = ElevatorMap.toDTO(elevatorResult) as IElevatorOutDTO;

      return Result.ok<IElevatorOutDTO>(elevatorDTOResult);
    } catch (e) {
      if (e instanceof TypeError) {
        this.logger.error(e);
        return Result.fail<IElevatorOutDTO>(e.message, FailureType.InvalidInput);
      } else {
        this.logger.error(e);
        return Result.fail<IElevatorOutDTO>(e.message, FailureType.DatabaseError);
      }
    }
  }

  /**
   *
   *  This method updates an elevator from a elevatorDTO
   *
   * @param elevatorId the elevatorId to be updated
   * @param elevatorDTO the elevatorDTO to be updated
   * @returns
   */
  public async updateElevator(elevatorId: string, elevatorDTO: IElevatorDTO): Promise<Result<IElevatorOutDTO>> {
    try {
      const MIN_X_POSITION = config.configurableValues.elevator.minXPosition;
      const MIN_Y_POSITION = config.configurableValues.elevator.minYPosition;

      // Check if the elevator exists
      const elevatorExists = await this.elevatorRepo.findByDomainId(elevatorId);
      if (!elevatorExists) {
        return Result.fail<IElevatorOutDTO>('The elevator does not exist.', FailureType.EntityDoesNotExist);
      }

      const oldFloors = elevatorExists.floors.map(floor => floor.id.toString()); // To use in check if position is available
      // Check if the floors were changed
      if (elevatorDTO.floors) {
        const floorsToUpdate = [];

        //Check if the floors exist and are from the building
        for (const floor of elevatorDTO.floors) {
          const floorExists = await this.floorRepo.findByDomainId(floor);
          if (!floorExists) {
            return Result.fail<IElevatorOutDTO>('The floor does not exist.', FailureType.EntityDoesNotExist);
          }
          if (floorExists.building.code.value !== elevatorExists.building.code.value) {
            return Result.fail<IElevatorOutDTO>('The floor does not belong to the building.', FailureType.InvalidInput);
          }

          floorsToUpdate.push(floorExists);
        }

        // Update floors
        elevatorExists.updateFloors(floorsToUpdate);
      } else {
        elevatorDTO.floors = elevatorExists.floors.map(floor => floor.id.toString()); // To use in check if position is available
      }

      // Check if there is a duplicate floor
      const duplicateFloor = elevatorDTO.floors.some((floor, index) => elevatorDTO.floors.indexOf(floor) !== index);
      if (duplicateFloor) {
        return Result.fail<IElevatorOutDTO>('There is a duplicate floor.', FailureType.InvalidInput);
      }

      // Check if the position was changed
      if (elevatorDTO.elevatorPosition) {
        // Check if the xpos and ypos are valid and a positive integer
        if (
          elevatorDTO.elevatorPosition.xposition < MIN_X_POSITION ||
          elevatorDTO.elevatorPosition.yposition < MIN_Y_POSITION ||
          !Number.isInteger(elevatorDTO.elevatorPosition.xposition) ||
          !Number.isInteger(elevatorDTO.elevatorPosition.yposition)
        ) {
          return Result.fail<IElevatorOutDTO>('The elevator position is invalid.', FailureType.InvalidInput);
        }

        //Check if xpos and ypos are inside the building width and height
        if (
          elevatorDTO.elevatorPosition.xposition > elevatorExists.building.dimensions.width - 1 ||
          elevatorDTO.elevatorPosition.yposition > elevatorExists.building.dimensions.length - 1
        ) {
          return Result.fail<IElevatorOutDTO>(
            'The elevator position is outside the building.',
            FailureType.InvalidInput,
          );
        }

        // Update position
        elevatorExists.updatePosition(elevatorDTO.elevatorPosition.xposition, elevatorDTO.elevatorPosition.yposition);
      }

      // Check if the orientation was changed
      if (elevatorDTO.orientation) {
        // Check if the orientation is valid

        if (
          elevatorDTO.orientation === 'SOUTH' &&
          elevatorExists.position.yposition + 1 > elevatorExists.building.dimensions.length - 1
        ) {
          return Result.fail<IElevatorOutDTO>(
            'The elevator door orientation is outside the building.',
            FailureType.InvalidInput,
          );
        }

        if (elevatorDTO.orientation === 'NORTH' && elevatorExists.position.yposition - 1 < MIN_Y_POSITION) {
          return Result.fail<IElevatorOutDTO>(
            'The elevator door orientation is outside the building.',
            FailureType.InvalidInput,
          );
        }

        if (
          elevatorDTO.orientation === 'EAST' &&
          elevatorExists.position.xposition + 1 > elevatorExists.building.dimensions.width - 1
        ) {
          return Result.fail<IElevatorOutDTO>(
            'The elevator door orientation is outside the building.',
            FailureType.InvalidInput,
          );
        }

        if (elevatorDTO.orientation === 'WEST' && elevatorExists.position.xposition - 1 < MIN_X_POSITION) {
          return Result.fail<IElevatorOutDTO>(
            'The elevator door orientation is outside the building.',
            FailureType.InvalidInput,
          );
        }

        // Update orientation
        elevatorExists.updateOrientation(ElevatorOrientation[elevatorDTO.orientation.toUpperCase()]);
      }

      //Check if the position is available in the floors
      for (const floor of elevatorDTO.floors) {
        const floorExists = await this.floorRepo.findByDomainId(floor);
        if (!floorExists) {
          return Result.fail<IElevatorOutDTO>('The floor does not exist.', FailureType.EntityDoesNotExist);
        }
        if (floorExists.building.code.value !== elevatorExists.building.code.value) {
          return Result.fail<IElevatorOutDTO>('The floor does not belong to the building.', FailureType.InvalidInput);
        }

        // if he only changes floors, we only need to check the new floors
        if (!elevatorDTO.elevatorPosition && !oldFloors.includes(floor) && !elevatorDTO.orientation) {
          const checkAvailability = await this.checkIfPositionIsAvailable(
            elevatorExists.position.xposition,
            elevatorExists.position.yposition,
            floorExists,
            elevatorExists,
            elevatorExists.orientation.toString(),
          );

          if (checkAvailability === 1)
            return Result.fail<IElevatorOutDTO>(
              'The position is not available in the floor.',
              FailureType.InvalidInput,
            );

          if (checkAvailability === 2)
            return Result.fail<IElevatorOutDTO>(
              'Position not available using this orientation.',
              FailureType.InvalidInput,
            );

          // if he changes position, we need to check all floors
        } else if (elevatorDTO.elevatorPosition || elevatorDTO.orientation) {
          const checkAvailability = await this.checkIfPositionIsAvailable(
            elevatorExists.position.xposition,
            elevatorExists.position.yposition,
            floorExists,
            elevatorExists,
            elevatorExists.orientation.toString(),
          );

          if (checkAvailability === 1)
            return Result.fail<IElevatorOutDTO>(
              'The position is not available in the floor.',
              FailureType.InvalidInput,
            );

          if (checkAvailability === 2)
            return Result.fail<IElevatorOutDTO>(
              'Position not available using this orientation.',
              FailureType.InvalidInput,
            );
        }
      }

      // Check if the model was changed
      if (elevatorDTO.model) {
        // Update model
        elevatorExists.updateModel(elevatorDTO.model);
      }

      // Check if the brand was changed
      if (elevatorDTO.brand) {
        //Check if there is a model
        if (!elevatorExists.model) {
          return Result.fail<IElevatorOutDTO>('Model is required when brand is provided.', FailureType.InvalidInput);
        }
        // Update brand
        elevatorExists.updateBrand(elevatorDTO.brand);
      }

      //Check if the serialNumber was changed
      if (elevatorDTO.serialNumber) {
        // Update serialNumber
        elevatorExists.updateSerialNumber(elevatorDTO.serialNumber);
      }

      //Check if the description was changed
      if (elevatorDTO.description) {
        // Update description
        elevatorExists.updateDescription(elevatorDTO.description);
      }

      // Save elevator
      await this.elevatorRepo.save(elevatorExists);

      // Return elevatorDTO
      const elevatorDTOResult = ElevatorMap.toDTO(elevatorExists) as IElevatorOutDTO;

      return Result.ok<IElevatorOutDTO>(elevatorDTOResult);
    } catch (e) {
      if (e instanceof TypeError) {
        this.logger.error(e);
        return Result.fail<IElevatorOutDTO>(e.message, FailureType.InvalidInput);
      } else {
        this.logger.error(e);
        return Result.fail<IElevatorOutDTO>(e.message, FailureType.DatabaseError);
      }
    }
  }

  private async checkIfPositionIsAvailable(
    xpos: number,
    ypos: number,
    floor: Floor,
    elevator: Elevator,
    orientation: string,
  ): Promise<number> {
    // Check if elevator is null
    let elevatorId = null;
    if (elevator) {
      elevatorId = elevator.id.toString();
    }

    // Check if top and orientation position is available in that floor
    const positionAvailable = await this.positionCheckerInstance.isPositionAvailable(xpos, ypos, floor, elevatorId);

    let positionAvailable2;

    switch (orientation) {
      case ElevatorOrientation.SOUTH:
        positionAvailable2 = await this.positionCheckerInstance.isPositionAvailable(xpos, ypos + 1, floor, elevatorId);
        break;
      case ElevatorOrientation.NORTH:
        positionAvailable2 = await this.positionCheckerInstance.isPositionAvailable(xpos, ypos - 1, floor, elevatorId);
        break;
      case ElevatorOrientation.EAST:
        positionAvailable2 = await this.positionCheckerInstance.isPositionAvailable(xpos + 1, ypos, floor, elevatorId);
        break;
      case ElevatorOrientation.WEST:
        positionAvailable2 = await this.positionCheckerInstance.isPositionAvailable(xpos - 1, ypos, floor, elevatorId);
        break;
    }

    if (!positionAvailable) {
      return 1;
    }

    if (!positionAvailable2) {
      return 2;
    }

    return 0;
  }

  /**
   *
   *  This method lists all elevators from a building
   *
   * @param buildingId the buildingId to be listed
   * @returns
   */
  public async listElevatorsFromBuilding(buildingId: string): Promise<Result<IElevatorOutDTO[]>> {
    try {
      // Check if the building exists
      const buildingExists = await this.buildingRepo.findByDomainId(buildingId);
      if (!buildingExists) {
        return Result.fail<IElevatorOutDTO[]>('The building does not exist.', FailureType.EntityDoesNotExist);
      }

      // List elevators
      const elevators = await this.elevatorRepo.findByBuildingId(buildingId);

      // Return elevatorsDTO
      const elevatorsDTOResult = elevators.map(elevator => ElevatorMap.toDTO(elevator) as IElevatorOutDTO);

      return Result.ok<IElevatorOutDTO[]>(elevatorsDTOResult);
    } catch (e) {
      if (e instanceof TypeError) {
        this.logger.error(e);
        return Result.fail<IElevatorOutDTO[]>(e.message, FailureType.InvalidInput);
      } else {
        this.logger.error(e);
        return Result.fail<IElevatorOutDTO[]>(e.message, FailureType.DatabaseError);
      }
    }
  }

  /**
   *
   *  This method lists all elevators
   *
   * @returns
   */
  public async listAllElevators(): Promise<Result<IElevatorOutDTO[]>> {
    try {
      // List elevators
      const elevators = await this.elevatorRepo.findAll();

      // Return elevatorsDTO
      const elevatorsDTOResult = elevators.map(elevator => ElevatorMap.toDTO(elevator) as IElevatorOutDTO);

      return Result.ok<IElevatorOutDTO[]>(elevatorsDTOResult);
    } catch (e) {
      if (e instanceof TypeError) {
        this.logger.error(e);
        return Result.fail<IElevatorOutDTO[]>(e.message, FailureType.InvalidInput);
      } else {
        this.logger.error(e);
        return Result.fail<IElevatorOutDTO[]>(e.message, FailureType.DatabaseError);
      }
    }
  }
}
