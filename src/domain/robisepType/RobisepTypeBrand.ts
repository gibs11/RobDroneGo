import { ValueObject } from '../../core/domain/ValueObject';
import { FailureType, Result } from '../../core/logic/Result';
import { Guard } from '../../core/logic/Guard';
import config from '../../../config';

const BRAND_MAX_LENGTH = config.configurableValues.robisepType.brandMaxLength;

interface RobisepTypeBrandProps {
  name: string;
}

export class RobisepTypeBrand extends ValueObject<RobisepTypeBrandProps> {
  private constructor(props: RobisepTypeBrandProps) {
    super(props);
  }

  get value(): string {
    return this.props.name;
  }

  public static create(brand: string): Result<RobisepTypeBrand> {
    const argName = 'RobisepTypeBrand';

    // Check if the code is null or undefined.
    const guardResult = Guard.againstNullOrUndefined(brand, argName);
    if (!guardResult.succeeded) {
      return Result.fail<RobisepTypeBrand>(guardResult.message);
    }

    // Check if is empty
    if (brand.length === 0) {
      return Result.fail<RobisepTypeBrand>("Brand can't be empty.");
    }

    // Check if the code is too long or too short.
    const rangeGuardResult = Guard.inRange(brand.length, 1, BRAND_MAX_LENGTH, argName);
    if (!rangeGuardResult.succeeded) {
      return Result.fail<RobisepTypeBrand>(rangeGuardResult.message);
    }

    // Check if it only contains spaces/tabs
    const onlySpacesGuardResult = Guard.onlyContainsSpaces(brand, argName);
    if (onlySpacesGuardResult.succeeded) {
      return Result.fail<RobisepTypeBrand>('Brand cannot only contain spaces/tabs.', FailureType.InvalidInput);
    }

    // Success
    return Result.ok<RobisepTypeBrand>(new RobisepTypeBrand({ name: brand.trim() }));
  }
}
