import * as sinon from 'sinon';

import { FloorPlan } from '../../../../src/domain/floor/floorPlan';

describe('FloorPlan', () => {

  it('should create a valid floor plan', () => {
    // Assert
    const validPlan = "There will be a floor plan here.";
    const validFloorPlan = FloorPlan.create(validPlan);

    // Act
    sinon.assert.match(validFloorPlan.isSuccess, true);
    sinon.assert.match(validFloorPlan.getValue().value, validPlan);
  });

  it('should fail to create a floor plan with a null value', () => {
    // Assert
    const nullPlan = null;
    const nullFloorPlan = FloorPlan.create(nullPlan);

    // Act
    sinon.assert.match(nullFloorPlan.isFailure, true);
    sinon.assert.match(nullFloorPlan.error, "Floor Plan is not a string.");
  });

  it('should fail to create a floor plan with an undefined value', () => {
    // Assert
    const undefinedPlan = undefined;
    const undefinedFloorPlan = FloorPlan.create(undefinedPlan);

    // Act
    sinon.assert.match(undefinedFloorPlan.isFailure, true);
    sinon.assert.match(undefinedFloorPlan.error, "Floor Plan is not a string.");
  });

  it('should fail to create a floor plan with an empty value', () => {
    // Assert
    const emptyPlan = "";
    const emptyFloorPlan = FloorPlan.create(emptyPlan);

    // Act
    sinon.assert.match(emptyFloorPlan.isFailure, true);
    sinon.assert.match(emptyFloorPlan.error, "Floor Plan is empty");
  });

});