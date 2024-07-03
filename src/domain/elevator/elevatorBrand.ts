import { ValueObject } from '../../core/domain/ValueObject';
import { FailureType, Result } from '../../core/logic/Result';
import { Guard } from '../../core/logic/Guard';
import config from '../../../config';

const ELEVATOR_BRAND_MAX_LENGTH = config.configurableValues.elevator.maxBrandNameLength;

interface ElevatorBrandProps {
  value: string;
}

export class ElevatorBrand extends ValueObject<ElevatorBrandProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: ElevatorBrandProps) {
    super(props);
  }

  public static create(brand: string): Result<ElevatorBrand> {
    const argName = 'Elevator Brand';

    // Check if the brand is null or undefined.
    const guardResult = Guard.againstNullOrUndefined(brand, argName);
    if (!guardResult.succeeded) {
      return Result.fail<ElevatorBrand>(guardResult.message, FailureType.InvalidInput);
    }

    // Check if the brand is empty.
    const guardAgainstEmpty = Guard.onlyContainsSpaces(brand, argName);
    if (guardAgainstEmpty.succeeded) {
      return Result.fail<ElevatorBrand>(`Elevator Brand cannot be empty.`, FailureType.InvalidInput);
    }

    // Check if the brand is too long or too short.
    const rangeGuard = Guard.inRange(brand.length, 1, ELEVATOR_BRAND_MAX_LENGTH, argName);
    if (!rangeGuard.succeeded) {
      return Result.fail<ElevatorBrand>(rangeGuard.message, FailureType.InvalidInput);
    }

    // Check if the brand is alphanumeric.
    const alphanumericGuard = Guard.onlyContainsAlphanumericsAndSpaces(brand, argName);
    if (!alphanumericGuard.succeeded) {
      return Result.fail<ElevatorBrand>(alphanumericGuard.message, FailureType.InvalidInput);
    }

    // If all the checks pass, return the brand.
    return Result.ok<ElevatorBrand>(new ElevatorBrand({ value: brand }));
  }
}
