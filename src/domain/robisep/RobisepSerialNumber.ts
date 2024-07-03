import { ValueObject } from '../../core/domain/ValueObject';
import { Guard } from '../../core/logic/Guard';
import { FailureType, Result } from '../../core/logic/Result';
import config from '../../../config';

const SERIAL_NUMBER_MAX_LENGTH = config.configurableValues.robisep.serialNumberMaxLength;

interface RobisepSerialNumberProps {
  serialNumber: string;
}

export class RobisepSerialNumber extends ValueObject<RobisepSerialNumberProps> {
  private constructor(props: RobisepSerialNumberProps) {
    super(props);
  }

  get value(): string {
    return this.props.serialNumber;
  }

  public static create(serialNumber: string): Result<RobisepSerialNumber> {
    const argName = 'SerialNumber';

    // Check if the code is null or undefined.
    const guardResult = Guard.againstNullOrUndefined(serialNumber, argName);
    if (!guardResult.succeeded) {
      return Result.fail<RobisepSerialNumber>(guardResult.message, FailureType.InvalidInput);
    }

    // Check if the code is too long or too short.
    const rangeGuardResult = Guard.inRange(serialNumber.length, 1, SERIAL_NUMBER_MAX_LENGTH, argName);
    if (!rangeGuardResult.succeeded) {
      return Result.fail<RobisepSerialNumber>(rangeGuardResult.message, FailureType.InvalidInput);
    }

    // Check if it contains only spaces/tabs
    const onlySpacesGuardResult = Guard.onlyContainsSpaces(serialNumber, argName);
    if (onlySpacesGuardResult.succeeded) {
      return Result.fail<RobisepSerialNumber>('Serial Number cannot contain only spaces.', FailureType.InvalidInput);
    }

    // Check if it is alphanumeric
    const alphanumericGuardResult = Guard.onlyContainsAlphanumericsAndSpaces(serialNumber, argName);
    if (!alphanumericGuardResult.succeeded) {
      return Result.fail<RobisepSerialNumber>('Serial Number must be alphanumeric.', FailureType.InvalidInput);
    }

    // Success
    return Result.ok<RobisepSerialNumber>(new RobisepSerialNumber({ serialNumber: serialNumber.trim() }));
  }
}
