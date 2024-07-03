import { Inject, Service } from 'typedi';

import config from '../../config';

import IFloorFactory from '../services/IFactories/IFloorFactory';
import { Floor } from '../domain/floor/floor';
import IBuildingRepo from '../services/IRepos/IBuildingRepo';
import { FloorNumber } from '../domain/floor/floorNumber';
import { FloorDescription } from '../domain/floor/floorDescription';
import { UniqueEntityID } from '../core/domain/UniqueEntityID';

@Service()
export default class FloorFactory implements IFloorFactory {
  constructor(@Inject(config.repos.building.name) private buildingRepo: IBuildingRepo) {}

  public async createFloor(raw: any): Promise<Floor> {
    // Allow for null floor description
    let floorDescriptionOrError = null;
    if (raw.floorDescription) {
      floorDescriptionOrError = FloorDescription.create(raw.floorDescription);

      if (floorDescriptionOrError.isFailure) {
        throw new TypeError(floorDescriptionOrError.errorMessage());
      }
    }

    // Create Floor Number
    const floorNumberOrError = FloorNumber.create(raw.floorNumber);
    // Verify creation success
    if (floorNumberOrError.isFailure) {
      throw new TypeError(floorNumberOrError.errorMessage());
    }

    // Retrieve the Building
    const building = await this.buildingRepo.findByDomainId(raw.buildingId);

    // Verify building was found
    if (!building) {
      throw new TypeError('Building not found');
    }

    // Create Floor
    const floorOrError = Floor.create(
      {
        building: building,
        floorNumber: floorNumberOrError.getValue(),
        floorDescription: floorDescriptionOrError ? floorDescriptionOrError.getValue() : null,
      },
      new UniqueEntityID(raw.domainId),
    );

    return floorOrError.isSuccess ? floorOrError.getValue() : null;
  }
}
