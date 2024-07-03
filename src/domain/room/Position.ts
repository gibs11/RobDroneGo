import { ValueObject } from '../../core/domain/ValueObject';
import { Result } from '../../core/logic/Result';
import { Guard } from '../../core/logic/Guard';

interface PositionProps {
  xPosition: number;
  yPosition: number;
}

export class Position extends ValueObject<PositionProps> {
  private constructor(props: PositionProps) {
    super(props);
  }

  get xPosition(): number {
    return this.props.xPosition;
  }

  get yPosition(): number {
    return this.props.yPosition;
  }

  public static create(xPosition: number, yPosition: number): Result<Position> {
    const argName1 = 'XPosition';
    const argName2 = 'YPosition';

    // Check if the xPosition is null or undefined.
    const guardResult = Guard.againstNullOrUndefined(xPosition, argName1);
    if (!guardResult.succeeded) {
      return Result.fail<Position>(guardResult.message);
    }

    // Check if the yPosition is null or undefined.
    const guardResult2 = Guard.againstNullOrUndefined(yPosition, argName1);
    if (!guardResult2.succeeded) {
      return Result.fail<Position>(guardResult2.message);
    }

    const integerGuardResult = Guard.isInteger(xPosition, argName1);
    if (!integerGuardResult.succeeded) {
      return Result.fail<Position>(integerGuardResult.message);
    }

    const integerGuardResult2 = Guard.isInteger(yPosition, argName2);
    if (!integerGuardResult2.succeeded) {
      return Result.fail<Position>(integerGuardResult2.message);
    }

    // Check if the xPosition is positive.
    if (xPosition < 0) {
      return Result.fail<Position>('XPosition must be positive.');
    }

    // Check if the yPosition is positive.
    if (yPosition < 0) {
      return Result.fail<Position>('YPosition must be positive.');
    }

    // Success
    return Result.ok<Position>(new Position({ xPosition: xPosition, yPosition: yPosition }));
  }
}
