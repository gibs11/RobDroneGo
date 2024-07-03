import { ValueObject } from '../../core/domain/ValueObject';
import { FailureType, Result } from '../../core/logic/Result';
import { Guard } from '../../core/logic/Guard';

interface FloorNumberProps {
  value: number;
}

export class FloorNumber extends ValueObject<FloorNumberProps> {
  get value(): number {
    return this.props.value;
  }

  private constructor(props: FloorNumberProps) {
    super(props);
  }

  public static create(floorNumber: number): Result<FloorNumber> {
    // Define the argument name for the guard.
    const argName = 'Floor Number';

    // Check if the floor number is null or undefined.
    const guardResult = Guard.againstNullOrUndefined(floorNumber, argName);

    if (!guardResult.succeeded) {
      return Result.fail<FloorNumber>(guardResult.message, FailureType.InvalidInput);
    }

    // Check if the floor is an integer
    if (!Number.isInteger(floorNumber)) {
      return Result.fail<FloorNumber>('Floor Number must be an integer value.', FailureType.InvalidInput);
    }

    // If all the checks pass, return the floor number.
    return Result.ok<FloorNumber>(new FloorNumber({ value: floorNumber }));
  }
}
