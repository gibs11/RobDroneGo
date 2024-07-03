import { Mapper } from '../core/infra/Mapper';
import IElevatorOutDTO from '../dto/out/IElevatorOutDTO';
import { UniqueEntityID } from '../core/domain/UniqueEntityID';
import { Elevator } from '../domain/elevator/elevator';
import { ElevatorPosition } from '../domain/elevator/elevatorPosition';
import { ElevatorDescription } from '../domain/elevator/elevatorDescription';
import { ElevatorBrand } from '../domain/elevator/elevatorBrand';
import { ElevatorSerialNumber } from '../domain/elevator/elevatorSerialNumber';
import { ElevatorModel } from '../domain/elevator/elevatorModel';
import BuildingRepo from '../repos/buildingRepo';
import FloorRepo from '../repos/floorRepo';
import Container from 'typedi';

import { FloorMap } from './FloorMap';
import { BuildingMap } from './BuildingMap';
import { ElevatorOrientation } from '../domain/elevator/elevatorOrientation';

export class ElevatorMap extends Mapper<Elevator> {
  public static toDTO(elevator: Elevator): IElevatorOutDTO {
    const elevatorDTO: IElevatorOutDTO = {
      domainId: elevator.id.toString(),
      uniqueNumber: elevator.uniqueNumber,
      elevatorPosition: {
        xposition: elevator.position.xposition,
        yposition: elevator.position.yposition,
      },
      orientation: elevator.orientation.toString(),
      building: BuildingMap.toDTO(elevator.building),
      floors: elevator.floors.map(floor => FloorMap.toDTO(floor)),
    };

    if (elevator.brand) {
      elevatorDTO.brand = elevator.brand.value;

      if (elevator.model) {
        elevatorDTO.model = elevator.model.value;
      } else {
        throw new TypeError('Model required if Brand is provided.');
      }
    }

    if (elevator.model && !elevator.brand) {
      elevatorDTO.model = elevator.model.value;
    }

    if (elevator.description) {
      elevatorDTO.description = elevator.description.value;
    }

    if (elevator.serialNumber) {
      elevatorDTO.serialNumber = elevator.serialNumber.value;
    }
    return elevatorDTO;
  }

  public static async toDomain(raw: any): Promise<Elevator> {
    // Get the building from the building repo.
    const buildingRepo = Container.get(BuildingRepo);
    const building = await buildingRepo.findByDomainId(raw.building);
    if (!building) {
      throw new TypeError('The building does not exist.');
    }

    const floorRepo = Container.get(FloorRepo);

    const floors = [];
    for (const floorId of raw.floors) {
      const floor = await floorRepo.findByDomainId(floorId);
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
    let elevatorBrandOrError = null;
    let elevatorModelOrError = null;
    if (raw.brand) {
      elevatorBrandOrError = ElevatorBrand.create(raw.brand);

      if (elevatorBrandOrError.isFailure) {
        throw new TypeError(elevatorBrandOrError.errorMessage());
      }

      if (raw.model) {
        elevatorModelOrError = ElevatorModel.create(raw.model);

        if (elevatorModelOrError.isFailure) {
          throw new TypeError(elevatorModelOrError.errorMessage());
        }
      } else {
        throw new TypeError('Model required if Brand is provided.');
      }
    }

    // Allow for null elevator model
    if (raw.model && !raw.brand) {
      elevatorModelOrError = ElevatorModel.create(raw.model);

      if (elevatorModelOrError.isFailure) {
        throw new TypeError(elevatorModelOrError.errorMessage());
      }
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
        brand: elevatorBrandOrError ? elevatorBrandOrError.getValue() : null,
        model: elevatorModelOrError ? elevatorModelOrError.getValue() : null,
        serialNumber: elevatorSerialNumberOrError ? elevatorSerialNumberOrError.getValue() : null,
        description: elevatorDescriptionOrError ? elevatorDescriptionOrError.getValue() : null,
        orientation: orientationOrError,
        building: building,
        floors: floors,
      },
      new UniqueEntityID(raw.domainId),
    );

    return elevatorOrError.isSuccess ? elevatorOrError.getValue() : null;
  }

  public static toPersistence(elevator: Elevator): any {
    const floorsArray = [];
    for (const floor of elevator.floors) {
      floorsArray.push(floor.id.toString());
    }
    return {
      domainId: elevator.id.toString(),
      uniqueNumber: elevator.uniqueNumber,
      brand: elevator.brand ? elevator.brand.value : null,
      model: elevator.model ? elevator.model.value : null,
      serialNumber: elevator.serialNumber ? elevator.serialNumber.value : null,
      description: elevator.description ? elevator.description.value : null,
      elevatorPosition: {
        xposition: elevator.position.xposition,
        yposition: elevator.position.yposition,
      },
      orientation: elevator.orientation.toString(),
      building: elevator.building.id.toString(),
      floors: floorsArray,
    };
  }
}
