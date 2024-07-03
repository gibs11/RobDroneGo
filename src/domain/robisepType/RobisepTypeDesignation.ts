import { ValueObject } from '../../core/domain/ValueObject';
import { FailureType, Result } from '../../core/logic/Result';
import { Guard } from '../../core/logic/Guard';
import config from '../../../config';

const DESIGNATION_MAX_LENGTH = config.configurableValues.robisepType.designationMaxLenght;

interface RobisepTypeDesignationProps {
  designation: string;
}

export class RobisepTypeDesignation extends ValueObject<RobisepTypeDesignationProps> {
  private constructor(props: RobisepTypeDesignationProps) {
    super(props);
  }

  get value(): string {
    return this.props.designation;
  }

  public static create(designation: string): Result<RobisepTypeDesignation> {
    const argName = 'Designation';

    // Check if the code is null or undefined.
    const guardResult = Guard.againstNullOrUndefined(designation, argName);
    if (!guardResult.succeeded) {
      return Result.fail<RobisepTypeDesignation>(guardResult.message);
    }

    // Check if the code is too long or too short.
    const rangeGuardResult = Guard.inRange(designation.length, 1, DESIGNATION_MAX_LENGTH, argName);
    if (!rangeGuardResult.succeeded) {
      return Result.fail<RobisepTypeDesignation>(rangeGuardResult.message);
    }

    // Check if is alphanumeric
    const alphanumericGuardResult = Guard.onlyContainsAlphanumericsAndSpaces(designation, argName);
    if (!alphanumericGuardResult.succeeded) {
      return Result.fail<RobisepTypeDesignation>('Designation must be alphanumeric.', FailureType.InvalidInput);
    }

    // Check if it only contains spaces/tabs
    const onlySpacesGuardResult = Guard.onlyContainsSpaces(designation, argName);
    if (onlySpacesGuardResult.succeeded) {
      return Result.fail<RobisepTypeDesignation>(
        'Designation must contain at least one alphanumeric character.',
        FailureType.InvalidInput,
      );
    }

    // Success
    return Result.ok<RobisepTypeDesignation>(new RobisepTypeDesignation({ designation: designation.trim() }));
  }
}
