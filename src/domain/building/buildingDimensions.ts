import { ValueObject } from '../../core/domain/ValueObject';
import { FailureType, Result } from '../../core/logic/Result';
import { Guard } from '../../core/logic/Guard';

interface BuildingDimensionProps {
  width: number;
  length: number;
}

const MIN_DIMENSION = 1;

export class BuildingDimensions extends ValueObject<BuildingDimensionProps> {
  get width(): number {
    return this.props.width;
  }

  get length(): number {
    return this.props.length;
  }

  private constructor(props: BuildingDimensionProps) {
    super(props);
  }

  public static create(bdProps: BuildingDimensionProps): Result<BuildingDimensions> {
    const guardedProps = [
      { argument: bdProps.width, argumentName: 'width' },
      { argument: bdProps.length, argumentName: 'length' },
    ];

    // Assure that the props are not null or undefined.
    const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);
    if (!guardResult.succeeded) {
      return Result.fail<BuildingDimensions>(guardResult.message, FailureType.InvalidInput);
    }

    // Assure that dimensions are integers.
    const validIntegers = Number.isInteger(bdProps.width) && Number.isInteger(bdProps.length);
    if (!validIntegers) {
      return Result.fail<BuildingDimensions>('Building dimensions must be integers.', FailureType.InvalidInput);
    }

    // Assure that the props are greater than 0.
    const validDimensions = bdProps.width >= MIN_DIMENSION && bdProps.length >= MIN_DIMENSION;
    if (!validDimensions) {
      return Result.fail<BuildingDimensions>('Building dimensions must be greater than 0', FailureType.InvalidInput);
    }

    // If all the checks pass, return the dimensions.
    return Result.ok<BuildingDimensions>(new BuildingDimensions(bdProps));
  }
}
