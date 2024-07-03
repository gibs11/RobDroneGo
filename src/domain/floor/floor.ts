import { AggregateRoot } from '../../core/domain/AggregateRoot';
import { UniqueEntityID } from '../../core/domain/UniqueEntityID';

import { Guard } from '../../core/logic/Guard';
import { FailureType, Result } from '../../core/logic/Result';

import { Building } from '../building/building';
import { FloorDescription } from './floorDescription';
import { FloorNumber } from './floorNumber';
import { FloorPlan } from './floorPlan';
import { Coordinates } from '../common/coordinates';

interface FloorProps {
  building: Building;
  floorNumber: FloorNumber;
  floorDescription?: FloorDescription;
  floorPlan?: FloorPlan;
}

export class Floor extends AggregateRoot<FloorProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get building(): Building {
    return this.props.building;
  }

  get floorNumber(): FloorNumber {
    return this.props.floorNumber;
  }

  get floorDescription(): FloorDescription {
    return this.props.floorDescription;
  }

  get floorPlan(): FloorPlan {
    return this.props.floorPlan;
  }

  private set floorNumber(newFloorNumber: FloorNumber) {
    this.props.floorNumber = newFloorNumber;
  }

  private set floorDescription(newFloorDescription: FloorDescription) {
    this.props.floorDescription = newFloorDescription;
  }

  private set floorPlan(newFloorPlan: FloorPlan) {
    this.props.floorPlan = newFloorPlan;
  }

  private constructor(props: FloorProps, id?: UniqueEntityID) {
    super(props, id);
  }

  /**
   * Updates the floor number.
   * @param floorNumber - The new floor number.
   */
  updateNumber(floorNumber: number) {
    const floorNumberOrError = FloorNumber.create(floorNumber);
    if (floorNumberOrError.isFailure) {
      throw new TypeError(floorNumberOrError.errorMessage());
    }

    this.floorNumber = floorNumberOrError.getValue();
  }

  /**
   * Updates the floor number.
   * @param floorDescription - The new floor description.
   */
  updateDescription(floorDescription: string) {
    const descriptionOrError = FloorDescription.create(floorDescription);
    if (descriptionOrError.isFailure) {
      throw new TypeError(descriptionOrError.errorMessage());
    }

    this.floorDescription = descriptionOrError.getValue();
  }

  /**
   * Updates the floor number.
   * @param floorPlan - The new floor plan.
   */
  updatePlan(floorPlan: string) {
    const floorPlanOrError = FloorPlan.create(floorPlan);
    if (floorPlanOrError.isFailure) {
      throw new TypeError(floorPlanOrError.errorMessage());
    }

    this.floorPlan = floorPlanOrError.getValue();
  }

  public static create(props: FloorProps, id?: UniqueEntityID): Result<Floor> {
    const guardedProps: any = [
      { argument: props.building, argumentName: 'building' },
      { argument: props.floorNumber, argumentName: 'floorNumber' },
    ];

    // Optional props
    if (props.floorDescription) {
      guardedProps.push({ argument: props.floorDescription, argumentName: 'floorDescription' });
    }

    if (props.floorPlan) {
      guardedProps.push({ argument: props.floorPlan, argumentName: 'floorPlan' });
    }

    // Ensure that the props are not null or undefined.
    const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);

    if (!guardResult.succeeded) {
      return Result.fail<Floor>(guardResult.message, FailureType.InvalidInput);
    } else {
      const floor = new Floor(
        {
          ...props,
        },
        id,
      );

      // Return a Result type success.
      return Result.ok<Floor>(floor);
    }
  }

  /**
   * Verifies if the pair of coordinates is in border
   *
   *  @returns A Result type success if the coordinates are in border, otherwise a Result type failure.
   * @param firstCoordinates
   * @param lastCoordinates
   */
  public areCoordinatesInBorder(firstCoordinates: Coordinates, lastCoordinates: Coordinates): Result<boolean> {
    const firstCoordinatesAreInBorder = this.building.isCoordinateInBorder(firstCoordinates).getValue();
    if (!firstCoordinatesAreInBorder) {
      return Result.ok<boolean>(false);
    }

    const lastCoordinatesAreInBorder = this.building.isCoordinateInBorder(lastCoordinates).getValue();
    if (!lastCoordinatesAreInBorder) {
      return Result.ok<boolean>(false);
    }

    return Result.ok<boolean>(true);
  }
}
