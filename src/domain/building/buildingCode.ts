import { ValueObject } from '../../core/domain/ValueObject';
import { FailureType, Result } from '../../core/logic/Result';
import { Guard } from '../../core/logic/Guard';
import config from '../../../config';

const BUILDING_CODE_MAX_LENGTH = config.configurableValues.building.maxCodeLength;

interface BuildingCodeProps {
  value: string;
}

export class BuildingCode extends ValueObject<BuildingCodeProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: BuildingCodeProps) {
    super(props);
  }

  public static create(code: string): Result<BuildingCode> {
    const argName = 'Building Code';

    // Check if the code is null or undefined.
    const guardResult = Guard.againstNullOrUndefined(code, argName);
    if (!guardResult.succeeded) {
      return Result.fail<BuildingCode>(guardResult.message, FailureType.InvalidInput);
    }

    // Check if the code is empty.
    const guardAgainstEmpty = Guard.onlyContainsSpaces(code, argName);
    if (guardAgainstEmpty.succeeded) {
      return Result.fail<BuildingCode>(`Building Code cannot be empty.`, FailureType.InvalidInput);
    }

    // Check if the code is too long or too short.
    const rangeGuard = Guard.inRange(code.length, 1, BUILDING_CODE_MAX_LENGTH, argName);
    if (!rangeGuard.succeeded) {
      return Result.fail<BuildingCode>(rangeGuard.message, FailureType.InvalidInput);
    }

    // Check if the code is alphanumeric.
    const alphanumericGuard = Guard.onlyContainsAlphanumericsAndSpaces(code, argName);
    if (!alphanumericGuard.succeeded) {
      return Result.fail<BuildingCode>(alphanumericGuard.message, FailureType.InvalidInput);
    }

    // If all the checks pass, return the code.
    return Result.ok<BuildingCode>(new BuildingCode({ value: code }));
  }
}
