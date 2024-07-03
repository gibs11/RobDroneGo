import { Guard } from '../../core/logic/Guard';
import { FailureType, Result } from '../../core/logic/Result';

import { ValueObject } from '../../core/domain/ValueObject';
import { Floor } from '../floor/floor';
import { Coordinates } from '../common/coordinates';

interface PassagePointProps {
  floor: Floor;
  firstCoordinates: Coordinates;
  lastCoordinates: Coordinates;
}

export class PassagePoint extends ValueObject<PassagePointProps> {
  // Returns the passage point floor
  get floor(): Floor {
    return this.props.floor;
  }

  // Returns the left or top coordinates
  get firstCoordinates(): Coordinates {
    return this.props.firstCoordinates;
  }

  // Returns the right or bottom coordinates
  get lastCoordinates(): Coordinates {
    return this.props.lastCoordinates;
  }

  private constructor(props: PassagePointProps) {
    super(props);
  }

  public static create(props: PassagePointProps): Result<PassagePoint> {
    // Verifies if the provided props are not null or undefined.
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.floor, argumentName: 'floor' },
      { argument: props.firstCoordinates, argumentName: 'firstCoordinates' },
      { argument: props.lastCoordinates, argumentName: 'lastCoordinates' },
    ]);
    if (!guardResult.succeeded) {
      return Result.fail<PassagePoint>(guardResult.message, FailureType.InvalidInput);
    }

    // Verify if the coordinates are the same
    const areCoordinatesTheSame =
      props.firstCoordinates.x === props.lastCoordinates.x && props.firstCoordinates.y === props.lastCoordinates.y;
    if (areCoordinatesTheSame) {
      return Result.fail<PassagePoint>('Coordinates must be different.', FailureType.InvalidInput);
    }

    // Verifies if the coordinates are next to each other.
    const areCoordinatesNextToEachOther =
      Math.abs(props.firstCoordinates.x - props.lastCoordinates.x) === 1 ||
      Math.abs(props.firstCoordinates.y - props.lastCoordinates.y) === 1;
    if (!areCoordinatesNextToEachOther) {
      return Result.fail<PassagePoint>('Coordinates must be next to each other.', FailureType.InvalidInput);
    }

    // Verifies if the coordinates are in a border of the floor.
    const areCoordinatesInBorder = props.floor.areCoordinatesInBorder(props.firstCoordinates, props.lastCoordinates);
    if (!areCoordinatesInBorder.getValue()) {
      return Result.fail<PassagePoint>('Coordinates must be in the border of the floor.', FailureType.InvalidInput);
    }

    // Return the new Passage point
    return Result.ok<PassagePoint>(new PassagePoint(props));
  }
}
