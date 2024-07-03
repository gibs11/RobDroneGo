import { ValueObject } from '../../core/domain/ValueObject';
import { Guard } from '../../core/logic/Guard';
import { FailureType, Result } from '../../core/logic/Result';

interface PersonalNameProps {
  value: string;
}

export class PersonalName extends ValueObject<PersonalNameProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: PersonalNameProps) {
    super(props);
  }

  public static create(personalName: string): Result<PersonalName> {
    // Name for the argument to be used in the guard.
    const argName = 'Personal Name';

    // Check if the personal name is a string.
    if (typeof personalName !== 'string') {
      return Result.fail<PersonalName>(`${argName} is not a string.`, FailureType.InvalidInput);
    }

    // Check if the personal name is not empty.
    const guardResultWhitespace = Guard.onlyContainsSpaces(personalName, argName);
    if (guardResultWhitespace.succeeded) {
      return Result.fail<PersonalName>(`${argName} only contains whitespace.`, FailureType.InvalidInput);
    }

    // If all the checks pass, return the personal name.
    return Result.ok<PersonalName>(new PersonalName({ value: personalName }));
  }
}
