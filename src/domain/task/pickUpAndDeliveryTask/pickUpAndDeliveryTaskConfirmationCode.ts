import { ValueObject } from '../../../core/domain/ValueObject';
import { FailureType, Result } from '../../../core/logic/Result';
import { Guard } from '../../../core/logic/Guard';

import config from '../../../../config';

const MIN_CONFIRMATION_CODE_VALUE = config.configurableValues.task.pickUpAndDeliveryTask.confirmationCodeMinValue;
const MAX_CONFIRMATION_CODE_VALUE = config.configurableValues.task.pickUpAndDeliveryTask.confirmationCodeMaxValue;

interface PickUpAndDeliveryTaskConfirmationCodeProps {
  value: number;
}

export class PickUpAndDeliveryTaskConfirmationCode extends ValueObject<PickUpAndDeliveryTaskConfirmationCodeProps> {
  get value(): number {
    return this.props.value;
  }

  private constructor(props: PickUpAndDeliveryTaskConfirmationCodeProps) {
    super(props);
  }

  public static create(pickUpAndDeliveryTaskConfirmationCode: number): Result<PickUpAndDeliveryTaskConfirmationCode> {
    // Name for the argument to be used in the guard.
    const argName = 'Pick up and delivery task confirmation code';

    // Check if the pickUpAndDeliveryTaskConfirmationCode is a string.
    if (typeof pickUpAndDeliveryTaskConfirmationCode !== 'number') {
      return Result.fail<PickUpAndDeliveryTaskConfirmationCode>(
        `${argName} is not a number.`,
        FailureType.InvalidInput,
      );
    }

    // Check if the pickUpAndDeliveryTaskConfirmationCode is integer.
    const guardResultInteger = Guard.isInteger(pickUpAndDeliveryTaskConfirmationCode, argName);
    if (!guardResultInteger.succeeded) {
      return Result.fail<PickUpAndDeliveryTaskConfirmationCode>(guardResultInteger.message, FailureType.InvalidInput);
    }

    // Check if the pickUpAndDeliveryTaskConfirmationCode is in range, from 4 to 6 digits.
    const guardResultPositive = Guard.inRange(
      pickUpAndDeliveryTaskConfirmationCode,
      MIN_CONFIRMATION_CODE_VALUE,
      MAX_CONFIRMATION_CODE_VALUE,
      argName,
    );
    if (!guardResultPositive.succeeded) {
      return Result.fail<PickUpAndDeliveryTaskConfirmationCode>(
        `Task confirmation code must be in the range from ${MIN_CONFIRMATION_CODE_VALUE} to ${MAX_CONFIRMATION_CODE_VALUE}.`,
        FailureType.InvalidInput,
      );
    }

    // If all the checks pass, return the pickUpAndDeliveryTaskConfirmationCode.
    return Result.ok<PickUpAndDeliveryTaskConfirmationCode>(
      new PickUpAndDeliveryTaskConfirmationCode({ value: pickUpAndDeliveryTaskConfirmationCode }),
    );
  }
}
