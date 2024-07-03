import * as sinon from 'sinon';
import { expect } from 'chai';
import { ElevatorModel } from '../../../../src/domain/elevator/elevatorModel';
import config from '../../../../config';


describe('ElevatorModel', () => {
    describe('create', () => {
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        const ELEVATOR_MODEL_MAX_LENGTH = config.configurableValues.elevator.maxModelLength;

        it('should create a valid elevator model.', () => {

            const validModel = 'Sample Elevator Model';
            const elevatorModelResult = ElevatorModel.create(validModel);

            expect(elevatorModelResult.isSuccess).to.be.true;
            expect(elevatorModelResult.getValue().value).to.be.equal(validModel);
        });

        it('should fail if the model is null or undefined.', () => {
            const nullModel = null as any;
            const undefinedModel = undefined as any;

            const nullModelResult = ElevatorModel.create(nullModel);
            const undefinedModelResult = ElevatorModel.create(undefinedModel);

            expect(nullModelResult.isFailure).to.be.true;
            expect(nullModelResult.error).to.be.equal('Elevator Model is null or undefined');
            expect(undefinedModelResult.isFailure).to.be.true;
            expect(undefinedModelResult.error).to.be.equal('Elevator Model is null or undefined');
        });

        it('should fail if the model is empty.', () => {
            const emptyModel = '  ';

            const emptyModelResult = ElevatorModel.create(emptyModel);

            expect(emptyModelResult.isFailure).to.be.true;
            expect(emptyModelResult.error).to.be.equal(`Elevator Model cannot be empty.`);
        });

        it('should fail if the model is too long.', () => {
            const longModel = 'a'.repeat(ELEVATOR_MODEL_MAX_LENGTH + 1);

            const longModelResult = ElevatorModel.create(longModel);

            expect(longModelResult.isFailure).to.be.true;
            expect(longModelResult.error).to.be.equal(`Elevator Model is not within range 1 to ${ELEVATOR_MODEL_MAX_LENGTH}.`)
        });

        it('should fail if the model is too short.', () => {
            const shortModel = '';

            const shortModelResult = ElevatorModel.create(shortModel);

            expect(shortModelResult.isFailure).to.be.true;
            expect(shortModelResult.error).to.be.equal(`Elevator Model is not within range 1 to ${ELEVATOR_MODEL_MAX_LENGTH}.`)
        });

        it ('should fail if the model is not alphanumeric.', () => {
            const nonAlphanumericModel = 'Sample Model 1!';

            const nonAlphanumericModelResult = ElevatorModel.create(nonAlphanumericModel);

            expect(nonAlphanumericModelResult.isFailure).to.be.true;
            expect(nonAlphanumericModelResult.error).to.be.equal(`Elevator Model can only contain alphanumeric characters and spaces.`);
        });

    });

});