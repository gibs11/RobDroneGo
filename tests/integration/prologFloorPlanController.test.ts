import 'reflect-metadata';

import * as sinon from 'sinon';
import {Container} from "typedi";
import {Request, Response} from 'express';
import {Result} from "../../src/core/logic/Result";

import config from "../../config";

import PrologFloorPlanController from "../../src/controllers/prologFloorPlanController";
import IPrologFloorPlanService from "../../src/services/IServices/IPrologFloorPlanService";

import FloorDataSource from "../datasource/floorDataSource";
import ElevatorDataSource from "../datasource/elevatorDataSource";
import RoomDataSource from "../datasource/RoomDataSource";

import IPrologFloorPlanDTO from '../../src/dto/IPrologFloorPlanDTO';

describe('PrologFloorPlanController', () => {

  describe('obtainFloorPlan', () => {

    const sandbox = sinon.createSandbox();

    let loggerMock: any;

    let buildingRepoMock: any;
    let floorRepoMock: any;
    let roomRepoMock: any;
    let elevatorRepoMock: any;

    let floorFromDataSource: any;

    let floorProlog1FromDataSource: any;

    let floorProlog2FromDataSource: any;

    let floorProlog4FromDataSource: any;

    let elevatorFromDataSourceProlog: any;

    let roomFromDataSourceProlog: any;

    beforeEach(() => {
      Container.reset();

      loggerMock = {
        error: sinon.stub(),
      };

      buildingRepoMock = {
        findByDomainId: sinon.stub(),
      };

      floorRepoMock = {
        findByDomainId: sinon.stub(),
      };

      elevatorRepoMock = {
        findAllByFloorID: sinon.stub(),
      };

      roomRepoMock = {
        findByFloorId: sinon.stub(),
      };

      Container.set("logger", loggerMock);

      floorFromDataSource = FloorDataSource.getFirstFloor();

      floorProlog1FromDataSource = FloorDataSource.floorForProlog1();

      floorProlog2FromDataSource = FloorDataSource.floorForProlog2();

      floorProlog4FromDataSource = FloorDataSource.floorForProlog4();

      elevatorFromDataSourceProlog = ElevatorDataSource.getElevatorForProlog1();

      roomFromDataSourceProlog = RoomDataSource.getRoomProlog1();

      Container.set(config.repos.building.name, buildingRepoMock);

      Container.set(config.repos.floor.name, floorRepoMock);

      Container.set(config.repos.room.name, roomRepoMock);

      Container.set(config.repos.elevator.name, elevatorRepoMock);

      let prologFloorPlanServiceClass = require("../../src/services/ServicesImpl/prologFloorPlanService").default;
      let prologFloorPlanServiceInstance = Container.get(prologFloorPlanServiceClass);
      Container.set(config.services.prologFloorPlan.name, prologFloorPlanServiceInstance);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('PrologFloorPlanController unit test using PrologFloorPlanService stub results in valid floor plan retrieved', async () => {
      // Arrange
      let req: Partial<Request> = {
        params: {
          byFloorId: floorFromDataSource.id
        }
      };

      let res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      let prologFloorPlanServiceInstance = Container.get(config.services.prologFloorPlan.name);

      sinon.stub(prologFloorPlanServiceInstance, 'obtainFloorPlan').returns(Result.ok<IPrologFloorPlanDTO>({
        floorPlanHeight: 3,
        floorPlanWidth: 3,
        floorPlanCells: [
          "m(1,1,1)",
          "m(2,1,1)",
          "m(3,1,1)",
          "m(1,2,1)",
          "m(2,2,0)",
          "m(3,2,1)",
          "m(1,3,1)",
          "m(2,3,1)",
          "m(3,3,1)",
        ]
      }));

      // Act
      const controller =
        new PrologFloorPlanController(prologFloorPlanServiceInstance as IPrologFloorPlanService);

      await controller.obtainFloorPlan(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(res.json, sinon.match({
        floorPlanHeight: 3,
        floorPlanWidth: 3,
        floorPlanCells: [
          "m(1,1,1)",
          "m(2,1,1)",
          "m(3,1,1)",
          "m(1,2,1)",
          "m(2,2,0)",
          "m(3,2,1)",
          "m(1,3,1)",
          "m(2,3,1)",
          "m(3,3,1)",
        ]
      }));
    });


    it('PrologFloorPlanController + PrologFloorPlanService integration test valid floor plan retrieved', async () => {
      // Arrange
      const floorId = floorFromDataSource.id;

      let req: Partial<Request> = {
        params: {
          byFloorId: floorId
        }
      };

      let res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Mock the floor repo
      floorRepoMock.findByDomainId.resolves(floorProlog1FromDataSource);

      // Mock the elevator repo
      elevatorRepoMock.findAllByFloorID.resolves([]);

      roomRepoMock.findByFloorId.resolves([]);

      // Act
      const controller =
        new PrologFloorPlanController(Container.get(config.services.prologFloorPlan.name) as IPrologFloorPlanService);

      await controller.obtainFloorPlan(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(res.json, sinon.match({
        floorPlanHeight: 3,
        floorPlanWidth: 3,
        floorPlanCells: [
          `m(${floorId},1,1,0)`,
          `m(${floorId},2,1,0)`,
          `m(${floorId},3,1,0)`,
          `m(${floorId},1,2,0)`,
          `m(${floorId},2,2,0)`,
          `m(${floorId},3,2,0)`,
          `m(${floorId},1,3,0)`,
          `m(${floorId},2,3,0)`,
          `m(${floorId},3,3,0)`,
        ]
      }));
    });


    it('PrologFloorPlanController + PrologFloorPlanService integration test valid floor plan retrieved, passage in the floor', async () => {
      // Arrange
      const floorId = floorFromDataSource.id;

      let req: Partial<Request> = {
        params: {
          byFloorId: floorId
        }
      };

      let res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Mock the floor repo
      floorRepoMock.findByDomainId.resolves(floorProlog2FromDataSource);

      // Mock the elevator repo
      elevatorRepoMock.findAllByFloorID.resolves([]);

      roomRepoMock.findByFloorId.resolves([]);

      // Act
      const controller =
        new PrologFloorPlanController(Container.get(config.services.prologFloorPlan.name) as IPrologFloorPlanService);

      await controller.obtainFloorPlan(<Request>req, <Response>res);


      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(res.json, sinon.match({
        floorPlanHeight: 4,
        floorPlanWidth: 4,
        floorPlanCells: [
          `m(${floorId},1,1,0)`,
          `m(${floorId},2,1,0)`,
          `m(${floorId},3,1,0)`,
          `m(${floorId},4,1,0)`,
          `m(${floorId},1,2,0)`,
          `m(${floorId},2,2,0)`,
          `m(${floorId},3,2,0)`,
          `m(${floorId},4,2,0)`,
          `m(${floorId},1,3,0)`,
          `m(${floorId},2,3,0)`,
          `m(${floorId},3,3,0)`,
          `m(${floorId},4,3,0)`,
          `m(${floorId},1,4,0)`,
          `m(${floorId},2,4,0)`,
          `m(${floorId},3,4,0)`,
          `m(${floorId},4,4,0)`,
        ]
      }));

    });


    it('PrologFloorPlanController + PrologFloorPlanService integration test valid floor plan retrieved, opposite passage in the floor', async () => {
      // Arrange
      const floorId = floorFromDataSource.id;

      let req: Partial<Request> = {
        params: {
          byFloorId: floorId
        }
      };

      let res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Mock the floor repo
      floorRepoMock.findByDomainId.resolves(floorProlog1FromDataSource);

      // Mock the elevator repo
      elevatorRepoMock.findAllByFloorID.resolves([]);

      roomRepoMock.findByFloorId.resolves([]);

      // Act
      const controller =
        new PrologFloorPlanController(Container.get(config.services.prologFloorPlan.name) as IPrologFloorPlanService);

      await controller.obtainFloorPlan(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(res.json, sinon.match({
        floorPlanHeight: 3,
        floorPlanWidth: 3,
        floorPlanCells: [
          `m(${floorId},1,1,0)`,
          `m(${floorId},2,1,0)`,
          `m(${floorId},3,1,0)`,
          `m(${floorId},1,2,0)`,
          `m(${floorId},2,2,0)`,
          `m(${floorId},3,2,0)`,
          `m(${floorId},1,3,0)`,
          `m(${floorId},2,3,0)`,
          `m(${floorId},3,3,0)`,
        ]
      }));

    });


    it('PrologFloorPlanController + PrologFloorPlanService integration test valid floor plan retrieved, elevator in the floor', async () => {
      // Arrange
      const floorId = floorFromDataSource.id;

      let req: Partial<Request> = {
        params: {
          byFloorId: floorId
        }
      };

      let res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Mock the floor repo
      floorRepoMock.findByDomainId.resolves(floorProlog2FromDataSource);

      // Mock the elevator repo
      elevatorRepoMock.findAllByFloorID.resolves([
        elevatorFromDataSourceProlog
      ]);

      roomRepoMock.findByFloorId.resolves([]);

      // Act
      const controller =
        new PrologFloorPlanController(Container.get(config.services.prologFloorPlan.name) as IPrologFloorPlanService);

      await controller.obtainFloorPlan(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(res.json, sinon.match({
        floorPlanHeight: 4,
        floorPlanWidth: 4,
        floorPlanCells: [
          `m(${floorId},1,1,0)`,
          `m(${floorId},2,1,0)`,
          `m(${floorId},3,1,0)`,
          `m(${floorId},4,1,0)`,
          `m(${floorId},1,2,0)`,
          `m(${floorId},2,2,0)`,
          `m(${floorId},3,2,0)`,
          `m(${floorId},4,2,0)`,
          `m(${floorId},1,3,0)`,
          `m(${floorId},2,3,0)`,
          `m(${floorId},3,3,0)`,
          `m(${floorId},4,3,0)`,
          `m(${floorId},1,4,0)`,
          `m(${floorId},2,4,0)`,
          `m(${floorId},3,4,0)`,
          `m(${floorId},4,4,1)`,
        ]
      }));
    });


    it('PrologFloorPlanController + PrologFloorPlanService integration test valid floor plan retrieved, room in the floor', async () => {
      // Arrange
      const floorId = floorFromDataSource.id;

      let req: Partial<Request> = {
        params: {
          byFloorId: floorId
        }
      };

      let res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Mock the floor repo
      floorRepoMock.findByDomainId.resolves(floorProlog4FromDataSource);

      // Mock the elevator repo
      elevatorRepoMock.findAllByFloorID.resolves([]);

      roomRepoMock.findByFloorId.resolves([
        roomFromDataSourceProlog
      ]);

      // Act
      const controller =
        new PrologFloorPlanController(Container.get(config.services.prologFloorPlan.name) as IPrologFloorPlanService);

      await controller.obtainFloorPlan(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(res.json, sinon.match({
        floorPlanHeight: 3,
        floorPlanWidth: 3,
        floorPlanCells: [
          `m(${floorId},1,1,0)`,
          `m(${floorId},2,1,1)`,
          `m(${floorId},3,1,0)`,
          `m(${floorId},1,2,0)`,
          `m(${floorId},2,2,1)`,
          `m(${floorId},3,2,0)`,
          `m(${floorId},1,3,0)`,
          `m(${floorId},2,3,1)`,
          `m(${floorId},3,3,0)`,
        ]
      }));

    });


    it('PrologFloorPlanController + PrologFloorPlanService integration test valid floor plan retrieved, all cells occupied', async () => {
      // Arrange
      const floorId = floorFromDataSource.id;

      let req: Partial<Request> = {
        params: {
          byFloorId: floorId
        }
      };

      let res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Mock the floor repo
      floorRepoMock.findByDomainId.resolves(floorProlog2FromDataSource);

      // Mock the elevator repo
      elevatorRepoMock.findAllByFloorID.resolves([]);

      roomRepoMock.findByFloorId.resolves([]);

      // Act
      const controller =
        new PrologFloorPlanController(Container.get(config.services.prologFloorPlan.name) as IPrologFloorPlanService);

      await controller.obtainFloorPlan(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(res.json, sinon.match({
        floorPlanHeight: 4,
        floorPlanWidth: 4,
        floorPlanCells: [
          `m(${floorId},1,1,0)`,
          `m(${floorId},2,1,0)`,
          `m(${floorId},3,1,0)`,
          `m(${floorId},4,1,0)`,
          `m(${floorId},1,2,0)`,
          `m(${floorId},2,2,0)`,
          `m(${floorId},3,2,0)`,
          `m(${floorId},4,2,0)`,
          `m(${floorId},1,3,0)`,
          `m(${floorId},2,3,0)`,
          `m(${floorId},3,3,0)`,
          `m(${floorId},4,3,0)`,
          `m(${floorId},1,4,0)`,
          `m(${floorId},2,4,0)`,
          `m(${floorId},3,4,0)`,
          `m(${floorId},4,4,0)`,
        ]
      }));
    });


    it('PrologFloorPlanController should return 401 user is not authorized', async () => {
      // Arrange
      const floorId = floorFromDataSource.id;

      let req: Partial<Request> = {
        params: {
          byFloorId: floorId
        }
      };

      let res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      let prologFloorPlanServiceInstance = Container.get(config.services.prologFloorPlan.name);

      sinon.stub(prologFloorPlanServiceInstance, 'obtainFloorPlan').throws(new Error("User is not authorized"));

      // Act
      const controller =
        new PrologFloorPlanController(prologFloorPlanServiceInstance as IPrologFloorPlanService);

      await controller.obtainFloorPlan(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 401);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, "User is not authorized");
    });


    it('PrologFloorPlanController should return 404 when floor does not exist', async () => {
      // Arrange
      let req: Partial<Request> = {
        params: {
          byFloorId: "Invalid floor id"
        }
      };

      let res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Mock the floor repo
      floorRepoMock.findByDomainId.resolves(null);

      const controller =
        new PrologFloorPlanController(Container.get(config.services.prologFloorPlan.name) as IPrologFloorPlanService);

      // Act
      await controller.obtainFloorPlan(<Request>req, <Response>res);

      const id = "Invalid floor id";

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 404);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, {message: 'Floor with id ' + id + ' does not exist'});
    });

  });

});
