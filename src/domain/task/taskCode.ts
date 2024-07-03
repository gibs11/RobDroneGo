import { ValueObject } from '../../core/domain/ValueObject';
import { FailureType, Result } from '../../core/logic/Result';
import { Guard } from '../../core/logic/Guard';

interface TaskCodeProps {
  value: number;
}

export class TaskCode extends ValueObject<TaskCodeProps> {
  get value(): number {
    return this.props.value;
  }

  private constructor(props: TaskCodeProps) {
    super(props);
  }

  public static create(taskCode: number): Result<TaskCode> {
    // Name for the argument to be used in the guard.
    const argName = 'Task code';

    // Check if the taskCode is a string.
    if (typeof taskCode !== 'number') {
      return Result.fail<TaskCode>(`${argName} is not a number.`, FailureType.InvalidInput);
    }

    // Check if the taskCode is integer.
    const guardResultInteger = Guard.isInteger(taskCode, argName);
    if (!guardResultInteger.succeeded) {
      return Result.fail<TaskCode>(guardResultInteger.message, FailureType.InvalidInput);
    }

    // Check if the taskCode is positive.
    if (taskCode <= 0) {
      return Result.fail<TaskCode>(`${argName} is negative.`, FailureType.InvalidInput);
    }

    // If all the checks pass, return the taskCode.
    return Result.ok<TaskCode>(new TaskCode({ value: taskCode }));
  }
}
