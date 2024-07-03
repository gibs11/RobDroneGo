import * as sinon from 'sinon';

import { FloorNumber } from '../../../../src/domain/floor/floorNumber';

describe('FloorNumber', () => {

  it('should create a valid floor number', () => {
    // Assert
    const validNumber= 1;
    const validFloorNumber= FloorNumber.create(validNumber);

    // Assert
    sinon.assert.match(validFloorNumber.isSuccess, true);
    sinon.assert.match(validFloorNumber.getValue().value, validNumber);
  });

  it('should create a floor number with a negative number', () => {
    // Assert
    const validNumber = -1;
    const validFloorNumber = FloorNumber.create(validNumber);

    // Assert
    sinon.assert.match(validFloorNumber.isSuccess, true);
    sinon.assert.match(validFloorNumber.getValue().value, validNumber);
  });

  it('should fail to create a floor number with a null value', () => {
    // Assert
    const nullNumber: any = null;
    const nullFloorNumber = FloorNumber.create(nullNumber);

    // Assert
    sinon.assert.match(nullFloorNumber.isFailure, true);
    sinon.assert.match(nullFloorNumber.error, 'Floor Number is null or undefined');
  });

  it('should fail to create a floor number with an undefined value', () => {
    // Assert
    const undefinedNumber: any = undefined;
    const undefinedFloorNumber = FloorNumber.create(undefinedNumber);

    // Assert
    sinon.assert.match(undefinedFloorNumber.isFailure, true);
    sinon.assert.match(undefinedFloorNumber.error, 'Floor Number is null or undefined');
  });

  it('should fail to create a floor number with a non-integer value', () => {
    // Assert
    const decimalNumber = 1.1;
    const decimalFloorNumber = FloorNumber.create(decimalNumber);

    // Act
    sinon.assert.match(decimalFloorNumber.isFailure, true);
    sinon.assert.match(decimalFloorNumber.error, 'Floor Number must be an integer value.');
  });

});