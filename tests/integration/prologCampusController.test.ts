import 'reflect-metadata';

import * as sinon from 'sinon';
import { Response, Request } from 'express';
import { Container } from 'typedi';
import { Result } from '../../src/core/logic/Result';
import config from '../../config';


import PrologCampusController from '../../src/controllers/prologCampusController';
import IPrologCampusService from '../../src/services/IServices/IPrologCampusService';
import IPrologCampusDTO from '../../src/dto/IPrologCampusDTO';

import FloorDataSource from '../datasource/floorDataSource';
import ElevatorDataSource from '../datasource/elevatorDataSource';
import BuildingDataSource from '../datasource/buildingDataSource';
import PassageDataSource from '../datasource/passageDataSource';

import { Passage } from "../../src/domain/passage/passage";
import { PassagePoint } from "../../src/domain/passage/passagePoint";
import {UniqueEntityID} from '../../src/core/domain/UniqueEntityID';
import { ElevatorPosition } from '../../src/domain/elevator/elevatorPosition';
import { ElevatorOrientation } from '../../src/domain/elevator/elevatorOrientation';
import { Elevator } from '../../src/domain/elevator/elevator';


describe('PrologCampusController', () => {

    const sandbox = sinon.createSandbox();

    let loggerMock;
    let elevatorRepoMock;
    let buildingRepoMock;
    let floorRepoMock;
    let passageRepoMock;

    describe('prologCampusFacts', () => {

        let floorDataSource1;
        let floorDataSource2;

        let elevatorNorth;
        let elevatorSouth;
        let elevatorEast;
        let elevatorWest;

        let buildingDataSource1;
        let buildingDataSource2;

        let passageDataSource1;
        let passageDataSource2;
        let passageDataSource3;


        let xpos = 5;
        let ypos = 5;

        beforeEach(function() {

            Container.reset();

            loggerMock = {
                error: sinon.stub(),
            };
            Container.set('logger', loggerMock);

            elevatorRepoMock = {
                findByBuildingId: sinon.stub(),
            };
            Container.set(config.repos.elevator.name, elevatorRepoMock);

            buildingRepoMock = {
                findAll: sinon.stub(),
            };
            Container.set(config.repos.building.name, buildingRepoMock);

            floorRepoMock = {
                findByBuildingId: sinon.stub(),
            };
            Container.set(config.repos.floor.name, floorRepoMock);

            passageRepoMock = {
                findAll: sinon.stub(),
            };
            Container.set(config.repos.passage.name, passageRepoMock);

            floorDataSource1 = FloorDataSource.getFirstFloor();
            floorDataSource2 = FloorDataSource.getSecondFloor();

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
            
            buildingDataSource1 = BuildingDataSource.getBuildingA();
            buildingDataSource2 = BuildingDataSource.getBuildingB();

            passageDataSource1 = PassageDataSource.getPassageA();
            passageDataSource2 = PassageDataSource.getPassageA();
            passageDataSource3 = Passage.create({
                passageStartPoint: PassagePoint.create({
                  floor: FloorDataSource.getThirdFloor(),
                  firstCoordinates: PassageDataSource.getPassagePointB().firstCoordinates,
                  lastCoordinates: PassageDataSource.getPassagePointB().lastCoordinates
                }).getValue(),
                passageEndPoint: PassagePoint.create({
                  floor: FloorDataSource.getFirstFloor(),
                  firstCoordinates: PassageDataSource.getPassagePointA().firstCoordinates,
                  lastCoordinates: PassageDataSource.getPassagePointA().lastCoordinates
                }).getValue()
              }, new UniqueEntityID("3")).getValue();

            let prologCampusService = require('../../src/services/ServicesImpl/prologCampusService').default;
            let prologCampusServiceInstance = Container.get(prologCampusService);
            Container.set(config.services.prologCampus.name, prologCampusServiceInstance);

        });

        afterEach(function () {
            sandbox.restore();
        });

        it('should return all the campus facts NORTH', async () => {
    
            const prologCampusController = Container.get(PrologCampusController);

            let request: Partial<Request> = {
                params: {
                }
            };
            let response: Partial<Response> = {
                json: sinon.stub().returnsThis(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            elevatorRepoMock.findByBuildingId.resolves([elevatorNorth.getValue()]);
            buildingRepoMock.findAll.resolves([buildingDataSource1, buildingDataSource2]);
            floorRepoMock.findByBuildingId.resolves([floorDataSource1]);
            passageRepoMock.findAll.resolves([passageDataSource1, passageDataSource2]);


            await prologCampusController.prologCampusFacts(<Request>request, <Response>response);

            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 200);
            sinon.assert.calledOnce(response.json);
            sinon.assert.calledWith(response.json, sinon.match({
                floors: ['floors(1,[1])', 'floors(2,[1])'],
                elevators: ['elevator(1,[1],cel(6,5))', 'elevator(2,[1],cel(6,5))'],
                passages: ['passage(1,2,1,2,cel(1,1),cel(1,1))', 'passage(1,2,1,2,cel(1,1),cel(1,1))'],
                connects: ['connects(1,2)'],
            }));



        });

        it('should return all the campus facts SOUTH', async () => {
    
            const prologCampusController = Container.get(PrologCampusController);

            let request: Partial<Request> = {
                params: {
                }
            };
            let response: Partial<Response> = {
                json: sinon.stub().returnsThis(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            elevatorRepoMock.findByBuildingId.resolves([elevatorSouth.getValue()]);
            buildingRepoMock.findAll.resolves([buildingDataSource1, buildingDataSource2]);
            floorRepoMock.findByBuildingId.resolves([floorDataSource1]);
            passageRepoMock.findAll.resolves([passageDataSource1, passageDataSource3]);


            await prologCampusController.prologCampusFacts(<Request>request, <Response>response);

            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 200);
            sinon.assert.calledOnce(response.json);
            sinon.assert.calledWith(response.json, sinon.match({
                connects: ['connects(1,2)', 'connects(3,1)'],
                elevators: ['elevator(1,[1],cel(6,7))', 'elevator(2,[1],cel(6,7))'],
                floors: ['floors(1,[1])', 'floors(2,[1])'],
                passages: ['passage(1,2,1,2,cel(1,1),cel(1,1))', 'passage(3,1,3,1,cel(1,1),cel(1,1))'],
            }));

        });


        it('should return all the campus facts EAST', async () => {
    
            const prologCampusController = Container.get(PrologCampusController);

            let request: Partial<Request> = {
                params: {
                }
            };
            let response: Partial<Response> = {
                json: sinon.stub().returnsThis(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            elevatorRepoMock.findByBuildingId.resolves([elevatorEast.getValue()]);
            buildingRepoMock.findAll.resolves([buildingDataSource1, buildingDataSource2]);
            floorRepoMock.findByBuildingId.resolves([floorDataSource1]);
            passageRepoMock.findAll.resolves([passageDataSource1, passageDataSource3]);


            await prologCampusController.prologCampusFacts(<Request>request, <Response>response);

            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 200);
            sinon.assert.calledOnce(response.json);
            sinon.assert.calledWith(response.json, sinon.match({
                connects: ['connects(1,2)', 'connects(3,1)'],
                elevators: ['elevator(1,[1],cel(7,6))', 'elevator(2,[1],cel(7,6))'],
                floors: ['floors(1,[1])', 'floors(2,[1])'],
                passages: ['passage(1,2,1,2,cel(1,1),cel(1,1))', 'passage(3,1,3,1,cel(1,1),cel(1,1))'],
            }));

        });

        it('should return all the campus facts WEST', async () => {
    
            const prologCampusController = Container.get(PrologCampusController);

            let request: Partial<Request> = {
                params: {
                }
            };
            let response: Partial<Response> = {
                json: sinon.stub().returnsThis(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            elevatorRepoMock.findByBuildingId.resolves([elevatorWest.getValue()]);
            buildingRepoMock.findAll.resolves([buildingDataSource1, buildingDataSource2]);
            floorRepoMock.findByBuildingId.resolves([floorDataSource1]);
            passageRepoMock.findAll.resolves([passageDataSource1, passageDataSource3]);


            await prologCampusController.prologCampusFacts(<Request>request, <Response>response);

            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 200);
            sinon.assert.calledOnce(response.json);
            sinon.assert.calledWith(response.json, sinon.match({
                connects: ['connects(1,2)', 'connects(3,1)'],
                elevators: ['elevator(1,[1],cel(5,6))', 'elevator(2,[1],cel(5,6))'],
                floors: ['floors(1,[1])', 'floors(2,[1])'],
                passages: ['passage(1,2,1,2,cel(1,1),cel(1,1))', 'passage(3,1,3,1,cel(1,1),cel(1,1))'],
            }));

        });


        it('should return 401 if a user is not authorized', async function () {
                                        
            const prologCampusController = Container.get(PrologCampusController);
    
            let request: Partial<Request> = {
                params: {
                }
            };
            let response: Partial<Response> = {
                json: sinon.stub().returnsThis(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };
    
            let prologCampusServiceInstance = Container.get(config.services.prologCampus.name);
            // Force the service to throw an error
            sinon.stub(prologCampusServiceInstance, 'prologCampusFacts').throws(new Error('You are not authorized to perform this action'));
            
            await prologCampusController.prologCampusFacts(<Request>request, <Response>response);
    
            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 401);
            sinon.assert.calledOnce(response.send);
            sinon.assert.calledWith(response.send, 'You are not authorized to perform this action');
    
        });


        it('should return 503 when DataBase Error is thrown', async () => {
                                                                                                                    
            const prologCampusController = Container.get(PrologCampusController);
    
            let request: Partial<Request> = {
                params: {
                }
            };
            let response: Partial<Response> = {
                json: sinon.stub().returnsThis(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };
    
            elevatorRepoMock.findByBuildingId.rejects(new Error('Database Error'));
            buildingRepoMock.findAll.resolves([buildingDataSource1, buildingDataSource2]);
            floorRepoMock.findByBuildingId.resolves([floorDataSource1]);
            passageRepoMock.findAll.resolves([passageDataSource1, passageDataSource2]);

            await prologCampusController.prologCampusFacts(<Request>request, <Response>response);

            sinon.assert.calledOnce(response.status);
            sinon.assert.calledWith(response.status, 503);
        });

    });
    


});