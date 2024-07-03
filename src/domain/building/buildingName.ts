import { ValueObject } from '../../core/domain/ValueObject';
import { FailureType, Result } from '../../core/logic/Result';
import { Guard } from '../../core/logic/Guard';
import config from '../../../config';

const BUILDING_NAME_MAX_LENGTH = config.configurableValues.building.maxNameLength;

interface BuildingNameProps {
  value: string;
}

export class BuildingName extends ValueObject<BuildingNameProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: BuildingNameProps) {
    super(props);
  }

  public static create(name: string): Result<BuildingName> {
    const argName = 'Building Name';

    // Check if the name is null or undefined.
    const guardResult = Guard.againstNullOrUndefined(name, argName);
    if (!guardResult.succeeded) {
      return Result.fail<BuildingName>(guardResult.message, FailureType.InvalidInput);
    }

    // Check if the name is empty.
    const guardAgainstEmpty = Guard.onlyContainsSpaces(name, argName);
    if (guardAgainstEmpty.succeeded) {
      return Result.fail<BuildingName>(`Building Name cannot be empty.`, FailureType.InvalidInput);
    }

    // Check if the name is too long or too short.
    const rangeGuard = Guard.inRange(name.length, 1, BUILDING_NAME_MAX_LENGTH, argName);
    if (!rangeGuard.succeeded) {
      return Result.fail<BuildingName>(rangeGuard.message, FailureType.InvalidInput);
    }

    // Check if the name is alphanumeric.
    const alphanumericGuard = Guard.onlyContainsAlphanumericsAndSpaces(name, argName);
    if (!alphanumericGuard.succeeded) {
      return Result.fail<BuildingName>(alphanumericGuard.message, FailureType.InvalidInput);
    }

    // If all the checks pass, return the name.
    return Result.ok<BuildingName>(new BuildingName({ value: name }));
  }
}
