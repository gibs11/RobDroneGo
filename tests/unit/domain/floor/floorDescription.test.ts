import * as sinon from 'sinon';

import { FloorDescription } from '../../../../src/domain/floor/floorDescription';

describe('FloorDescription', () => {

  it('should create a valid FloorDescription', () => {
    // Arrange
    const validDescription = 'Floor Description Test';
    const validFloorDescription = FloorDescription.create(validDescription);

    // Assert
    sinon.assert.match(validFloorDescription.isSuccess, true);
    sinon.assert.match(validFloorDescription.getValue().value, validDescription);
  });

  it('should fail to create a FloorDescription with a null value', () => {
    // Arrange
    const nullDescription: any = null;
    const nullFloorDescription = FloorDescription.create(nullDescription);

    // Assert
    sinon.assert.match(nullFloorDescription.isFailure, true);
    sinon.assert.match(nullFloorDescription.error, 'Floor Description is not a string.');
  });

  it('should fail to create a FloorDescription with an undefined value', () => {
    // Arrange
    const undefinedDescription: any = undefined;
    const undefinedFloorDescription = FloorDescription.create(undefinedDescription);

    // Assert
    sinon.assert.match(undefinedFloorDescription.isFailure, true);
    sinon.assert.match(undefinedFloorDescription.error, 'Floor Description is not a string.');
  });

  it('should fail to create a FloorDescription with an empty value', () => {
    // Arrange
    const emptyDescription = '';
    const emptyFloorDescription = FloorDescription.create(emptyDescription);

    // Assert
    sinon.assert.match(emptyFloorDescription.isFailure, true);
    sinon.assert.match(emptyFloorDescription.error, 'Floor Description is not within range 1 to 250.');
  });

  it('should fail to create a FloorDescription with a value greater than 250 characters', () => {
    // Arrange
    const longDescription = 'a'.repeat(251);
    const longFloorDescription = FloorDescription.create(longDescription);

    // Assert
    sinon.assert.match(longFloorDescription.isFailure, true);
    sinon.assert.match(longFloorDescription.error, 'Floor Description is not within range 1 to 250.');
  });

  it('should fail to create a FloorDescription with an integer value', () => {
    // Arrange
    const integerDescription :any = 123;
    const integerFloorDescription = FloorDescription.create(integerDescription);

    // Assert
    sinon.assert.match(integerFloorDescription.isFailure, true);
    sinon.assert.match(integerFloorDescription.error, 'Floor Description is not a string.');
  });

  it('should fail to create a FloorDescription with only whitespaces', () => {
    // Arrange
    const whitespaceDescription = '   ';
    const whitespaceFloorDescription = FloorDescription.create(whitespaceDescription);

    // Assert
    sinon.assert.match(whitespaceFloorDescription.isFailure, true);
    sinon.assert.match(whitespaceFloorDescription.error, 'Description only contains whitespaces.');
  });

});