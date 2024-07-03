import { Guard } from '../../../core/logic/Guard';
import { FailureType, Result } from '../../../core/logic/Result';
import { PhoneNumber } from '../../common/phoneNumber';
import { PersonalName } from '../../common/personalName';
import { ValueObject } from '../../../core/domain/ValueObject';

interface PickUpAndDeliveryTaskPersonContactProps {
  personPhoneNumber: PhoneNumber;
  personPersonalName: PersonalName;
}

export class PickUpAndDeliveryTaskPersonContact extends ValueObject<PickUpAndDeliveryTaskPersonContactProps> {
  get personPhoneNumber(): PhoneNumber {
    return this.props.personPhoneNumber;
  }

  get personPersonalName(): PersonalName {
    return this.props.personPersonalName;
  }

  private constructor(props: PickUpAndDeliveryTaskPersonContactProps) {
    super(props);
  }

  public static create(props: PickUpAndDeliveryTaskPersonContactProps): Result<PickUpAndDeliveryTaskPersonContact> {
    const guardProps: any = [
      { argument: props.personPhoneNumber, argumentName: 'personPhoneNumber' },
      { argument: props.personPersonalName, argumentName: 'personPersonalName' },
    ];

    // Guard against null and undefined
    const guardResult = Guard.againstNullOrUndefinedBulk(guardProps);
    if (!guardResult.succeeded) {
      return Result.fail<PickUpAndDeliveryTaskPersonContact>(guardResult.message, FailureType.InvalidInput);
    }

    // Success
    const pickUpAndDeliveryTaskPersonContact = new PickUpAndDeliveryTaskPersonContact(props);
    return Result.ok<PickUpAndDeliveryTaskPersonContact>(pickUpAndDeliveryTaskPersonContact);
  }
}
