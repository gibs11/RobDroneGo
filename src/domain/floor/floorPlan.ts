import { ValueObject } from '../../core/domain/ValueObject';
import { FailureType, Result } from '../../core/logic/Result';

import config from '../../../config';

interface FloorPlanProps {
  value: string;
}

export class FloorPlan extends ValueObject<FloorPlanProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: FloorPlanProps) {
    super(props);
  }

  public static create(floorPlan: string): Result<FloorPlan> {
    // Name for the argument.
    const argName = 'Floor Plan';

    // Check if the plan is a string.
    if (typeof floorPlan !== 'string') {
      return Result.fail<FloorPlan>(`${argName} is not a string.`, FailureType.InvalidInput);
    }

    // Check if empty
    if (floorPlan.length < config.configurableValues.floor.minFloorPlanLength) {
      return Result.fail<FloorPlan>('Floor Plan is empty', FailureType.InvalidInput);
    }

    // Return the FloorPlan object.
    return Result.ok<FloorPlan>(new FloorPlan({ value: floorPlan }));
  }
}
