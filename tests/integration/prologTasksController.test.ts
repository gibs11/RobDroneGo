import 'reflect-metadata';
import * as sinon from 'sinon';
import {Container} from "typedi";
import {Request, Response} from 'express';
import {FailureType, Result} from "../../src/core/logic/Result";
import config from "../../config";
import PrologFloorPlanController from "../../src/controllers/prologFloorPlanController";
import IPrologFloorPlanService from "../../src/services/IServices/IPrologFloorPlanService";
import RobisepDataSource from "../datasource/RobisepDataSource";
import IPrologTasksService from "../../src/services/IServices/IPrologTasksService";
import IPrologTasksDTO from "../../src/dto/IPrologTasksDTO";
import PrologTasksController from "../../src/controllers/prologTasksController";
import PickUpAndDeliveryTaskDataSource from "../datasource/task/pickUpAndDeliveryTaskDataSource";
import SurveillanceTaskDataSource from "../datasource/task/surveillanceTaskDataSource";

describe('PrologFloorPlanController', () => {

  describe('obtainFloorPlan', () => {

    const sandbox = sinon.createSandbox();

    let loggerMock: any;

    let surveillanceTaskRepoMock: any;
    let pickUpAndDeliveryTaskRepoMock: any;
    let robisepRepoMock: any;

    let robisepMock: any;
    let surveillanceTaskMock: any;
    let pickUpAndDeliveryTaskMock: any;

    beforeEach(() => {
      Container.reset();

      loggerMock = {
        error: sinon.stub(),
      };

      robisepRepoMock = {
        findByDomainId: sinon.stub(),
      };

      surveillanceTaskRepoMock = {
        findByStateAndRobisepId: sinon.stub(),
      };

      pickUpAndDeliveryTaskRepoMock = {
        findByStateAndRobisepId: sinon.stub(),
      };

      robisepMock = RobisepDataSource.getRobisepA();

      surveillanceTaskMock = SurveillanceTaskDataSource.getBuildingBSurveillanceTaskWithRobisep();

      pickUpAndDeliveryTaskMock = PickUpAndDeliveryTaskDataSource.getRoomBToRoomProlog1PickUpAndDeliveryTaskWithRobisep();

      Container.set("logger", loggerMock);

      Container.set(config.repos.robisep.name, robisepRepoMock);

      Container.set(config.repos.surveillanceTask.name, surveillanceTaskRepoMock);

      Container.set(config.repos.pickUpAndDeliveryTask.name, pickUpAndDeliveryTaskRepoMock);

      let prologTasksServiceClass = require("../../src/services/ServicesImpl/prologTasksService").default;
      let prologTasksServiceInstance = Container.get(prologTasksServiceClass);
      Container.set(config.services.prologTasks.name, prologTasksServiceInstance);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('PrologTasksController unit test using PrologTasksService stub results in prolog task facts retrieved', async () => {
      // Arrange
      let req: Partial<Request> = {
        params: {
          byRobisepId: robisepMock.id
        }
      };

      let res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      let prologTasksServiceInstance = Container.get(config.services.prologTasks.name) as IPrologTasksService;

      sinon.stub(prologTasksServiceInstance, 'obtainApprovedTasks').returns(Result.ok<IPrologTasksDTO>({
        tasks: [
          "task(1,floor1,floor2,cel(2,2),cel(2,3))",
        ],
        robot: "robot(floor1,cel(2,2))",
      }));

      // Act
      const controller =
        new PrologTasksController(prologTasksServiceInstance);

      await controller.obtainApprovedTasks(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(res.json, sinon.match({
        tasks: [
          "task(1,floor1,floor2,cel(2,2),cel(2,3))",
        ],
        robot: "robot(floor1,cel(2,2))",
      }));
    });

    it('PrologTasksController unit test using PrologTasksService stub results in failure when robisep does not exist', async () => {
      // Arrange
      let req: Partial<Request> = {
        params: {
          byRobisepId: robisepMock.id
        }
      };

      let res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      let prologTasksServiceInstance = Container.get(config.services.prologTasks.name) as IPrologTasksService;

      sinon.stub(prologTasksServiceInstance, 'obtainApprovedTasks').returns(Result.fail<IPrologTasksDTO>('The robisep with id 1 does not exist.', FailureType.EntityDoesNotExist));

      // Act
      const controller =
        new PrologTasksController(prologTasksServiceInstance);

      await controller.obtainApprovedTasks(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 404);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({
        message: "The robisep with id 1 does not exist."
      }));
    });

    it('PrologTasksController unit test using PrologTasksService stub results in failure when database error', async () => {
      // Arrange
      let req: Partial<Request> = {
        params: {
          byRobisepId: robisepMock.id
        }
      };

      let res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      let prologTasksServiceInstance = Container.get(config.services.prologTasks.name) as IPrologTasksService;

      sinon.stub(prologTasksServiceInstance, 'obtainApprovedTasks').returns(Result.fail<IPrologTasksDTO>('Database error', FailureType.DatabaseError));

      // Act
      const controller =
        new PrologTasksController(prologTasksServiceInstance);

      await controller.obtainApprovedTasks(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 503);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, sinon.match({
        message: "Database error"
      }));
    });

    it('PrologTasksController + PrologTasksService integration test valid tasks retrieved', async () => {
      // Arrange
      let req: Partial<Request> = {
        params: {
          byRobisepId: robisepMock.id
        }
      };

      let res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      // Mock the robisep repo
      robisepRepoMock.findByDomainId.resolves(robisepMock);

      // Mock the surveillance task repo
      surveillanceTaskRepoMock.findByStateAndRobisepId.resolves([surveillanceTaskMock]);

      // Mock the pick up and delivery task repo
      pickUpAndDeliveryTaskRepoMock.findByStateAndRobisepId.resolves([pickUpAndDeliveryTaskMock]);

      // Act
      const controller =
        new PrologTasksController(Container.get(config.services.prologTasks.name) as IPrologTasksService);

      await controller.obtainApprovedTasks(<Request>req, <Response>res);

      // Assert
      sinon.assert.calledOnce(res.json);
      sinon.assert.calledWith(res.json, sinon.match({
        robot: "robot(floor-building-t,cel(2,3))",
        tasks: ["task(2,floor-building-t,floor-building-t,cel(2,3),cel(5,6))", "task(2,2,prolog-floor-4,cel(7,8),cel(3,2))"],
      }));
    });

    it('should return 401 if a user is not authorized', async () => {
      // Arrange
      let req: Partial<Request> = {
        params: {
          byRobisepId: robisepMock.id
        }
      };

      let res: Partial<Response> = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      let prologTasksServiceInstance = Container.get(config.services.prologTasks.name) as IPrologTasksService;
      // Force the service to throw an error
      sinon.stub(prologTasksServiceInstance, 'obtainApprovedTasks').throws(new Error('You are not authorized to perform this action'));

      await new PrologTasksController(prologTasksServiceInstance).obtainApprovedTasks(<Request>req, <Response>res);

      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 401);
      sinon.assert.calledOnce(res.send);
      sinon.assert.calledWith(res.send, 'You are not authorized to perform this action');
    });
  });
});
