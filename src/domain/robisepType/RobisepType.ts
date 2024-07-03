import { AggregateRoot } from '../../core/domain/AggregateRoot';
import { UniqueEntityID } from '../../core/domain/UniqueEntityID';
import { FailureType, Result } from '../../core/logic/Result';
import { RobisepTypeBrand } from './RobisepTypeBrand';
import { RobisepTypeDesignation } from './RobisepTypeDesignation';
import { TaskType } from '../common/TaskType';
import { RobisepTypeModel } from './RobisepTypeModel';
import { Guard } from '../../core/logic/Guard';

interface RobisepTypeProps {
  designation: RobisepTypeDesignation;
  brand: RobisepTypeBrand;
  model: RobisepTypeModel;
  tasksType: TaskType[];
}

export class RobisepType extends AggregateRoot<RobisepTypeProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get designation(): RobisepTypeDesignation {
    return this.props.designation;
  }

  get brand(): RobisepTypeBrand {
    return this.props.brand;
  }

  get model(): RobisepTypeModel {
    return this.props.model;
  }

  get tasksType(): TaskType[] {
    return this.props.tasksType;
  }

  private constructor(props: RobisepTypeProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: RobisepTypeProps, id?: UniqueEntityID): Result<RobisepType> {
    const guardProps = [
      { argument: props.designation, argumentName: 'designation' },
      { argument: props.brand, argumentName: 'brand' },
      { argument: props.model, argumentName: 'model' },
      { argument: props.tasksType, argumentName: 'tasksType' },
    ];

    const guardResult = Guard.againstNullOrUndefinedBulk(guardProps);
    if (!guardResult.succeeded) {
      return Result.fail<RobisepType>(guardResult.message);
    }

    // Check if tasksType is empty
    if (props.tasksType.length === 0) {
      return Result.fail<RobisepType>('TasksType cannot be empty', FailureType.InvalidInput);
    }

    // Check if the array has duplicates
    const hasDuplicates = props.tasksType.some((val, i) => props.tasksType.indexOf(val) !== i);
    if (hasDuplicates) {
      return Result.fail<RobisepType>('TasksType cannot have duplicates', FailureType.InvalidInput);
    }

    // Success
    const robisepType = new RobisepType(props, id);
    return Result.ok<RobisepType>(robisepType);
  }
}
