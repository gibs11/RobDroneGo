import { ValueObject } from '../../core/domain/ValueObject';
import { FailureType, Result } from '../../core/logic/Result';
import { Guard } from '../../core/logic/Guard';
import config from '../../../config';

const BUILDING_DESC_MAX_LENGTH = config.configurableValues.building.maxDescriptionLength;

interface BuildingDescriptionProps {
  value: string;
}

export class BuildingDescription extends ValueObject<BuildingDescriptionProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: BuildingDescriptionProps) {
    super(props);
  }

  public static create(description: string): Result<BuildingDescription> {
    const argName = 'Building Description';

    // Check if the description is null or undefined.
    const guardResult = Guard.againstNullOrUndefined(description, argName);
    if (!guardResult.succeeded) {
      return Result.fail<BuildingDescription>(guardResult.message, FailureType.InvalidInput);
    }

    // Check if the description is empty.
    const guardAgainstEmpty = Guard.onlyContainsSpaces(description, argName);
    if (guardAgainstEmpty.succeeded) {
      return Result.fail<BuildingDescription>(`Building Description cannot be empty.`, FailureType.InvalidInput);
    }

    // Check if the description is too long or too short.
    const rangeGuard = Guard.inRange(description.length, 1, BUILDING_DESC_MAX_LENGTH, argName);
    if (!rangeGuard.succeeded) {
      return Result.fail<BuildingDescription>(rangeGuard.message, FailureType.InvalidInput);
    }

    // Check if the description is alphanumeric.
    const alphanumericGuard = Guard.onlyContainsAlphanumericsAndSpaces(description, argName);
    if (!alphanumericGuard.succeeded) {
      return Result.fail<BuildingDescription>(alphanumericGuard.message, FailureType.InvalidInput);
    }

    // If all the checks pass, return the description.
    return Result.ok<BuildingDescription>(new BuildingDescription({ value: description }));
  }
}
