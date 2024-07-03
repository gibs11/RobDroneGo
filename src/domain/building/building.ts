import { AggregateRoot } from '../../core/domain/AggregateRoot';
import { UniqueEntityID } from '../../core/domain/UniqueEntityID';

import { Guard } from '../../core/logic/Guard';
import { FailureType, Result } from '../../core/logic/Result';
import { BuildingName } from './buildingName';
import { BuildingDimensions } from './buildingDimensions';
import { BuildingDescription } from './buildingDescription';
import { BuildingCode } from './buildingCode';
import { Coordinates } from '../common/coordinates';

interface BuildingProps {
  buildingName?: BuildingName;
  buildingDescription?: BuildingDescription;
  buildingCode: BuildingCode;
  buildingDimensions: BuildingDimensions;
}

export class Building extends AggregateRoot<BuildingProps> {
  updateDescription(buildingDescription: string) {
    if (buildingDescription) {
      const descriptionOrError = BuildingDescription.create(buildingDescription);
      if (descriptionOrError.isFailure) {
        throw new TypeError(descriptionOrError.errorMessage());
      }
      this.description = descriptionOrError.getValue();
    } else this.description = null;
  }

  updateName(buildingName: string) {
    if (buildingName) {
      const nameOrError = BuildingName.create(buildingName);
      if (nameOrError.isFailure) {
        throw new TypeError(nameOrError.errorMessage());
      }
      this.name = nameOrError.getValue();
    } else this.name = null;
  }

  get id(): UniqueEntityID {
    return this._id;
  }

  get name(): BuildingName {
    return this.props.buildingName;
  }

  get description(): BuildingDescription {
    return this.props.buildingDescription;
  }

  get dimensions(): BuildingDimensions {
    return this.props.buildingDimensions;
  }

  get code(): BuildingCode {
    return this.props.buildingCode;
  }

  private set name(newName: BuildingName) {
    this.props.buildingName = newName;
  }

  private set description(newDescription: BuildingDescription) {
    this.props.buildingDescription = newDescription;
  }

  set dimensions(newDimensions: BuildingDimensions) {
    this.props.buildingDimensions = newDimensions;
  }

  private constructor(props: BuildingProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: BuildingProps, id?: UniqueEntityID): Result<Building> {
    const guardedProps = [
      { argument: props.buildingCode, argumentName: 'buildingCode' },
      { argument: props.buildingDimensions, argumentName: 'buildingDimensions' },
    ];

    // Optional props
    if (props.buildingName) {
      guardedProps.push({ argument: props.buildingName, argumentName: 'buildingName' });
    }
    if (props.buildingDescription) {
      guardedProps.push({ argument: props.buildingDescription, argumentName: 'buildingDescription' });
    }

    // Assure that the props are not null or undefined.
    const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);
    if (!guardResult.succeeded) {
      return Result.fail<Building>(guardResult.message, FailureType.InvalidInput);
    }
    const building = new Building(
      {
        ...props,
      },
      id,
    );

    // If all the checks pass, return the building.
    return Result.ok<Building>(building);
  }

  /**
   * Verifies if a coordinate is in a border of the building.
   *
   *  @param coordinate - The coordinate to be verified.
   *  @returns A Result type boolean.
   */
  public isCoordinateInBorder(coordinate: Coordinates): Result<boolean> {
    const { width, length } = this.dimensions;

    if (coordinate.x > width - 1 || coordinate.y > this.dimensions.length - 1) {
      return Result.ok<boolean>(false);
    }

    if (coordinate.x === 0 || coordinate.x === width - 1 || coordinate.y === 0 || coordinate.y === length - 1) {
      return Result.ok<boolean>(true);
    }
    return Result.ok<boolean>(false);
  }
}
