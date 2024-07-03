import * as sinon from 'sinon';
import { BuildingDescription } from '../../../../src/domain/building/buildingDescription';
import config from '../../../../config';

describe('BuildingDescription', () => {
	it('should create a valid BuildingDescription', () => {
		const validDescription = 'Sample Building Description';
		const buildingDescriptionResult = BuildingDescription.create(validDescription);

		// Use Sinon's assertions
		sinon.assert.match(buildingDescriptionResult.isSuccess, true);
		sinon.assert.match(buildingDescriptionResult.getValue().value, validDescription);
	});

	it('should fail to create a BuildingDescription with a null or undefined value', () => {
		const nullDescription: any = null;
		const undefinedDescription: any = undefined;

		const nullResult = BuildingDescription.create(nullDescription);
		const undefinedResult = BuildingDescription.create(undefinedDescription);

		// Use Sinon's assertions
		sinon.assert.match(nullResult.isFailure, true);
		sinon.assert.match(nullResult.error, 'Description is null or undefined');
		sinon.assert.match(undefinedResult.isFailure, true);
		sinon.assert.match(undefinedResult.error, 'Description is null or undefined');
	});

	it('should fail to create a BuildingDescription with a value exceeding the maximum length', () => {
		const longDescription = 'VeryLongBuildingDescriptionThatExceedsTheMaximumLengthOf150CharactersAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVeryLongBuildingDescriptionThatExceedsTheMaximumLengthOf150CharactersAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
		const buildingDescriptionResult = BuildingDescription.create(longDescription);

		// Use Sinon's assertions
		sinon.assert.match(buildingDescriptionResult.isFailure, true);
		const errorMessage = 'Building Description is not within range 1 to ' + config.configurableValues.building.maxDescriptionLength + '.';
		sinon.assert.match(buildingDescriptionResult.error, errorMessage);
	});

	it('should fail to create a BuildingDescription with a value containing invalid characters', () => {
		const invalidCharacters = 'DescriptionWith@Invalid#Characters';
		const buildingDescriptionResult = BuildingDescription.create(invalidCharacters);

		// Use Sinon's assertions
		sinon.assert.match(buildingDescriptionResult.isFailure, true);
		sinon.assert.match(buildingDescriptionResult.error, 'Description can only contain alphanumeric characters and spaces.');
	});

	it('should fail to create a BuildingDescription with an empty value', () => {
		const emptyDescription = '';
		const buildingDescriptionResult = BuildingDescription.create(emptyDescription);

		// Use Sinon's assertions
		sinon.assert.match(buildingDescriptionResult.isFailure, true);
		const errorMessage = 'Building Description is not within range 1 to ' + config.configurableValues.building.maxDescriptionLength + '.';
		sinon.assert.match(buildingDescriptionResult.error, errorMessage);
	});

	it('should fail to create a BuildingDescription with a value containing only spaces', () => {
		// Arrange
		const spaceDescription = '    ';

		// Act
		const buildingDescriptionResult = BuildingDescription.create(spaceDescription);

		// Assert
		sinon.assert.match(buildingDescriptionResult.isFailure, true);
		const errorMessage = 'Building Description cannot be empty.';
		sinon.assert.match(buildingDescriptionResult.error, errorMessage);
	});
});