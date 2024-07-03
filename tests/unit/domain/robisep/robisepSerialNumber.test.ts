import * as sinon from 'sinon';
import {RobisepSerialNumber} from "../../../../src/domain/robisep/RobisepSerialNumber";


describe('RobisepSerialNumber', () => {
    it('should create a valid RobisepSerialNumber object', () => {

        // Arrange
        const serialNumber = RobisepSerialNumber.create('Sample SerialNumber 1');

        // Act
        const serialNumberResult = RobisepSerialNumber.create(serialNumber.getValue().value);

        // Assert
        sinon.assert.match(serialNumberResult.isSuccess, true);
    });


    it('should not create a valid RobisepSerialNumber object - not alphanumeric', () => {

        // Arrange
        const serialNumberResult = RobisepSerialNumber.create('Sample serialNumber_');

        // Assert
        sinon.assert.match(serialNumberResult.isFailure, true);
    });


    it('should not create a valid RobisepSerialNumber object - too long', () => {

        // Arrange & Act
        const serialNumberResult = RobisepSerialNumber
            .create('Sample serialNumber Sample serialNumber Sample more mroe moremoremoremoremoremoremore');

        // Assert
        sinon.assert.match(serialNumberResult.isFailure, true);
    });


    it('should not create a valid RobisepSerialNumber object - empty string/too short', () => {

        // Arrange
        const serialNumberResult = RobisepSerialNumber.create('');

        // Assert
        sinon.assert.match(serialNumberResult.isFailure, true);
    });


    it('should not create a valid RobisepSerialNumber object - contain only spaces/tabs', () => {

        // Arrange
        const serialNumberResult = RobisepSerialNumber.create('   ');

        // Assert
        sinon.assert.match(serialNumberResult.isFailure, true);
    });


    it('should not create a valid RobisepSerialNumber object - null', () => {

        // Arrange
        const serialNumberResult = RobisepSerialNumber.create(null);

        // Assert
        sinon.assert.match(serialNumberResult.isFailure, true);
    });


    it('should not create a valid RobisepSerialNumber object - undefined', () => {

        // Arrange
        const serialNumberResult = RobisepSerialNumber.create(undefined);

        // Assert
        sinon.assert.match(serialNumberResult.isFailure, true);
    });
});
