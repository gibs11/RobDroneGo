import { ValueObject } from '../../core/domain/ValueObject';
import { FailureType, Result } from '../../core/logic/Result';
import { Guard } from '../../core/logic/Guard';
import config from '../../../config';

const ELEVATOR_MODEL_MAX_LENGTH = config.configurableValues.elevator.maxModelLength;

interface ElevatorModelProps {
  value: string;
}

export class ElevatorModel extends ValueObject<ElevatorModelProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: ElevatorModelProps) {
    super(props);
  }

  public static create(model: string): Result<ElevatorModel> {
    const argName = 'Elevator Model';

    // Check if the model is null or undefined.
    const guardResult = Guard.againstNullOrUndefined(model, argName);
    if (!guardResult.succeeded) {
      return Result.fail<ElevatorModel>(guardResult.message, FailureType.InvalidInput);
    }

    // Check if the model is empty.
    const guardAgainstEmpty = Guard.onlyContainsSpaces(model, argName);
    if (guardAgainstEmpty.succeeded) {
      return Result.fail<ElevatorModel>(`Elevator Model cannot be empty.`, FailureType.InvalidInput);
    }

    // Check if the model is too long or too short.
    const rangeGuard = Guard.inRange(model.length, 1, ELEVATOR_MODEL_MAX_LENGTH, argName);
    if (!rangeGuard.succeeded) {
      return Result.fail<ElevatorModel>(rangeGuard.message, FailureType.InvalidInput);
    }

    // Check if the model is alphanumeric.
    const alphanumericGuard = Guard.onlyContainsAlphanumericsAndSpaces(model, argName);
    if (!alphanumericGuard.succeeded) {
      return Result.fail<ElevatorModel>(alphanumericGuard.message, FailureType.InvalidInput);
    }

    // If all the checks pass, return the model.
    return Result.ok<ElevatorModel>(new ElevatorModel({ value: model }));
  }
}
