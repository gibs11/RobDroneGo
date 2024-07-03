import 'reflect-metadata';
import * as sinon from 'sinon';
import {Request, Response} from 'express';
import {Container} from 'typedi';
import {Result} from '../../src/core/logic/Result';
import config from "../../config";
import IRobisepTypeOutDTO from "../../src/dto/out/IRobisepTypeOutDTO";
import RobisepTypeController from "../../src/controllers/robisepTypeController";
import IRobisepTypeService from "../../src/services/IServices/IRobisepTypeService";
import {RobisepTypeDesignation} from "../../src/domain/robisepType/RobisepTypeDesignation";
import {RobisepType} from "../../src/domain/robisepType/RobisepType";
import {RobisepTypeModel} from "../../src/domain/robisepType/RobisepTypeModel";
import {RobisepTypeBrand} from "../../src/domain/robisepType/RobisepTypeBrand";
import {TaskType} from "../../src/domain/common/TaskType";
import RobisepTypeDataSource from "../datasource/robisepTypeDataSource";

describe('RobisepTypeController', function () {
    const sandbox = sinon.createSandbox();
    let loggerMock;
    let robisepTypeRepoMock;

    describe('createRobisepType', function () {

        beforeEach(function () {
            Container.reset();
            loggerMock = {
                error: sinon.stub(),
            };
            Container.set("logger", loggerMock);

            robisepTypeRepoMock = {
                save: sinon.stub(),
                findByDomainId: sinon.stub(),
                existsSerialNumberInsideBrand: sinon.stub(),
                findByDesignation: sinon.stub(),
            };
            Container.set(config.repos.robisepType.name, robisepTypeRepoMock);

            let robisepTypeServiceClass = require("../../src/services/ServicesImpl/robisepTypeService").default;
            let robisepTypeServiceInstance = Container.get(robisepTypeServiceClass);
            Container.set(config.services.robisepType.name, robisepTypeServiceInstance);
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('RobisepTypeController unit test using RobisepTypeService stub', async function () {
            // Arrange
            let requestBody = {
                designation: 'robot2',
                brand: 'brandldkdaasjdfsd',
                model: 'model',
                tasksType: ['transport', 'surveillance'],
            };
            let req: Partial<Request> = {
                body: requestBody
            };
            let res: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            let robisepTypeServiceInstance = Container.get(config.services.robisepType.name);

            // Stub the createBuilding method in the RobisepTypeService
            robisepTypeRepoMock.findByDomainId.resolves(null);
            robisepTypeRepoMock.findByDesignation.resolves(null);
            sinon.stub(robisepTypeServiceInstance, 'createRobisepType').returns(Result.ok<IRobisepTypeOutDTO>({
                domainId: '123',
                designation: 'robot2',
                brand: 'brandldkdaasjdfsd',
                model: 'model',
                tasksType: ['transport', 'surveillance'],
            }));

            const ctrl = new RobisepTypeController(robisepTypeServiceInstance as IRobisepTypeService);

            // Act
            await ctrl.createRobisepType(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, sinon.match({
                designation: 'robot2',
                brand: 'brandldkdaasjdfsd',
                model: 'model',
                tasksType: ['transport', 'surveillance'],
            }));
        });

        it('RobisepTypeController + RobisepTypeService integration test', async function () {
            // Arrange
            let requestBody = {
                designation: 'robot2',
                brand: 'brandldkdaasjdfsd',
                model: 'model',
                tasksType: ["TRANSPORT"],
            };
            let req: Partial<Request> = {
                body: requestBody
            };
            let res: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            // Stub repo methods
            robisepTypeRepoMock.findByDomainId.resolves(null);
            robisepTypeRepoMock.findByDesignation.resolves(null);
            let robisepTypeInstance = RobisepType.create({
                designation: RobisepTypeDesignation.create(requestBody.designation).getValue(),
                brand: RobisepTypeBrand.create(requestBody.brand).getValue(),
                model: RobisepTypeModel.create(requestBody.model).getValue(),
                tasksType: [TaskType.TRANSPORT]
            }).getValue();
            robisepTypeRepoMock.save.resolves(robisepTypeInstance);


            let robisepTypeServiceInstance = Container.get(config.services.robisepType.name);
            const robisepTypeServiceSpy = sinon.spy(robisepTypeServiceInstance, 'createRobisepType');

            const ctrl = new RobisepTypeController(robisepTypeServiceInstance as IRobisepTypeService);

            // Act
            await ctrl.createRobisepType(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, sinon.match({
                designation: requestBody.designation,
                brand: requestBody.brand,
                model: requestBody.model,
                tasksType: requestBody.tasksType,
            }));
            sinon.assert.calledOnce(robisepTypeServiceSpy);
            sinon.assert.calledWith(robisepTypeServiceSpy, sinon.match({
                designation: requestBody.designation,
                brand: requestBody.brand,
                model: requestBody.model,
                tasksType: requestBody.tasksType,
            }));
        });

        it('RobisepTypeController should return 400 if desgnation is invalid', async function () {
            // Arrange
            let requestBody = {
                designation: 'robot2_',
                brand: 'brandldkdaasjdfsd',
                model: 'model',
                tasksType: ['transport', 'surveillance'],
            };
            let req: Partial<Request> = {
                body: requestBody
            };
            let res: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            // Stub repo methods
            robisepTypeRepoMock.findByDomainId.resolves(null);
            robisepTypeRepoMock.findByDesignation.resolves(null);

            let robisepTypeServiceInstance = Container.get(config.services.robisepType.name);

            const ctrl = new RobisepTypeController(robisepTypeServiceInstance as IRobisepTypeService);

            // Act
            await ctrl.createRobisepType(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 400);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'Designation must be alphanumeric.'}));
        });


        it('RobisepTypeController should return 400 if brand is invalid', async function () {
            // Arrange
            let requestBody = {
                designation: 'robot2',
                brand: 'way to long brand name that is not valid, in order to be to long I will repeat this sentence until it is long enough',
                model: 'model',
                tasksType: ['transport', 'surveillance'],
            };
            let req: Partial<Request> = {
                body: requestBody
            };
            let res: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            // Stub repo methods
            robisepTypeRepoMock.findByDomainId.resolves(null);
            robisepTypeRepoMock.findByDesignation.resolves(null);

            let robisepTypeServiceInstance = Container.get('RobisepTypeService');

            const ctrl = new RobisepTypeController(robisepTypeServiceInstance as IRobisepTypeService);

            // Act
            await ctrl.createRobisepType(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 400);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'RobisepTypeBrand is not within range 1 to 50.'}));
        });


        it('RobisepTypeController should return 400 if model is invalid', async function () {
            // Arrange
            let requestBody = {
                designation: 'robot2',
                brand: 'brand',
                model: 'way to long model name that is not valid, in order to be to long I will repeat this sentence until it is long enough' +
                'however, this is not enough, I will add some more words to make sure it is long enough, but I am not sure if it is enough, so I will if necessary add some more words',
                tasksType: ['transport', 'surveillance'],
            };
            let req: Partial<Request> = {
                body: requestBody
            };
            let res: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            // Stub repo methods
            robisepTypeRepoMock.findByDomainId.resolves(null);
            robisepTypeRepoMock.findByDesignation.resolves(null);

            let robisepTypeServiceInstance = Container.get('RobisepTypeService');

            const ctrl = new RobisepTypeController(robisepTypeServiceInstance as IRobisepTypeService);

            // Act
            await ctrl.createRobisepType(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 400);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'RobisepTypeModel is not within range 1 to 100.'}));
        });


        it('RobisepTypeController should return 400 if tasksType is empty', async function () {
            // Arrange
            let requestBody = {
                designation: 'robot2',
                brand: 'brand',
                model: 'model',
                tasksType: [],
            };
            let req: Partial<Request> = {
                body: requestBody
            };
            let res: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            // Stub repo methods
            robisepTypeRepoMock.findByDomainId.resolves(null);
            robisepTypeRepoMock.findByDesignation.resolves(null);

            let robisepTypeServiceInstance = Container.get('RobisepTypeService');

            const ctrl = new RobisepTypeController(robisepTypeServiceInstance as IRobisepTypeService);

            // Act
            await ctrl.createRobisepType(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 400);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'At least one Task Type must be provided.'}));
        });


        it('RobisepTypeController should return 401 if tasksType invalid', async function () {
            // Arrange
            let requestBody = {
                designation: 'robot2',
                brand: 'brand',
                model: 'model',
                tasksType: ['invalid'],
            };
            let req: Partial<Request> = {
                body: requestBody
            };
            let res: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            // Stub repo methods
            robisepTypeRepoMock.findByDomainId.resolves(null);
            robisepTypeRepoMock.findByDesignation.resolves(null);

            let robisepTypeServiceInstance = Container.get(config.services.robisepType.name);

            const ctrl = new RobisepTypeController(robisepTypeServiceInstance as IRobisepTypeService);

            // Act
            await ctrl.createRobisepType(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 400);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'Invalid tasksType provided - ' + requestBody.tasksType.toString().toUpperCase() +
                ". Valid values are: " + Object.values(TaskType)}));
        });


        it('RobisepTypeController should return 409 if robisep with same domainId already exists', async function () {
            // Arrange
            let requestBody = {
                domainId: 'robot2',
                designation: 'robot2',
                brand: 'brand',
                model: 'model',
                tasksType: ['transport', 'surveillance'],
            };
            let req: Partial<Request> = {
                body: requestBody
            };
            let res: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            // Stub repo methods
            robisepTypeRepoMock.findByDomainId.resolves({});

            let robisepTypeServiceInstance = Container.get(config.services.robisepType.name);

            const ctrl = new RobisepTypeController(robisepTypeServiceInstance as IRobisepTypeService);

            // Act
            await ctrl.createRobisepType(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 409);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'RobisepType already exists - domainId must be unique.'}));
        });


        it('RobisepTypeController should return 409 if robisep with same designation already exists', async function () {
            // Arrange
            let requestBody = {
                designation: 'robot2',
                brand: 'brand',
                model: 'model',
                tasksType: ['transport', 'surveillance'],
            };
            let req: Partial<Request> = {
                body: requestBody
            };
            let res: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            // Stub repo methods
            robisepTypeRepoMock.findByDomainId.resolves(null);
            robisepTypeRepoMock.findByDesignation.resolves({});

            let robisepTypeServiceInstance = Container.get(config.services.robisepType.name);

            const ctrl = new RobisepTypeController(robisepTypeServiceInstance as IRobisepTypeService);

            // Act
            await ctrl.createRobisepType(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 409);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'RobisepType already exists - designation must be unique.'}));
        });

        it('Save method should fail and throw an error', async function () {
            // Arrange
            let requestBody = {
                designation: 'robot2',
                brand: 'brand',
                model: 'model',
                tasksType: ['transport', 'surveillance'],
            };
            let req: Partial<Request> = {
                body: requestBody
            };
            let res: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            // Stub repo methods
            robisepTypeRepoMock.findByDomainId.resolves(null);
            robisepTypeRepoMock.findByDesignation.rejects(new Error('Database error'));

            let robisepTypeServiceInstance = Container.get(config.services.robisepType.name);

            const ctrl = new RobisepTypeController(robisepTypeServiceInstance as IRobisepTypeService);

            // Act
            await ctrl.createRobisepType(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 503);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'Database error'}));
        });

        it('RobisepType Controller should return 401 when user is not authorized', async () => {
            // Arrange
            let requestBody = {
                designation: 'robot2',
                brand: 'brand',
                model: 'model',
                tasksType: ['transport', 'surveillance'],
            };
            let req: Partial<Request> = {
                body: requestBody
            };
            let res: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            // Stub repo methods
            robisepTypeRepoMock.findByDomainId.resolves(null);
            robisepTypeRepoMock.findByDesignation.resolves({});

            let robisepTypeServiceInstance = Container.get(config.services.robisepType.name);

            // Force the service to throw an error
            sinon.stub(robisepTypeServiceInstance, 'createRobisepType').throws(new Error('You are not authorized to perform this action'));

            const controller = new RobisepTypeController(robisepTypeServiceInstance as IRobisepTypeService);

            // Act
            await controller.createRobisepType(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 401);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, 'You are not authorized to perform this action');
        });
    });


    describe('listRobisepTypes', function() {
        beforeEach(function() {
            Container.reset();
            loggerMock = {
                error: sinon.stub(),
            };
            Container.set('logger', loggerMock);

            robisepTypeRepoMock = {
                findAll: sinon.stub(),
            };
            Container.set(config.repos.robisepType.name, robisepTypeRepoMock);

            const robisepTypeRepoMockServiceClass = require('../../src/services/ServicesImpl/robisepTypeService').default;
            const robisepTypeServiceInstance = Container.get(robisepTypeRepoMockServiceClass);
            Container.set('RobisepTypeService', robisepTypeServiceInstance);
        });

        afterEach(function() {
            sandbox.restore();
        });

        it('RobisepTypeController unit test using RobisepTypeService stub', async function() {
            // Arrange
            const res: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            const robisepTypeServiceInstance = Container.get(config.services.robisepType.name);

            // Stub the createBuilding method in the RobisepTypeService
            sinon
              .stub(robisepTypeServiceInstance, 'listRobisepTypes')
              .returns([
                  RobisepTypeDataSource.getRobisepTypeAdto(),
                  RobisepTypeDataSource.getRobisepTypeBdto(),
                  RobisepTypeDataSource.getRobisepTypeCdto(),
              ]);

            const ctrl = new RobisepTypeController(robisepTypeServiceInstance as IRobisepTypeService);

            // Act
            await ctrl.listRobisepTypes(<Response>res);

            // Assert
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(
              res.json,
              sinon.match([
                  RobisepTypeDataSource.getRobisepTypeAdto(),
                  RobisepTypeDataSource.getRobisepTypeBdto(),
                  RobisepTypeDataSource.getRobisepTypeCdto(),
              ]),
            );
        });

        it('RobisepTypeController + RobisepTypeService integration test', async function() {
            // Arrange
            const res: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            // Stub repo methods
            robisepTypeRepoMock.findAll.resolves([
                RobisepTypeDataSource.getRobisepTypeA(),
                RobisepTypeDataSource.getRobisepTypeB(),
                RobisepTypeDataSource.getRobisepTypeC(),
            ]);
            const robisepTypeServiceInstance = Container.get('RobisepTypeService');
            const robisepTypeServiceSpy = sinon.spy(robisepTypeServiceInstance, 'listRobisepTypes');

            const ctrl = new RobisepTypeController(robisepTypeServiceInstance as IRobisepTypeService);

            // Act
            await ctrl.listRobisepTypes(<Response>res);

            // Assert
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(
              res.json,
              sinon.match([
                  RobisepTypeDataSource.getRobisepTypeAdto(),
                  RobisepTypeDataSource.getRobisepTypeBdto(),
                  RobisepTypeDataSource.getRobisepTypeCdto(),
              ]),
            );
            sinon.assert.calledOnce(robisepTypeServiceSpy);
        });

        it('Database Error', async function() {
            // Arrange
            const res: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            // Stub repo methods
            robisepTypeRepoMock.findAll.throws(new Error('Database error'));
            const robisepTypeServiceInstance = Container.get('RobisepTypeService');

            const ctrl = new RobisepTypeController(robisepTypeServiceInstance as IRobisepTypeService);

            // Act
            await ctrl.listRobisepTypes(<Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 503);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match('Database error'));
        });
    });
});
