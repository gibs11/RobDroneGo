import { AggregateRoot } from '../../core/domain/AggregateRoot';
import { UniqueEntityID } from '../../core/domain/UniqueEntityID';
import { RobisepType } from '../robisepType/RobisepType';
import { TaskState } from './taskState';
import { TaskCode } from './taskCode';
import { Robisep } from '../robisep/Robisep';

export default interface TaskProps {
  robisepType: RobisepType;
  taskState: TaskState;
  taskCode: TaskCode;
  email: string;
  robisep?: Robisep;
}

export abstract class Task extends AggregateRoot<TaskProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get robisepType(): RobisepType {
    return this.props.robisepType;
  }

  get taskState(): TaskState {
    return this.props.taskState;
  }

  get taskCode(): TaskCode {
    return this.props.taskCode;
  }

  get email(): string {
    return this.props.email;
  }

  get robisep(): Robisep {
    return this.props.robisep;
  }

  public markAsPlanned(): void {
    this.props.taskState = TaskState.PLANNED;
  }

  protected constructor(props: TaskProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public refuse(): void {
    if (this.props.taskState === TaskState.REFUSED) {
      throw new Error('Task already refused.');
    }

    this.props.taskState = TaskState.REFUSED;
  }

  public accept(): void {
    if (this.props.taskState === TaskState.ACCEPTED) {
      throw new Error('Task already accepted.');
    }

    if (this.props.taskState === TaskState.REFUSED) {
      throw new Error("You can't accept a refused task.");
    }

    this.props.taskState = TaskState.ACCEPTED;
  }

  public assignRobisep(robisep: Robisep): void {
    this.props.robisep = robisep;
  }
}
