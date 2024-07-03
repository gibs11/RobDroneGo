import { ValueObject } from '../../core/domain/ValueObject';
import { FailureType, Result } from '../../core/logic/Result';
import { Guard } from '../../core/logic/Guard';
import config from '../../../config';

interface RobisepNicknameProps {
  nickname: string;
}

const NICKNAME_MAX_LENGTH = config.configurableValues.robisep.nicknameMaxLength;

export class RobisepNickname extends ValueObject<RobisepNicknameProps> {
  private constructor(props: RobisepNicknameProps) {
    super(props);
  }

  get value(): string {
    return this.props.nickname;
  }

  public static create(nickname: string): Result<RobisepNickname> {
    const argName = 'Nickname';

    // Check if the code is null or undefined.
    const guardResult = Guard.againstNullOrUndefined(nickname, argName);
    if (!guardResult.succeeded) {
      return Result.fail<RobisepNickname>(guardResult.message, FailureType.InvalidInput);
    }

    // Check if the code is too long or too short.
    const rangeGuardResult = Guard.inRange(nickname.length, 1, NICKNAME_MAX_LENGTH, argName);
    if (!rangeGuardResult.succeeded) {
      return Result.fail<RobisepNickname>(rangeGuardResult.message, FailureType.InvalidInput);
    }

    // Check if it only contains spaces/tabs
    const onlySpacesGuardResult = Guard.onlyContainsSpaces(nickname, argName);
    if (onlySpacesGuardResult.succeeded) {
      return Result.fail<RobisepNickname>(
        'Nickname must contain at least one alphanumeric character.',
        FailureType.InvalidInput,
      );
    }

    // Check if is alphanumeric
    const alphanumericGuardResult = Guard.onlyContainsAlphanumericsAndSpaces(nickname, argName);
    if (!alphanumericGuardResult.succeeded) {
      return Result.fail<RobisepNickname>('Nickname must be alphanumeric.', FailureType.InvalidInput);
    }

    // Success
    return Result.ok<RobisepNickname>(new RobisepNickname({ nickname: nickname.trim() }));
  }
}
