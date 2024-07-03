import { ValueObject } from '../../core/domain/ValueObject';
import { FailureType, Result } from '../../core/logic/Result';

import config from '../../../config';
import { Guard } from '../../core/logic/Guard';

interface PhoneNumberProps {
  value: string;
}

export class PhoneNumber extends ValueObject<PhoneNumberProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: PhoneNumberProps) {
    super(props);
  }

  public static create(phoneNumber: string): Result<PhoneNumber> {
    // Name for the argument to be used in the guard.
    const argName = 'Phone Number';

    // Check if the phone number is a string.
    if (typeof phoneNumber !== 'string') {
      return Result.fail<PhoneNumber>(`${argName} is not a string.`, FailureType.InvalidInput);
    }

    // Check if the phone number is not empty.
    const guardResultWhitespace = Guard.onlyContainsSpaces(phoneNumber, argName);
    if (guardResultWhitespace.succeeded) {
      return Result.fail<PhoneNumber>(`${argName} only contains whitespace.`, FailureType.InvalidInput);
    }

    // Remove all the whitespace from the phone number.
    phoneNumber = phoneNumber.replace(/\s/g, '');

    // Check if the phone number is valid.
    if (!PhoneNumber.isPhoneNumberValid(phoneNumber)) {
      return Result.fail<PhoneNumber>(`${argName} is not following a valid format.`, FailureType.InvalidInput);
    }

    // If all the checks pass, return the phone number.
    return Result.ok<PhoneNumber>(new PhoneNumber({ value: phoneNumber }));
  }

  /**
   * Currently the only supported phone number format is the Portuguese format.
   * This method was built, having in mind that in the future, other formats might be supported.
   * @param phoneNumber The phone number to check.
   */
  private static isPhoneNumberValid(phoneNumber: string): boolean {
    // Check if the phone number matches one of the available formats.
    for (const regex of config.configurableValues.phoneNumber.formats) {
      if (regex.test(phoneNumber)) {
        return true;
      }
    }

    // If none of the formats match, return false.
    return false;
  }
}
