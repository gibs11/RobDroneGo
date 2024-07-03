import * as sinon from 'sinon';
import {RobisepDescription} from "../../../../src/domain/robisep/RobisepDescription";


describe('RobisepDescription', () => {
    it('should create a valid RobisepDescription object', () => {

        // Arrange
        const description = RobisepDescription.create('SampleCode 1');

        // Act
        const descriptionResult = RobisepDescription.create(description.getValue().value);

        // Assert
        sinon.assert.match(descriptionResult.isSuccess, true);
    });


    it('should not create a valid RobisepDescription object - not alphanumeric', () => {

        // Arrange
        const descriptionResult = RobisepDescription.create('Sample code_');

        // Assert
        sinon.assert.match(descriptionResult.isFailure, true);
    });


    it('should not create a valid RobisepDescription object - too long', () => {

        // Arrange
        const descriptionResult = RobisepDescription
            .create('Sample description Sample description Sample Sample description Sample description Sample' +
            'Sample description Sample description Sample Sample description Sample description Sample' +
            'Sample description Sample description Sample Sample description Sample description Sample' );

        // Assert
        sinon.assert.match(descriptionResult.isFailure, true);
    });


    it('should not create a valid RobisepDescription object - empty string/too short', () => {

        // Arrange
        const descriptionResult = RobisepDescription.create('');

        // Assert
        sinon.assert.match(descriptionResult.isFailure, true);
    });


    it('should not create a valid RobisepDescription object - contain only spaces/tabs', () => {

        // Arrange
        const descriptionResult = RobisepDescription.create('   ');

        // Assert
        sinon.assert.match(descriptionResult.isFailure, true);
    });


    it('should not create a valid RobisepDescription object - null', () => {

        // Arrange
        const descriptionResult = RobisepDescription.create(null);

        // Assert
        sinon.assert.match(descriptionResult.isFailure, true);
    });


    it('should not create a valid RobisepDescription object - undefined', () => {

        // Arrange
        const descriptionResult = RobisepDescription.create(undefined);

        // Assert
        sinon.assert.match(descriptionResult.isFailure, true);
    });
});
