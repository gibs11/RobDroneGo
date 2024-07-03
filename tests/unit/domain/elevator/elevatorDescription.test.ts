import * as sinon from 'sinon';
import { expect } from 'chai';
import { ElevatorDescription } from '../../../../src/domain/elevator/elevatorDescription';
import config from '../../../../config';



describe('ElevatorDescription', () => {
    describe('create', () => {
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        const ELEVATOR_DESC_MAX_LENGTH = config.configurableValues.elevator.maxDescriptionLength;

        it('should create a valid elevator description.', () => {

            const validDescription = 'Sample Elevator Description';
            const elevatorDescriptionResult = ElevatorDescription.create(validDescription);

            expect(elevatorDescriptionResult.isSuccess).to.be.true;
            expect(elevatorDescriptionResult.getValue().value).to.be.equal(validDescription);
        });

        it('should fail if the description is null or undefined.', () => {
            const nullDescription = null as any;
            const undefinedDescription = undefined as any;

            const nullDescriptionResult = ElevatorDescription.create(nullDescription);
            const undefinedDescriptionResult = ElevatorDescription.create(undefinedDescription);

            expect(nullDescriptionResult.isFailure).to.be.true;
            expect(nullDescriptionResult.error).to.be.equal('Elevator Description is null or undefined');
            expect(undefinedDescriptionResult.isFailure).to.be.true;
            expect(undefinedDescriptionResult.error).to.be.equal('Elevator Description is null or undefined');
        });

        it('should fail if the description is empty.', () => {
            const emptyDescription = '';

            const emptyDescriptionResult = ElevatorDescription.create(emptyDescription);

            expect(emptyDescriptionResult.isFailure).to.be.true;
            expect(emptyDescriptionResult.error).to.be.equal(`Elevator Description is not within range 1 to ${ELEVATOR_DESC_MAX_LENGTH}.`);
        });

        it('should fail if the description is too long.', () => {
            const longDescription = 'a'.repeat(ELEVATOR_DESC_MAX_LENGTH + 1);

            const longDescriptionResult = ElevatorDescription.create(longDescription);

            expect(longDescriptionResult.isFailure).to.be.true;
            expect(longDescriptionResult.error).to.be.equal(`Elevator Description is not within range 1 to ${ELEVATOR_DESC_MAX_LENGTH}.`)
        });

        it('should fail if the description is too short.', () => {
            const shortDescription = '';

            const shortDescriptionResult = ElevatorDescription.create(shortDescription);

            expect(shortDescriptionResult.isFailure).to.be.true;
            expect(shortDescriptionResult.error).to.be.equal(`Elevator Description is not within range 1 to ${ELEVATOR_DESC_MAX_LENGTH}.`)
            
        });

        it('should fail if the description is empty.', () => {
            const shortDescription = '  ';

            const shortDescriptionResult = ElevatorDescription.create(shortDescription);

            expect(shortDescriptionResult.isFailure).to.be.true;
            expect(shortDescriptionResult.error).to.be.equal(`Elevator Description cannot be empty.`)
            
        });

        it('should fail if the description contains non-alphanumeric characters.', () => {
            const nonAlphanumericDescription = 'a!';

            const nonAlphanumericDescriptionResult = ElevatorDescription.create(nonAlphanumericDescription);

            expect(nonAlphanumericDescriptionResult.isFailure).to.be.true;
            expect(nonAlphanumericDescriptionResult.error).to.be.equal('Elevator Description can only contain alphanumeric characters and spaces.')
        });
    });
});