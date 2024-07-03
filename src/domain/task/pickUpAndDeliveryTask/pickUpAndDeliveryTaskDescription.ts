import { ValueObject } from '../../../core/domain/ValueObject';
import { FailureType, Result } from '../../../core/logic/Result';
import { Guard } from '../../../core/logic/Guard';

import config from '../../../../config';

const MAX_DESCRIPTION_LENGTH = config.configurableValues.task.pickUpAndDeliveryTask.descriptionMaxLength;

interface PickUpAndDeliveryTaskDescriptionProps {
  value: string;
}

export class PickUpAndDeliveryTaskDescription extends ValueObject<PickUpAndDeliveryTaskDescriptionProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: PickUpAndDeliveryTaskDescriptionProps) {
    super(props);
  }

  public static create(pickUpAndDeliveryTaskDescription: string): Result<PickUpAndDeliveryTaskDescription> {
    // Name for the argument to be used in the guard.
    const argName = 'Pick up and delivery task description';

    // Check if the pickUpAndDeliveryTaskDescription is a string.
    if (typeof pickUpAndDeliveryTaskDescription !== 'string') {
      return Result.fail<PickUpAndDeliveryTaskDescription>(`${argName} is not a string.`, FailureType.InvalidInput);
    }

    // Check if the pickUpAndDeliveryTaskDescription is not only whitespace.
    const guardResultWhitespace = Guard.onlyContainsSpaces(pickUpAndDeliveryTaskDescription, argName);
    if (guardResultWhitespace.succeeded) {
      return Result.fail<PickUpAndDeliveryTaskDescription>(
        `${argName} only contains whitespace.`,
        FailureType.InvalidInput,
      );
    }

    // Check if the pickUpAndDeliveryTaskDescription is too short or too long.
    const guardResultLength = Guard.inRange(
      pickUpAndDeliveryTaskDescription.length,
      1,
      MAX_DESCRIPTION_LENGTH,
      argName,
    );
    if (!guardResultLength.succeeded) {
      return Result.fail<PickUpAndDeliveryTaskDescription>(guardResultLength.message, FailureType.InvalidInput);
    }

    // If all the checks pass, return the pickUpAndDeliveryTaskDescription.
    return Result.ok<PickUpAndDeliveryTaskDescription>(
      new PickUpAndDeliveryTaskDescription({ value: pickUpAndDeliveryTaskDescription }),
    );
  }
}
