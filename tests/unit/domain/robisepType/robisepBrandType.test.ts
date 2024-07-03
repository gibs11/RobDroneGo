import * as sinon from 'sinon';
import {RobisepTypeBrand} from "../../../../src/domain/robisepType/RobisepTypeBrand";


describe('RobisepTypeBrand', () => {
    it('should create a valid RobisepTypeBrand object', () => {

        // Arrange
        const brandResult = RobisepTypeBrand.create('Sampledesignation 1');

        // Assert
        sinon.assert.match(brandResult.isSuccess, true);
        sinon.assert.match(brandResult.getValue().value, 'Sampledesignation 1');
    });


    it('should not create a valid RobisepTypeBrand object - too long', () => {

        // Arrange
        const brandResult = RobisepTypeBrand.create('Sample brand type that will be to long to be created so I will keep writing to make it even longer');

        // Assert
        sinon.assert.match(brandResult.isFailure, true);
    });


    it('should not create a valid RobisepTypeBrand object - empty string', () => {

        // Arrange
        const brandResult = RobisepTypeBrand.create('');

        // Assert
        sinon.assert.match(brandResult.isFailure, true);
    });


    it('should not create a valid RobisepBrandType object - contain only spaces/tabs', () => {

        // Arrange
        const brandResult = RobisepTypeBrand.create('   ');

        // Assert
        sinon.assert.match(brandResult.isFailure, true);
    });


    it('should not create a valid RobisepTypeBrand object - null', () => {

        // Arrange
        const brandResult = RobisepTypeBrand.create(null);

        // Assert
        sinon.assert.match(brandResult.isFailure, true);
    });


    it('should not create a valid RobisepTypeBrand object - undefined', () => {

        // Arrange
        const brandResult = RobisepTypeBrand.create(undefined);

        // Assert
        sinon.assert.match(brandResult.isFailure, true);
    });
});
