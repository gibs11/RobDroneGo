import { RobisepNickname } from './RobisepNickname';
import { RobisepSerialNumber } from './RobisepSerialNumber';
import { RobisepState } from './RobisepState';
import { AggregateRoot } from '../../core/domain/AggregateRoot';
import { Guard } from '../../core/logic/Guard';
import { FailureType, Result } from '../../core/logic/Result';
import { RobisepType } from '../robisepType/RobisepType';
import { RobisepCode } from './RobisepCode';
import { UniqueEntityID } from '../../core/domain/UniqueEntityID';
import { RobisepDescription } from './RobisepDescription';
import { Room } from '../room/Room';

interface RobisepProps {
  nickname: RobisepNickname;
  serialNumber: RobisepSerialNumber;
  code: RobisepCode;
  description?: RobisepDescription;
  robisepType: RobisepType;
  state: RobisepState;
  roomId: Room;
}

export class Robisep extends AggregateRoot<RobisepProps> {
  private constructor(props: RobisepProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get id(): UniqueEntityID {
    return this._id;
  }

  get nickname(): RobisepNickname {
    return this.props.nickname;
  }

  get serialNumber(): RobisepSerialNumber {
    return this.props.serialNumber;
  }

  get code(): RobisepCode {
    return this.props.code;
  }

  get description(): RobisepDescription {
    return this.props.description;
  }

  get robisepType(): RobisepType {
    return this.props.robisepType;
  }

  get state(): RobisepState {
    return this.props.state;
  }

  get roomId(): Room {
    return this.props.roomId;
  }

  public static create(props: RobisepProps, id?: UniqueEntityID): Result<Robisep> {
    let guardProps;
    // eslint-disable-next-line prefer-const
    guardProps = [
      { argument: props.nickname, argumentName: 'designation' },
      { argument: props.serialNumber, argumentName: 'serialNumber' },
      { argument: props.code, argumentName: 'code' },
      { argument: props.robisepType, argumentName: 'robisepTypeId' },
      { argument: props.state, argumentName: 'state' },
      { argument: props.roomId, argumentName: 'roomId' },
    ];

    // Optional props
    if (props.description) {
      guardProps.push({ argument: props.description, argumentName: 'description' });
    }

    const guardResult = Guard.againstNullOrUndefinedBulk(guardProps);
    if (!guardResult.succeeded) {
      return Result.fail<Robisep>(guardResult.message, FailureType.InvalidInput);
    }

    // Success
    const robisep = new Robisep(props, id);
    return Result.ok<Robisep>(robisep);
  }

  public disable(): void {
    if (this.state === RobisepState.INACTIVE) {
      throw new Error('The robisep is already disabled.');
    }

    this.props.state = RobisepState.INACTIVE;
  }
}
