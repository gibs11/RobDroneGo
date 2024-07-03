import { ValueObject } from '../../core/domain/ValueObject';
import { FailureType, Result } from '../../core/logic/Result';
import { Guard } from '../../core/logic/Guard';

import config from '../../../config';

const MAX_FLOOR_DESCRIPTION_LENGTH = config.configurableValues.floor.maxFloorDescriptionLength;

interface FloorDescriptionProps {
  value: string;
}

export class FloorDescription extends ValueObject<FloorDescriptionProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: FloorDescriptionProps) {
    super(props);
  }

  public static create(floorDescription: string): Result<FloorDescription> {
    // Name for the argument to be used in the guard.
    const argName = 'Floor Description';

    // Check if the description is a string.
    if (typeof floorDescription !== 'string') {
      return Result.fail<FloorDescription>(`${argName} is not a string.`, FailureType.InvalidInput);
    }

    // Check if the description is not only whitespace.
    const guardResultWhitespace = Guard.onlyContainsSpaces(floorDescription, argName);

    if (guardResultWhitespace.succeeded) {
      return Result.fail<FloorDescription>('Description only contains whitespaces.', FailureType.InvalidInput);
    }

    // Check if the description is too short or too long.
    const guardResultLength = Guard.inRange(floorDescription.length, 1, MAX_FLOOR_DESCRIPTION_LENGTH, argName);

    if (!guardResultLength.succeeded) {
      return Result.fail<FloorDescription>(guardResultLength.message, FailureType.InvalidInput);
    }

    // If all the checks pass, return the description.
    return Result.ok<FloorDescription>(new FloorDescription({ value: floorDescription }));
  }
}
