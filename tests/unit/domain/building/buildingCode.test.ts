import * as sinon from 'sinon';
import { BuildingCode } from '../../../../src/domain/building/buildingCode';

describe('BuildingCode', () => {
  it('should create a valid BuildingCode', () => {
    const validCode = 'ABC12';
    const buildingCodeResult = BuildingCode.create(validCode);

    // Use Sinon's assertions
    sinon.assert.match(buildingCodeResult.isSuccess, true);
    sinon.assert.match(buildingCodeResult.getValue().value, validCode);
  });

  it('should fail to create a BuildingCode with a null or undefined value', () => {
    const nullCode: any = null;
    const undefinedCode: any = undefined;

    const nullResult = BuildingCode.create(nullCode);
    const undefinedResult = BuildingCode.create(undefinedCode);

    // Use Sinon's assertions
    sinon.assert.match(nullResult.isFailure, true);
    sinon.assert.match(nullResult.error, 'Building Code is null or undefined');
    sinon.assert.match(undefinedResult.isFailure, true);
    sinon.assert.match(undefinedResult.error, 'Building Code is null or undefined');
  });

  it('should fail to create a BuildingCode with a value exceeding the maximum length', () => {
    const longCode = 'VeryLongBuildingCodeThatExceedsTheMaximumLengthOfFiftyCharacters';
    const buildingCodeResult = BuildingCode.create(longCode);

    // Use Sinon's assertions
    sinon.assert.match(buildingCodeResult.isFailure, true);
    sinon.assert.match(buildingCodeResult.error, 'Building Code is not within range 1 to 5.');
  });

  it('should fail to create a BuildingCode with a value containing invalid characters', () => {
    const invalidCharacters = 'C@-de';
    const buildingCodeResult = BuildingCode.create(invalidCharacters);

    // Use Sinon's assertions
    sinon.assert.match(buildingCodeResult.isFailure, true);
    sinon.assert.match(buildingCodeResult.error, 'Building Code can only contain alphanumeric characters and spaces.');
  });

  it('should fail to create a BuildingCode with an empty value', () => {
    const emptyCode = '';
    const buildingCodeResult = BuildingCode.create(emptyCode);

    // Use Sinon's assertions
    sinon.assert.match(buildingCodeResult.isFailure, true);
    sinon.assert.match(buildingCodeResult.error, 'Building Code is not within range 1 to 5.');
  });

  it('should fail to create a BuildingCode with a value containing only spaces', () => {
    // Arrange
    const spaceCode = '    ';

    // Act
    const buildingCodeResult = BuildingCode.create(spaceCode);

    // Assert
    sinon.assert.match(buildingCodeResult.isFailure, true);
    sinon.assert.match(buildingCodeResult.error, 'Building Code cannot be empty.');
  });
});