import * as sinon from 'sinon';
import config from '../../../../config';
import { Elevator } from '../../../../src/domain/elevator/elevator';
import { ElevatorPosition } from '../../../../src/domain/elevator/elevatorPosition';
import { ElevatorBrand } from '../../../../src/domain/elevator/elevatorBrand';
import { ElevatorSerialNumber } from '../../../../src/domain/elevator/elevatorSerialNumber';
import { ElevatorDescription } from '../../../../src/domain/elevator/elevatorDescription';
import { ElevatorModel } from '../../../../src/domain/elevator/elevatorModel';
import { Building } from '../../../../src/domain/building/building';
import { Floor } from '../../../../src/domain/floor/floor';
import { FloorNumber } from '../../../../src/domain/floor/floorNumber';

import BuildingDataSource from '../../../datasource/buildingDataSource';

import { UniqueEntityID } from '../../../../src/core/domain/UniqueEntityID';
import { ElevatorOrientation } from '../../../../src/domain/elevator/elevatorOrientation';


describe('Elevator', () => {

     // Create sinon sandbox for isolating tests
    const sandbox = sinon.createSandbox();

    // Building for the floor
    let buildingMock: Building;
    let floorMock: Floor;
    let floorDataSource1;
    let floorDataSource2;
    let floorDataSource3;

    beforeEach(() => {
        buildingMock = sinon.mock(Building.prototype);
        floorMock = sinon.mock(Floor.prototype);

        floorDataSource1 = Floor.create({floorNumber: FloorNumber.create(1).getValue(), building: BuildingDataSource.getBuildingA()}).getValue();

        floorDataSource2 = Floor.create({floorNumber: FloorNumber.create(2).getValue(), building: BuildingDataSource.getBuildingA()}).getValue();

        floorDataSource3 = Floor.create({floorNumber: FloorNumber.create(3).getValue(), building: BuildingDataSource.getBuildingB()}).getValue();

    });

    afterEach(() => {
        sandbox.restore();
        sinon.restore();
    });

    const ELEVATOR_MODEL_MAX_LENGTH = config.configurableValues.elevator.maxModelLength;
    const ELEVATOR_DESC_MAX_LENGTH = config.configurableValues.elevator.maxDescriptionLength;
    const ELEVATOR_SN_MAX_LENGTH = config.configurableValues.elevator.maxSerialNumberLength;
    const ELEVATOR_BRAND_MAX_LENGTH = config.configurableValues.elevator.maxBrandNameLength;

    it('should create a valid Elevator object', () => {
        const validElevatorProps = {
            uniqueNumber: 1,
            brand: ElevatorBrand.create('brand').getValue(),
            model: ElevatorModel.create('model').getValue(),
            serialNumber: ElevatorSerialNumber.create('serialNumber').getValue(),
            description: ElevatorDescription.create('description').getValue(),
            elevatorPosition: ElevatorPosition.create({xposition: 1, yposition: 1}).getValue(),
            orientation: ElevatorOrientation.NORTH,
            building: buildingMock,
            floors: [floorMock,floorMock],
        };
        const elevatorId = new UniqueEntityID();
        const elevatorResult = Elevator.create(validElevatorProps, elevatorId);
    
        // Use Sinon's assertions
        sinon.assert.match(elevatorResult.isSuccess, true);
    
        const elevator = elevatorResult.getValue();
        sinon.assert.match(elevator.id, elevatorId);
        sinon.assert.match(elevator.position, validElevatorProps.elevatorPosition);
        sinon.assert.match(elevator.building, validElevatorProps.building);
        sinon.assert.match(elevator.floors, validElevatorProps.floors);
        sinon.assert.match(elevator.brand, validElevatorProps.brand);
        sinon.assert.match(elevator.model, validElevatorProps.model);
        sinon.assert.match(elevator.serialNumber, validElevatorProps.serialNumber);
        sinon.assert.match(elevator.description, validElevatorProps.description);
    });

    it('should fail to create Elevator with null or undenified building', () => {
        const invalidElevatorProps = {
          uniqueNumber: 1,
            elevatorPosition: ElevatorPosition.create({xposition: 1, yposition: 1}).getValue(),
            orientation: ElevatorOrientation.NORTH,
            building: undefined as any,
            floors: [floorMock,floorMock],
        };
        const elevatorResult = Elevator.create(invalidElevatorProps);
        sinon.assert.match(elevatorResult.isFailure, true);
        sinon.assert.match(elevatorResult.error, 'building is null or undefined');
    });

    it('should fail to create Elevator with null or undenified elevator position', () => {
        const validElevatorProps = {
          uniqueNumber: 1,
          elevatorPosition: undefined as any,
          orientation: ElevatorOrientation.NORTH,
          building: buildingMock,
          floors: [floorMock,floorMock],
        };
        const elevatorResult = Elevator.create(validElevatorProps);
        sinon.assert.match(elevatorResult.isFailure, true);
        sinon.assert.match(elevatorResult.error, 'elevatorPosition is null or undefined');
      });


    it('should fail to create Elevator with null or undenified elevator position and building', () => {
        const validElevatorProps = {
          uniqueNumber: 1,
          elevatorPosition: undefined as any,
          orientation: ElevatorOrientation.NORTH,
          building: undefined as any,
          floors: [floorMock,floorMock],
        };
        const elevatorResult = Elevator.create(validElevatorProps);
        sinon.assert.match(elevatorResult.isFailure, true);
        sinon.assert.match(elevatorResult.error, 'elevatorPosition is null or undefined');
      });

    it('should create Elevator with null or undenified elevator description', () => {
        const validElevatorProps = {
          uniqueNumber: 1,
          elevatorPosition: ElevatorPosition.create({xposition: 1, yposition: 1}).getValue(),
          description: undefined as any,
          orientation: ElevatorOrientation.NORTH,
          building: buildingMock,
          floors: [floorMock,floorMock],
        };
        const elevatorResult = Elevator.create(validElevatorProps);
        sinon.assert.match(elevatorResult.isFailure, false);
      });

    it('should create Elevator with null or undenified elevator serial number', () => {
        const validElevatorProps = {
          uniqueNumber: 1,
          elevatorPosition: ElevatorPosition.create({xposition: 1, yposition: 1}).getValue(),
          serialNumber: undefined as any,
          orientation: ElevatorOrientation.NORTH,
          building: buildingMock,
          floors: [floorMock,floorMock],
        };
        const elevatorResult = Elevator.create(validElevatorProps);
        sinon.assert.match(elevatorResult.isFailure, false);
      });

    it('should fail to create Elevator with null or undenified elevator model', () => {
        const validElevatorProps = {
          uniqueNumber: 1,
          elevatorPosition: ElevatorPosition.create({xposition: 1, yposition: 1}).getValue(),
          brand : ElevatorBrand.create('brand').getValue(),
          orientation: ElevatorOrientation.NORTH,
          model: undefined as any,
          building: buildingMock,
          floors: [floorMock,floorMock],
        };
        const elevatorResult = Elevator.create(validElevatorProps);
        sinon.assert.match(elevatorResult.isFailure, true);
        sinon.assert.match(elevatorResult.error, 'Model is required when brand is provided.');
      });

    it('should fail to create Elevator with null orientation', () => {
        const validElevatorProps = {
          uniqueNumber: 1,
          elevatorPosition: ElevatorPosition.create({xposition: 1, yposition: 1}).getValue(),
          orientation: undefined as any,
          building: buildingMock,
          floors: [floorMock,floorMock],
        };
        const elevatorResult = Elevator.create(validElevatorProps);
        sinon.assert.match(elevatorResult.isFailure, true);
        sinon.assert.match(elevatorResult.error, 'Invalid Door Orientation.');
      });

    it('should create Elevator with null or undenified elevator brand', () => {
        const validElevatorProps = {
          uniqueNumber: 1,
          elevatorPosition: ElevatorPosition.create({xposition: 1, yposition: 1}).getValue(),
          brand: undefined as any,
          orientation: ElevatorOrientation.NORTH,
          model: ElevatorModel.create('model').getValue(),
          building: buildingMock,
          floors: [floorMock,floorMock],
        };
        const elevatorResult = Elevator.create(validElevatorProps);
        sinon.assert.match(elevatorResult.isFailure, false);
      });

      it ('should fail to create Elevator with null or undenified floors', () => {
        const validElevatorProps = {
          uniqueNumber: 1,
          elevatorPosition: ElevatorPosition.create({xposition: 1, yposition: 1}).getValue(),
          building: buildingMock,
          orientation: ElevatorOrientation.NORTH,
          floors: undefined as any,
        };
        const elevatorResult = Elevator.create(validElevatorProps);
        sinon.assert.match(elevatorResult.isFailure, true);
        sinon.assert.match(elevatorResult.error, 'floors is null or undefined');
      });

      it ('should fail to create Elevator with null or undenified unique number', () => {
        const validElevatorProps = {
          uniqueNumber: undefined as any,
          elevatorPosition: ElevatorPosition.create({xposition: 1, yposition: 1}).getValue(),
          building: buildingMock,
          orientation: ElevatorOrientation.NORTH,
          floors: [floorMock,floorMock],
        };
        const elevatorResult = Elevator.create(validElevatorProps);
        sinon.assert.match(elevatorResult.isFailure, true);
        sinon.assert.match(elevatorResult.error, 'uniqueNumber is null or undefined');
      });

      it('should fail to create Elevator with brand without model', () => {
        const validElevatorProps = {
          uniqueNumber: 1,
          elevatorPosition: ElevatorPosition.create({xposition: 1, yposition: 1}).getValue(),
          brand: ElevatorBrand.create('brand').getValue(),
          building: buildingMock,
          orientation: ElevatorOrientation.NORTH,
          floors: [floorMock,floorMock],
        };
        const elevatorResult = Elevator.create(validElevatorProps);
        sinon.assert.match(elevatorResult.isFailure, true);
        sinon.assert.match(elevatorResult.error, 'Model is required when brand is provided.');
      });

      it('should fail to update brand without a existent model', () => {
        try {

          const elevator = Elevator.create({
            uniqueNumber: 1,
            elevatorPosition: ElevatorPosition.create({xposition: 1, yposition: 1}).getValue(),
            building: buildingMock,
            orientation: ElevatorOrientation.NORTH,
            floors: [floorMock,floorMock],
          }).getValue();
          elevator.updateBrand('brand');
          sinon.assert.fail('should not reach this point');
        } catch (error) {
          sinon.assert.match(error.message, 'Model is required when brand is provided.');
        } 
      });

      it ('should fail to update brand with a null or undefined brand', () => {
        try {

          const elevator = Elevator.create({
            uniqueNumber: 1,
            elevatorPosition: ElevatorPosition.create({xposition: 1, yposition: 1}).getValue(),
            model: ElevatorModel.create('model').getValue(),
            building: buildingMock,
            orientation: ElevatorOrientation.NORTH,
            floors: [floorMock,floorMock],
          }).getValue();
          elevator.updateBrand(undefined as any);
          sinon.assert.fail('should not reach this point');
        } catch (error) {
          sinon.assert.match(error.message, 'Elevator brand is invalid.');
        } 
      });

      it('should fail to update model with a null or undefined model', () => {
        try {

          const elevator = Elevator.create({
            uniqueNumber: 1,
            elevatorPosition: ElevatorPosition.create({xposition: 1, yposition: 1}).getValue(),
            building: buildingMock,
            orientation: ElevatorOrientation.NORTH,
            floors: [floorMock,floorMock],
          }).getValue();
          elevator.updateModel(undefined as any);
          sinon.assert.fail('should not reach this point');
        } catch (error) {
          sinon.assert.match(error.message, 'Elevator model is invalid.');
        } 
      });

      it('should fail to update serial number with a null or undefined serial number', () => {
        try {

          const elevator = Elevator.create({
            uniqueNumber: 1,
            elevatorPosition: ElevatorPosition.create({xposition: 1, yposition: 1}).getValue(),
            model: ElevatorModel.create('model').getValue(),
            building: buildingMock,
            orientation: ElevatorOrientation.NORTH,
            floors: [floorMock,floorMock],
          }).getValue();
          elevator.updateSerialNumber(undefined as any);
          sinon.assert.fail('should not reach this point');
        } catch (error) {
          sinon.assert.match(error.message, 'Elevator serial number is invalid.');
        } 
      });

      it('should fail to update description with a null or undefined description', () => {
        try {

          const elevator = Elevator.create({
            uniqueNumber: 1,
            elevatorPosition: ElevatorPosition.create({xposition: 1, yposition: 1}).getValue(),
            model: ElevatorModel.create('model').getValue(),
            building: buildingMock,
            orientation: ElevatorOrientation.NORTH,
            floors: [floorMock,floorMock],
          }).getValue();
          elevator.updateDescription(undefined as any);
          sinon.assert.fail('should not reach this point');
        } catch (error) {
          sinon.assert.match(error.message, 'Elevator description is invalid.');
        } 
      });

      it('should fail to update position with a null or undefined position', () => {
        try {

          const elevator = Elevator.create({
            uniqueNumber: 1,
            elevatorPosition: ElevatorPosition.create({xposition: 1, yposition: 1}).getValue(),
            model: ElevatorModel.create('model').getValue(),
            building: buildingMock,
            orientation: ElevatorOrientation.NORTH,
            floors: [floorMock,floorMock],
          }).getValue();
          elevator.updatePosition(undefined as any, undefined as any);
          sinon.assert.fail('should not reach this point');
        } catch (error) {
          sinon.assert.match(error.message, 'Elevator position is invalid.');
        } 
      }); 

      it ('should update floors with a valid floors', () => {
        const elevator = Elevator.create({
          uniqueNumber: 1,
          elevatorPosition: ElevatorPosition.create({xposition: 1, yposition: 2}).getValue(),
          building: BuildingDataSource.getBuildingA(),
          orientation: ElevatorOrientation.NORTH,
          floors: [floorDataSource1,floorDataSource2],
        }).getValue();
        elevator.updateFloors([floorDataSource1]);
        sinon.assert.match(elevator.floors, [floorDataSource1]);
      });

      it ('should fail to update floors that are not from the building', () => {
        try {

          const elevator = Elevator.create({
            uniqueNumber: 1,
            elevatorPosition: ElevatorPosition.create({xposition: 1, yposition: 2}).getValue(),
            building: BuildingDataSource.getBuildingA(),
            orientation: ElevatorOrientation.NORTH,
            floors: [floorDataSource1,floorDataSource2],
          }).getValue();
          elevator.updateFloors([floorDataSource3]);
          sinon.assert.fail('should not reach this point');
        } catch (error) {
          sinon.assert.match(error.message, 'Floor is not from the same building.');
        } 
      });

      it('should update orientation with a valid orientation', () => {
        const elevator = Elevator.create({
          uniqueNumber: 1,
          elevatorPosition: ElevatorPosition.create({xposition: 1, yposition: 1}).getValue(),
          model: ElevatorModel.create('model').getValue(),
          building: buildingMock,
          orientation: ElevatorOrientation.NORTH,
          floors: [floorMock,floorMock],
        }).getValue();
        elevator.updateOrientation(ElevatorOrientation.SOUTH);
        sinon.assert.match(elevator.orientation, ElevatorOrientation.SOUTH);
      });

      it('should fail to update orientation with a null or undefined orientation', () => {
        try {

          const elevator = Elevator.create({
            uniqueNumber: 1,
            elevatorPosition: ElevatorPosition.create({xposition: 1, yposition: 1}).getValue(),
            model: ElevatorModel.create('model').getValue(),
            building: buildingMock,
            orientation: ElevatorOrientation.NORTH,
            floors: [floorMock,floorMock],
          }).getValue();
          elevator.updateOrientation(undefined as any);
          sinon.assert.fail('should not reach this point');
        } catch (error) {
          sinon.assert.match(error.message, 'Invalid Door Orientation.');
        } 
      });

      

        

});