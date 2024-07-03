import { ValueObject } from '../../core/domain/ValueObject';
import { FailureType, Result } from '../../core/logic/Result';
import { Guard } from '../../core/logic/Guard';
import config from '../../../config';

const MODEL_MAX_LENGTH = config.configurableValues.robisepType.modelMaxLength;

interface RobisepTypeModelProps {
  model: string;
}

export class RobisepTypeModel extends ValueObject<RobisepTypeModelProps> {
  private constructor(props: RobisepTypeModelProps) {
    super(props);
  }

  get value(): string {
    return this.props.model;
  }

  public static create(model: string): Result<RobisepTypeModel> {
    const argName = 'RobisepTypeModel';

    // Check if the code is null or undefined.
    const guardResult = Guard.againstNullOrUndefined(model, argName);
    if (!guardResult.succeeded) {
      return Result.fail<RobisepTypeModel>(guardResult.message);
    }

    // Check if is empty
    if (model.length === 0) {
      return Result.fail<RobisepTypeModel>("Model can't be empty.");
    }

    // Check if the code is too long or too short.
    const rangeGuardResult = Guard.inRange(model.length, 1, MODEL_MAX_LENGTH, argName);
    if (!rangeGuardResult.succeeded) {
      return Result.fail<RobisepTypeModel>(rangeGuardResult.message);
    }

    // Check if it only contains spaces/tabs
    const onlySpacesGuardResult = Guard.onlyContainsSpaces(model, argName);
    if (onlySpacesGuardResult.succeeded) {
      return Result.fail<RobisepTypeModel>('Model cannot only contain spaces/tabs.', FailureType.InvalidInput);
    }

    // Success
    return Result.ok<RobisepTypeModel>(new RobisepTypeModel({ model: model.trim() }));
  }
}
