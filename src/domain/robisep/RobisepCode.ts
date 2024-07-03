import { ValueObject } from '../../core/domain/ValueObject';
import { FailureType, Result } from '../../core/logic/Result';
import { Guard } from '../../core/logic/Guard';
import config from '../../../config';

interface RobisepCodeProps {
  code: string;
}

const CODE_MAX_LENGTH = config.configurableValues.robisep.codeMaxLength;

export class RobisepCode extends ValueObject<RobisepCodeProps> {
  private constructor(props: RobisepCodeProps) {
    super(props);
  }

  get value(): string {
    return this.props.code;
  }

  public static create(code: string): Result<RobisepCode> {
    const argName = 'Code';

    // Check if the code is null or undefined.
    const guardResult = Guard.againstNullOrUndefined(code, argName);
    if (!guardResult.succeeded) {
      return Result.fail<RobisepCode>(guardResult.message);
    }

    // Check if the code is too long or too short.
    const rangeGuardResult = Guard.inRange(code.length, 1, CODE_MAX_LENGTH, argName);
    if (!rangeGuardResult.succeeded) {
      return Result.fail<RobisepCode>(rangeGuardResult.message);
    }

    // Check if it only contains spaces/tabs
    const onlySpacesGuardResult = Guard.onlyContainsSpaces(code, argName);
    if (onlySpacesGuardResult.succeeded) {
      return Result.fail<RobisepCode>(
        'Code must contain at least one alphanumeric character.',
        FailureType.InvalidInput,
      );
    }

    // Check if it is alphanumeric
    const alphanumericGuardResult = Guard.onlyContainsAlphanumericsAndSpaces(code, argName);
    if (!alphanumericGuardResult.succeeded) {
      return Result.fail<RobisepCode>('Code must be alphanumeric.', FailureType.InvalidInput);
    }

    // Success
    return Result.ok<RobisepCode>(new RobisepCode({ code: code.trim() }));
  }
}
