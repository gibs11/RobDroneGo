import * as sinon from 'sinon';
import {RobisepTypeModel} from "../../../../src/domain/robisepType/RobisepTypeModel";


describe('RobisepTypeModel', () => {
    it('should create a valid RobisepTypeModel object', () => {

        // Arrange
        const modelResult = RobisepTypeModel.create('Sampledesignation 1');

        // Assert
        sinon.assert.match(modelResult.isSuccess, true);
        sinon.assert.match(modelResult.getValue().value, 'Sampledesignation 1');
    });


    it('should not create a valid RobisepTypeModel object - too long', () => {

        // Arrange
        const modelResult = RobisepTypeModel.create('Sample brand type that will be to long to ' +
            'be created so I will keep writing to make it even longer. The problem is that I dont really know when to stop. ' +
            'I guess I will just keep writing until I get bored. But I am not bored yet. I am still writing. ');

        // Assert
        sinon.assert.match(modelResult.isFailure, true);
    });


    it('should not create a valid RobisepTypeModel object - empty string', () => {

        // Arrange
        const modelResult = RobisepTypeModel.create('');

        // Assert
        sinon.assert.match(modelResult.isFailure, true);
    });


    it('should not create a valid RobisepTypeDesignation object - contain only spaces/tabs', () => {

        // Arrange
        const modelResult = RobisepTypeModel.create('   ');

        // Assert
        sinon.assert.match(modelResult.isFailure, true);
    });


    it('should not create a valid RobisepTypeModel object - null', () => {

        // Arrange
        const modelResult = RobisepTypeModel.create(null);

        // Assert
        sinon.assert.match(modelResult.isFailure, true);
    });


    it('should not create a valid RobisepTypeModel object - undefined', () => {

        // Arrange
        const modelResult = RobisepTypeModel.create(undefined);

        // Assert
        sinon.assert.match(modelResult.isFailure, true);
    });
});
