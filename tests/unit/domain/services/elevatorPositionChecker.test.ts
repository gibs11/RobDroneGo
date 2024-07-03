import * as sinon from 'sinon';
import { expect, use } from 'chai';
import { Response, Request } from 'express';
import { Container } from 'typedi';
import { Result } from '../../../../src/core/logic/Result';
import config from '../../../../config';


import { Floor } from '../../../../src/domain/floor/floor';
import { FloorNumber } from '../../../../src/domain/floor/floorNumber';
import { Building } from '../../../../src/domain/building/building';
import IElevatorRepo from "../../../../src/services/IRepos/IElevatorRepo";
import { Elevator } from '../../../../src/domain/elevator/elevator';
import { ElevatorPosition } from '../../../../src/domain/elevator/elevatorPosition';


import ElevatorPositionChecker from '../../../../src/domain/ServicesImpl/elevatorPositionChecker';
import BuildingDataSource from '../../../datasource/buildingDataSource';
import { UniqueEntityID } from '../../../../src/core/domain/UniqueEntityID';
import { ElevatorOrientation } from '../../../../src/domain/elevator/elevatorOrientation';

describe('ElevatorPositionChecker', () => {
    const sandbox = sinon.createSandbox();


    let loggerMock;
    let elevatorRepoMock;


    let floorDataSource1;
    let floorDataSource2;

    let elevatorNorth;
    let elevatorSouth;
    let elevatorEast;
    let elevatorWest;

    let positionCheckerService;

    let xpos = 5;
    let ypos = 5;

    beforeEach(function () {
        Container.reset();

        loggerMock = {
            error: sinon.stub(),
        };
        Container.set('logger', loggerMock);

        elevatorRepoMock = {
            exists: sinon.stub(),
            findAllByFloorID: sinon.stub(),
            save: sinon.stub(),
        };
        Container.set(config.repos.elevator.name, elevatorRepoMock);


        floorDataSource1 = Floor.create({floorNumber: FloorNumber.create(1).getValue(), building: BuildingDataSource.getBuildingA()}).getValue();

        floorDataSource2 = Floor.create({floorNumber: FloorNumber.create(2).getValue(), building: BuildingDataSource.getBuildingB()}).getValue();

        const validElevatorProps = {
            uniqueNumber: 1,
            elevatorPosition: ElevatorPosition.create({xposition: xpos, yposition: ypos}).getValue(),
            building: BuildingDataSource.getBuildingA(),
            orientation: ElevatorOrientation.NORTH,
            floors: [floorDataSource1],
        };
        elevatorNorth = Elevator.create(validElevatorProps), new UniqueEntityID();

        const validElevatorProps2 = {
            uniqueNumber: 2,
            elevatorPosition: ElevatorPosition.create({xposition: xpos, yposition: ypos}).getValue(),
            building: BuildingDataSource.getBuildingA(),
            orientation: ElevatorOrientation.SOUTH,
            floors: [floorDataSource1],
        };
        elevatorSouth = Elevator.create(validElevatorProps2), new UniqueEntityID();

        const validElevatorProps3 = {
            uniqueNumber: 3,
            elevatorPosition: ElevatorPosition.create({xposition: xpos, yposition: ypos}).getValue(),
            building: BuildingDataSource.getBuildingA(),
            orientation: ElevatorOrientation.EAST,
            floors: [floorDataSource1],
        };
        elevatorEast = Elevator.create(validElevatorProps3), new UniqueEntityID();

        const validElevatorProps4 = {
            uniqueNumber: 4,
            elevatorPosition: ElevatorPosition.create({xposition: xpos, yposition: ypos}).getValue(),
            building: BuildingDataSource.getBuildingA(),
            orientation: ElevatorOrientation.WEST,
            floors: [floorDataSource1],
        };
        elevatorWest = Elevator.create(validElevatorProps4), new UniqueEntityID();


        positionCheckerService = new ElevatorPositionChecker(elevatorRepoMock);


    });

    afterEach(function () {
        sandbox.restore();
    });

    it ('should return false if the position is not available in position', async () => {

        //Arrange
        elevatorRepoMock.findAllByFloorID.resolves([elevatorNorth.getValue()]);

        //Act
        const result = await positionCheckerService.isPositionAvailable(xpos, ypos, floorDataSource1, null);

        //Assert
        expect(result).to.be.false;
    });

    it ('should return false if the position is not available NORTH', async () => {

        //Arrange
        elevatorRepoMock.findAllByFloorID.resolves([elevatorNorth.getValue()]);

        //Act
        const result = await positionCheckerService.isPositionAvailable(xpos, ypos - 1, floorDataSource1, null);


        //Assert
        expect(result).to.be.false;

    });

    it ('should return false if the position is not available SOUTH', async () => {

        //Arrange
        elevatorRepoMock.findAllByFloorID.resolves([elevatorSouth.getValue()]);

        //Act
        const result = await positionCheckerService.isPositionAvailable(xpos, ypos + 1, floorDataSource1, null);
    });

    it ('should return false if the position is not available EAST', async () => {

        //Arrange
        elevatorRepoMock.findAllByFloorID.resolves([elevatorEast.getValue()]);

        //Act
        const result = await positionCheckerService.isPositionAvailable(xpos + 1, ypos, floorDataSource1, null);
    });

    it ('should return false if the position is not available WEST', async () => {

        //Arrange
        elevatorRepoMock.findAllByFloorID.resolves([elevatorWest.getValue()]);

        //Act
        const result = await positionCheckerService.isPositionAvailable(xpos - 1, ypos, floorDataSource1, null);
    });


    it ('should return true if the position is available', async () => {

        //Arrange
        elevatorRepoMock.findAllByFloorID.resolves([elevatorNorth.getValue()]);

        //Act
        const result = await positionCheckerService.isPositionAvailable(1, 3, floorDataSource1, null);


        //Assert
        expect(result).to.be.true;
          
    });


    it ('should return true if there is no elevator in the floor', async () => {

        //Arrange
        elevatorRepoMock.findAllByFloorID.resolves([]);

        //Act
        const result = await positionCheckerService.isPositionAvailable(1, 2, floorDataSource1, null);

        //Assert
        expect(result).to.be.true;
        
    });


    it('should return true when elevator is inside the array list', async () => {
        //Arrange
        elevatorRepoMock.findAllByFloorID.resolves([elevatorSouth.getValue()]);
    
        //Act
        const result = await positionCheckerService.isPositionAvailable(1, 1, floorDataSource1, elevatorSouth.getValue().id.toString());
    
        //Assert
        expect(result).to.be.true;
    });

 
});
