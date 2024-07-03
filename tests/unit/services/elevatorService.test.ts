import 'reflect-metadata';


import * as sinon from 'sinon';
import { expect, use } from 'chai';
import ElevatorService from '../../../src/services/ServicesImpl/elevatorService';
import ElevatorDataSourse from '../../datasource/elevatorDataSource';

describe ('ElevatorService', () => {

    const sandbox = sinon.createSandbox();
    let loggerMock;
    let elevatorRepoMock;
    let buildingRepoMock;
    let floorRepoMock;
    let elevatorFactoryMock;
    let positionCheckerServiceMock;

    let elevatorService;

   

    describe('createElevator', () => {

        beforeEach(() => {
            loggerMock = {
                error: sinon.stub(),
            };
    
            elevatorRepoMock = {
                findByBuildingId: sinon.stub(),
                findByDomainId: sinon.stub(),
                save: sinon.stub(),
            };
    
            buildingRepoMock = {
                findByDomainId: sinon.stub(),
            };
    
            floorRepoMock = {
                findByDomainId: sinon.stub(),
                save: sinon.stub(),
            };
    
            elevatorFactoryMock = {
                createElevator: sinon.stub(),
            };
    
            positionCheckerServiceMock = {
                isPositionAvailable: sinon.stub(),
            };
    
            elevatorService = new ElevatorService(
                buildingRepoMock,
                elevatorRepoMock,
                elevatorFactoryMock,
                floorRepoMock,
                positionCheckerServiceMock,
                loggerMock,
            );
        });
    
        afterEach(() => {
            sandbox.restore();
        });
    
        it('should create a new elevator', async () => {
            const elevator = ElevatorDataSourse.getElevatorB();

            const elevatorDto = ElevatorDataSourse.getElevatorBdto();

            buildingRepoMock.findByDomainId.resolves(elevator.building);
            floorRepoMock.findByDomainId.resolves(elevator.floors[0]);
            elevatorFactoryMock.createElevator.resolves(elevator);

            elevatorRepoMock.findByDomainId.resolves(null);
            elevatorRepoMock.findByBuildingId.resolves(null);
            elevatorRepoMock.save.resolves(null);

            positionCheckerServiceMock.isPositionAvailable.resolves(true);

            const result = await elevatorService.createElevator(elevatorDto);

            // Assert
            expect(result.getValue().uniqueNumber).to.equal(elevatorDto.uniqueNumber);
            expect(result.getValue().orientation).to.equal(elevatorDto.orientation);
            expect(result.getValue().building.domainId).to.equal(elevatorDto.building);

        });

        it('should not create a new elevator if the elevator already exists', async () => {

            const elevator = ElevatorDataSourse.getElevatorB();

            buildingRepoMock.findByDomainId.resolves(elevator.building);
            floorRepoMock.findByDomainId.resolves(elevator.floors[0]);
            elevatorFactoryMock.createElevator.resolves(elevator);

            elevatorRepoMock.findByDomainId.resolves(elevator);
            elevatorRepoMock.findByBuildingId.resolves(null);
            elevatorRepoMock.save.resolves(null);

            positionCheckerServiceMock.isPositionAvailable.resolves(true);

            const result = await elevatorService.createElevator(ElevatorDataSourse.getElevatorBdto());

            // Assert
            expect(result.error).to.equal('The domainId for this elevator is not unique.');
        });

        it('should not create a new elevator if the building does not exist', async () => {

            const elevator = ElevatorDataSourse.getElevatorB();

            buildingRepoMock.findByDomainId.resolves(null);
            floorRepoMock.findByDomainId.resolves(elevator.floors[0]);
            elevatorFactoryMock.createElevator.resolves(elevator);

            elevatorRepoMock.findByDomainId.resolves(null);
            elevatorRepoMock.findByBuildingId.resolves(null);
            elevatorRepoMock.save.resolves(null);

            positionCheckerServiceMock.isPositionAvailable.resolves(true);

            const result = await elevatorService.createElevator(ElevatorDataSourse.getElevatorBdto());

            // Assert
            expect(result.error).to.equal('The building does not exist.');
        });

        it('should not create a new elevator if the floor does not exist', async () => {

            const elevator = ElevatorDataSourse.getElevatorB();

            buildingRepoMock.findByDomainId.resolves(elevator.building);
            floorRepoMock.findByDomainId.resolves(null);
            elevatorFactoryMock.createElevator.resolves(elevator);

            elevatorRepoMock.findByDomainId.resolves(null);
            elevatorRepoMock.findByBuildingId.resolves(null);
            elevatorRepoMock.save.resolves(null);

            positionCheckerServiceMock.isPositionAvailable.resolves(true);

            const result = await elevatorService.createElevator(ElevatorDataSourse.getElevatorBdto());

            // Assert
            expect(result.error).to.equal('The floor does not exist.');
        });


    

    });

    describe('updateElevator', () => {

        beforeEach(() => {
            loggerMock = {
                error: sinon.stub(),
            };
    
            elevatorRepoMock = {
                findByBuildingId: sinon.stub(),
                findByDomainId: sinon.stub(),
                save: sinon.stub(),
            };
    
            buildingRepoMock = {
                findByDomainId: sinon.stub(),
            };
    
            floorRepoMock = {
                findByDomainId: sinon.stub(),
                save: sinon.stub(),
            };
    
            elevatorFactoryMock = {
                createElevator: sinon.stub(),
            };
    
            positionCheckerServiceMock = {
                isPositionAvailable: sinon.stub(),
            };
    
            elevatorService = new ElevatorService(
                buildingRepoMock,
                elevatorRepoMock,
                elevatorFactoryMock,
                floorRepoMock,
                positionCheckerServiceMock,
                loggerMock,
            );
        });
    
        afterEach(() => {
            sandbox.restore();
        });


        it('should update an elevator', async () => {
            const elevator = ElevatorDataSourse.getElevatorB();

            buildingRepoMock.findByDomainId.resolves(elevator.building);
            floorRepoMock.findByDomainId.resolves(elevator.floors[0]);
            elevatorFactoryMock.createElevator.resolves(elevator);

            elevatorRepoMock.findByDomainId.resolves(elevator);
            elevatorRepoMock.findByBuildingId.resolves(null);
            elevatorRepoMock.save.resolves(null);

            positionCheckerServiceMock.isPositionAvailable.resolves(true);

            const result = await elevatorService.updateElevator('2',ElevatorDataSourse.getElevatorBdto());

            // Assert
            expect(result.getValue().uniqueNumber).to.equal(elevator.uniqueNumber);
            expect(result.getValue().orientation).to.equal(elevator.orientation);
            expect(result.getValue().building.domainId).to.equal(elevator.building.id.toString());

        });

        it('should not update an elevator if the elevator does not exist', async () => {

            const elevator = ElevatorDataSourse.getElevatorB();

            buildingRepoMock.findByDomainId.resolves(elevator.building);
            floorRepoMock.findByDomainId.resolves(elevator.floors[0]);
            elevatorFactoryMock.createElevator.resolves(elevator);

            elevatorRepoMock.findByDomainId.resolves(null);
            elevatorRepoMock.findByBuildingId.resolves(null);
            elevatorRepoMock.save.resolves(null);

            positionCheckerServiceMock.isPositionAvailable.resolves(true);

            const result = await elevatorService.updateElevator('2',ElevatorDataSourse.getElevatorBdto());

            // Assert
            expect(result.error).to.equal('The elevator does not exist.');
        });


    });

    describe('listAllFromBuilding', () => {
        beforeEach(() => {
            loggerMock = {
                error: sinon.stub(),
            };

            elevatorRepoMock = {
                findByBuildingId: sinon.stub(),
                findByDomainId: sinon.stub(),
                save: sinon.stub(),
            };

            buildingRepoMock = {
                findByDomainId: sinon.stub(),
            };

            floorRepoMock = {
                findByDomainId: sinon.stub(),
                save: sinon.stub(),
            };

            elevatorFactoryMock = {
                createElevator: sinon.stub(),
            };

            positionCheckerServiceMock = {
                isPositionAvailable: sinon.stub(),
            };

            elevatorService = new ElevatorService(
              buildingRepoMock,
              elevatorRepoMock,
              elevatorFactoryMock,
              floorRepoMock,
              positionCheckerServiceMock,
              loggerMock,
            );
        });

        afterEach(() => {
            sandbox.restore();
        });


        it('should list all elevators from a building', async () => {

            const buildingID = '2';

            const elevators = [ElevatorDataSourse.getElevatorB(), ElevatorDataSourse.getElevatorB()];

            buildingRepoMock.findByDomainId.resolves(elevators[0].building);

            elevatorRepoMock.findByBuildingId.resolves(elevators);

            const result = await elevatorService.listElevatorsFromBuilding(buildingID);

            // Assert
            expect(result.getValue().length).to.equal(2);
            expect(result.getValue()[0].uniqueNumber).to.equal(elevators[0].uniqueNumber);
            expect(result.getValue()[0].orientation).to.equal(elevators[0].orientation);
            expect(result.getValue()[0].building.domainId).to.equal(elevators[0].building.id.toString());

        });


    });

    

});
