import { ValueObject } from '../../core/domain/ValueObject';
import { FailureType, Result } from '../../core/logic/Result';
import { Guard } from '../../core/logic/Guard';
import config from '../../../config';

interface RoomDescriptionProps {
  value: string;
}

export class RoomDescription extends ValueObject<RoomDescriptionProps> {
  private constructor(props: RoomDescriptionProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(description: string): Result<RoomDescription> {
    const argName = 'Room description';

    // Check if the description is null or undefined.
    const guardResult = Guard.againstNullOrUndefined(description, argName);
    if (!guardResult.succeeded) {
      return Result.fail<RoomDescription>(guardResult.message);
    }

    // Check if the description is too long or too short.
    const rangeGuardResult = Guard.inRange(
      description.length,
      1,
      config.configurableValues.room.maxDescriptionLength,
      argName,
    );
    if (!rangeGuardResult.succeeded) {
      return Result.fail<RoomDescription>(rangeGuardResult.message);
    }

    // Check if is alphanumeric
    const alphanumericGuardResult = Guard.onlyContainsAlphanumericsAndSpaces(description, argName);
    if (!alphanumericGuardResult.succeeded) {
      return Result.fail<RoomDescription>('Room description must be alphanumeric.', FailureType.InvalidInput);
    }

    // Check if it only contains spaces/tabs
    const onlySpacesGuardResult = Guard.onlyContainsSpaces(description, argName);
    if (onlySpacesGuardResult.succeeded) {
      return Result.fail<RoomDescription>(
        'Room description must contain at least one alphanumeric character.',
        FailureType.InvalidInput,
      );
    }

    // Success
    return Result.ok<RoomDescription>(new RoomDescription({ value: description.trim() }));
  }
}
