import { ValueObject } from '../../core/domain/ValueObject';
import config from '../../../config';
import { FailureType, Result } from '../../core/logic/Result';
import { Guard } from '../../core/logic/Guard';

interface ElevatorPositionProps {
  xposition: number;
  yposition: number;
}

const MIN_X_POS = config.configurableValues.elevator.minXPosition;
const MIN_Y_POS = config.configurableValues.elevator.minYPosition;

export class ElevatorPosition extends ValueObject<ElevatorPositionProps> {
  get xposition(): number {
    return this.props.xposition;
  }

  get yposition(): number {
    return this.props.yposition;
  }

  private constructor(props: ElevatorPositionProps) {
    super(props);
  }

  public static create(epProps: ElevatorPositionProps): Result<ElevatorPosition> {
    const guardedProps = [
      { argument: epProps.xposition, argumentName: 'xpos' },
      { argument: epProps.yposition, argumentName: 'ypos' },
    ];

    // Assure that the props are not null or undefined.
    const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);
    if (!guardResult.succeeded) {
      return Result.fail<ElevatorPosition>(guardResult.message, FailureType.InvalidInput);
    }

    // Assure that the props are greater than 0 or 0.
    const validDimensions = epProps.xposition >= MIN_X_POS && epProps.yposition >= MIN_Y_POS;
    if (!validDimensions) {
      return Result.fail<ElevatorPosition>('Elevator positions must be greater than 0', FailureType.InvalidInput);
    }

    // If all the checks pass, return the dimensions.
    return Result.ok<ElevatorPosition>(new ElevatorPosition(epProps));
  }
}
