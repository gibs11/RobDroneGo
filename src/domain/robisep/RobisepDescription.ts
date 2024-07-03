import { ValueObject } from '../../core/domain/ValueObject';
import { FailureType, Result } from '../../core/logic/Result';
import { Guard } from '../../core/logic/Guard';
import config from '../../../config';

const DESCRIPTION_MAX_LENGTH = config.configurableValues.robisep.descriptionMaxLength;

interface RobisepDescriptionProps {
  value: string;
}

export class RobisepDescription extends ValueObject<RobisepDescriptionProps> {
  private constructor(props: RobisepDescriptionProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(description: string): Result<RobisepDescription> {
    const argName = 'Description';

    // Check if the code is null or undefined.
    const guardResult = Guard.againstNullOrUndefined(description, argName);
    if (!guardResult.succeeded) {
      return Result.fail<RobisepDescription>(guardResult.message, FailureType.InvalidInput);
    }

    // Check if the code is too long or too short.
    const rangeGuardResult = Guard.inRange(description.length, 1, DESCRIPTION_MAX_LENGTH, argName);
    if (!rangeGuardResult.succeeded) {
      return Result.fail<RobisepDescription>(rangeGuardResult.message, FailureType.InvalidInput);
    }

    // Check if it only contains spaces/tabs
    const onlySpacesGuardResult = Guard.onlyContainsSpaces(description, argName);
    if (onlySpacesGuardResult.succeeded) {
      return Result.fail<RobisepDescription>('Description cannot contain only spaces/tabs.', FailureType.InvalidInput);
    }

    // Check if it is alphanumeric
    const alphanumericGuardResult = Guard.onlyContainsAlphanumericsAndSpaces(description, argName);
    if (!alphanumericGuardResult.succeeded) {
      return Result.fail<RobisepDescription>('Description must be alphanumeric.', FailureType.InvalidInput);
    }

    // Success
    return Result.ok<RobisepDescription>(new RobisepDescription({ value: description.trim() }));
  }
}
