import 'reflect-metadata';
import * as sinon from 'sinon';
import {Request, Response} from 'express';
import {Container} from 'typedi';
import {Result} from '../../src/core/logic/Result';
import config from "../../config";
import RoomController from "../../src/controllers/roomController";
import IRoomService from "../../src/services/IServices/IRoomService";
import IRoomDTO from "../../src/dto/IRoomDTO";
import {Floor} from "../../src/domain/floor/floor";
import {RoomName} from "../../src/domain/room/RoomName";
import {RoomCategory} from "../../src/domain/room/RoomCategory";
import {Room} from "../../src/domain/room/Room";
import {RoomDescription} from "../../src/domain/room/RoomDescription";
import {RoomDimensions} from "../../src/domain/room/RoomDimensions";
import {Position} from "../../src/domain/room/Position";
import RoomDataSource from "../datasource/RoomDataSource";
import {DoorOrientation} from "../../src/domain/room/DoorOrientation";

describe('RoomController', function () {
    const sandbox = sinon.createSandbox();
    let loggerMock;
    let roomRepoMock;
    let elevatorRepoMock;
    let passageRepoMock;
    let floorRepoMock;
    let doorPositionCheckerServiceMock;
    let roomAreaChecker;
    let roomMock: Room;
    let floorMock: Floor;
    let roomFactory;

    describe('createRoom', function () {

        beforeEach(function () {
            roomMock = RoomDataSource.getRoomA();
            floorMock = roomMock.floor;

            Container.reset();
            loggerMock = {
                error: sinon.stub(),
            };
            Container.set("logger", loggerMock);

            roomRepoMock = {
                save: sinon.stub(),
                findByDomainId: sinon.stub(),
                findByName: sinon.stub(),
                checkCellAvailability: sinon.stub(),
                checkIfRoomExistInArea: sinon.stub(),
            };
            Container.set(config.repos.room.name, roomRepoMock);

            elevatorRepoMock = {
                checkIfElevatorExistInArea: sinon.stub(),
            }
            Container.set(config.repos.elevator.name, elevatorRepoMock);

            passageRepoMock = {
                checkIfPassageExistInArea: sinon.stub(),
            }

            floorRepoMock = {
                findByDomainId: sinon.stub(),
            }
            Container.set(config.repos.floor.name, floorRepoMock);

            doorPositionCheckerServiceMock = {
                isPositionValid: sinon.stub(),
            }
            Container.set(config.services.doorPositionChecker.name, doorPositionCheckerServiceMock);

            roomAreaChecker = {
                checkIfAreaIsAvailableForRoom: sinon.stub(),
            }
            Container.set(config.services.roomAreaChecker.name, roomAreaChecker);

            let roomSchemaMock = require("../../src/persistence/schemas/roomSchema").default;
            Container.set("roomSchema", roomSchemaMock);

            roomFactory = {
                createRoom: sinon.stub(),
            }
            Container.set(config.factories.room.name, roomFactory);

            let roomServiceClass = require("../../src/services/ServicesImpl/roomService").default;
            let roomServiceInstance = Container.get(roomServiceClass);
            Container.set(config.services.room.name, roomServiceInstance);
        });

        afterEach(function () {
            sandbox.restore();
            sinon.restore();
        });

        it('RoomController unit test using RoomService stub', async function () {
            // Arrange
            let requestBody = {
                name: "room1",
                description: "description",
                category: "other",
                dimensions: {
                    initialPosition: {
                        xPosition: 0,
                        yPosition: 0,
                    },
                    finalPosition: {
                        xPosition: 2,
                        yPosition: 2,
                    }
                },
                doorPosition: {
                    xPosition: 0,
                    yPosition: 2,
                },
                floor: floorMock
            };
            let req: Partial<Request> = {
                body: requestBody
            };
            let res: Partial<Response> = {
                json: sinon.spy(),
                status: sinon.stub().returnsThis(),
                send: sinon.spy(),
            };

            let roomServiceInstance = Container.get(config.services.room.name);

            // Stub the createRoom method in the RoomService
            roomRepoMock.findByName.resolves(null);
            roomRepoMock.checkCellAvailability.resolves(null);
            roomRepoMock.checkIfRoomExistInArea.resolves([]);
            sinon.stub(roomServiceInstance, 'createRoom').returns(Result.ok<IRoomDTO>({
                domainId: '123',
                name: "room1",
                description: "description",
                category: "other",
                dimensions: {
                    initialPosition: {
                        xPosition: 0,
                        yPosition: 0,
                    },
                    finalPosition: {
                        xPosition: 2,
                        yPosition: 2,
                    }
                },
                doorPosition: {
                    xPosition: 0,
                    yPosition: 1,
                },
                doorOrientation: 'NORTH',
                floorId: floorMock.id.toString()
            }));

            const ctrl = new RoomController(roomServiceInstance as IRoomService);

            // Act
            await ctrl.createRoom(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, sinon.match({
                domainId: '123',
                name: "room1",
                description: "description",
                category: "other",
                dimensions: {
                    initialPosition: {
                        xPosition: 0,
                        yPosition: 0,
                    },
                    finalPosition: {
                        xPosition: 2,
                        yPosition: 2,
                    }
                },
                doorPosition: {
                    xPosition: 0,
                    yPosition: 1,
                },
                doorOrientation: 'NORTH',
                floorId: floorMock.id.toString(),
            }));
        });


        it('RoomController + RoomService integration test', async function () {
            // Arrange
            let requestBody = {
                name: "room1",
                description: "description",
                category: "OTHER",
                dimensions: {
                    initialPosition: {
                        xPosition: 0,
                        yPosition: 0,
                    },
                    finalPosition: {
                        xPosition: 2,
                        yPosition: 2,
                    }
                },
                doorPosition: {
                    xPosition: 0,
                    yPosition: 2,
                },
                doorOrientation: 'SOUTH',
                floor: floorMock
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
            let roomInstance = Room.create({
                name: RoomName.create(requestBody.name).getValue(),
                description: RoomDescription.create(requestBody.description).getValue(),
                category: RoomCategory.OTHER,
                dimensions: RoomDimensions.create(
                    Position.create(
                        requestBody.dimensions.initialPosition.xPosition,
                        requestBody.dimensions.initialPosition.yPosition
                    ).getValue(),
                    Position.create(
                        requestBody.dimensions.finalPosition.xPosition,
                        requestBody.dimensions.finalPosition.yPosition
                    ).getValue(),
                ).getValue(),
                doorPosition: Position.create(
                    requestBody.doorPosition.xPosition,
                    requestBody.doorPosition.yPosition,
                ).getValue(),
                doorOrientation: DoorOrientation.SOUTH,
                floor: floorMock
            }).getValue();
            floorRepoMock.findByDomainId.resolves(floorMock);
            roomRepoMock.findByName.resolves(null);
            roomAreaChecker.checkIfAreaIsAvailableForRoom.resolves(true);
            doorPositionCheckerServiceMock.isPositionValid.resolves(true);
            roomFactory.createRoom.resolves(roomInstance);
            roomRepoMock.save.resolves(roomInstance);


            let roomServiceInstance = Container.get(config.services.room.name);

            const ctrl = new RoomController(roomServiceInstance as IRoomService);

            // Act
            await ctrl.createRoom(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, sinon.match({
                category: "OTHER",
                description: "description",
                dimensions: {
                    finalPosition: {
                        xPosition: 2,
                        yPosition: 2,
                    },
                    initialPosition: {
                        xPosition: 0,
                        yPosition: 0,
                    }
                },
                domainId: roomInstance.id.toString(),
                doorPosition: {
                    xPosition: 0,
                    yPosition: 2,
                },
                name: "room1",
            }));
        });


        it('RoomController should return 400 if name is not alphanumeric', async function () {
            // Arrange
            let requestBody = {
                name: "room1@",
                description: "description",
                category: "other",
                dimensions: {
                    initialPosition: {
                        xPosition: 4,
                        yPosition: 4,
                    },
                    finalPosition: {
                        xPosition: 5,
                        yPosition: 5,
                    }
                },
                doorPosition: {
                    xPosition: 4,
                    yPosition: 5,
                },
                floor: floorMock
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
            floorRepoMock.findByDomainId.resolves(floorMock);
            roomRepoMock.findByName.resolves(null);
            roomAreaChecker.checkIfAreaIsAvailableForRoom.resolves(true);
            doorPositionCheckerServiceMock.isPositionValid.resolves(true);
            roomFactory.createRoom.throws(new TypeError('Name must be alphanumeric.'));


            let roomServiceInstance = Container.get(config.services.room.name);

            const ctrl = new RoomController(roomServiceInstance as IRoomService);

            // Act
            await ctrl.createRoom(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 400);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'Name must be alphanumeric.'}));
        });


        it('RoomController should return 400 if name is not unique', async function () {
            // Arrange
            let requestBody = {
                name: "room1",
                description: "description",
                category: "other",
                dimensions: {
                    initialPosition: {
                        xPosition: 0,
                        yPosition: 0,
                    },
                    finalPosition: {
                        xPosition: 2,
                        yPosition: 2,
                    }
                },
                doorPosition: {
                    xPosition: 0,
                    yPosition: 2,
                },
                floor: floorMock
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
            roomRepoMock.findByName.resolves(roomMock);
            roomRepoMock.save.resolves(roomMock);
            floorRepoMock.findByDomainId.resolves(floorMock);
            doorPositionCheckerServiceMock.isPositionValid.resolves(true);

            let roomServiceInstance = Container.get(config.services.room.name);

            const ctrl = new RoomController(roomServiceInstance as IRoomService);

            // Act
            await ctrl.createRoom(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 409);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'Room already exists - name must be unique.'}));
        });


        it('RoomController should return 400 if name is too long', async function () {
            // Arrange
            let requestBody = {
                name: "room1 room room room room room room room room room room",
                description: "description",
                category: "other",
                dimensions: {
                    initialPosition: {
                        xPosition: 0,
                        yPosition: 0,
                    },
                    finalPosition: {
                        xPosition: 2,
                        yPosition: 2,
                    }
                },
                doorPosition: {
                    xPosition: 0,
                    yPosition: 2,
                },
                floor: floorMock
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
            floorRepoMock.findByDomainId.resolves(floorMock);
            roomRepoMock.findByName.resolves(null);
            roomAreaChecker.checkIfAreaIsAvailableForRoom.resolves(true);
            doorPositionCheckerServiceMock.isPositionValid.resolves(true);
            roomFactory.createRoom.throws(new TypeError('Name must be less than 50 characters.'));

            let roomServiceInstance = Container.get(config.services.room.name);

            const ctrl = new RoomController(roomServiceInstance as IRoomService);

            // Act
            await ctrl.createRoom(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 400);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'Name must be less than 50 characters.'}));
        });


        it('RoomController should return 400 if description not alphanumeric', async function () {
            // Arrange
            let requestBody = {
                name: "room1",
                description: "description@",
                category: "other",
                dimensions: {
                    initialPosition: {
                        xPosition: 0,
                        yPosition: 0,
                    },
                    finalPosition: {
                        xPosition: 2,
                        yPosition: 2,
                    }
                },
                doorPosition: {
                    xPosition: 0,
                    yPosition: 2,
                },
                floor: floorMock
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
            floorRepoMock.findByDomainId.resolves(floorMock);
            roomRepoMock.findByName.resolves(null);
            roomAreaChecker.checkIfAreaIsAvailableForRoom.resolves(true);
            doorPositionCheckerServiceMock.isPositionValid.resolves(true);
            roomFactory.createRoom.throws(new TypeError('Description must be alphanumeric.'));

            let roomServiceInstance = Container.get(config.services.room.name);

            const ctrl = new RoomController(roomServiceInstance as IRoomService);

            // Act
            await ctrl.createRoom(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 400);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'Description must be alphanumeric.'}));
        });


        it('RoomController should return 400 if description is too long', async function () {
            // Arrange
            let requestBody = {
                name: "room1",
                description: "description description description description description description description " +
                    "description description description description description description description description " +
                    "description description description description description description description description ",
                category: "other",
                dimensions: {
                    initialPosition: {
                        xPosition: 0,
                        yPosition: 0,
                    },
                    finalPosition: {
                        xPosition: 2,
                        yPosition: 2,
                    }
                },
                doorPosition: {
                    xPosition: 0,
                    yPosition: 2,
                },
                floor: floorMock
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
            floorRepoMock.findByDomainId.resolves(floorMock);
            roomRepoMock.findByName.resolves(null);
            roomAreaChecker.checkIfAreaIsAvailableForRoom.resolves(true);
            doorPositionCheckerServiceMock.isPositionValid.resolves(true);
            roomFactory.createRoom.throws(new TypeError('Description must be less than 250 characters.'));

            let roomServiceInstance = Container.get(config.services.room.name);

            const ctrl = new RoomController(roomServiceInstance as IRoomService);

            // Act
            await ctrl.createRoom(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 400);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'Description must be less than 250 characters.'}));
        });


        it('RoomController should return 404 if floor is does not exist', async function () {
            // Arrange
            let requestBody = {
                nickname: 'robot2',
                serialNumber: '123456789',
                code: "123",
                description: "description",
                robisepTypeId: "123",
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
            floorRepoMock.findByDomainId.resolves(null);

            let roomServiceInstance = Container.get(config.services.room.name);

            const ctrl = new RoomController(roomServiceInstance as IRoomService);

            // Act
            await ctrl.createRoom(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 404);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'Floor not found.'}));
        });


        it('RoomController should return 400 if dimensions are not valid - Negative initial xPosition', async function () {
            // Arrange
            let requestBody = {
                name: "room1",
                description: "description",
                category: "other",
                dimensions: {
                    initialPosition: {
                        xPosition: -1,
                        yPosition: 0,
                    },
                    finalPosition: {
                        xPosition: 2,
                        yPosition: 2,
                    }
                },
                doorPosition: {
                    xPosition: 0,
                    yPosition: 2,
                },
                floor: floorMock
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
            floorRepoMock.findByDomainId.resolves(floorMock);
            roomRepoMock.findByName.resolves(null);
            roomFactory.createRoom.throws(new TypeError('Initial and final positions must be positive.'));

            let roomServiceInstance = Container.get(config.services.room.name);

            const ctrl = new RoomController(roomServiceInstance as IRoomService);

            // Act
            await ctrl.createRoom(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 400);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'Initial and final positions must be positive.'}));
        });


        it('RoomController should return 400 if dimensions are not valid - Negative Initial yPosition', async function () {
            // Arrange
            let requestBody = {
                name: "room1",
                description: "description",
                category: "other",
                dimensions: {
                    initialPosition: {
                        xPosition: 0,
                        yPosition: -1,
                    },
                    finalPosition: {
                        xPosition: 2,
                        yPosition: 2,
                    }
                },
                doorPosition: {
                    xPosition: 0,
                    yPosition: 2,
                },
                floor: floorMock
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
            roomRepoMock.findByName.resolves(null);
            floorRepoMock.findByDomainId.resolves(floorMock);
            roomFactory.createRoom.throws(new TypeError('Initial and final positions must be positive.'));

            let roomServiceInstance = Container.get(config.services.room.name);

            const ctrl = new RoomController(roomServiceInstance as IRoomService);

            // Act
            await ctrl.createRoom(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 400);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'Initial and final positions must be positive.'}));
        });


        it('RoomController should return 400 if dimensions are not valid - Negative Final xPosition', async function () {
            // Arrange
            let requestBody = {
                name: "room1",
                description: "description",
                category: "other",
                dimensions: {
                    initialPosition: {
                        xPosition: 1,
                        yPosition: 0,
                    },
                    finalPosition: {
                        xPosition: -2,
                        yPosition: 2,
                    }
                },
                doorPosition: {
                    xPosition: 0,
                    yPosition: 2,
                },
                floor: floorMock
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
            roomRepoMock.findByName.resolves(null);
            floorRepoMock.findByDomainId.resolves(floorMock);
            roomFactory.createRoom.throws(new TypeError('Initial and final positions must be positive.'));

            let roomServiceInstance = Container.get(config.services.room.name);

            const ctrl = new RoomController(roomServiceInstance as IRoomService);

            // Act
            await ctrl.createRoom(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 400);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'Initial and final positions must be positive.'}));
        });


        it('RoomController should return 400 if dimensions are not valid - Negative Final yPosition', async function () {
            // Arrange
            let requestBody = {
                name: "room1",
                description: "description",
                category: "other",
                dimensions: {
                    initialPosition: {
                        xPosition: 0,
                        yPosition: 1,
                    },
                    finalPosition: {
                        xPosition: 2,
                        yPosition: -2,
                    }
                },
                doorPosition: {
                    xPosition: 0,
                    yPosition: 2,
                },
                floor: floorMock
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
            roomRepoMock.findByName.resolves(null);
            floorRepoMock.findByDomainId.resolves(floorMock);
            roomFactory.createRoom.throws(new TypeError('Initial and final positions must be positive.'));

            let roomServiceInstance = Container.get(config.services.room.name);

            const ctrl = new RoomController(roomServiceInstance as IRoomService);

            // Act
            await ctrl.createRoom(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 400);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'Initial and final positions must be positive.'}));
        });


        it('RoomController should return 400 if dimensions are not valid - Initial xPosition equal than Final xPosition', async function () {
            // Arrange
            let requestBody = {
                name: "room1",
                description: "description",
                category: "other",
                dimensions: {
                    initialPosition: {
                        xPosition: 2,
                        yPosition: 5,
                    },
                    finalPosition: {
                        xPosition: 2,
                        yPosition: 0,
                    }
                },
                doorPosition: {
                    xPosition: 0,
                    yPosition: 2,
                },
                floor: floorMock
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
            floorRepoMock.findByDomainId.resolves(floorMock);
            roomRepoMock.findByName.resolves(null);
            roomFactory.createRoom.throws(new TypeError('Initial position must be lower than final position.'));

            let roomServiceInstance = Container.get(config.services.room.name);

            const ctrl = new RoomController(roomServiceInstance as IRoomService);

            // Act
            await ctrl.createRoom(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 400);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'Initial position must be lower than final position.'}));
        });


        it('RoomController should return 400 if dimensions are not valid - Initial xPosition greater than Final xPosition', async function () {
            // Arrange
            let requestBody = {
                name: "room1",
                description: "description",
                category: "other",
                dimensions: {
                    initialPosition: {
                        xPosition: 2,
                        yPosition: 0,
                    },
                    finalPosition: {
                        xPosition: 1,
                        yPosition: 2,
                    }
                },
                doorPosition: {
                    xPosition: 0,
                    yPosition: 2,
                },
                floor: floorMock
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
            roomRepoMock.findByName.resolves(null);
            roomFactory.createRoom.throws(new TypeError('Initial position must be lower than final position.'));
            floorRepoMock.findByDomainId.resolves(floorMock);
            doorPositionCheckerServiceMock.isPositionValid.resolves(true);

            let roomServiceInstance = Container.get(config.services.room.name);

            const ctrl = new RoomController(roomServiceInstance as IRoomService);

            // Act
            await ctrl.createRoom(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 400);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'Initial position must be lower than final position.'}));
        });


        it('RoomController should return 400 if dimensions are not valid - room already exists', async function () {
            // Arrange
            let requestBody = {
                name: "room1",
                description: "description",
                category: "other",
                dimensions: {
                    initialPosition: {
                        xPosition: 2,
                        yPosition: 2,
                    },
                    finalPosition: {
                        xPosition: 5,
                        yPosition: 5,
                    }
                },
                doorPosition: {
                    xPosition: 0,
                    yPosition: 2,
                },
                floor: floorMock
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
            floorRepoMock.findByDomainId.resolves(floorMock);
            roomRepoMock.findByName.resolves(null);
            roomFactory.createRoom.throws(new TypeError('Position already occupied.'));

            let roomServiceInstance = Container.get(config.services.room.name);

            const ctrl = new RoomController(roomServiceInstance as IRoomService);

            // Act
            await ctrl.createRoom(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 400);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'Position already occupied.'}));
        });


        it('RoomController should return 400 if doorPosition is not valid - xPostion negative', async function () {
            // Arrange
            let requestBody = {
                name: "room1",
                description: "description",
                category: "other",
                dimensions: {
                    initialPosition: {
                        xPosition: 0,
                        yPosition: 0,
                    },
                    finalPosition: {
                        xPosition: 2,
                        yPosition: 2,
                    }
                },
                doorPosition: {
                    xPosition: -1,
                    yPosition: 2,
                },
                floor: floorMock
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
            floorRepoMock.findByDomainId.resolves(floorMock);
            roomRepoMock.findByName.resolves(null);
            roomFactory.createRoom.throws(new TypeError('Door position must be positive.'));

            let roomServiceInstance = Container.get(config.services.room.name);

            const ctrl = new RoomController(roomServiceInstance as IRoomService);

            // Act
            await ctrl.createRoom(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 400);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'Door position must be positive.'}));
        });


        it('RoomController should return 400 if doorPosition are not valid - yPostion negative', async function () {
            // Arrange
            let requestBody = {
                name: "room1",
                description: "description",
                category: "other",
                dimensions: {
                    initialPosition: {
                        xPosition: 0,
                        yPosition: 0,
                    },
                    finalPosition: {
                        xPosition: 2,
                        yPosition: 2,
                    }
                },
                doorPosition: {
                    xPosition: 1,
                    yPosition: -2,
                },
                floor: floorMock
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
            floorRepoMock.findByDomainId.resolves(floorMock);
            roomRepoMock.findByName.resolves(null);
            roomFactory.createRoom.throws(new TypeError('Door position must be positive.'));

            let roomServiceInstance = Container.get(config.services.room.name);

            const ctrl = new RoomController(roomServiceInstance as IRoomService);

            // Act
            await ctrl.createRoom(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 400);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'Door position must be positive.'}));
        });


        it('RoomController should return 400 if doorPosition is not valid', async function () {
            // Arrange
            let requestBody = {
                name: "room1",
                description: "description",
                category: "other",
                dimensions: {
                    initialPosition: {
                        xPosition: 0,
                        yPosition: 0,
                    },
                    finalPosition: {
                        xPosition: 2,
                        yPosition: 2,
                    }
                },
                doorPosition: {
                    xPosition: 1,
                    yPosition: 2,
                },
                doorOrientation: 'NORTH',
                floor: floorMock
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
            floorRepoMock.findByDomainId.resolves(floorMock);
            roomRepoMock.findByName.resolves(null);
            roomAreaChecker.checkIfAreaIsAvailableForRoom.resolves(true);
            roomFactory.createRoom.throws(new TypeError('Invalid Door Orientation.'));

            let roomServiceInstance = Container.get(config.services.room.name);

            const ctrl = new RoomController(roomServiceInstance as IRoomService);

            // Act
            await ctrl.createRoom(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 400);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'Invalid Door Orientation.'}));
        });


        it('RoomController should return 409 if room id is already in use', async function () {
            // Arrange
            let requestBody = {
                domainId: "room1",
                name: "room1",
                description: "description",
                category: "other",
                dimensions: {
                    initialPosition: {
                        xPosition: 0,
                        yPosition: 0,
                    },
                    finalPosition: {
                        xPosition: 2,
                        yPosition: 2,
                    }
                },
                doorPosition: {
                    xPosition: 1,
                    yPosition: 2,
                },
                floor: floorMock
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
            roomRepoMock.findByDomainId.resolves(roomMock);

            let roomServiceInstance = Container.get(config.services.room.name);

            const ctrl = new RoomController(roomServiceInstance as IRoomService);

            // Act
            await ctrl.createRoom(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 409);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:`Room with id: ${requestBody.domainId} already exists.`}));
        });


        it('RoomController should return 200 if room id is valid', async function () {
            // Arrange
            let requestBody = {
                domainId: "room1",
                name: "room1",
                description: "description",
                category: "other",
                dimensions: {
                    initialPosition: {
                        xPosition: 0,
                        yPosition: 0,
                    },
                    finalPosition: {
                        xPosition: 2,
                        yPosition: 2,
                    }
                },
                doorPosition: {
                    xPosition: 1,
                    yPosition: 2,
                },
                floor: floorMock
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
            roomRepoMock.findByDomainId.resolves(null);
            floorRepoMock.findByDomainId.resolves(floorMock);
            roomRepoMock.findByName.resolves(null);
            roomAreaChecker.checkIfAreaIsAvailableForRoom.resolves(true);
            doorPositionCheckerServiceMock.isPositionValid.resolves(true);
            roomFactory.createRoom.resolves(roomMock);
            roomRepoMock.save.resolves(roomMock);


            let roomServiceInstance = Container.get(config.services.room.name);

            const ctrl = new RoomController(roomServiceInstance as IRoomService);

            // Act
            await ctrl.createRoom(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 201);
        });


        it('Save method should fail and throw an error', async function () {
            // Arrange
            let requestBody = {
                name: "room1",
                description: "description",
                category: "other",
                dimensions: {
                    initialPosition: {
                        xPosition: 0,
                        yPosition: 0,
                    },
                    finalPosition: {
                        xPosition: 2,
                        yPosition: 2,
                    }
                },
                doorPosition: {
                    xPosition: 0,
                    yPosition: 2,
                },
                floor: floorMock
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
            floorRepoMock.findByDomainId.resolves(floorMock);
            roomRepoMock.findByName.resolves(null);
            doorPositionCheckerServiceMock.isPositionValid.resolves(true);
            roomAreaChecker.checkIfAreaIsAvailableForRoom.resolves(true);
            roomFactory.createRoom.resolves(roomMock);
            roomRepoMock.save.throws(new Error('error.'));

            let roomServiceInstance = Container.get(config.services.room.name);

            const ctrl = new RoomController(roomServiceInstance as IRoomService);

            // Act
            await ctrl.createRoom(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 503);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, sinon.match({message:'error.'}));
        });


        it('Room Controller should return 401 when user is not authorized', async () => {
            // Arrange
            let requestBody = {
                nickname: 'robot2',
                serialNumber: '123456789',
                code: "123",
                description: "description",
                robisepTypeId: "123",
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
            roomFactory.createRoom.throws(new Error('error.'));
            roomRepoMock.findByName.resolves(null);

            let roomServiceInstance = Container.get(config.services.room.name);

            // Force the service to throw an error
            sinon.stub(roomServiceInstance, 'createRoom').throws(new Error('You are not authorized to perform this action'));

            const controller = new RoomController(roomServiceInstance as IRoomService);

            // Act
            await controller.createRoom(<Request>req, <Response>res);

            // Assert
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 401);
            sinon.assert.calledOnce(res.send);
            sinon.assert.calledWith(res.send, 'You are not authorized to perform this action');
        });
    });


    describe('List Rooms', function () {

        describe('List All Rooms', function () {
            beforeEach(function() {
                Container.reset();
                loggerMock = {
                    error: sinon.stub()
                };
                Container.set("logger", loggerMock);

                roomRepoMock = {
                    findAll: sinon.stub()
                };
                Container.set("RoomRepo", roomRepoMock);

                roomFactory = {
                    createRoom: sinon.stub()
                }
                Container.set("RoomFactory", roomFactory);

                floorRepoMock = {
                    findByDomainId: sinon.stub(),
                }
                Container.set(config.repos.floor.name, floorRepoMock);

                doorPositionCheckerServiceMock = {
                    isPositionValid: sinon.stub(),
                }
                Container.set(config.services.doorPositionChecker.name, doorPositionCheckerServiceMock);

                roomAreaChecker = {
                    checkIfAreaIsAvailableForRoom: sinon.stub(),
                }
                Container.set(config.services.roomAreaChecker.name, roomAreaChecker);

                let roomServiceClass = require("../../src/services/ServicesImpl/roomService").default;
                let roomServiceInstance = Container.get(roomServiceClass);
                Container.set("RoomService", roomServiceInstance);
            });

            afterEach(function() {
                sandbox.restore();
            });

            it("RoomController unit test using RoomService stub", async function() {
                // Arrange
                let res: Partial<Response> = {
                    json: sinon.spy(),
                    status: sinon.stub().returnsThis(),
                    send: sinon.spy()
                };

                let roomServiceInstance = Container.get("RoomService");

                // Stub the createRoom method in the RoomService
                sinon.stub(roomServiceInstance, "listRooms").returns(
                  [RoomDataSource.getRoomAdto()]);

                const ctrl = new RoomController(roomServiceInstance as IRoomService);

                // Act
                await ctrl.listRooms(<Response>res);

                // Assert
                sinon.assert.calledOnce(res.json);
                sinon.assert.calledWith(res.json,
                  sinon.match([RoomDataSource.getRoomAdto(),
                  ]));
            });

            it("RoomController + RoomService integration test", async function() {
                // Arrange
                let res: Partial<Response> = {
                    json: sinon.spy(),
                    status: sinon.stub().returnsThis(),
                    send: sinon.spy()
                };

                // Stub repo methods
                roomRepoMock.findAll.resolves([RoomDataSource.getRoomA(),
                ]);
                let RoomServiceInstance = Container.get("RoomService");
                const roomServiceSpy = sinon.spy(RoomServiceInstance, "listRooms");

                const ctrl = new RoomController(RoomServiceInstance as IRoomService);

                // Act
                await ctrl.listRooms(<Response>res);

                // Assert
                sinon.assert.calledOnce(res.json);
                sinon.assert.calledWith(res.json,
                  sinon.match([RoomDataSource.getRoomAdto(),
                  ]));
                sinon.assert.calledOnce(roomServiceSpy);
            });

            it("ListRoom fail - database error", async function() {
                // Arrange
                let res: Partial<Response> = {
                    json: sinon.spy(),
                    status: sinon.stub().returnsThis(),
                    send: sinon.spy()
                };

                // Stub repo methods
                roomRepoMock.findAll.throws(new Error('error.'));
                let RoomServiceInstance = Container.get("RoomService");

                const ctrl = new RoomController(RoomServiceInstance as IRoomService);

                // Act
                await ctrl.listRooms(<Response>res);

                // Assert
                sinon.assert.calledOnce(res.status);
                sinon.assert.calledWith(res.status, 503);
                sinon.assert.calledOnce(res.send);
                sinon.assert.calledWith(res.send, 'error.');
            });
        });

        describe('List Rooms by Floor', function () {
            beforeEach(function() {
                Container.reset();
                loggerMock = {
                    error: sinon.stub()
                };
                Container.set("logger", loggerMock);

                roomRepoMock = {
                    findByFloorId: sinon.stub()
                };
                Container.set("RoomRepo", roomRepoMock);

                roomFactory = {
                    createRoom: sinon.stub()
                }
                Container.set("RoomFactory", roomFactory);

                floorRepoMock = {
                    findByDomainId: sinon.stub(),
                }
                Container.set(config.repos.floor.name, floorRepoMock);

                doorPositionCheckerServiceMock = {
                    isPositionValid: sinon.stub(),
                }
                Container.set(config.services.doorPositionChecker.name, doorPositionCheckerServiceMock);

                roomAreaChecker = {
                    checkIfAreaIsAvailableForRoom: sinon.stub(),
                }
                Container.set(config.services.roomAreaChecker.name, roomAreaChecker);

                let roomServiceClass = require("../../src/services/ServicesImpl/roomService").default;
                let roomServiceInstance = Container.get(roomServiceClass);
                Container.set("RoomService", roomServiceInstance);
            });

            afterEach(function() {
                sandbox.restore();
            });

            it("RoomController unit test using RoomService stub", async function() {
                // Arrange
                let req: Partial<Request> = {
                    params: {
                        floorId: "123"
                    }
                }
                let res: Partial<Response> = {
                    json: sinon.spy(),
                    status: sinon.stub().returnsThis(),
                    send: sinon.spy()
                };

                let roomServiceInstance = Container.get(config.services.room.name);

                // Stub the createRoom method in the RoomService
                roomRepoMock.findByFloorId.resolves([RoomDataSource.getRoomA()]);

                const ctrl = new RoomController(roomServiceInstance as IRoomService);

                // Act
                await ctrl.listRoomsByFloor(<Request>req, <Response>res);

                // Assert
                sinon.assert.calledOnce(res.json);
                sinon.assert.calledWith(res.json,
                  sinon.match([RoomDataSource.getRoomAdto(),
                  ]));
            });

            it("RoomController fail", async function() {
                // Arrange
                let req: Partial<Request> = {
                    params: {
                        floorId: "123"
                    }
                }
                let res: Partial<Response> = {
                    json: sinon.spy(),
                    status: sinon.stub().returnsThis(),
                    send: sinon.spy()
                };

                let roomServiceInstance = Container.get(config.services.room.name);


                // Force the service to throw an error
                sinon.stub(roomServiceInstance, 'listRoomsByFloor').throws(new Error('You are not authorized to perform this action'));

                const ctrl = new RoomController(roomServiceInstance as IRoomService);

                // Act
                await ctrl.listRoomsByFloor(<Request>req, <Response>res);

                // Assert
                sinon.assert.calledOnce(res.status);
                sinon.assert.calledWith(res.status, 401);
                sinon.assert.calledOnce(res.send);
            });
        });
    });
});
