import { Mapper } from '../core/infra/Mapper';
import { UniqueEntityID } from '../core/domain/UniqueEntityID';
import { Building } from '../domain/building/building';
import { BuildingName } from '../domain/building/buildingName';
import { BuildingDimensions } from '../domain/building/buildingDimensions';
import { BuildingDescription } from '../domain/building/buildingDescription';
import { BuildingCode } from '../domain/building/buildingCode';
import IBuildingOutDTO from '../dto/out/IBuildingOutDTO';

export class BuildingMap extends Mapper<Building> {
  public static toDTO(building: Building): IBuildingOutDTO {
    const buildingDTO: IBuildingOutDTO = {
      domainId: building.id.toString(),
      buildingDimensions: {
        width: building.dimensions.width,
        length: building.dimensions.length,
      },
      buildingCode: building.code.value,
    };

    // Optional props
    if (building.name) {
      buildingDTO.buildingName = building.name.value;
    }

    if (building.description) {
      buildingDTO.buildingDescription = building.description.value;
    }

    return buildingDTO;
  }

  public static async toDomain(raw: any): Promise<Building> {
    // Create the building dimensions value object.
    const buildingDimensionsOrError = BuildingDimensions.create(raw.buildingDimensions);
    if (buildingDimensionsOrError.isFailure) {
      // Throw type error with the error message.
      throw new TypeError(buildingDimensionsOrError.errorMessage());
    }

    // Create the building code value object.
    const buildingCodeOrError = BuildingCode.create(raw.buildingCode);
    if (buildingCodeOrError.isFailure) {
      // Throw type error with the error message.
      throw new TypeError(buildingCodeOrError.errorMessage());
    }

    // Allow for null building name and description
    let buildingNameOrError = null;
    if (raw.buildingName) {
      buildingNameOrError = BuildingName.create(raw.buildingName);
      if (buildingNameOrError.isFailure) {
        throw new TypeError(buildingNameOrError.errorMessage());
      }
    }

    let buildingDescriptionOrError = null;
    if (raw.buildingDescription) {
      buildingDescriptionOrError = BuildingDescription.create(raw.buildingDescription);
      if (buildingDescriptionOrError.isFailure) {
        throw new TypeError(buildingDescriptionOrError.errorMessage());
      }
    }

    // Create the building entity.
    const buildingOrError = Building.create(
      {
        buildingDimensions: buildingDimensionsOrError.getValue(),
        buildingCode: buildingCodeOrError.getValue(),
        buildingName: buildingNameOrError ? buildingNameOrError.getValue() : null,
        buildingDescription: buildingDescriptionOrError ? buildingDescriptionOrError.getValue() : null,
      },
      new UniqueEntityID(raw.domainId),
    );

    buildingOrError.isFailure ? console.log(buildingOrError.error) : '';

    // Return the building entity. If it fails, return null.
    return buildingOrError.isSuccess ? buildingOrError.getValue() : null;
  }

  public static toPersistence(building: Building): any {
    const persistenceObject: any = {
      domainId: building.id.toString(),
      buildingDimensions: {
        width: building.dimensions.width,
        length: building.dimensions.length,
      },
      buildingCode: building.code.value,
    };

    // Optional props
    if (building.name) {
      persistenceObject.buildingName = building.name.value;
    }

    if (building.description) {
      persistenceObject.buildingDescription = building.description.value;
    }

    return persistenceObject;
  }
}
