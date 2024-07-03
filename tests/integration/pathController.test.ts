import 'reflect-metadata';
import { Container } from 'typedi';
import * as sinon from 'sinon';
import config from '../../config';
import { Request, Response } from 'express';
import IPathOutDTO from '../../src/dto/out/IPathOutDTO';
import { Result } from '../../src/core/logic/Result';
import PathController from '../../src/controllers/pathController';
import IPathService from '../../src/services/IServices/IPathService';
import FloorDataSource from "../datasource/floorDataSource";
import RoomDataSource from "../datasource/RoomDataSource";

describe('Path Controller', () => {
  const sandbox = sinon.createSandbox();
  let loggerMock;
  let floorRepoMock;
  let roomRepoMock;
  let pathGatewayMock;

  describe('GET Path', () => {
    beforeEach(() => {
      Container.reset();
      loggerMock = {
        error: sinon.stub(),
      };
      Container.set('logger', loggerMock);

      floorRepoMock = {
        findByDomainId: sinon.stub(),
      };
      Container.set(config.repos.floor.name, floorRepoMock);

      roomRepoMock = {
        findByDomainId: sinon.stub(),
      };
      Container.set(config.repos.room.name, roomRepoMock);

      pathGatewayMock = {
        getLowestCostPath: sinon.stub(),
      };
      Container.set(config.gateways.path.name, pathGatewayMock);

      const pathServiceClass = require('../../src/services/ServicesImpl/pathService').default;
      const pathServiceInstance = Container.get(pathServiceClass);
      Container.set(config.services.path.name, pathServiceInstance);
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('success', () => {
      it('PassageController unit test using PathService stub', async function() {
        const request: Partial<Request> = {
          query: {
            originFloorId: '1',
            originRoomId: '1',
            destinationFloorId: '2',
            destinationRoomId: '2',
          },
        };
        const response: Partial<Response> = {
          json: sinon.spy(),
          status: sinon.stub().returnsThis(),
          send: sinon.spy(),
        };

        const pathOutDTO = {
          path: 'cel(5,4) -> cel(6,4) -> cel(7,4)',
          cost: '3',
        };

        const pathServiceInstance = Container.get(config.services.path.name);

        // Stub
        sinon.stub(pathServiceInstance, 'getLowestCostPath').returns(Result.ok<IPathOutDTO>(pathOutDTO));

        const controller = new PathController(pathServiceInstance as IPathService);

        // Act
        await controller.getLowestCostPath(request as Request, response as Response);

        // Assert
        sinon.assert.calledOnce(response.json);
        sinon.assert.calledWith(response.json, sinon.match({ path: 'cel(5,4) -> cel(6,4) -> cel(7,4)', cost: '3' }));
      });

      describe('insuccess', () => {
        it('should return 404 if the floor does not exist', async function() {
          const request: Partial<Request> = {
            query: {
              originFloorId: '1',
              originRoomId: '1',
              destinationFloorId: '2',
              destinationRoomId: '2',
            },
          };
          const response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };

          floorRepoMock.findByDomainId.onCall(0).resolves(null);

          let pathServiceInstance = Container.get(config.services.path.name);
          const controller = new PathController(pathServiceInstance as IPathService);

          // Act
          await controller.getLowestCostPath(request as Request, response as Response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 404);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send, sinon.match({ message: 'The origin floor does not exist.' }));
        });
        it('should return 404 if the destinationFloor does not exist ', async function() {
          const request: Partial<Request> = {
            query: {
              originFloorId: '1',
              originRoomId: '1',
              destinationFloorId: '2',
              destinationRoomId: '2',
            },
          };
          const response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };

          floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());

          floorRepoMock.findByDomainId.onCall(1).resolves(null);

          let pathServiceInstance = Container.get(config.services.path.name);
          const controller = new PathController(pathServiceInstance as IPathService);

          // Act
          await controller.getLowestCostPath(request as Request, response as Response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 404);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send, sinon.match({ message: 'The destination floor does not exist.' }));
        });

        it('should return 404 if the originRoom does not exist ', async function() {
          const request: Partial<Request> = {
            query: {
              originFloorId: '1',
              originRoomId: '1',
              destinationFloorId: '2',
              destinationRoomId: '2',
            },
          };
          const response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };

          floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());

          floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getSecondFloor());

          roomRepoMock.findByDomainId.onCall(0).resolves(null);

          let pathServiceInstance = Container.get(config.services.path.name);
          const controller = new PathController(pathServiceInstance as IPathService);

          // Act
          await controller.getLowestCostPath(request as Request, response as Response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 404);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send, sinon.match({ message: 'The origin room does not exist.' }));
        });

        it('should return 404 if the destinationRoom does not exist ', async function() {
          const request: Partial<Request> = {
            query: {
              originFloorId: '1',
              originRoomId: '1',
              destinationFloorId: '2',
              destinationRoomId: '2',
            },
          };
          const response: Partial<Response> = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy(),
          };

          floorRepoMock.findByDomainId.onCall(0).resolves(FloorDataSource.getFirstFloor());

          floorRepoMock.findByDomainId.onCall(1).resolves(FloorDataSource.getSecondFloor());

          roomRepoMock.findByDomainId.onCall(0).resolves(RoomDataSource.getRoomA());

          roomRepoMock.findByDomainId.onCall(1).resolves(null);

          let pathServiceInstance = Container.get(config.services.path.name);
          const controller = new PathController(pathServiceInstance as IPathService);

          // Act
          await controller.getLowestCostPath(request as Request, response as Response);

          // Assert
          sinon.assert.calledOnce(response.status);
          sinon.assert.calledWith(response.status, 404);
          sinon.assert.calledOnce(response.send);
          sinon.assert.calledWith(response.send, sinon.match({ message: 'The destination room does not exist.' }));
        });
      });
    });
  });
});
