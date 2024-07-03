import * as sinon from 'sinon';
import {RobisepCode} from "../../../../src/domain/robisep/RobisepCode";


describe('RobisepCode', () => {
    it('should create a valid RobisepCode object', () => {

        // Arrange
        const code = RobisepCode.create('SampleCode 1');

        // Act
        const codeResult = RobisepCode.create(code.getValue().value);

        // Assert
        sinon.assert.match(codeResult.isSuccess, true);
    });


    it('should not create a valid RobisepCode object - not alphanumeric', () => {

        // Arrange
        const codeResult = RobisepCode.create('Sample code_');

        // Assert
        sinon.assert.match(codeResult.isFailure, true);
    });


    it('should not create a valid RobisepCode object - too long', () => {

        // Arrange
        const codeResult = RobisepCode
            .create('Sample code Sample code Sample Sample code Sample code Sample' +
                'Sample code Sample code Sample Sample code Sample code Sample' );

        // Assert
        sinon.assert.match(codeResult.isFailure, true);
    });


    it('should not create a valid RobisepCode object - empty string/too short', () => {

        // Arrange
        const codeResult = RobisepCode.create('');

        // Assert
        sinon.assert.match(codeResult.isFailure, true);
    });


    it('should not create a valid RobisepCode object - contain only spaces/tabs', () => {

        // Arrange
        const codeResult = RobisepCode.create('   ');

        // Assert
        sinon.assert.match(codeResult.isFailure, true);
    });


    it('should not create a valid RobisepCode object - null', () => {

        // Arrange
        const codeResult = RobisepCode.create(null);

        // Assert
        sinon.assert.match(codeResult.isFailure, true);
    });


    it('should not create a valid RobisepCode object - undefined', () => {

        // Arrange
        const codeResult = RobisepCode.create(undefined);

        // Assert
        sinon.assert.match(codeResult.isFailure, true);
    });
});
