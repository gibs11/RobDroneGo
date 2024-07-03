import * as sinon from 'sinon';

import {
  PickUpAndDeliveryTaskConfirmationCode
} from "../../../../../src/domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTaskConfirmationCode";

describe('Pickup and delivery task confirmation code', () => {

  describe('success when', () => {
    it('creating a valid Confirmation code object, 4 digits', () => {
      // Arrange
      const confirmationCodeNumber = 1234;

      // Act
      const confirmationCodeResult = PickUpAndDeliveryTaskConfirmationCode.create(confirmationCodeNumber);

      // Assert
      sinon.assert.match(confirmationCodeResult.isSuccess, true);

      const confirmationCode = confirmationCodeResult.getValue();

      sinon.assert.match(confirmationCode.value, confirmationCodeNumber);
    });

    it('creating a valid Confirmation code object, 5 digits', () => {
      // Arrange
      const confirmationCodeNumber = 12345;

      // Act
      const confirmationCodeResult = PickUpAndDeliveryTaskConfirmationCode.create(confirmationCodeNumber);

      // Assert
      sinon.assert.match(confirmationCodeResult.isSuccess, true);

      const confirmationCode = confirmationCodeResult.getValue();

      sinon.assert.match(confirmationCode.value, confirmationCodeNumber);
    });

    it('creating a valid Confirmation code object, 6 digits', () => {
      // Arrange
      const confirmationCodeNumber = 123456;

      // Act
      const confirmationCodeResult = PickUpAndDeliveryTaskConfirmationCode.create(confirmationCodeNumber);

      // Assert
      sinon.assert.match(confirmationCodeResult.isSuccess, true);

      const confirmationCode = confirmationCodeResult.getValue();

      sinon.assert.match(confirmationCode.value, confirmationCodeNumber);
    });
  });

  describe('failure when', () => {
    it('creating a Confirmation code object with null or undefined value', () => {
      // Arrange
      const confirmationCodeNumber = null;

      // Act
      const confirmationCodeResult = PickUpAndDeliveryTaskConfirmationCode.create(confirmationCodeNumber);

      // Assert
      sinon.assert.match(confirmationCodeResult.isFailure, true);
      sinon.assert.match(confirmationCodeResult.error, 'Pick up and delivery task confirmation code is not a number.');
    });

    it('creating a Confirmation code object with decimal value', () => {
      // Arrange
      const confirmationCodeNumber = 1234.56;

      // Act
      const confirmationCodeResult = PickUpAndDeliveryTaskConfirmationCode.create(confirmationCodeNumber);

      // Assert
      sinon.assert.match(confirmationCodeResult.isFailure, true);
      sinon.assert.match(confirmationCodeResult.error, 'Pick up and delivery task confirmation code must be an integer.');
    });

    it('creating a Confirmation code object with value not in range from 1000 to 999999', () => {
      // Arrange
      const confirmationCodeNumber = 123;

      // Act
      const confirmationCodeResult = PickUpAndDeliveryTaskConfirmationCode.create(confirmationCodeNumber);

      // Assert
      sinon.assert.match(confirmationCodeResult.isFailure, true);
      sinon.assert.match(confirmationCodeResult.error, 'Task confirmation code must be in the range from 1000 to 999999.');
    });
  });
});
