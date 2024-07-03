import { ValueObject } from '../../core/domain/ValueObject';
import { FailureType, Result } from '../../core/logic/Result';
import { Guard } from '../../core/logic/Guard';
import config from '../../../config';

const NAME_MAX_LENGTH = config.configurableValues.room.nameMaxLength;

interface RoomNameProps {
  value: string;
}

export class RoomName extends ValueObject<RoomNameProps> {
  private constructor(props: RoomNameProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(name: string): Result<RoomName> {
    const argName = 'Room name';

    // Check if the name is null or undefined.
    const guardResult = Guard.againstNullOrUndefined(name, argName);
    if (!guardResult.succeeded) {
      return Result.fail<RoomName>(guardResult.message);
    }

    // Check if the name is too long or too short.
    const rangeGuardResult = Guard.inRange(name.length, 1, NAME_MAX_LENGTH, argName);
    if (!rangeGuardResult.succeeded) {
      return Result.fail<RoomName>(rangeGuardResult.message);
    }

    // Check if is alphanumeric
    const alphanumericGuardResult = Guard.onlyContainsAlphanumericsAndSpaces(name, argName);
    if (!alphanumericGuardResult.succeeded) {
      return Result.fail<RoomName>('Room name must be alphanumeric.', FailureType.InvalidInput);
    }

    // Check if it only contains spaces/tabs
    const onlySpacesGuardResult = Guard.onlyContainsSpaces(name, argName);
    if (onlySpacesGuardResult.succeeded) {
      return Result.fail<RoomName>(
        'Room name must contain at least one alphanumeric character.',
        FailureType.InvalidInput,
      );
    }

    // Success
    return Result.ok<RoomName>(new RoomName({ value: name.trim() }));
  }
}
