import { AggregateRoot } from '../../core/domain/AggregateRoot';
import { UniqueEntityID } from '../../core/domain/UniqueEntityID';

import { Guard } from '../../core/logic/Guard';
import { FailureType, Result } from '../../core/logic/Result';
import { Coordinates } from '../common/coordinates';
import { Floor } from '../floor/floor';
import { PassagePoint } from './passagePoint';

interface PassageProps {
  passageStartPoint: PassagePoint;
  passageEndPoint: PassagePoint;
}

export class Passage extends AggregateRoot<PassageProps> {
  // Returns the passage's id.
  get id(): UniqueEntityID {
    return this._id;
  }

  // Returns the passage start point.
  get startPoint(): PassagePoint {
    return this.props.passageStartPoint;
  }

  // Returns the passage end point.
  get endPoint(): PassagePoint {
    return this.props.passageEndPoint;
  }

  private constructor(props: PassageProps, id?: UniqueEntityID) {
    super(props, id);
  }

  // Updates the passage start point.
  updateStartPoint(
    floor: Floor,
    firstCoordinatesX: number,
    firstCoordinatesY: number,
    lastCoordinatesX: number,
    lastCoordinatesY: number,
  ): Result<void> {
    const firstCoordinatesProps = {
      x: firstCoordinatesX,
      y: firstCoordinatesY,
    };
    const lastCoordinatesProps = {
      x: lastCoordinatesX,
      y: lastCoordinatesY,
    };

    const firstCoordinatesOrError = Coordinates.create(firstCoordinatesProps);
    if (firstCoordinatesOrError.isFailure) {
      return Result.fail<void>(firstCoordinatesOrError.errorMessage(), FailureType.InvalidInput);
    }

    const lastCoordinatesOrError = Coordinates.create(lastCoordinatesProps);
    if (lastCoordinatesOrError.isFailure) {
      return Result.fail<void>(lastCoordinatesOrError.errorMessage(), FailureType.InvalidInput);
    }

    const startPointProps = {
      floor: floor,
      firstCoordinates: firstCoordinatesOrError.getValue(),
      lastCoordinates: lastCoordinatesOrError.getValue(),
    };
    const startPointOrError = PassagePoint.create(startPointProps);

    if (startPointOrError.isFailure) {
      return Result.fail<void>(startPointOrError.errorMessage(), FailureType.InvalidInput);
    }

    this.props.passageStartPoint = startPointOrError.getValue();
    return Result.ok<void>();
  }

  // Updates the passage end point.
  updateEndPoint(
    floor: Floor,
    firstCoordinatesX: number,
    firstCoordinatesY: number,
    lastCoordinatesX: number,
    lastCoordinatesY: number,
  ): Result<void> {
    const firstCoordinatesProps = {
      x: firstCoordinatesX,
      y: firstCoordinatesY,
    };
    const lastCoordinatesProps = {
      x: lastCoordinatesX,
      y: lastCoordinatesY,
    };

    const firstCoordinatesOrError = Coordinates.create(firstCoordinatesProps);
    if (firstCoordinatesOrError.isFailure) {
      return Result.fail<void>(firstCoordinatesOrError.errorMessage(), FailureType.InvalidInput);
    }

    const lastCoordinatesOrError = Coordinates.create(lastCoordinatesProps);
    if (lastCoordinatesOrError.isFailure) {
      return Result.fail<void>(lastCoordinatesOrError.errorMessage(), FailureType.InvalidInput);
    }

    const endPointProps = {
      floor: floor,
      firstCoordinates: firstCoordinatesOrError.getValue(),
      lastCoordinates: lastCoordinatesOrError.getValue(),
    };
    const endPointOrError = PassagePoint.create(endPointProps);

    if (endPointOrError.isFailure) {
      return Result.fail<void>(endPointOrError.errorMessage(), FailureType.InvalidInput);
    }

    this.props.passageEndPoint = endPointOrError.getValue();
    return Result.ok<void>();
  }

  // Creates a new passage.
  public static create(props: PassageProps, id?: UniqueEntityID): Result<Passage> {
    // Verifies if the provided props are not null or undefined.
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.passageStartPoint, argumentName: 'passageStartPoint' },
      { argument: props.passageEndPoint, argumentName: 'passageEndPoint' },
    ]);
    if (!guardResult.succeeded) {
      return Result.fail<Passage>(guardResult.message, FailureType.InvalidInput);
    }

    // Verifies if the passage start and end point buildings are the same
    if (props.passageStartPoint.floor.building.id.toString() === props.passageEndPoint.floor.building.id.toString()) {
      return Result.fail<Passage>(
        "You can't create a passage between floors of the same building.",
        FailureType.InvalidInput,
      );
    }

    return Result.ok<Passage>(new Passage(props, id));
  }
}
