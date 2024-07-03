import * as sinon from 'sinon';

import {PhoneNumber} from "../../../../src/domain/common/phoneNumber";

describe('Phone Number', () => {

  describe('success when', () => {
    it('creating a valid Phone Number object, with portuguese country code and spaces', () => {
      // Arrange
      const phoneNumberString = '+351 912 345 678';

      // Act
      const phoneNumberResult = PhoneNumber.create(phoneNumberString);

      // Assert
      sinon.assert.match(phoneNumberResult.isSuccess, true);

      const phoneNumber = phoneNumberResult.getValue();
      // Remove whitespace from the phone number string, to compare it with the value of the PhoneNumber object.
      const phoneNumberStringWithoutWhitespace = phoneNumberString.replace(/\s/g, '');

      sinon.assert.match(phoneNumber.value, phoneNumberStringWithoutWhitespace);
    });

    it('creating a valid Phone Number object, with portuguese country code and no spaces', () => {
      // Arrange
      const phoneNumberString = '+351912345678';

      // Act
      const phoneNumberResult = PhoneNumber.create(phoneNumberString);

      // Assert
      sinon.assert.match(phoneNumberResult.isSuccess, true);

      const phoneNumber = phoneNumberResult.getValue();
      sinon.assert.match(phoneNumber.value, phoneNumberString);
    });

    it('creating a valid Phone Number object, without portuguese country code and spaces', () => {
      // Arrange
      const phoneNumberString = '912 345 678';

      // Act
      const phoneNumberResult = PhoneNumber.create(phoneNumberString);

      // Assert
      sinon.assert.match(phoneNumberResult.isSuccess, true);

      const phoneNumber = phoneNumberResult.getValue();
      // Remove whitespace from the phone number string, to compare it with the value of the PhoneNumber object.
      const phoneNumberStringWithoutWhitespace = phoneNumberString.replace(/\s/g, '');

      sinon.assert.match(phoneNumber.value, phoneNumberStringWithoutWhitespace);
    });

    it('creating a valid Phone Number object, without portuguese country code and no spaces', () => {
      // Arrange
      const phoneNumberString = '912345678';

      // Act
      const phoneNumberResult = PhoneNumber.create(phoneNumberString);

      // Assert
      sinon.assert.match(phoneNumberResult.isSuccess, true);

      const phoneNumber = phoneNumberResult.getValue();
      sinon.assert.match(phoneNumber.value, phoneNumberString);
    });
  });

  describe('failure when', () => {
    it('creating a Phone Number with a null or undefined value', () => {
      // Arrange
      const invalidPhoneNumberString = null;

      // Act
      const phoneNumberResult = PhoneNumber.create(invalidPhoneNumberString);

      // Assert
      sinon.assert.match(phoneNumberResult.isFailure, true);
      sinon.assert.match(phoneNumberResult.error, 'Phone Number is not a string');
    });

    it('creating a Phone Number with only whitespace as value', () => {
      // Arrange
      const invalidPhoneNumberString = ' ';

      // Act
      const phoneNumberResult = PhoneNumber.create(invalidPhoneNumberString);

      // Assert
      sinon.assert.match(phoneNumberResult.isFailure, true);
      sinon.assert.match(phoneNumberResult.error, 'Phone Number only contains whitespace.');
    });

    it('creating a Phone Number with unrecognized format (spain)', () => {
      // Arrange
      const invalidPhoneNumberString = '+34 679742549';

      // Act
      const phoneNumberResult = PhoneNumber.create(invalidPhoneNumberString);

      // Assert
      sinon.assert.match(phoneNumberResult.isFailure, true);
      sinon.assert.match(phoneNumberResult.error, 'Phone Number is not following a valid format.');
    });
  });
});
