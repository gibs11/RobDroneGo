import { Inject, Service } from 'typedi';
import config from '../../config';

import IElevatorFactory from '../services/IFactories/IElevatorFactory';
import { Elevator } from '../domain/elevator/elevator';
import { ElevatorPosition } from '../domain/elevator/elevatorPosition';
import { ElevatorBrand } from '../domain/elevator/elevatorBrand';
import { ElevatorSerialNumber } from '../domain/elevator/elevatorSerialNumber';
import { ElevatorDescription } from '../domain/elevator/elevatorDescription';
import { ElevatorModel } from '../domain/elevator/elevatorModel';
import IBuildingRepo from '../services/IRepos/IBuildingRepo';
import IFloorRepo from '../services/IRepos/IFloorRepo';

import { UniqueEntityID } from '../core/domain/UniqueEntityID';
import IElevatorRepo from '../services/IRepos/IElevatorRepo';
import { ElevatorOrientation } from '../domain/elevator/elevatorOrientation';

@Service()
export default class ElevatorFactory implements IElevatorFactory {
  constructor(
    @Inject(config.repos.building.name) private buildingRepo: IBuildingRepo,
    @Inject(config.repos.floor.name) private floorRepo: IFloorRepo,
    @Inject(config.repos.elevator.name) private elevatorRepo: IElevatorRepo,
  ) {}

  /**
   * Creates a new elevator.
   *
   * @param raw The raw data to create the elevator.
   */
  public async createElevator(raw: any): Promise<Elevator> {
    // Check if the domainId comes in the DTO and if it is unique
    if (raw.domainId) {
      const elevatorWithIdExists = await this.elevatorRepo.findByDomainId(raw.domainId);
      if (elevatorWithIdExists) {
        throw new TypeError('The domainId for this elevator is not unique.');
      }
    }

    // Get the building from the building repo.

    const building = await this.buildingRepo.findByDomainId(raw.building);
    if (!building) {
      throw new TypeError('The building does not exist.');
    }

    const floors = [];

    for (const floorId of raw.floors) {
      const floor = await this.floorRepo.findByDomainId(floorId);
      if (!floor) {
        throw new TypeError('The floor does not exist.');
      }
      floors.push(floor);
    }

    // Create the elevator position value object.
    const elevatorPositionOrError = ElevatorPosition.create(raw.elevatorPosition);
    if (elevatorPositionOrError.isFailure) {
      throw new TypeError(elevatorPositionOrError.errorMessage());
    }

    // Room Orientation
    let orientationOrError: ElevatorOrientation;
    for (const orientation in ElevatorOrientation) {
      if (raw.orientation.trim().toUpperCase() === orientation) {
        orientationOrError = ElevatorOrientation[orientation];
        break;
      }
    }
    if (!orientationOrError) {
      throw new TypeError('Invalid Door Orientation.');
    }

    // Allow for null elevator brand
    let elevatorBrand = null;
    let elevatorModel = null;
    if (raw.brand) {
      const elevatorBrandOrError = ElevatorBrand.create(raw.brand);

      if (elevatorBrandOrError.isFailure) {
        throw new TypeError(elevatorBrandOrError.errorMessage());
      }

      if (raw.model) {
        const elevatorModelOrError = ElevatorModel.create(raw.model);

        if (elevatorModelOrError.isFailure) {
          throw new TypeError(elevatorModelOrError.errorMessage());
        }

        elevatorModel = elevatorModelOrError.getValue();
      } else {
        throw new TypeError('Model required if Brand is provided.');
      }

      elevatorBrand = elevatorBrandOrError.getValue();
    }

    // Allow for null elevator model
    if (raw.model && !raw.brand) {
      const elevatorModelOrError = ElevatorModel.create(raw.model);

      if (elevatorModelOrError.isFailure) {
        throw new TypeError(elevatorModelOrError.errorMessage());
      }

      elevatorModel = elevatorModelOrError.getValue();
    }

    // Allow for null elevator description
    let elevatorDescriptionOrError = null;
    if (raw.description) {
      elevatorDescriptionOrError = ElevatorDescription.create(raw.description);

      if (elevatorDescriptionOrError.isFailure) {
        throw new TypeError(elevatorDescriptionOrError.errorMessage());
      }
    }

    // Allow for null elevator serial number
    let elevatorSerialNumberOrError = null;
    if (raw.serialNumber) {
      elevatorSerialNumberOrError = ElevatorSerialNumber.create(raw.serialNumber);

      if (elevatorSerialNumberOrError.isFailure) {
        throw new TypeError(elevatorSerialNumberOrError.errorMessage());
      }
    }

    // Create the elevator entity.
    const elevatorOrError = Elevator.create(
      {
        elevatorPosition: elevatorPositionOrError.getValue(),
        uniqueNumber: raw.uniqueNumber,
        brand: elevatorBrand ? elevatorBrand : null,
        model: elevatorModel ? elevatorModel : null,
        serialNumber: elevatorSerialNumberOrError ? elevatorSerialNumberOrError.getValue() : null,
        description: elevatorDescriptionOrError ? elevatorDescriptionOrError.getValue() : null,
        building: building,
        floors: floors,
        orientation: orientationOrError,
      },
      new UniqueEntityID(raw.domainId),
    );

    return elevatorOrError.isSuccess ? elevatorOrError.getValue() : null;
  }
}
