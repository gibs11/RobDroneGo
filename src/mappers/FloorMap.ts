import { Mapper } from '../core/infra/Mapper';
import { Floor } from '../domain/floor/floor';
import { FloorNumber } from '../domain/floor/floorNumber';
import BuildingRepo from '../repos/buildingRepo';
import { Container } from 'typedi';
import { FloorDescription } from '../domain/floor/floorDescription';
import { UniqueEntityID } from '../core/domain/UniqueEntityID';
import { FloorPlan } from '../domain/floor/floorPlan';
import IFloorOutDTO from '../dto/out/IFloorOutDTO';
import { BuildingMap } from './BuildingMap';

export class FloorMap extends Mapper<Floor> {
  public static toDTO(floor: Floor): IFloorOutDTO {
    const floorDTO: IFloorOutDTO = {
      domainId: floor.id.toString(),
      floorNumber: floor.floorNumber.value,
      building: BuildingMap.toDTO(floor.building),
    };

    if (floor.floorDescription) {
      floorDTO.floorDescription = floor.floorDescription.value;
    }

    if (floor.floorPlan) {
      floorDTO.floorPlan = JSON.parse(floor.floorPlan.value);
    }

    return floorDTO;
  }

  public static async toDomain(raw: any): Promise<Floor> {
    // Create Floor Number
    const floorNumberOrError = FloorNumber.create(raw.floorNumber);

    // Verify creation success
    if (floorNumberOrError.isFailure) {
      throw new TypeError(floorNumberOrError.errorMessage());
    }

    // Allow for null floor description
    let floorDescriptionOrError = null;
    if (raw.floorDescription) {
      floorDescriptionOrError = FloorDescription.create(raw.floorDescription);

      if (floorDescriptionOrError.isFailure) {
        throw new TypeError(floorDescriptionOrError.errorMessage());
      }
    }

    // Allow for null floor plan
    let floorPlanOrError = null;
    if (raw.floorPlan) {
      floorPlanOrError = FloorPlan.create(raw.floorPlan);

      if (floorPlanOrError.isFailure) {
        throw new TypeError(floorPlanOrError.errorMessage());
      }
    }

    // Retrieve the Building
    const buildingRepo = Container.get(BuildingRepo);
    const building = await buildingRepo.findByDomainId(raw.buildingId);
    // Verify building was found
    if (!building) {
      throw new ReferenceError('Building not found');
    }

    // Create Floor
    const floorOrError = Floor.create(
      {
        building: building,
        floorNumber: floorNumberOrError.getValue(),
        floorDescription: floorDescriptionOrError ? floorDescriptionOrError.getValue() : null,
        floorPlan: floorPlanOrError ? floorPlanOrError.getValue() : null,
      },
      new UniqueEntityID(raw.domainId),
    );

    return floorOrError.isSuccess ? floorOrError.getValue() : null;
  }

  public static toPersistence(floor: Floor): any {
    return {
      domainId: floor.id.toString(),
      floorNumber: floor.floorNumber.value,
      floorDescription: floor.floorDescription ? floor.floorDescription.value : null,
      buildingId: floor.building.id.toValue(),
      floorPlan: floor.floorPlan ? floor.floorPlan.value : null,
    };
  }
}
