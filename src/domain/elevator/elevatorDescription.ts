import { ValueObject } from '../../core/domain/ValueObject';
import { FailureType, Result } from '../../core/logic/Result';
import { Guard } from '../../core/logic/Guard';
import config from '../../../config';

const ELEVATOR_DESC_MAX_LENGTH = config.configurableValues.elevator.maxDescriptionLength;

interface ElevatorDescriptionProps {
  value: string;
}

export class ElevatorDescription extends ValueObject<ElevatorDescriptionProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: ElevatorDescriptionProps) {
    super(props);
  }

  public static create(description: string): Result<ElevatorDescription> {
    const argName = 'Elevator Description';

    // Check if the description is null or undefined.
    const guardResult = Guard.againstNullOrUndefined(description, argName);
    if (!guardResult.succeeded) {
      return Result.fail<ElevatorDescription>(guardResult.message, FailureType.InvalidInput);
    }

    // Check if the description is empty.
    const guardAgainstEmpty = Guard.onlyContainsSpaces(description, argName);
    if (guardAgainstEmpty.succeeded) {
      return Result.fail<ElevatorDescription>(`Elevator Description cannot be empty.`, FailureType.InvalidInput);
    }

    // Check if the description is too long or too short.
    const rangeGuard = Guard.inRange(description.length, 1, ELEVATOR_DESC_MAX_LENGTH, argName);
    if (!rangeGuard.succeeded) {
      return Result.fail<ElevatorDescription>(rangeGuard.message, FailureType.InvalidInput);
    }

    // Check if the description is alphanumeric.
    const alphanumericGuard = Guard.onlyContainsAlphanumericsAndSpaces(description, argName);
    if (!alphanumericGuard.succeeded) {
      return Result.fail<ElevatorDescription>(alphanumericGuard.message, FailureType.InvalidInput);
    }

    // If all the checks pass, return the description.
    return Result.ok<ElevatorDescription>(new ElevatorDescription({ value: description }));
  }
}
