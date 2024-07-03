import 'reflect-metadata';


import * as sinon from 'sinon';
import { Response, Request } from 'express';
import { Container } from 'typedi';
import { Result } from '../../src/core/logic/Result';
import config from '../../config';
import IElevatorService from '../../src/services/IServices/IElevatorService';
import ElevatorController from '../../src/controllers/elevatorController';
import IElevatorDTO from '../../src/dto/IElevatorDTO';
import IElevatorOutDTO from '../../src/dto/out/IElevatorOutDTO';
import { Elevator } from '../../src/domain/elevator/elevator';
import { ElevatorPosition } from '../../src/domain/elevator/elevatorPosition';
import { ElevatorBrand } from '../../src/domain/elevator/elevatorBrand';
import { ElevatorModel } from '../../src/domain/elevator/elevatorModel';
import { ElevatorDescription } from '../../src/domain/elevator/elevatorDescription';
import { ElevatorSerialNumber } from '../../src/domain/elevator/elevatorSerialNumber';
import  BuildingDataSource  from '../datasource/buildingDataSource';
import { Floor } from '../../src/domain/floor/floor';
import {FloorNumber} from "../../src/domain/floor/floorNumber";
import { UniqueEntityID } from '../../src/core/domain/UniqueEntityID';
import ElevatorDataSource from '../datasource/elevatorDataSource';
import { ElevatorOrientation } from '../../src/domain/elevator/elevatorOrientation';

describe('ElevatorController', function () {

    const sandbox = sinon.createSandbox();
    let loggerMock;
    let elevatorRepoMock;
    let buildingRepoMock;
    let floorRepoMock;
    let elevatorFactoryMock;
    let positionCheckerServiceMock;

    describe('createElevator', function () {

        let floorDataSource1;
        let floorDataSource2;

        beforeEach(function () {
            Container.reset();

            loggerMock = {
                error: sinon.stub(),
            };
            Container.set('logger', loggerMock);

            elevatorRepoMock = {
                exists: sinon.stub(),
                findByBuildingId: sinon.stub(),
                findByUniqueNumberInBuilding: sinon.stub(),
                findByDomainId: sinon.stub(),
                save: sinon.stub(),
            };
            Container.set(config.repos.elevator.name, elevatorRepoMock);

            buildingRepoMock = {
                findByDomainId: sinon.stub(),
                save: sinon.stub(),
            };
            Container.set(config.repos.building.name, buildingRepoMock);

            floorRepoMock = {
                findByDomainId: sinon.stub(),
                save: sinon.stub(),
            };
            Container.set(config.repos.floor.name, floorRepoMock);

            elevatorFactoryMock = {
                createElevator: sinon.stub(),
            };
            Container.set(config.factories.elevator.name, elevatorFactoryMock);

            positionCheckerServiceMock = {
                isPositionAvailable: sinon.stub(),
            };
            Container.set(config.services.positionChecker.name, positionCheckerServiceMock);

            floorDataSource1 = Floor.create({floorNumber: FloorNumber.create(1).getValue(), building: BuildingDataSource.getBuildingA()}).getValue();

            floorDataSource2 = Floor.create({floorNumber: FloorNumber.create(2).getValue(), building: BuildingDataSource.getBuildingB()}).getValue();

            let elevatorServiceClass = require('../../src/services/ServicesImpl/elevatorService').default;
            let elevatorServiceInstance = Container.get(elevatorServiceClass);
            Container.set(config.services.elevator.name, elevatorServiceInstance);

        });

        afterEach(function () {
            sandbox.restore();
        });

        it('ElevatorController unit test using ElevatorService stub', async function () {

            let requestBody = {
                uniqueNumber: 1,
                elevatorPosition: {
                    xposition: 5,
                    yposition: 8
                },
                orientation: 'NORTH',
                building: '1',
                floors: ['1', '2']
            };
            let request: Partial<Request> = {
                body: requestBody
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            // Stub the createElevator method in the ElevatorService
            sinon.stub(elevatorServiceInstance, 'createElevator').returns(Result.ok<IElevatorDTO>({
                domainId: 'id',
                uniqueNumber: 1,
                elevatorPosition: ElevatorPosition.create(requestBody.elevatorPosition).getValue(),
                orientation: requestBody.orientation,
                building: '1',
                floors: ['1', '2']
            }));

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await controller.createElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.json);
            sinon.assert.calledWith(response.json, sinon.match({
                domainId: 'id',
                uniqueNumber: 1,
                elevatorPosition: { xposition: 5, yposition: 8 },
                building: '1',
                floors: ['1', '2']
            }));

        });

        it('ElevatorController + ElevatorService integration test NORTH', async function () {
            // Arrange
            let requestBody = {
              domainId: 'id',
              uniqueNumber: 1,
              elevatorPosition: {
                xposition: 4,
                yposition: 8
              },
              orientation: 'NORTH',
              building: '1',
              floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
              body: requestBody
            };
            let response: Partial<Response> = {
              json: sinon.spy(),
              status: sinon.stub().returnsThis(),
              send: sinon.spy(),
            };
          
            let elevatorInstance = Elevator.create({
              uniqueNumber: requestBody.uniqueNumber,
              elevatorPosition: ElevatorPosition.create({xposition: requestBody.elevatorPosition.xposition , yposition: requestBody.elevatorPosition.yposition}).getValue(),
              orientation: ElevatorOrientation.NORTH,
              building: BuildingDataSource.getBuildingA(),
              floors: [Floor.create({floorNumber: FloorNumber.create(1).getValue(), building: BuildingDataSource.getBuildingA()}).getValue()]
            }).getValue();
          
          
            // Stub buildingRepo methods
            buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());
          
            // Stub elevatorRepo methods
            elevatorRepoMock.findByBuildingId.resolves(null);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);
            elevatorRepoMock.findByDomainId.resolves(null);
            elevatorRepoMock.save.resolves(elevatorInstance);
          
            // Stub elevatorFactory methods
            elevatorFactoryMock.createElevator.resolves(elevatorInstance);
          
            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);
          
            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(true);
          
            
            let elevatorServiceInstance = Container.get(config.services.elevator.name);
            const elevatorServiceSpy = sinon.spy(elevatorServiceInstance, 'createElevator');
          
            const ctrl = new ElevatorController(elevatorServiceInstance as IElevatorService);
          
          
            // Act
            await ctrl.createElevator(<Request>request, <Response>response);
          
          
            // Assert
            sinon.assert.calledOnce(response.json);
            sinon.assert.calledWith(response.json, sinon.match({
              uniqueNumber: elevatorInstance.uniqueNumber,
              elevatorPosition: { xposition: elevatorInstance.position.xposition, yposition: elevatorInstance.position.yposition },
              domainId: elevatorInstance.id.toString()
            }));
            
            sinon.assert.calledOnce(elevatorServiceSpy);
            sinon.assert.calledWith(elevatorServiceSpy, requestBody);
        });

        it('ElevatorController + ElevatorService integration test SOUTH', async function () {
            // Arrange
            let requestBody = {
              domainId: 'id',
              uniqueNumber: 1,
              elevatorPosition: {
                xposition: 4,
                yposition: 8
              },
              orientation: 'SOUTH',
              building: '1',
              floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
              body: requestBody
            };
            let response: Partial<Response> = {
              json: sinon.spy(),
              status: sinon.stub().returnsThis(),
              send: sinon.spy(),
            };
          
            let elevatorInstance = Elevator.create({
              uniqueNumber: requestBody.uniqueNumber,
              elevatorPosition: ElevatorPosition.create({xposition: requestBody.elevatorPosition.xposition , yposition: requestBody.elevatorPosition.yposition}).getValue(),
              orientation: ElevatorOrientation.NORTH,
              building: BuildingDataSource.getBuildingA(),
              floors: [Floor.create({floorNumber: FloorNumber.create(1).getValue(), building: BuildingDataSource.getBuildingA()}).getValue()]
            }).getValue();
          
          
            // Stub buildingRepo methods
            buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());
          
            // Stub elevatorRepo methods
            elevatorRepoMock.findByBuildingId.resolves(null);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);
            elevatorRepoMock.findByDomainId.resolves(null);
            elevatorRepoMock.save.resolves(elevatorInstance);
          
            // Stub elevatorFactory methods
            elevatorFactoryMock.createElevator.resolves(elevatorInstance);
          
            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);
          
            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(true);
          
            
            let elevatorServiceInstance = Container.get(config.services.elevator.name);
            const elevatorServiceSpy = sinon.spy(elevatorServiceInstance, 'createElevator');
          
            const ctrl = new ElevatorController(elevatorServiceInstance as IElevatorService);
          
          
            // Act
            await ctrl.createElevator(<Request>request, <Response>response);
          
          
            // Assert
            sinon.assert.calledOnce(response.json);
            sinon.assert.calledWith(response.json, sinon.match({
              uniqueNumber: elevatorInstance.uniqueNumber,
              elevatorPosition: { xposition: elevatorInstance.position.xposition, yposition: elevatorInstance.position.yposition },
              domainId: elevatorInstance.id.toString()
            }));
            
            sinon.assert.calledOnce(elevatorServiceSpy);
            sinon.assert.calledWith(elevatorServiceSpy, requestBody);
        });

        it('ElevatorController + ElevatorService integration test EAST', async function () {
            // Arrange
            let requestBody = {
              domainId: 'id',
              uniqueNumber: 1,
              elevatorPosition: {
                xposition: 3,
                yposition: 8
              },
              orientation: 'EAST',
              building: '1',
              floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
              body: requestBody
            };
            let response: Partial<Response> = {
              json: sinon.spy(),
              status: sinon.stub().returnsThis(),
              send: sinon.spy(),
            };
          
            let elevatorInstance = Elevator.create({
              uniqueNumber: requestBody.uniqueNumber,
              elevatorPosition: ElevatorPosition.create({xposition: requestBody.elevatorPosition.xposition , yposition: requestBody.elevatorPosition.yposition}).getValue(),
              orientation: ElevatorOrientation.NORTH,
              building: BuildingDataSource.getBuildingA(),
              floors: [Floor.create({floorNumber: FloorNumber.create(1).getValue(), building: BuildingDataSource.getBuildingA()}).getValue()]
            }).getValue();
          
          
            // Stub buildingRepo methods
            buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());
          
            // Stub elevatorRepo methods
            elevatorRepoMock.findByBuildingId.resolves(null);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);
            elevatorRepoMock.findByDomainId.resolves(null);
            elevatorRepoMock.save.resolves(elevatorInstance);
          
            // Stub elevatorFactory methods
            elevatorFactoryMock.createElevator.resolves(elevatorInstance);
          
            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);
          
            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(true);
          
            
            let elevatorServiceInstance = Container.get(config.services.elevator.name);
            const elevatorServiceSpy = sinon.spy(elevatorServiceInstance, 'createElevator');
          
            const ctrl = new ElevatorController(elevatorServiceInstance as IElevatorService);
          
          
            // Act
            await ctrl.createElevator(<Request>request, <Response>response);
          
          
            // Assert
            sinon.assert.calledOnce(response.json);
            sinon.assert.calledWith(response.json, sinon.match({
              uniqueNumber: elevatorInstance.uniqueNumber,
              elevatorPosition: { xposition: elevatorInstance.position.xposition, yposition: elevatorInstance.position.yposition },
              domainId: elevatorInstance.id.toString()
            }));
            
            sinon.assert.calledOnce(elevatorServiceSpy);
            sinon.assert.calledWith(elevatorServiceSpy, requestBody);
        });

        it('ElevatorController + ElevatorService integration test WEST', async function () {
            // Arrange
            let requestBody = {
              domainId: 'id',
              uniqueNumber: 1,
              elevatorPosition: {
                xposition: 3,
                yposition: 8
              },
              orientation: 'WEST',
              building: '1',
              floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
              body: requestBody
            };
            let response: Partial<Response> = {
              json: sinon.spy(),
              status: sinon.stub().returnsThis(),
              send: sinon.spy(),
            };
          
            let elevatorInstance = Elevator.create({
              uniqueNumber: requestBody.uniqueNumber,
              elevatorPosition: ElevatorPosition.create({xposition: requestBody.elevatorPosition.xposition , yposition: requestBody.elevatorPosition.yposition}).getValue(),
              orientation: ElevatorOrientation.NORTH,
              building: BuildingDataSource.getBuildingA(),
              floors: [Floor.create({floorNumber: FloorNumber.create(1).getValue(), building: BuildingDataSource.getBuildingA()}).getValue()]
            }).getValue();
          
          
            // Stub buildingRepo methods
            buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());
          
            // Stub elevatorRepo methods
            elevatorRepoMock.findByBuildingId.resolves(null);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);
            elevatorRepoMock.findByDomainId.resolves(null);
            elevatorRepoMock.save.resolves(elevatorInstance);
          
            // Stub elevatorFactory methods
            elevatorFactoryMock.createElevator.resolves(elevatorInstance);
          
            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);
          
            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(true);
          
            
            let elevatorServiceInstance = Container.get(config.services.elevator.name);
            const elevatorServiceSpy = sinon.spy(elevatorServiceInstance, 'createElevator');
          
            const ctrl = new ElevatorController(elevatorServiceInstance as IElevatorService);
          
          
            // Act
            await ctrl.createElevator(<Request>request, <Response>response);
          
          
            // Assert
            sinon.assert.calledOnce(response.json);
            sinon.assert.calledWith(response.json, sinon.match({
              uniqueNumber: elevatorInstance.uniqueNumber,
              elevatorPosition: { xposition: elevatorInstance.position.xposition, yposition: elevatorInstance.position.yposition },
              domainId: elevatorInstance.id.toString()
            }));
            
            sinon.assert.calledOnce(elevatorServiceSpy);
            sinon.assert.calledWith(elevatorServiceSpy, requestBody);
        });

        it('should return 400 if xposition is invalid', async function () {
            // Arrange
            let requestBody = {
                uniqueNumber: 1,
                elevatorPosition: {
                    xposition: -1,
                    yposition: 8
                },
                orientation: 'NORTH',
                building: '1',
                floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub buildingRepo methods
            buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());

            // Stub elevatorRepo methods
            elevatorRepoMock.findByBuildingId.resolves(null);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);
            elevatorRepoMock.findByDomainId.resolves(null);
            elevatorRepoMock.save.resolves(null);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);

            // Stub elevatorFactory methods
            elevatorFactoryMock.createElevator.throws(new TypeError('The elevator position is invalid.'));


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const ctrl = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await ctrl.createElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The elevator position is invalid.'}));


        });

        it('should return 400 if yposition is invalid', async function () {
                // Arrange
                let requestBody = {
                    uniqueNumber: 1,
                    elevatorPosition: {
                        xposition: 5,
                        yposition: -10
                    },
                    orientation: 'NORTH',
                    building: '1',
                    floors: [floorDataSource1.id.toString()]
                };
                let request: Partial<Request> = {
                    body: requestBody
                };
                let response: Partial<Response> = {
                    json: sinon.spy(),
                    status: sinon.stub().returnsThis(),
                    send: sinon.spy(),
                };


                // Stub buildingRepo methods
                buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());

                // Stub elevatorRepo methods
                elevatorRepoMock.findByBuildingId.resolves(null);
                elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);
                elevatorRepoMock.findByDomainId.resolves(null);
                elevatorRepoMock.save.resolves(null);

                // Stub floorRepo methods
                floorRepoMock.findByDomainId.resolves(floorDataSource1);

                // Stub elevatorFactory methods
                elevatorFactoryMock.createElevator.throws(new TypeError('The elevator position is invalid.'));


                let elevatorServiceInstance = Container.get(config.services.elevator.name);

                const ctrl = new ElevatorController(elevatorServiceInstance as IElevatorService);

                // Act
                await ctrl.createElevator(<Request>request, <Response>response);

                // Assert
                sinon.assert.calledOnce(response.status);
                sinon.assert.calledWith(response.status, 400);
                sinon.assert.calledOnce(response.send);
                sinon.assert.calledWith(response.send, sinon.match({message:'The elevator position is invalid.'}));

        });

        it('should return 400 if position is outside the building', async function () {
            // Arrange
            let requestBody = {
                uniqueNumber: 1,
                elevatorPosition: {
                    xposition: 3,
                    yposition: 300
                },
                orientation: 'NORTH',
                building: '1',
                floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub buildingRepo methods
            buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());

            // Stub elevatorRepo methods
            elevatorRepoMock.findByBuildingId.resolves(null);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);
            elevatorRepoMock.findByDomainId.resolves(null);
            elevatorRepoMock.save.resolves(null);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const ctrl = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await ctrl.createElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The elevator position is outside the building.'}));

        });

        it('should return 400 if positions is already occupied', async function () {
             // Arrange
             let requestBody = {
                uniqueNumber: 1,
                elevatorPosition: {
                    xposition: 4,
                    yposition: 8
                },
                orientation: 'NORTH',
                building: '1',
                floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            let elevatorInstance = Elevator.create({
                uniqueNumber: requestBody.uniqueNumber,
                elevatorPosition: ElevatorPosition.create({xposition: requestBody.elevatorPosition.xposition , yposition: requestBody.elevatorPosition.yposition}).getValue(),
                building: BuildingDataSource.getBuildingA(),
                orientation: ElevatorOrientation.NORTH,
                floors: [Floor.create({floorNumber: FloorNumber.create(1).getValue(), building: BuildingDataSource.getBuildingA()}).getValue()]
            }).getValue();


            // Stub buildingRepo methods
            buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());

            // Stub elevatorRepo methods
            elevatorRepoMock.findByBuildingId.resolves(null);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);
            elevatorRepoMock.findByDomainId.resolves(null);
            elevatorRepoMock.save.resolves(elevatorInstance);

            // Stub elevatorFactory methods
            elevatorFactoryMock.createElevator.resolves(elevatorInstance);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);

            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(false);

            
            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const ctrl = new ElevatorController(elevatorServiceInstance as IElevatorService);


            // Act
            await ctrl.createElevator(<Request>request, <Response>response);


            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The position is not available in the floor.'}));
        });

        it('should return 400 if orientation position is already occupied', async function () {
            // Arrange
            let requestBody = {
               uniqueNumber: 1,
               elevatorPosition: {
                   xposition: 4,
                   yposition: 8
               },
               orientation: 'NORTH',
               building: '1',
               floors: [floorDataSource1.id.toString()]
           };
           let request: Partial<Request> = {
               body: requestBody
           };
           let response: Partial<Response> = {
               json: sinon.spy(),
               status: sinon.stub().returnsThis(),
               send: sinon.spy(),
           };

           let elevatorInstance = Elevator.create({
               uniqueNumber: requestBody.uniqueNumber,
               elevatorPosition: ElevatorPosition.create({xposition: requestBody.elevatorPosition.xposition , yposition: requestBody.elevatorPosition.yposition}).getValue(),
               building: BuildingDataSource.getBuildingA(),
               orientation: ElevatorOrientation.NORTH,
               floors: [Floor.create({floorNumber: FloorNumber.create(1).getValue(), building: BuildingDataSource.getBuildingA()}).getValue()]
           }).getValue();


           // Stub buildingRepo methods
           buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());

           // Stub elevatorRepo methods
           elevatorRepoMock.findByBuildingId.resolves(elevatorInstance);
           elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);
           elevatorRepoMock.findByDomainId.resolves(null);
           elevatorRepoMock.save.resolves(elevatorInstance);

           // Stub elevatorFactory methods
           elevatorFactoryMock.createElevator.resolves(elevatorInstance);

           // Stub floorRepo methods
           floorRepoMock.findByDomainId.resolves(floorDataSource1);

           // Stub positionCheckerService methods
           positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
            positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(false);

           
           let elevatorServiceInstance = Container.get(config.services.elevator.name);

           const ctrl = new ElevatorController(elevatorServiceInstance as IElevatorService);


           // Act
           await ctrl.createElevator(<Request>request, <Response>response);


           // Assert
           sinon.assert.calledOnce(response.status);
           sinon.assert.calledWith(response.status, 400);
           sinon.assert.calledOnce(response.send);
           sinon.assert.calledWith(response.send, sinon.match({message:'Position not available using this orientation.'}));
       });

        it('should return 400 if door position is already occupied', async function () {
            // Arrange
            let requestBody = {
               uniqueNumber: 1,
               elevatorPosition: {
                   xposition: 4,
                   yposition: 8
               },
               orientation: 'NORTH',
               building: '1',
               floors: [floorDataSource1.id.toString()]
           };
           let request: Partial<Request> = {
               body: requestBody
           };
           let response: Partial<Response> = {
               json: sinon.spy(),
               status: sinon.stub().returnsThis(),
               send: sinon.spy(),
           };

           let elevatorInstance = Elevator.create({
               uniqueNumber: requestBody.uniqueNumber,
               elevatorPosition: ElevatorPosition.create({xposition: requestBody.elevatorPosition.xposition , yposition: requestBody.elevatorPosition.yposition}).getValue(),
               building: BuildingDataSource.getBuildingA(),
               orientation: ElevatorOrientation.NORTH,
               floors: [Floor.create({floorNumber: FloorNumber.create(1).getValue(), building: BuildingDataSource.getBuildingA()}).getValue()]
           }).getValue();


           // Stub buildingRepo methods
           buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());

           // Stub elevatorRepo methods
           elevatorRepoMock.findByBuildingId.resolves(null);
           elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);
           elevatorRepoMock.findByDomainId.resolves(null);
           elevatorRepoMock.save.resolves(elevatorInstance);

           // Stub elevatorFactory methods
           elevatorFactoryMock.createElevator.resolves(elevatorInstance);

           // Stub floorRepo methods
           floorRepoMock.findByDomainId.resolves(floorDataSource1);

           // Stub positionCheckerService method
           positionCheckerServiceMock.isPositionAvailable.resolves(false);
           
           let elevatorServiceInstance = Container.get(config.services.elevator.name);

           const ctrl = new ElevatorController(elevatorServiceInstance as IElevatorService);


           // Act
           await ctrl.createElevator(<Request>request, <Response>response);


           // Assert
           sinon.assert.calledOnce(response.status);
           sinon.assert.calledWith(response.status, 400);
           sinon.assert.calledOnce(response.send);
           sinon.assert.calledWith(response.send, sinon.match({message:'The position is not available in the floor.'}));
       });

        it('should return 400 if floor does not belong to the building', async function () {
            // Arrange
            let requestBody = {
                uniqueNumber: 1,
                elevatorPosition: {
                    xposition: 4,
                    yposition: 8
                },
                orientation: 'NORTH',
                building: '1',
                floors: [floorDataSource2.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            let elevatorInstance = Elevator.create({
                uniqueNumber: requestBody.uniqueNumber,
                elevatorPosition: ElevatorPosition.create({xposition: requestBody.elevatorPosition.xposition , yposition: requestBody.elevatorPosition.yposition}).getValue(),
                building: BuildingDataSource.getBuildingA(),
                orientation: ElevatorOrientation.NORTH,
                floors: [Floor.create({floorNumber: FloorNumber.create(1).getValue(), building: BuildingDataSource.getBuildingA()}).getValue()]
            }).getValue();


            // Stub buildingRepo methods
            buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());

            // Stub elevatorRepo methods
            elevatorRepoMock.findByBuildingId.resolves(null);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);
            elevatorRepoMock.findByDomainId.resolves(null);
            elevatorRepoMock.save.resolves(elevatorInstance);

            // Stub elevatorFactory methods
            elevatorFactoryMock.createElevator.resolves(elevatorInstance);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource2);

            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(true);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const ctrl = new ElevatorController(elevatorServiceInstance as IElevatorService);


            // Act
            await ctrl.createElevator(<Request>request, <Response>response);


            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The floor does not belong to the building.'}));

        });

        it('should return 400 if factory returns a TypeError "The elevator position is invalid."', async function () {
            // Arrange
            let requestBody = {
                uniqueNumber: 1,
                elevatorPosition: {
                    xposition: 4,
                    yposition: 8
                },
                orientation: 'NORTH',
                building: '1',
                floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            let elevatorInstance = Elevator.create({
                uniqueNumber: requestBody.uniqueNumber,
                elevatorPosition: ElevatorPosition.create({xposition: requestBody.elevatorPosition.xposition , yposition: requestBody.elevatorPosition.yposition}).getValue(),
                building: BuildingDataSource.getBuildingA(),
                orientation: ElevatorOrientation.NORTH,
                floors: [Floor.create({floorNumber: FloorNumber.create(1).getValue(), building: BuildingDataSource.getBuildingA()}).getValue()]
            }).getValue();


            // Stub buildingRepo methods
            buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());

            // Stub elevatorRepo methods
            elevatorRepoMock.findByBuildingId.resolves(null);
            elevatorRepoMock.save.resolves(elevatorInstance);
            elevatorRepoMock.findByDomainId.resolves(null);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);

            // Stub elevatorFactory methods
            elevatorFactoryMock.createElevator.throws(new TypeError('The elevator position is invalid.'));

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);

            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(true);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const ctrl = new ElevatorController(elevatorServiceInstance as IElevatorService);


            // Act
            await ctrl.createElevator(<Request>request, <Response>response);


            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The elevator position is invalid.'}));

        });

        it('should return 400 if orientation is invalid', async function () {
            // Arrange
            let requestBody = {
                uniqueNumber: 1,
                elevatorPosition: {
                    xposition: 4,
                    yposition: 8
                },
                orientation: 'INVALID',
                building: '1',
                floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub buildingRepo methods
            buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());

            // Stub elevatorRepo methods
            elevatorRepoMock.findByBuildingId.resolves(null);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);
            elevatorRepoMock.findByDomainId.resolves(null);
            elevatorRepoMock.save.resolves(null);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);

            // Stub elevatorFactory methods
            elevatorFactoryMock.createElevator.throws(new TypeError('Invalid Door Orientation.'));


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const ctrl = new ElevatorController(elevatorServiceInstance as IElevatorService);


            // Act
            await ctrl.createElevator(<Request>request, <Response>response);


            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'Invalid Door Orientation'}));
        });

        it('should return 400 if door orientation is out of position SOUTH', async function () {
            // Arrange
            let requestBody = {
                uniqueNumber: 1,
                elevatorPosition: {
                    xposition: 1,
                    yposition: 9
                },
                orientation: 'SOUTH',
                building: '1',
                floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub buildingRepo methods
            buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());

            // Stub elevatorRepo methods
            elevatorRepoMock.findByBuildingId.resolves(null);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);
            elevatorRepoMock.findByDomainId.resolves(null);
            elevatorRepoMock.save.resolves(null);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);

            // Stub elevatorFactory methods
            elevatorFactoryMock.createElevator.throws(new TypeError('The elevator door orientation is outside the building.'));
            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(true);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const ctrl = new ElevatorController(elevatorServiceInstance as IElevatorService);


            // Act
            await ctrl.createElevator(<Request>request, <Response>response);


            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The elevator door orientation is outside the building.'}));
        });
            
        it('should return 400 if door orientation is out of position NORTH', async function () {
            // Arrange
            let requestBody = {
                uniqueNumber: 1,
                elevatorPosition: {
                    xposition: 1,
                    yposition: 0
                },
                orientation: 'NORTH',
                building: '1',
                floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub buildingRepo methods
            buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());

            // Stub elevatorRepo methods
            elevatorRepoMock.findByBuildingId.resolves(null);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);
            elevatorRepoMock.findByDomainId.resolves(null);
            elevatorRepoMock.save.resolves(null);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);

            // Stub elevatorFactory methods
            elevatorFactoryMock.createElevator.throws(new TypeError('The elevator door orientation is outside the building.'));
            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(true);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const ctrl = new ElevatorController(elevatorServiceInstance as IElevatorService);


            // Act
            await ctrl.createElevator(<Request>request, <Response>response);


            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The elevator door orientation is outside the building.'}));
        });

        it('should return 400 if door orientation is out of position WEST', async function () {
            // Arrange
            let requestBody = {
                uniqueNumber: 1,
                elevatorPosition: {
                    xposition: 0,
                    yposition: 0
                },
                orientation: 'WEST',
                building: '1',
                floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub buildingRepo methods
            buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());

            // Stub elevatorRepo methods
            elevatorRepoMock.findByBuildingId.resolves(null);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);
            elevatorRepoMock.findByDomainId.resolves(null);
            elevatorRepoMock.save.resolves(null);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);

            // Stub elevatorFactory methods
            elevatorFactoryMock.createElevator.throws(new TypeError('The elevator door orientation is outside the building.'));
            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(true);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const ctrl = new ElevatorController(elevatorServiceInstance as IElevatorService);


            // Act
            await ctrl.createElevator(<Request>request, <Response>response);


            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The elevator door orientation is outside the building.'}));
        });

        it('should return 400 if door orientation is out of position EAST', async function () {
            // Arrange
            let requestBody = {
                uniqueNumber: 1,
                elevatorPosition: {
                    xposition: 4,
                    yposition: 1
                },
                orientation: 'EAST',
                building: '1',
                floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub buildingRepo methods
            buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());

            // Stub elevatorRepo methods
            elevatorRepoMock.findByBuildingId.resolves(null);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);
            elevatorRepoMock.findByDomainId.resolves(null);
            elevatorRepoMock.save.resolves(null);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);

            // Stub elevatorFactory methods
            elevatorFactoryMock.createElevator.throws(new TypeError('The elevator door orientation is outside the building.'));
            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(true);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const ctrl = new ElevatorController(elevatorServiceInstance as IElevatorService);


            // Act
            await ctrl.createElevator(<Request>request, <Response>response);


            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The elevator door orientation is outside the building.'}));
        });

        it('should return 401 if a user is not authorized', async function () {
            // Arrange
            let requestBody = {
                uniqueNumber: 1,
                elevatorPosition: {
                    xposition: 4,
                    yposition: 8
                },
                orientation: 'NORTH',
                building: '1',
                floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            let elevatorServiceInstance = Container.get('ElevatorService');

            // Force the service to throw an error
            sinon.stub(elevatorServiceInstance, 'createElevator').throws(new Error('You are not authorized to perform this action'));

            const ctrl = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await ctrl.createElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 401);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, 'You are not authorized to perform this action');
        });

        it('should return 404 if building does not exist', async function () {
            // Arrange
            let requestBody = {
                uniqueNumber: 1,
                elevatorPosition: {
                    xposition: 4,
                    yposition: 8
                },
                building: '1',
                floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub buildingRepo methods
            buildingRepoMock.findByDomainId.resolves(null);

            // Stub elevatorRepo methods
            elevatorRepoMock.findByBuildingId.resolves(floorDataSource1);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);
            elevatorRepoMock.findByDomainId.resolves(null);



            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const ctrl = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await ctrl.createElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 404);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The building does not exist.'}));
        });

        it('should return 404 if floor does not exist', async function () {
            // Arrange
            let requestBody = {
                uniqueNumber: 1,
                elevatorPosition: {
                    xposition: 4,
                    yposition: 8
                },
                building: '1',
                orientation: 'NORTH',
                floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub buildingRepo methods
            buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(null);

            // Stub elevatorRepo methods
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);
            elevatorRepoMock.findByBuildingId.resolves(null);
            elevatorRepoMock.findByDomainId.resolves(null);



            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const ctrl = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await ctrl.createElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 404);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The floor does not exist.'}));

        });

        it ('should return 400 if there is a duplicate floor in the request', async function () {
            // Arrange
            let requestBody = {
              uniqueNumber: 1,
              elevatorPosition: {
                xposition: 4,
                yposition: 8
              },
              orientation: 'NORTH',
              building: '1',
              floors: [floorDataSource1.id.toString(), floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
              body: requestBody
            };
            let response: Partial<Response> = {
              json: sinon.spy(),
              status: sinon.stub().returnsThis(),
              send: sinon.spy(),
            };
          
            let elevatorInstance = Elevator.create({
              uniqueNumber: requestBody.uniqueNumber,
              elevatorPosition: ElevatorPosition.create({xposition: requestBody.elevatorPosition.xposition , yposition: requestBody.elevatorPosition.yposition}).getValue(),
              building: BuildingDataSource.getBuildingA(),
              orientation: ElevatorOrientation.NORTH,
              floors: [floorDataSource1, floorDataSource1]
            }).getValue();
          
          
            // Stub buildingRepo methods
            buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());
          
            // Stub elevatorRepo methods
            elevatorRepoMock.findByBuildingId.resolves(elevatorInstance);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);
            elevatorRepoMock.findByDomainId.resolves(null);
            elevatorRepoMock.save.resolves(elevatorInstance);
          
            // Stub elevatorFactory methods
            elevatorFactoryMock.createElevator.resolves(elevatorInstance);
          
            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);
          
            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(true);
          
            
            let elevatorServiceInstance = Container.get(config.services.elevator.name);
            const ctrl = new ElevatorController(elevatorServiceInstance as IElevatorService);
          
          
            // Act
            await ctrl.createElevator(<Request>request, <Response>response);
          
          
            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'There is a duplicate floor.'}));
          });

/*
        it('should return 409 if building already has an elevator', async function () {
            // Arrange
            let requestBody = {
                uniqueNumber: 1,
                elevatorPosition: {
                    xposition: 5,
                    yposition: 8
                },
                building: '1',
                floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            let elevatorInstance = Elevator.create({
                uniqueNumber: requestBody.uniqueNumber,
                elevatorPosition: ElevatorPosition.create({xposition: requestBody.elevatorPosition.xposition , yposition: requestBody.elevatorPosition.yposition}).getValue(),
                building: BuildingDataSource.getBuildingA(),
                floors: [Floor.create({floorNumber: FloorNumber.create(1).getValue(), building: BuildingDataSource.getBuildingA()}).getValue(), Floor.create({floorNumber: FloorNumber.create(2).getValue(), building: BuildingDataSource.getBuildingA()}).getValue()]
            }).getValue();


            // Stub buildingRepo methods
            buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());

            // Stub elevatorRepo methods
            elevatorRepoMock.findByBuildingId.resolves(elevatorInstance);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);
            const elevatorServiceSpy = sinon.spy(elevatorServiceInstance, 'createElevator');

            const ctrl = new ElevatorController(elevatorServiceInstance as IElevatorService);


            // Act
            await ctrl.createElevator(<Request>request, <Response>response);


            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 409);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, 'The building already has an elevator.');

        });
*/

        it('should return 409 if there is an elevator with the same domain ID', async function () {
            // Arrange
            let requestBody = {
                domainId: 'id',
                elevatorPosition: {
                    xposition: 4,
                    yposition: 8
                },
                orientation: 'NORTH',
                building: '1',
                floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            let elevatorInstance = Elevator.create({
                uniqueNumber: 1,
                elevatorPosition: ElevatorPosition.create({xposition: requestBody.elevatorPosition.xposition , yposition: requestBody.elevatorPosition.yposition}).getValue(),
                building: BuildingDataSource.getBuildingA(),
                orientation: ElevatorOrientation.NORTH,
                floors: [Floor.create({floorNumber: FloorNumber.create(1).getValue(), building: BuildingDataSource.getBuildingA()}).getValue(), Floor.create({floorNumber: FloorNumber.create(2).getValue(), building: BuildingDataSource.getBuildingA()}).getValue()]
            }).getValue();


            // Stub buildingRepo methods
            buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());

            // Stub elevatorRepo methods
            elevatorRepoMock.findByBuildingId.resolves(null);
            elevatorRepoMock.findByDomainId.resolves(elevatorInstance);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);
            const elevatorServiceSpy = sinon.spy(elevatorServiceInstance, 'createElevator');

            const ctrl = new ElevatorController(elevatorServiceInstance as IElevatorService);


            // Act
            await ctrl.createElevator(<Request>request, <Response>response);


            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 409);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The domainId for this elevator is not unique.'}));

        });

        it('should return 503 when database error occurs', async function () {
            // Arrange
            let requestBody = {
                uniqueNumber: 1,
                elevatorPosition: {
                    xposition: 4,
                    yposition: 8
                },
                orientation: 'NORTH',
                building: '1',
                floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            let elevatorInstance = Elevator.create({
                uniqueNumber: requestBody.uniqueNumber,
                elevatorPosition: ElevatorPosition.create({xposition: requestBody.elevatorPosition.xposition , yposition: requestBody.elevatorPosition.yposition}).getValue(),
                building: BuildingDataSource.getBuildingA(),
                orientation: ElevatorOrientation.NORTH,
                floors: [Floor.create({floorNumber: FloorNumber.create(1).getValue(), building: BuildingDataSource.getBuildingA()}).getValue(), Floor.create({floorNumber: FloorNumber.create(2).getValue(), building: BuildingDataSource.getBuildingA()}).getValue()]
            }).getValue();


            // Stub buildingRepo methods
            buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);

            // Stub elevatorRepo methods
            elevatorRepoMock.findByBuildingId.resolves(null);
            elevatorRepoMock.save.throws(new Error('Database error'));
            elevatorRepoMock.findByDomainId.resolves(null);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);

            // Stub elevatorFactory methods
            elevatorFactoryMock.createElevator.resolves(elevatorInstance);

            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(true);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const ctrl = new ElevatorController(elevatorServiceInstance as IElevatorService);


            // Act
            await ctrl.createElevator(<Request>request, <Response>response);


            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 503);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'Database error'}));

        });

    });

    describe('updateElevator', function () {
        let floorDataSource1;
        let floorDataSource2;
        let floorDataSource3;
        let elevatorDataSourceFull;
        let elevatorDataSourceNoBrandNoModel;


        beforeEach(function () {
            Container.reset();

            loggerMock = {
                error: sinon.stub(),
            };
            Container.set('logger', loggerMock);

            elevatorRepoMock = {
                exists: sinon.stub(),
                findByDomainId: sinon.stub(),
                findByBuildingId: sinon.stub(),
                findByUniqueNumberInBuilding: sinon.stub(),
                save: sinon.stub(),
            };
            Container.set(config.repos.elevator.name, elevatorRepoMock);

            buildingRepoMock = {
                findByDomainId: sinon.stub(),
                save: sinon.stub(),
            };
            Container.set(config.repos.building.name, buildingRepoMock);

            floorRepoMock = {
                findByDomainId: sinon.stub(),
                save: sinon.stub(),
            };
            Container.set(config.repos.floor.name, floorRepoMock);

            positionCheckerServiceMock = {
                isPositionAvailable: sinon.stub(),
            };
            Container.set(config.services.positionChecker.name, positionCheckerServiceMock);

            elevatorFactoryMock = {
                createElevator: sinon.stub(),
            }
            Container.set(config.factories.elevator.name, elevatorFactoryMock);

            floorDataSource1 = Floor.create({floorNumber: FloorNumber.create(1).getValue(), building: BuildingDataSource.getBuildingA()}).getValue();

            floorDataSource3 = Floor.create({floorNumber: FloorNumber.create(3).getValue(), building: BuildingDataSource.getBuildingA()}).getValue();

            floorDataSource2 = Floor.create({floorNumber: FloorNumber.create(2).getValue(), building: BuildingDataSource.getBuildingB()}).getValue();


            elevatorDataSourceFull = Elevator.create({
                uniqueNumber: 1,
                description: ElevatorDescription.create('Elevator 1').getValue(),
                brand: ElevatorBrand.create('Brand 1').getValue(),
                model: ElevatorModel.create('Model 1').getValue(),
                serialNumber: ElevatorSerialNumber.create('Serial 1').getValue(),
                elevatorPosition: ElevatorPosition.create({xposition: 4, yposition: 8}).getValue(),
                orientation: ElevatorOrientation.NORTH,
                building: BuildingDataSource.getBuildingA(),
                floors: [floorDataSource1]
            }, new UniqueEntityID('id')).getValue();

            elevatorDataSourceNoBrandNoModel = Elevator.create({
                uniqueNumber: 2,
                description: ElevatorDescription.create('Elevator 1').getValue(),
                elevatorPosition: ElevatorPosition.create({xposition: 4, yposition: 8}).getValue(),
                building: BuildingDataSource.getBuildingA(),
                orientation: ElevatorOrientation.NORTH,
                floors: [floorDataSource1]
            }, new UniqueEntityID('id2')).getValue();

            let elevatorServiceClass = require('../../src/services/ServicesImpl/elevatorService').default;
            let elevatorServiceInstance = Container.get(elevatorServiceClass);
            Container.set(config.services.elevator.name, elevatorServiceInstance);


        });

        afterEach(function () {
            sandbox.restore();
        });

        it ('unit - should result in valid elevator update', async function () {
            let requestBody = {
                uniqueNumber: 1,
                brand: 'Brand 2',
                model: 'Model 2',
                serialNumber: 'Serial 2',
                description: 'Elevator 2',
                elevatorPosition: {
                    xposition: 2,
                    yposition: 3
                },
                orientation: 'NORTH',
                floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody,
                params: {
                    elevatorId: 'id'
                }
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            // Stub the updateElevator method in the ElevatorService
            sinon.stub(elevatorServiceInstance, 'updateElevator').returns(Result.ok<IElevatorDTO>({
                domainId: 'id',
                uniqueNumber: 1,
                brand: 'Brand 2',
                model: 'Model 2',
                serialNumber: 'Serial 2',
                description: 'Elevator 2',
                elevatorPosition: ElevatorPosition.create(requestBody.elevatorPosition).getValue(),
                orientation: ElevatorOrientation.NORTH,
                building: BuildingDataSource.getBuildingA().id.toString(),
                floors: [floorDataSource1.id.toString()]
            }));

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await controller.updateElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.json);
            sinon.assert.calledWith(response.json, sinon.match({
                domainId: 'id',
                uniqueNumber: 1,
                brand: 'Brand 2',
                model: 'Model 2',
                serialNumber: 'Serial 2',
                description: 'Elevator 2',
                elevatorPosition: { xposition: 2, yposition: 3 },
                orientation: 'NORTH',
                building: BuildingDataSource.getBuildingA().id.toString(),
                floors: [floorDataSource1.id.toString()]
            }));
        });

        it('should update a valid elevator NORTH', async function () {
            let requestBody = {
              uniqueNumber: 1,
              brand: 'Brand 2',
              model: 'Model 2',
              serialNumber: 'Serial 2',
              description: 'Elevator 2',
              elevatorPosition: {
                xposition: 2,
                yposition: 3
              },
              orientation: 'NORTH',
              floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
              body: requestBody,
              params: {
                elevatorId: 'id'
              }
            };
            let response: Partial<Response> = {
              json: sinon.stub().returnsThis(),
              status: sinon.stub().returnsThis(),
              send: sinon.spy(),
            };

          
            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(elevatorDataSourceFull);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(elevatorDataSourceFull);
          
            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);
          
            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(true);  
          
            let elevatorServiceInstance = Container.get(config.services.elevator.name);
          
            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);
            const elevatorServiceSpy = sinon.spy(elevatorServiceInstance, 'updateElevator');
          
            // Act
            await controller.updateElevator(<Request>request, <Response>response);
          
            // Assert
            sinon.assert.calledOnce(response.json);
            sinon.assert.calledWith(response.json, sinon.match({
                domainId: 'id'.toString(),
                uniqueNumber: requestBody.uniqueNumber,
                brand: requestBody.brand,
                model: requestBody.model,
                orientation: requestBody.orientation,
                serialNumber: requestBody.serialNumber,
                description: requestBody.description,
                elevatorPosition: requestBody.elevatorPosition
              }));
           sinon.assert.calledOnce(elevatorServiceSpy);
          
        });

        it('should update a valid elevator SOUTH', async function () {
            let requestBody = {
              uniqueNumber: 1,
              brand: 'Brand 2',
              model: 'Model 2',
              serialNumber: 'Serial 2',
              description: 'Elevator 2',
              elevatorPosition: {
                xposition: 2,
                yposition: 3
              },
              orientation: 'SOUTH',
              floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
              body: requestBody,
              params: {
                elevatorId: 'id'
              }
            };
            let response: Partial<Response> = {
              json: sinon.stub().returnsThis(),
              status: sinon.stub().returnsThis(),
              send: sinon.spy(),
            };

          
            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(elevatorDataSourceFull);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(elevatorDataSourceFull);
          
            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);
          
            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(true);  
          
            let elevatorServiceInstance = Container.get(config.services.elevator.name);
          
            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);
            const elevatorServiceSpy = sinon.spy(elevatorServiceInstance, 'updateElevator');
          
            // Act
            await controller.updateElevator(<Request>request, <Response>response);
          
            // Assert
            sinon.assert.calledOnce(response.json);
            sinon.assert.calledWith(response.json, sinon.match({
                domainId: 'id'.toString(),
                uniqueNumber: requestBody.uniqueNumber,
                brand: requestBody.brand,
                model: requestBody.model,
                orientation: requestBody.orientation,
                serialNumber: requestBody.serialNumber,
                description: requestBody.description,
                elevatorPosition: requestBody.elevatorPosition
              }));
           sinon.assert.calledOnce(elevatorServiceSpy);
          
        });

        it('should update a valid elevator EAST', async function () {
            let requestBody = {
              uniqueNumber: 1,
              brand: 'Brand 2',
              model: 'Model 2',
              serialNumber: 'Serial 2',
              description: 'Elevator 2',
              elevatorPosition: {
                xposition: 2,
                yposition: 3
              },
              orientation: 'EAST',
              floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
              body: requestBody,
              params: {
                elevatorId: 'id'
              }
            };
            let response: Partial<Response> = {
              json: sinon.stub().returnsThis(),
              status: sinon.stub().returnsThis(),
              send: sinon.spy(),
            };

          
            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(elevatorDataSourceFull);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(elevatorDataSourceFull);
          
            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);
          
            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(true);  
          
            let elevatorServiceInstance = Container.get(config.services.elevator.name);
          
            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);
            const elevatorServiceSpy = sinon.spy(elevatorServiceInstance, 'updateElevator');
          
            // Act
            await controller.updateElevator(<Request>request, <Response>response);
          
            // Assert
            sinon.assert.calledOnce(response.json);
            sinon.assert.calledWith(response.json, sinon.match({
                domainId: 'id'.toString(),
                uniqueNumber: requestBody.uniqueNumber,
                brand: requestBody.brand,
                model: requestBody.model,
                orientation: requestBody.orientation,
                serialNumber: requestBody.serialNumber,
                description: requestBody.description,
                elevatorPosition: requestBody.elevatorPosition
              }));
           sinon.assert.calledOnce(elevatorServiceSpy);
          
        });

        it('should update a valid elevator WEST', async function () {
            let requestBody = {
              uniqueNumber: 1,
              brand: 'Brand 2',
              model: 'Model 2',
              serialNumber: 'Serial 2',
              description: 'Elevator 2',
              elevatorPosition: {
                xposition: 2,
                yposition: 3
              },
              orientation: 'WEST',
              floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
              body: requestBody,
              params: {
                elevatorId: 'id'
              }
            };
            let response: Partial<Response> = {
              json: sinon.stub().returnsThis(),
              status: sinon.stub().returnsThis(),
              send: sinon.spy(),
            };

          
            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(elevatorDataSourceFull);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(elevatorDataSourceFull);
          
            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);
          
            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(true);  
          
            let elevatorServiceInstance = Container.get(config.services.elevator.name);
          
            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);
            const elevatorServiceSpy = sinon.spy(elevatorServiceInstance, 'updateElevator');
          
            // Act
            await controller.updateElevator(<Request>request, <Response>response);
          
            // Assert
            sinon.assert.calledOnce(response.json);
            sinon.assert.calledWith(response.json, sinon.match({
                domainId: 'id'.toString(),
                uniqueNumber: requestBody.uniqueNumber,
                brand: requestBody.brand,
                model: requestBody.model,
                orientation: requestBody.orientation,
                serialNumber: requestBody.serialNumber,
                description: requestBody.description,
                elevatorPosition: requestBody.elevatorPosition
              }));
           sinon.assert.calledOnce(elevatorServiceSpy);
          
        });

        it('should update a valid elevator 2', async function () {
            let requestBody = {
              uniqueNumber: 1,
              brand: 'Brand 2',
              model: 'Model 2',
              serialNumber: 'Serial 2',
              description: 'Elevator 2',
              floors: [floorDataSource3.id.toString()]
            };
            let request: Partial<Request> = {
              body: requestBody,
              params: {
                elevatorId: 'id'
              }
            };
            let response: Partial<Response> = {
              json: sinon.stub().returnsThis(),
              status: sinon.stub().returnsThis(),
              send: sinon.spy(),
            };

          
            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(elevatorDataSourceFull);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(elevatorDataSourceFull);
          
            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource3);
          
            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(true);  
          
            let elevatorServiceInstance = Container.get(config.services.elevator.name);
          
            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);
            const elevatorServiceSpy = sinon.spy(elevatorServiceInstance, 'updateElevator');
          
            // Act
            await controller.updateElevator(<Request>request, <Response>response);
          
            // Assert
            sinon.assert.calledOnce(response.json);
            sinon.assert.calledOnce(elevatorServiceSpy);
          
        });

        it('should not update anything if req is empty', async function () {
            let requestBody = {};
            let request: Partial<Request> = {
                body: requestBody,
                params: {
                    elevatorId: 'id'
                }
            };
            let response: Partial<Response> = {
                json: sinon.stub().returnsThis(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(elevatorDataSourceFull);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(elevatorDataSourceFull);
            elevatorRepoMock.save.resolves(null);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);

            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(true);

            // Stub elevatorFactory methods
            elevatorFactoryMock.createElevator.resolves(elevatorDataSourceFull);



            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);
            const elevatorServiceSpy = sinon.spy(elevatorServiceInstance, 'updateElevator');

            // Act
            await controller.updateElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.json);
            sinon.assert.calledWith(response.json, sinon.match({
                domainId: 'id'.toString(),
                uniqueNumber: 1,
                brand: 'Brand 1',
                model: 'Model 1',
                serialNumber: 'Serial 1',
                description: 'Elevator 1',
                elevatorPosition: { xposition: 4, yposition: 8 },
                orientation: 'NORTH'
            }));
            sinon.assert.calledOnce(elevatorServiceSpy);
        });

        it('should return 400 when position not available', async function () {
            let requestBody = {
              uniqueNumber: 1,
              brand: 'Brand 2',
              model: 'Model 2',
              serialNumber: 'Serial 2',
              description: 'Elevator 2',
              floors: [floorDataSource1.id.toString()],
              elevatorPosition: {
                    xposition: 4,
                    yposition: 8
              },
              orientation: 'NORTH'
            };
            let request: Partial<Request> = {
              body: requestBody,
              params: {
                elevatorId: 'id'
              }
            };
            let response: Partial<Response> = {
              json: sinon.stub().returnsThis(),
              status: sinon.stub().returnsThis(),
              send: sinon.spy(),
            };

          
            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(elevatorDataSourceFull);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(elevatorDataSourceFull);
          
            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);
          
            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(false);
          
            let elevatorServiceInstance = Container.get(config.services.elevator.name);
          
            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);
            const elevatorServiceSpy = sinon.spy(elevatorServiceInstance, 'updateElevator');
          
            // Act
            await controller.updateElevator(<Request>request, <Response>response);
          
            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The position is not available in the floor.'}));
          
        });

        it('should return 400 when TypeError is thrown', async function () {
            let requestBody = {
                uniqueNumber: 1,
            };
            let request: Partial<Request> = {
                body: requestBody,
                params: {
                    elevatorId: 'id'
                }
            };
            let response: Partial<Response> = {
                json: sinon.stub().returnsThis(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(new TypeError('Example of Type Error.'));


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await controller.updateElevator(<Request>request, <Response>response);

            // Assert
  
            sinon.assert.calledWith(response.status, 400);
        });
       
        it ('should return 400 when adding a brand without a model (existent or new)', async function () {
            let requestBody = {
                uniqueNumber: 1,
                brand: 'Brand 2',
                serialNumber: 'Serial 2',
                description: 'Elevator 2',
                elevatorPosition: {
                    xposition: 2,
                    yposition: 3
                },
                floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody,
                params: {
                    elevatorId: 'id2'
                }
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(elevatorDataSourceNoBrandNoModel);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);

            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(true);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await controller.updateElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'Model is required when brand is provided.'}));

        });

        it ('should return 400 when floor not from building when updating floors', async function () {
            let requestBody = {
                uniqueNumber: 1,
                brand: 'Brand 2',
                model: 'Model 2',
                serialNumber: 'Serial 2',
                description: 'Elevator 2',
                elevatorPosition: {
                    xposition: 2,
                    yposition: 3
                },
                floors: [floorDataSource2.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody,
                params: {
                    elevatorId: 'id2'
                }
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(elevatorDataSourceNoBrandNoModel);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource2);

            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(true);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await controller.updateElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The floor does not belong to the building.'}));
        });

        it ('should return 400 when floor not from building when not updating floors', async function () {
            let requestBody = {
                uniqueNumber: 1,
                brand: 'Brand 2',
                model: 'Model 2',
                serialNumber: 'Serial 2',
                description: 'Elevator 2',
                elevatorPosition: {
                    xposition: 2,
                    yposition: 3
                },
            };
            let request: Partial<Request> = {
                body: requestBody,
                params: {
                    elevatorId: 'id2'
                }
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(elevatorDataSourceNoBrandNoModel);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource2);

            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(true);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await controller.updateElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The floor does not belong to the building.'}));
        });

        it ('should return 400 when elevator xposition is not available', async function () {
            let requestBody = {
                uniqueNumber: 1,
                brand: 'Brand 2',
                model: 'Model 2',
                serialNumber: 'Serial 2',
                description: 'Elevator 2',
                elevatorPosition: {
                    xposition: -2,
                    yposition: 3
                },
                floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody,
                params: {
                    elevatorId: 'id2'
                }
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(elevatorDataSourceNoBrandNoModel);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);

            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(true);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await controller.updateElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The elevator position is invalid.'}));
        });

        it ('should return 400 when elevator position is outside the building', async function () {
            let requestBody = {
                uniqueNumber: 1,
                brand: 'Brand 2',
                model: 'Model 2',
                serialNumber: 'Serial 2',
                description: 'Elevator 2',
                elevatorPosition: {
                    xposition: 2,
                    yposition: 40
                },
                floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody,
                params: {
                    elevatorId: 'id2'
                }
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(elevatorDataSourceNoBrandNoModel);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);

            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
            positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(false);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await controller.updateElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The elevator position is outside the building.'}));
        });

        it('should return 400 when only changing floor and it is occupied', async function () {
            let requestBody = {
                uniqueNumber: 1,
                brand: 'Brand 2',
                model: 'Model 2',
                serialNumber: 'Serial 2',
                description: 'Elevator 2',
                floors: [floorDataSource3.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody,
                params: {
                    elevatorId: 'id2'
                }
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(elevatorDataSourceNoBrandNoModel);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);

            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
            positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(false);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await controller.updateElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'Position not available using this orientation.'}));
        });

        it('should return 400 when only changing floor and it is occupied', async function () {
            let requestBody = {
                uniqueNumber: 1,
                brand: 'Brand 2',
                model: 'Model 2',
                serialNumber: 'Serial 2',
                description: 'Elevator 2',
                floors: [floorDataSource3.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody,
                params: {
                    elevatorId: 'id2'
                }
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(elevatorDataSourceNoBrandNoModel);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);

            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(false);
            positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(true);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await controller.updateElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The position is not available in the floor.'}));
        });

        it('should return 400 when updating with duplicated floors', async function () {
            let requestBody = {
                uniqueNumber: 1,
                brand: 'Brand 2',
                model: 'Model 2',
                serialNumber: 'Serial 2',
                description: 'Elevator 2',
                floors: [floorDataSource1.id.toString(), floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody,
                params: {
                    elevatorId: 'id2'
                }
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(elevatorDataSourceNoBrandNoModel);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);

            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
            positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(false);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);
            const elevatorServiceSpy = sinon.spy(elevatorServiceInstance, 'updateElevator');

            // Act
            await controller.updateElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'There is a duplicate floor.'}));
        });

        it('should return 400 when updating orientation to NORTH and position outside building', async function () {
            let requestBody = {
                uniqueNumber: 1,
                brand: 'Brand 2',
                model: 'Model 2',
                serialNumber: 'Serial 2',
                orientation: 'NORTH',
                description: 'Elevator 2',
                elevatorPosition: {
                    xposition: 2,
                    yposition: 0
                },
                floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody,
                params: {
                    elevatorId: 'id2'
                }
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(elevatorDataSourceNoBrandNoModel);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await controller.updateElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The elevator door orientation is outside the building.'}));
        });

        it('should return 400 when updating orientation to SOUTH and position outside building', async function () {
            let requestBody = {
                uniqueNumber: 1,
                brand: 'Brand 2',
                model: 'Model 2',
                serialNumber: 'Serial 2',
                orientation: 'SOUTH',
                description: 'Elevator 2',
                elevatorPosition: {
                    xposition: 2,
                    yposition: 9
                },
                floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody,
                params: {
                    elevatorId: 'id2'
                }
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(elevatorDataSourceNoBrandNoModel);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await controller.updateElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The elevator door orientation is outside the building.'}));
        });

        it('should return 400 when updating orientation to EAST and position outside building', async function () {
            let requestBody = {
                uniqueNumber: 1,
                brand: 'Brand 2',
                model: 'Model 2',
                serialNumber: 'Serial 2',
                orientation: 'EAST',
                description: 'Elevator 2',
                elevatorPosition: {
                    xposition: 4,
                    yposition: 2
                },
                floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody,
                params: {
                    elevatorId: 'id2'
                }
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(elevatorDataSourceNoBrandNoModel);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await controller.updateElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The elevator door orientation is outside the building.'}));
        });

        it('should return 400 when updating orientation to WEST and position outside building', async function () {
            let requestBody = {
                uniqueNumber: 1,
                brand: 'Brand 2',
                model: 'Model 2',
                serialNumber: 'Serial 2',
                orientation: 'WEST',
                description: 'Elevator 2',
                elevatorPosition: {
                    xposition: 0,
                    yposition: 1
                },
                floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody,
                params: {
                    elevatorId: 'id2'
                }
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(elevatorDataSourceNoBrandNoModel);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await controller.updateElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The elevator door orientation is outside the building.'}));
        });

        it('should return 400 when updating orientation to an occupied position', async function () {
            let requestBody = {
                uniqueNumber: 1,
                brand: 'Brand 2',
                model: 'Model 2',
                serialNumber: 'Serial 2',
                description: 'Elevator 2',
                orientation: 'NORTH',
                floors: [floorDataSource3.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody,
                params: {
                    elevatorId: 'id2'
                }
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(elevatorDataSourceNoBrandNoModel);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);

            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.onCall(0).resolves(true);
            positionCheckerServiceMock.isPositionAvailable.onCall(1).resolves(false);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await controller.updateElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'Position not available using this orientation.'}));
        });

        it('should return 401 if a user is not authorized', async function () {
            let requestBody = {};
            let request: Partial<Request> = {
                body: requestBody,
                params: {
                    elevatorId: 'id'
                }
            };
            let response: Partial<Response> = {
                json: sinon.stub().returnsThis(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };




            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            // Force the service to throw an error
            sinon.stub(elevatorServiceInstance, 'updateElevator').throws(new Error('You are not authorized to perform this action'));

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);
  

            // Act
            await controller.updateElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 401);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, 'You are not authorized to perform this action');
        });
        
        it ('should return 404 when floor does not exist when updating floors', async function () {
            let requestBody = {
                floors: [floorDataSource2.id.toString()]    
            };
            let request: Partial<Request> = {
                body: requestBody,
                params: {
                    elevatorId: 'id2'
                }
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(elevatorDataSourceNoBrandNoModel);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(null);

            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await controller.updateElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 404);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The floor does not exist.'}));

        });

        it ('should return 404 when floor does not exist when not updating floors', async function () {
            let requestBody = {
                
            };
            let request: Partial<Request> = {
                body: requestBody,
                params: {
                    elevatorId: 'id2'
                }
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(elevatorDataSourceNoBrandNoModel);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(null);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(null);

            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await controller.updateElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 404);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The floor does not exist.'}));

        });

        it ('should return 404 when building to update does not exist', async function () {

            let requestBody = {
                serialNumber: 'Serial 2',

            };
            let request: Partial<Request> = {
                body: requestBody,
                params: {
                    elevatorId: 'id3'
                }
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(null);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await controller.updateElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 404);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The elevator does not exist.'}));

        });
/*
        it( 'should return 409 when elevator uniqueNumber is already in use in the building', async function () {
            let requestBody = {
                uniqueNumber: 1,
                brand: 'Brand 2',
                model: 'Model 2',
                serialNumber: 'Serial 2',
                description: 'Elevator 2',
                elevatorPosition: {
                    xposition: 2,
                    yposition: 3
                },
                floors: [floorDataSource1.id.toString()]
            };
            let request: Partial<Request> = {
                body: requestBody,
                params: {
                    elevatorId: 'id2'
                }
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(elevatorDataSourceNoBrandNoModel);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(elevatorDataSourceFull);

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);

            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(true);


            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await controller.updateElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 409);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, 'The elevator uniqueNumber is already in use in the building.');
        });
*/
        it('should return 503 when DataBase Error is thrown', async function () {
            let requestBody = {};
            let request: Partial<Request> = {
                body: requestBody,
                params: {
                    elevatorId: 'id'
                }
            };
            let response: Partial<Response> = {
                json: sinon.stub().returnsThis(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };


            // Stub elevatorRepo methods
            elevatorRepoMock.findByDomainId.resolves(elevatorDataSourceFull);
            elevatorRepoMock.findByUniqueNumberInBuilding.resolves(elevatorDataSourceFull);
            elevatorRepoMock.save.throws(new Error('Database error'));

            // Stub floorRepo methods
            floorRepoMock.findByDomainId.resolves(floorDataSource1);

            // Stub positionCheckerService methods
            positionCheckerServiceMock.isPositionAvailable.resolves(true);

            // Stub elevatorFactory methods
            elevatorFactoryMock.createElevator.resolves(elevatorDataSourceFull);



            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);
            const elevatorServiceSpy = sinon.spy(elevatorServiceInstance, 'updateElevator');

            // Act
            await controller.updateElevator(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 503);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'Database error'}));
        });
    

    });

    describe('listElevatorsFromBuilding', function () {

        let elevatorDataSourceFull;
        let elevatorDataSourceNoBrandNoModel;
        let floorDataSource1;
        let floorDataSource2;
        let floorDataSource3;

        beforeEach(function () {
            Container.reset();

            loggerMock = {
                error: sinon.stub(),
            };
            Container.set('logger', loggerMock);

            elevatorRepoMock = {
                exists: sinon.stub(),
                findByDomainId: sinon.stub(),
                findByBuildingId: sinon.stub(),
                findByUniqueNumberInBuilding: sinon.stub(),
                save: sinon.stub(),
            };
            Container.set(config.repos.elevator.name, elevatorRepoMock);

            buildingRepoMock = {
                findByDomainId: sinon.stub(),
                save: sinon.stub(),
            };
            Container.set(config.repos.building.name, buildingRepoMock);

            floorRepoMock = {
                findByDomainId: sinon.stub(),
                save: sinon.stub(),
            };
            Container.set(config.repos.floor.name, floorRepoMock);

            positionCheckerServiceMock = {
                isPositionAvailable: sinon.stub(),
            };
            Container.set(config.services.positionChecker.name, positionCheckerServiceMock);

            elevatorFactoryMock = {
                createElevator: sinon.stub(),
            }
            Container.set(config.factories.elevator.name, elevatorFactoryMock);

            floorDataSource1 = Floor.create({floorNumber: FloorNumber.create(1).getValue(), building: BuildingDataSource.getBuildingA()}).getValue();

            floorDataSource2 = Floor.create({floorNumber: FloorNumber.create(3).getValue(), building: BuildingDataSource.getBuildingA()}).getValue();

            floorDataSource3 = Floor.create({floorNumber: FloorNumber.create(2).getValue(), building: BuildingDataSource.getBuildingB()}).getValue();


            elevatorDataSourceFull = Elevator.create({
                uniqueNumber: 1,
                description: ElevatorDescription.create('Elevator 1').getValue(),
                brand: ElevatorBrand.create('Brand 1').getValue(),
                model: ElevatorModel.create('Model 1').getValue(),
                serialNumber: ElevatorSerialNumber.create('Serial 1').getValue(),
                elevatorPosition: ElevatorPosition.create({xposition: 5, yposition: 8}).getValue(),
                orientation: ElevatorOrientation.NORTH,
                building: BuildingDataSource.getBuildingA(),
                floors: [floorDataSource1]
            }, new UniqueEntityID('id')).getValue();

            elevatorDataSourceNoBrandNoModel = Elevator.create({
                uniqueNumber: 2,
                description: ElevatorDescription.create('Elevator 2').getValue(),
                elevatorPosition: ElevatorPosition.create({xposition: 5, yposition: 8}).getValue(),
                building: BuildingDataSource.getBuildingA(),
                orientation: ElevatorOrientation.NORTH,
                floors: [floorDataSource2]
            }, new UniqueEntityID('id2')).getValue();

            let elevatorServiceClass = require('../../src/services/ServicesImpl/elevatorService').default;
            let elevatorServiceInstance = Container.get(elevatorServiceClass);
            Container.set(config.services.elevator.name, elevatorServiceInstance);


        });

        afterEach(function () {
            sandbox.restore();
        });

        it('should list all elevators from a building', async function () {
            let request: Partial<Request> = {
                params: {
                    buildingId: 'id'
                }
            };
            let response: Partial<Response> = {
                json: sinon.stub().returnsThis(),
                status: sinon.stub().returnsThis(),
            };

            // Stub buildingRepo methods
            buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());

            // Stub elevatorRepo methods
            elevatorRepoMock.findByBuildingId.resolves([ElevatorDataSource.getElevatorA()]);

            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);

            // Act
            await controller.listElevatorsFromBuilding(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.json);
            sinon.assert.calledWith(response.json,
                sinon.match([ ElevatorDataSource.getElevatorAdto()])
              );
        });

        it ('should return 400 when TypeError is thrown', async function () {
            let request: Partial<Request> = {
                params: {
                    buildingId: 'id'
                }
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            // Stub buildingRepo methods
            buildingRepoMock.findByDomainId.resolves(new TypeError('Example of Type Error.'));

            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);
            
            // Act
            await controller.listElevatorsFromBuilding(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
        });

        it('should return 401 if a user is not authorized', async function () {
            let request: Partial<Request> = {
                params: {
                    buildingId: 'id'
                }
            };
            let response: Partial<Response> = {
                json: sinon.stub().returnsThis(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            // Force the service to throw an error
            sinon.stub(elevatorServiceInstance, 'listElevatorsFromBuilding').throws(new Error('You are not authorized to perform this action'));

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);
  

            // Act
            await controller.listElevatorsFromBuilding(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 401);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, 'You are not authorized to perform this action');
        });

        it ('should return 404 when building does not exist', async function () {
            let request: Partial<Request> = {
                params: {
                    buildingId: 'id3'
                }
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            // Stub buildingRepo methods
            buildingRepoMock.findByDomainId.resolves(null);

            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);
            
            // Act
            await controller.listElevatorsFromBuilding(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 404);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'The building does not exist.'}));
        });

        it ('should return 503 when DataBase Error is thrown', async function () {
            let request: Partial<Request> = {
                params: {
                    buildingId: 'id'
                }
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            // Stub buildingRepo methods
            buildingRepoMock.findByDomainId.resolves(BuildingDataSource.getBuildingA());

            // Stub elevatorRepo methods
            elevatorRepoMock.findByBuildingId.throws(new Error('Database error'));

            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);
            
            // Act
            await controller.listElevatorsFromBuilding(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 503);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'Database error'}));
        });


    });

    describe('listAllElevators', function () {
            
        let elevatorDataSourceFull;
        let elevatorDataSourceNoBrandNoModel;
        let floorDataSource1;
        let floorDataSource2;
        let floorDataSource3;

        beforeEach(function () {
            Container.reset();

            loggerMock = {
                error: sinon.stub(),
            };
            Container.set('logger', loggerMock);

            elevatorRepoMock = {
                exists: sinon.stub(),
                findByDomainId: sinon.stub(),
                findByBuildingId: sinon.stub(),
                findByUniqueNumberInBuilding: sinon.stub(),
                findAll: sinon.stub(),
                save: sinon.stub(),
            };
            Container.set(config.repos.elevator.name, elevatorRepoMock);

            buildingRepoMock = {
                findByDomainId: sinon.stub(),
                save: sinon.stub(),
            };
            Container.set(config.repos.building.name, buildingRepoMock);

            floorRepoMock = {
                findByDomainId: sinon.stub(),
                save: sinon.stub(),
            };
            Container.set(config.repos.floor.name, floorRepoMock);

            positionCheckerServiceMock = {
                isPositionAvailable: sinon.stub(),
            };
            Container.set(config.services.positionChecker.name, positionCheckerServiceMock);

            elevatorFactoryMock = {
                createElevator: sinon.stub(),
            }
            Container.set(config.factories.elevator.name, elevatorFactoryMock);

            floorDataSource1 = Floor.create({floorNumber: FloorNumber.create(1).getValue(), building: BuildingDataSource.getBuildingA()}).getValue();

            floorDataSource2 = Floor.create({floorNumber: FloorNumber.create(3).getValue(), building: BuildingDataSource.getBuildingA()}).getValue();

            floorDataSource3 = Floor.create({floorNumber: FloorNumber.create(2).getValue(), building: BuildingDataSource.getBuildingB()}).getValue();


            elevatorDataSourceFull = Elevator.create({
                uniqueNumber: 1,
                description: ElevatorDescription.create('Elevator 1').getValue(),
                brand: ElevatorBrand.create('Brand 1').getValue(),
                model: ElevatorModel.create('Model 1').getValue(),
                serialNumber: ElevatorSerialNumber.create('Serial 1').getValue(),
                elevatorPosition: ElevatorPosition.create({xposition: 5, yposition: 8}).getValue(),
                orientation: ElevatorOrientation.NORTH,
                building: BuildingDataSource.getBuildingA(),
                floors: [floorDataSource1]
            }, new UniqueEntityID('id')).getValue();

            elevatorDataSourceNoBrandNoModel = Elevator.create({
                uniqueNumber: 2,
                description: ElevatorDescription.create('Elevator 2').getValue(),
                elevatorPosition: ElevatorPosition.create({xposition: 5, yposition: 8}).getValue(),
                orientation: ElevatorOrientation.NORTH,
                building: BuildingDataSource.getBuildingA(),
                floors: [floorDataSource2]
            }, new UniqueEntityID('id2')).getValue();

            let elevatorServiceClass = require('../../src/services/ServicesImpl/elevatorService').default;
            let elevatorServiceInstance = Container.get(elevatorServiceClass);
            Container.set(config.services.elevator.name, elevatorServiceInstance);


        });

        afterEach(function () {
            sandbox.restore();
        });

        it('should list all elevators', async function () {
            let request: Partial<Request> = {
                params: {
                }
            };
            let response: Partial<Response> = {
                json: sinon.stub().returnsThis(),
                status: sinon.stub().returnsThis(),
            };

            // Stub elevatorRepo methods
            elevatorRepoMock.findAll.resolves([ElevatorDataSource.getElevatorA()]);

            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);
            
            // Act
            await controller.listAllElevators(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.json);
            sinon.assert.calledWith(response.json,
                sinon.match([ElevatorDataSource.getElevatorAdto()])
              );
        });

        it ('should return 400 when TypeError is thrown', async function () {
            let request: Partial<Request> = {
                params: {
                }
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            // Stub elevatorRepo methods
            elevatorRepoMock.findAll.resolves(new TypeError('Example of Type Error.'));

            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);
            
            // Act
            await controller.listAllElevators(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 400);
        });

        it('should return 401 if a user is not authorized', async function () {
            let request: Partial<Request> = {
                params: {
                }
            };
            let response: Partial<Response> = {
                json: sinon.stub().returnsThis(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            // Force the service to throw an error
            sinon.stub(elevatorServiceInstance, 'listAllElevators').throws(new Error('You are not authorized to perform this action'));

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);
  

            // Act
            await controller.listAllElevators(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 401);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, 'You are not authorized to perform this action');
        });

        it ('should return 503 when DataBase Error is thrown', async function () {
            let request: Partial<Request> = {
                params: {
                }
            };
            let response: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            // Stub elevatorRepo methods
            elevatorRepoMock.findAll.throws(new Error('Database error'));

            let elevatorServiceInstance = Container.get(config.services.elevator.name);

            const controller = new ElevatorController(elevatorServiceInstance as IElevatorService);
            
            // Act
            await controller.listAllElevators(<Request>request, <Response>response);

            // Assert
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 503);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, sinon.match({message:'Database error'}));
        });

    });

    
});