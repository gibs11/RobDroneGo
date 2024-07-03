import { Result } from '../../core/logic/Result';
import { Guard } from '../../core/logic/Guard';
import { RoomName } from './RoomName';
import { RoomDimensions } from './RoomDimensions';
import { RoomDescription } from './RoomDescription';
import { Position } from './Position';
import { AggregateRoot } from '../../core/domain/AggregateRoot';
import { UniqueEntityID } from '../../core/domain/UniqueEntityID';
import { Floor } from '../floor/floor';
import { RoomCategory } from './RoomCategory';
import { DoorOrientation } from './DoorOrientation';

interface RoomProps {
  name: RoomName;
  description: RoomDescription;
  category: RoomCategory;
  dimensions: RoomDimensions;
  doorPosition: Position;
  doorOrientation: DoorOrientation;
  floor: Floor;
}

export class Room extends AggregateRoot<RoomProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get name(): RoomName {
    return this.props.name;
  }

  get description(): RoomDescription {
    return this.props.description;
  }

  get category(): RoomCategory {
    return this.props.category;
  }

  get dimensions(): RoomDimensions {
    return this.props.dimensions;
  }

  get doorPosition(): Position {
    return this.props.doorPosition;
  }

  get doorOrientation(): DoorOrientation {
    return this.props.doorOrientation;
  }

  get floor(): Floor {
    return this.props.floor;
  }

  private constructor(props: RoomProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: RoomProps, id?: UniqueEntityID): Result<Room> {
    const guardProps = [
      { argument: props.name, argumentName: 'Name' },
      { argument: props.description, argumentName: 'Description' },
      { argument: props.category, argumentName: 'Category' },
      { argument: props.dimensions, argumentName: 'Dimensions' },
      { argument: props.doorPosition, argumentName: 'DoorPosition' },
      { argument: props.doorOrientation, argumentName: 'DoorOrientation' },
      { argument: props.floor, argumentName: 'Floor' },
    ];

    // Guard against nulls and undefined
    const guardResult = Guard.againstNullOrUndefinedBulk(guardProps);
    if (!guardResult.succeeded) {
      return Result.fail<Room>(guardResult.message);
    }

    // Validate dimensions
    const buildingLength = props.floor.building.dimensions.length;
    const buildingWidth = props.floor.building.dimensions.width;

    if (
      props.dimensions.finalPosition.xPosition > buildingWidth - 1 ||
      props.dimensions.finalPosition.yPosition > buildingLength - 1
    ) {
      return Result.fail<Room>('Room dimensions are out of bounds.');
    }

    // Success
    return Result.ok<Room>(new Room(props, id));
  }
}
