export interface IGuardResult {
  succeeded: boolean;
  message?: string;
}

export interface IGuardArgument {
  argument: any;
  argumentName: string;
}

export type GuardArgumentCollection = IGuardArgument[];

export class Guard {
  public static combine(guardResults: IGuardResult[]): IGuardResult {
    for (const result of guardResults) {
      if (result.succeeded === false) return result;
    }

    return { succeeded: true };
  }

  public static againstNullOrUndefined(argument: any, argumentName: string): IGuardResult {
    if (argument === null || argument === undefined) {
      return { succeeded: false, message: `${argumentName} is null or undefined` };
    } else {
      return { succeeded: true };
    }
  }

  public static againstNullOrUndefinedBulk(args: GuardArgumentCollection): IGuardResult {
    for (const arg of args) {
      const result = this.againstNullOrUndefined(arg.argument, arg.argumentName);
      if (!result.succeeded) return result;
    }

    return { succeeded: true };
  }

  public static isOneOf(value: any, validValues: any[], argumentName: string): IGuardResult {
    let isValid = false;
    for (const validValue of validValues) {
      if (value === validValue) {
        isValid = true;
      }
    }

    if (isValid) {
      return { succeeded: true };
    } else {
      return {
        succeeded: false,
        message: `${argumentName} isn't oneOf the correct types in ${JSON.stringify(validValues)}. Got "${value}".`,
      };
    }
  }

  public static inRange(num: number, min: number, max: number, argumentName: string): IGuardResult {
    const isInRange = num >= min && num <= max;
    if (!isInRange) {
      return { succeeded: false, message: `${argumentName} is not within range ${min} to ${max}.` };
    } else {
      return { succeeded: true };
    }
  }

  public static allInRange(numbers: number[], min: number, max: number, argumentName: string): IGuardResult {
    let failingResult: IGuardResult = null;
    for (const num of numbers) {
      const numIsInRangeResult = this.inRange(num, min, max, argumentName);
      if (!numIsInRangeResult.succeeded) failingResult = numIsInRangeResult;
    }

    if (failingResult) {
      return { succeeded: false, message: `${argumentName} is not within the range.` };
    } else {
      return { succeeded: true };
    }
  }

  public static onlyContainsAlphanumericsAndSpaces(value: string, argumentName: string): IGuardResult {
    const regex = /^[A-Za-z0-9\s]+$/g;
    const isValid = regex.test(removeAccents(value));
    if (!isValid) {
      return { succeeded: false, message: `${argumentName} can only contain alphanumeric characters and spaces.` };
    } else {
      return { succeeded: true };
    }
  }

  static onlyContainsSpaces(designation: string, argName: string) {
    const regex = /^\s+$/g;
    const isValid = regex.test(designation);
    if (!isValid) {
      return { succeeded: false, message: `${argName} can only contain spaces.` };
    }
    return { succeeded: true };
  }

  static isInteger(serialNumber: number, argName: string) {
    const isValid = Number.isInteger(serialNumber);
    if (!isValid) {
      return { succeeded: false, message: `${argName} must be an integer.` };
    }
    return { succeeded: true };
  }
}

function removeAccents(input: string) {
  return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
