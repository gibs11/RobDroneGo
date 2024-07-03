import * as sinon from 'sinon';
import {
  PickUpAndDeliveryTaskDescription
} from "../../../../../src/domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTaskDescription";

describe('Pickup and delivery task description', () => {

  describe('success when', () => {
    it('creating a valid Description object', () => {
      // Arrange
      const descriptionString = 'This is a valid description.';

      // Act
      const descriptionResult = PickUpAndDeliveryTaskDescription.create(descriptionString);

      // Assert
      sinon.assert.match(descriptionResult.isSuccess, true);

      const description = descriptionResult.getValue();

      sinon.assert.match(description.value, descriptionString);
    });
  });

  describe('failure when', () => {
    it('creating a Description object with null or undefined value', () => {
      // Arrange
      const descriptionString = null;

      // Act
      const descriptionResult = PickUpAndDeliveryTaskDescription.create(descriptionString);

      // Assert
      sinon.assert.match(descriptionResult.isFailure, true);
      sinon.assert.match(descriptionResult.error, 'Pick up and delivery task description is not a string.');
    });

    it('creating a Description object with only whitespace', () => {
      // Arrange
      const descriptionString = ' ';

      // Act
      const descriptionResult = PickUpAndDeliveryTaskDescription.create(descriptionString);

      // Assert
      sinon.assert.match(descriptionResult.isFailure, true);
      sinon.assert.match(descriptionResult.error, 'Pick up and delivery task description only contains whitespace.');
    });

    it('creating a Description object with length < minimum description length', () => {
      // Arrange
      const descriptionString = "";

      // Act
      const descriptionResult = PickUpAndDeliveryTaskDescription.create(descriptionString);

      // Assert
      sinon.assert.match(descriptionResult.isFailure, true);
      sinon.assert.match(descriptionResult.error, 'Pick up and delivery task description is not within range 1 to 1000.');
    });

    it('creating a Description object with length > maximum description length', () => {
      // Arrange
      const descriptionString = "a".repeat(1001);

      // Act
      const descriptionResult = PickUpAndDeliveryTaskDescription.create(descriptionString);

      // Assert
      sinon.assert.match(descriptionResult.isFailure, true);
      sinon.assert.match(descriptionResult.error, 'Pick up and delivery task description is not within range 1 to 1000.');
    });
  });
});
