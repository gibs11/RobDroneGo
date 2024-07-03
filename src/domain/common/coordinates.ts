import { ValueObject } from '../../core/domain/ValueObject';
import { FailureType, Result } from '../../core/logic/Result';

interface CoordinatesProps {
  x: number;
  y: number;
}

export class Coordinates extends ValueObject<CoordinatesProps> {
  // Returns the passage's points.
  get x(): number {
    return this.props.x;
  }

  get y(): number {
    return this.props.y;
  }

  private constructor(props: CoordinatesProps) {
    super(props);
  }

  public static create(props: CoordinatesProps): Result<Coordinates> {
    // Verifies if the x and y are integers.
    if (!Number.isInteger(props.x) || !Number.isInteger(props.y)) {
      return Result.fail<Coordinates>('Coordinates must be integer numbers.', FailureType.InvalidInput);
    }

    // Verifies if the x and y are positive numbers.
    if (props.x < 0 || props.y < 0) {
      return Result.fail<Coordinates>('Coordinates must be positive numbers.', FailureType.InvalidInput);
    }

    return Result.ok<Coordinates>(new Coordinates(props));
  }

  /**
   * Checks if the coordinates are the same.
   * @param coordinates - Coordinates to compare.
   * @returns True if the coordinates are the same.
   */
  public equals(coordinates: Coordinates): boolean {
    return this.x === coordinates.x && this.y === coordinates.y;
  }
}
