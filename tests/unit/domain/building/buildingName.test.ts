import * as sinon from 'sinon';
import { BuildingName } from '../../../../src/domain/building/buildingName';

describe('BuildingName', () => {
  it('should create a valid BuildingName', () => {
    const validName = 'Sample Building Name';
    const buildingNameResult = BuildingName.create(validName);

    // Use Sinon's assertions
    sinon.assert.match(buildingNameResult.isSuccess, true);
    sinon.assert.match(buildingNameResult.getValue().value, validName);
  });

  it('should fail to create a BuildingName with an empty name', () => {
    const emptyName: any = undefined;
    const buildingNameResult = BuildingName.create(emptyName);

    // Use Sinon's assertions
    sinon.assert.match(buildingNameResult.isFailure, true);
    sinon.assert.match(buildingNameResult.error, 'Building Name is null or undefined');
  });

  it('should fail to create a BuildingName with a name exceeding the maximum length', () => {
    const longName = 'VeryLongBuildingNameThatExceedsTheMaximumLengthOfFiftyCharacters';
    const buildingNameResult = BuildingName.create(longName);

    // Use Sinon's assertions
    sinon.assert.match(buildingNameResult.isFailure, true);
    sinon.assert.match(buildingNameResult.error, 'Building Name is not within range 1 to 50.');
  });

  it('should fail to create a BuildingName with a null value', () => {
    const nullName: any = null;
    const buildingNameResult = BuildingName.create(nullName);

    // Use Sinon's assertions
    sinon.assert.match(buildingNameResult.isFailure, true);
    sinon.assert.match(buildingNameResult.error, 'Building Name is null or undefined');
  });

  it('should fail to create with an invalid length', () => {
    const invalidLength = '';
    const buildingNameResult = BuildingName.create(invalidLength);

    // Use Sinon's assertions
    sinon.assert.match(buildingNameResult.isFailure, true);
    sinon.assert.match(buildingNameResult.error, 'Building Name is not within range 1 to 50.');
  });

  it('should fail to create with a name containing invalid characters', () => {
    const invalidCharacters = 'Sample Building Name!';
    const buildingNameResult = BuildingName.create(invalidCharacters);

    // Use Sinon's assertions
    sinon.assert.match(buildingNameResult.isFailure, true);
    sinon.assert.match(buildingNameResult.error, 'Building Name can only contain alphanumeric characters and spaces.');
  });

  it('should fail to create with a name containing only spaces', () => {
    const spaceName = '    ';
    const buildingNameResult = BuildingName.create(spaceName);

    // Use Sinon's assertions
    sinon.assert.match(buildingNameResult.isFailure, true);
    sinon.assert.match(buildingNameResult.error, 'Building Name cannot be empty.');
  });
});
