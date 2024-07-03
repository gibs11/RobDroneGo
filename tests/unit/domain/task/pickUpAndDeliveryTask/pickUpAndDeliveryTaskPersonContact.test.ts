import * as sinon from 'sinon';

import {PhoneNumber} from "../../../../../src/domain/common/phoneNumber";
import {PersonalName} from "../../../../../src/domain/common/personalName";
import {
  PickUpAndDeliveryTaskPersonContact
} from "../../../../../src/domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTaskPersonContact";

describe('Pickup and delivery task person contact', () => {

  describe('success when', () => {
    it('creating a valid Person Contact object', () => {
      // Arrange
      const personContactProps = {
        personPhoneNumber: PhoneNumber.create('912345678').getValue(),
        personPersonalName: PersonalName.create('John Doe').getValue(),
      }

      // Act
      const personContactResult = PickUpAndDeliveryTaskPersonContact.create(personContactProps);

      // Assert
      sinon.assert.match(personContactResult.isSuccess, true);

      const personContact = personContactResult.getValue();

      sinon.assert.match(personContact.personPhoneNumber.value, personContactProps.personPhoneNumber.value);
      sinon.assert.match(personContact.personPersonalName.value, personContactProps.personPersonalName.value);
    });
  });

  describe('failure when', () => {
    it('creating a Person Contact object with null or undefined phoneNumber', () => {
      // Arrange
      const personContactProps = {
        personPhoneNumber: null,
        personPersonalName: PersonalName.create('John Doe').getValue(),
      }

      // Act
      const personContactResult = PickUpAndDeliveryTaskPersonContact.create(personContactProps);

      // Assert
      sinon.assert.match(personContactResult.isFailure, true);
      sinon.assert.match(personContactResult.error, 'personPhoneNumber is null or undefined');
    });

    it('creating a Person Contact object with null or undefined personalName', () => {
      // Arrange
      const personContactProps = {
        personPhoneNumber: PhoneNumber.create('912345678').getValue(),
        personPersonalName: null,
      }

      // Act
      const personContactResult = PickUpAndDeliveryTaskPersonContact.create(personContactProps);

      // Assert
      sinon.assert.match(personContactResult.isFailure, true);
      sinon.assert.match(personContactResult.error, 'personPersonalName is null or undefined');
    });
  });
});
