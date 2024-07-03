import * as sinon from 'sinon';
import { BuildingDimensions } from '../../../../src/domain/building/buildingDimensions';

describe('BuildingDimensions', () => {
  it('should create a valid BuildingDimensions object', () => {
    const validDimensions = { width: 5, length: 10 };
    const buildingDimensionsResult = BuildingDimensions.create(validDimensions);

    // Use Sinon's assertions
    sinon.assert.match(buildingDimensionsResult.isSuccess, true);

    const buildingDimensions = buildingDimensionsResult.getValue();
    sinon.assert.match(buildingDimensions.width, validDimensions.width);
    sinon.assert.match(buildingDimensions.length, validDimensions.length);
  });

  it('should fail to create BuildingDimensions with null or undefined width', () => {
    const invalidDimensions = { width: null, length: 3 };
    const buildingDimensionsResult = BuildingDimensions.create(invalidDimensions);

    // Use Sinon's assertions
    sinon.assert.match(buildingDimensionsResult.isFailure, true);
    sinon.assert.match(buildingDimensionsResult.error, 'width is null or undefined');
  });

  it('should fail to create BuildingDimensions with null or undefined length', () => {
    const invalidDimensions = { width: 5, length: null };
    const buildingDimensionsResult = BuildingDimensions.create(invalidDimensions);

    // Use Sinon's assertions
    sinon.assert.match(buildingDimensionsResult.isFailure, true);
    sinon.assert.match(buildingDimensionsResult.error, 'length is null or undefined');
  });

  it('should fail to create BuildingDimensions with dimensions less than 1', () => {
    const invalidDimensions = { width: 0, length: -5 };
    const buildingDimensionsResult = BuildingDimensions.create(invalidDimensions);

    // Use Sinon's assertions
    sinon.assert.match(buildingDimensionsResult.isFailure, true);
    sinon.assert.match(buildingDimensionsResult.error, 'Building dimensions must be greater than 0');
  });

  it('should fail to create BuildingDimensions with width less than 1', () => {
    const invalidDimensions = { width: 0, length: 5 };
    const buildingDimensionsResult = BuildingDimensions.create(invalidDimensions);

    // Use Sinon's assertions
    sinon.assert.match(buildingDimensionsResult.isFailure, true);
    sinon.assert.match(buildingDimensionsResult.error, 'Building dimensions must be greater than 0');
  });

  it('should fail to create BuildingDimensions with length less than 1', () => {
    const invalidDimensions = { width: 5, length: -5 };
    const buildingDimensionsResult = BuildingDimensions.create(invalidDimensions);

    // Use Sinon's assertions
    sinon.assert.match(buildingDimensionsResult.isFailure, true);
    sinon.assert.match(buildingDimensionsResult.error, 'Building dimensions must be greater than 0');
  });

  it('should fail to create BuildingDimensions with non-integer width', () => {
    const invalidDimensions = { width: 5.5, length: 5 };
    const buildingDimensionsResult = BuildingDimensions.create(invalidDimensions);

    // Use Sinon's assertions
    sinon.assert.match(buildingDimensionsResult.isFailure, true);
    sinon.assert.match(buildingDimensionsResult.error, 'Building dimensions must be integers.');
  });

  it('should fail to create BuildingDimensions with non-integer length', () => {
    const invalidDimensions = { width: 5, length: 5.5 };
    const buildingDimensionsResult = BuildingDimensions.create(invalidDimensions);

    // Use Sinon's assertions
    sinon.assert.match(buildingDimensionsResult.isFailure, true);
    sinon.assert.match(buildingDimensionsResult.error, 'Building dimensions must be integers.');
  });
});
