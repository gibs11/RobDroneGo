import * as sinon from 'sinon';
import {RobisepTypeDesignation} from "../../../../src/domain/robisepType/RobisepTypeDesignation";


describe('RobisepTypeDesignation', () => {
    it('should create a valid RobisepTypeDesignation object', () => {

        // Arrange
        const designation = RobisepTypeDesignation.create('Sampledesignation 1');

        // Act
        const designationResult = RobisepTypeDesignation.create(designation.getValue().value);

        // Assert
        sinon.assert.match(designationResult.isSuccess, true);
    });


    it('should not create a valid RobisepTypeDesignation object - not alphanumeric', () => {

        // Arrange
        const designationResult = RobisepTypeDesignation.create('Sample designation_');

        // Assert
        sinon.assert.match(designationResult.isFailure, true);
    });


    it('should not create a valid RobisepTypeDesignation object - too long', () => {

        // Arrange
        const designation = RobisepTypeDesignation.create('Sample designation');

        // Act
        const designationResult = RobisepTypeDesignation.create('Sample designation Sample designation Sample');

        // Assert
        sinon.assert.match(designationResult.isFailure, true);
    });


    it('should not create a valid RobisepTypeDesignation object - empty string/too short', () => {

        // Arrange
        const designationResult = RobisepTypeDesignation.create('');

        // Assert
        sinon.assert.match(designationResult.isFailure, true);
    });


    it('should not create a valid RobisepTypeDesignation object - contain only spaces/tabs', () => {

        // Arrange
        const designationResult = RobisepTypeDesignation.create('   ');

        // Assert
        sinon.assert.match(designationResult.isFailure, true);
    });


    it('should not create a valid RobisepTypeDesignation object - null', () => {

        // Arrange
        const designationResult = RobisepTypeDesignation.create(null);

        // Assert
        sinon.assert.match(designationResult.isFailure, true);
    });


    it('should not create a valid RobisepTypeDesignation object - undefined', () => {

        // Arrange
        const designationResult = RobisepTypeDesignation.create(undefined);

        // Assert
        sinon.assert.match(designationResult.isFailure, true);
    });
});
