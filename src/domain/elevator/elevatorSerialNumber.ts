import { ValueObject } from '../../core/domain/ValueObject';
import { FailureType, Result } from '../../core/logic/Result';
import { Guard } from '../../core/logic/Guard';
import config from '../../../config';

const ELEVATOR_SN_MAX_LENGTH = config.configurableValues.elevator.maxSerialNumberLength;

interface ElevatorSerialNumberProps {
  value: string;
}

export class ElevatorSerialNumber extends ValueObject<ElevatorSerialNumberProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: ElevatorSerialNumberProps) {
    super(props);
  }

  public static create(serialNumber: string): Result<ElevatorSerialNumber> {
    const argName = 'Elevator Serial Number';

    // Check if the serial number is null or undefined.
    const guardResult = Guard.againstNullOrUndefined(serialNumber, argName);
    if (!guardResult.succeeded) {
      return Result.fail<ElevatorSerialNumber>(guardResult.message, FailureType.InvalidInput);
    }

    // Check if the serial number is empty.
    const guardAgainstEmpty = Guard.onlyContainsSpaces(serialNumber, argName);
    if (guardAgainstEmpty.succeeded) {
      return Result.fail<ElevatorSerialNumber>(`Elevator Serial Number cannot be empty.`, FailureType.InvalidInput);
    }

    // Check if the serial number is too long or too short.
    const rangeGuard = Guard.inRange(serialNumber.length, 1, ELEVATOR_SN_MAX_LENGTH, argName);
    if (!rangeGuard.succeeded) {
      return Result.fail<ElevatorSerialNumber>(rangeGuard.message, FailureType.InvalidInput);
    }

    // Check if the serial number is alphanumeric.
    const alphanumericGuard = Guard.onlyContainsAlphanumericsAndSpaces(serialNumber, argName);
    if (!alphanumericGuard.succeeded) {
      return Result.fail<ElevatorSerialNumber>(alphanumericGuard.message, FailureType.InvalidInput);
    }

    // If all the checks pass, return the serial number.
    return Result.ok<ElevatorSerialNumber>(new ElevatorSerialNumber({ value: serialNumber }));
  }
}
