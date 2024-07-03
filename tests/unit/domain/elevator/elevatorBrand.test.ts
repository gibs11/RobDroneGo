import * as sinon from 'sinon';
import { expect } from 'chai';
import { ElevatorBrand } from '../../../../src/domain/elevator/elevatorBrand';
import config from '../../../../config';


describe('ElevatorBrand', () => {
    describe('create', () => {
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        const ELEVATOR_BRAND_MAX_LENGTH = config.configurableValues.elevator.maxBrandNameLength;

        it('should create a valid elevator brand.', () => {

            const validBrand = 'Sample Elevator Brand';
            const elevatorBrandResult = ElevatorBrand.create(validBrand);

            expect(elevatorBrandResult.isSuccess).to.be.true;
            expect(elevatorBrandResult.getValue().value).to.be.equal(validBrand);
        });

        it('should fail if the brand is null or undefined.', () => {
            const nullBrand = null as any;
            const undefinedBrand = undefined as any;

            const nullBrandResult = ElevatorBrand.create(nullBrand);
            const undefinedBrandResult = ElevatorBrand.create(undefinedBrand);

            expect(nullBrandResult.isFailure).to.be.true;
            expect(nullBrandResult.error).to.be.equal('Elevator Brand is null or undefined');
            expect(undefinedBrandResult.isFailure).to.be.true;
            expect(undefinedBrandResult.error).to.be.equal('Elevator Brand is null or undefined');
        });

        it('should fail if the brand is empty.', () => {
            const emptyBrand = '';

            const emptyBrandResult = ElevatorBrand.create(emptyBrand);

            expect(emptyBrandResult.isFailure).to.be.true;
            expect(emptyBrandResult.error).to.be.equal(`Elevator Brand is not within range 1 to ${ELEVATOR_BRAND_MAX_LENGTH}.`);
        });

        it('should fail if the brand is too long.', () => {
            const longBrand = 'a'.repeat(ELEVATOR_BRAND_MAX_LENGTH + 1);

            const longBrandResult = ElevatorBrand.create(longBrand);

            expect(longBrandResult.isFailure).to.be.true;
            expect(longBrandResult.error).to.be.equal(`Elevator Brand is not within range 1 to ${ELEVATOR_BRAND_MAX_LENGTH}.`)
        });

        it('should fail if the brand is empty.', () => {
            const shortBrand = '  ';

            const shortBrandResult = ElevatorBrand.create(shortBrand);

            expect(shortBrandResult.isFailure).to.be.true;
            expect(shortBrandResult.error).to.be.equal(`Elevator Brand cannot be empty.`)
            
        });

        it('should fail if the brand contains non-alphanumeric characters.', () => {
            const nonAlphanumericBrand = 'a!';

            const nonAlphanumericBrandResult = ElevatorBrand.create(nonAlphanumericBrand);

            expect(nonAlphanumericBrandResult.isFailure).to.be.true;
            expect(nonAlphanumericBrandResult.error).to.be.equal('Elevator Brand can only contain alphanumeric characters and spaces.')
        });

    });

});