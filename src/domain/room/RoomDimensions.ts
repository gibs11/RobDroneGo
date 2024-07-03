import { ValueObject } from '../../core/domain/ValueObject';
import { Result } from '../../core/logic/Result';
import { Guard } from '../../core/logic/Guard';
import { Position } from './Position';

interface RoomDimensionsProps {
  initialPosition: Position;
  finalPosition: Position;
}

export class RoomDimensions extends ValueObject<RoomDimensionsProps> {
  private constructor(props: RoomDimensionsProps) {
    super(props);
  }

  get initialPosition(): Position {
    return this.props.initialPosition;
  }

  get finalPosition(): Position {
    return this.props.finalPosition;
  }

  public static create(initialPosition: Position, finalPosition: Position): Result<RoomDimensions> {
    const argName1 = 'Initial position';
    const argName2 = 'Final position';

    // Check if the initialPosition is null or undefined.
    const guardResult = Guard.againstNullOrUndefined(initialPosition, argName1);
    if (!guardResult.succeeded) {
      return Result.fail<RoomDimensions>(guardResult.message);
    }

    // Check if the finalPosition is null or undefined.
    const guardResult2 = Guard.againstNullOrUndefined(finalPosition, argName2);
    if (!guardResult2.succeeded) {
      return Result.fail<RoomDimensions>(guardResult2.message);
    }

    // Check if the initialPosition is equal to the finalPosition.
    if (
      initialPosition.xPosition === finalPosition.xPosition &&
      initialPosition.yPosition === finalPosition.yPosition
    ) {
      return Result.fail<RoomDimensions>('Initial position cannot be equal to final position.');
    }

    // Check if the initialPosition is greater than the finalPosition.
    if (initialPosition.xPosition > finalPosition.xPosition || initialPosition.yPosition > finalPosition.yPosition) {
      return Result.fail<RoomDimensions>('Initial position cannot be greater than final position.');
    }

    // Success
    return Result.ok<RoomDimensions>(
      new RoomDimensions({ initialPosition: initialPosition, finalPosition: finalPosition }),
    );
  }
}
