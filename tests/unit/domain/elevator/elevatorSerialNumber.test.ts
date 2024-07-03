import * as sinon from 'sinon';
import { expect } from 'chai';
import { ElevatorSerialNumber } from '../../../../src/domain/elevator/elevatorSerialNumber';
import config from '../../../../config';


describe('ElevatorSerialNumber', () => {
    describe('create', () => {
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        const ELEVATOR_SN_MAX_LENGTH = config.configurableValues.elevator.maxSerialNumberLength;

        it('should create a valid elevator serial number.', () => {

            const validSerialNumber = '1234567890';
            const elevatorSerialNumberResult = ElevatorSerialNumber.create(validSerialNumber);

            expect(elevatorSerialNumberResult.isSuccess).to.be.true;
            expect(elevatorSerialNumberResult.getValue().value).to.be.equal(validSerialNumber);
        });

        it('should fail if the serial number is null or undefined.', () => {
            const nullSerialNumber = null as any;
            const undefinedSerialNumber = undefined as any;

            const nullSerialNumberResult = ElevatorSerialNumber.create(nullSerialNumber);
            const undefinedSerialNumberResult = ElevatorSerialNumber.create(undefinedSerialNumber);

            expect(nullSerialNumberResult.isFailure).to.be.true;
            expect(nullSerialNumberResult.error).to.be.equal('Elevator Serial Number is null or undefined');
            expect(undefinedSerialNumberResult.isFailure).to.be.true;
            expect(undefinedSerialNumberResult.error).to.be.equal('Elevator Serial Number is null or undefined');
        });

        it('should fail if the serial number is empty.', () => {
            const emptySerialNumber = '   ';

            const emptySerialNumberResult = ElevatorSerialNumber.create(emptySerialNumber);

            expect(emptySerialNumberResult.isFailure).to.be.true;
            expect(emptySerialNumberResult.error).to.be.equal(`Elevator Serial Number cannot be empty.`);
        });

        it('should fail if the serial number is too long.', () => {
            const longSerialNumber = 'a'.repeat(ELEVATOR_SN_MAX_LENGTH + 1);

            const longSerialNumberResult = ElevatorSerialNumber.create(longSerialNumber);

            expect(longSerialNumberResult.isFailure).to.be.true;
            expect(longSerialNumberResult.error).to.be.equal(`Elevator Serial Number is not within range 1 to ${ELEVATOR_SN_MAX_LENGTH}.`)
        });

        it('should fail if the serial number is too short.', () => {
            const shortSerialNumber = '';

            const shortSerialNumberResult = ElevatorSerialNumber.create(shortSerialNumber);

            expect(shortSerialNumberResult.isFailure).to.be.true;
            expect(shortSerialNumberResult.error).to.be.equal(`Elevator Serial Number is not within range 1 to ${ELEVATOR_SN_MAX_LENGTH}.`)
            
        });

        it('should fail if the serial number is empty.', () => {
            const emptySerialNumber = '   ';

            const emptySerialNumberResult = ElevatorSerialNumber.create(emptySerialNumber);

            expect(emptySerialNumberResult.isFailure).to.be.true;
            expect(emptySerialNumberResult.error).to.be.equal(`Elevator Serial Number cannot be empty.`);
        });

        it('should fail if the serial number contains non-alphanumeric characters.', () => {
            const nonAlphanumericSerialNumber = 'a!';

            const nonAlphanumericSerialNumberResult = ElevatorSerialNumber.create(nonAlphanumericSerialNumber);

            expect(nonAlphanumericSerialNumberResult.isFailure).to.be.true;
            expect(nonAlphanumericSerialNumberResult.error).to.be.equal('Elevator Serial Number can only contain alphanumeric characters and spaces.')
        });

    });

});


