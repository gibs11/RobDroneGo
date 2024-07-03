import {expect} from 'chai';
import * as sinon from 'sinon';
import RoomFactory from '../../../src/factories/roomFactory';
import {UniqueEntityID} from "../../../src/core/domain/UniqueEntityID";
import {Floor} from "../../../src/domain/floor/floor";
import BuildingDataSource from "../../datasource/buildingDataSource";
import {FloorNumber} from "../../../src/domain/floor/floorNumber";
import {FailureType, Result} from "../../../src/core/logic/Result";

describe('roomFactory', () => {
    // Create sinon sandbox for isolating tests
    const sandbox = sinon.createSandbox();

    // Building for the room
    let floorMock;

    let floorTypeRepo;
    let roomAreaChecker;
    let doorPositionChecker;
    let roomFactory;

    beforeEach(() => {
        floorMock = Floor.create({
            building: BuildingDataSource.getBuildingC(),
            floorNumber: FloorNumber.create(1).getValue()
            }, new UniqueEntityID("123456")
        ).getValue()

        floorTypeRepo = {
            findByDomainId: sinon.stub(),
        }

        roomAreaChecker = {
            checkIfAreaIsAvailableForRoom: sinon.stub()
        };

        doorPositionChecker = {
            isPositionValid: sinon.stub()
        };

        roomFactory = new RoomFactory(floorTypeRepo, doorPositionChecker, roomAreaChecker);
    });

    afterEach(() => {
        sandbox.restore();
        sinon.restore();
    });

    it('should create a valid room', async () => {
        // Arrange
        const roomDTO = {
            name : "Sample Room",
            description: "Sample Room Description",
            category: "OTHER",
            dimensions: {
                initialPosition: {
                    xPosition: 0,
                    yPosition: 0
                },
                finalPosition: {
                    xPosition: 8,
                    yPosition: 8
                }
            },
            doorPosition: {
                xPosition: 8,
                yPosition: 5
            },
            doorOrientation: 'EAST',
            floorId: "123456"
        };

        floorTypeRepo.findByDomainId.resolves(floorMock);
        const result = Result.ok<boolean>(true);
        roomAreaChecker.checkIfAreaIsAvailableForRoom.resolves(result);
        doorPositionChecker.isPositionValid.resolves(result);

        const room = await roomFactory.createRoom(roomDTO);

        // Assert
        expect(room.name.value).to.equal(roomDTO.name);
        expect(room.description.value).to.equal(roomDTO.description);
        expect(room.category).to.equal(roomDTO.category);
        expect(room.dimensions.initialPosition.xPosition).to.equal(roomDTO.dimensions.initialPosition.xPosition);
        expect(room.dimensions.initialPosition.yPosition).to.equal(roomDTO.dimensions.initialPosition.yPosition);
        expect(room.dimensions.finalPosition.xPosition).to.equal(roomDTO.dimensions.finalPosition.xPosition);
        expect(room.dimensions.finalPosition.yPosition).to.equal(roomDTO.dimensions.finalPosition.yPosition);
        expect(room.doorPosition.xPosition).to.equal(roomDTO.doorPosition.xPosition);
        expect(room.doorPosition.yPosition).to.equal(roomDTO.doorPosition.yPosition);
        expect(room.floor).to.equal(floorMock);
    });

    it('should throw an error when floor is not found', async () => {
        // Arrange
        const roomDTO = {
            name : "Sample Room",
            description: "Sample Room Description",
            category: "OTHER",
            dimensions: {
                initialPosition: {
                    xPosition: 0,
                    yPosition: 0
                },
                finalPosition: {
                    xPosition: 8,
                    yPosition: 8
                }
            },
            doorPosition: {
                xPosition: 8,
                yPosition: 5
            },
            floorId: "123456"
        };

        floorTypeRepo.findByDomainId.resolves(null);

        // Act
        let error = null;
        try {
            await roomFactory.createRoom(roomDTO);
        } catch (e) {
            error = e;
        }

        // Assert
        expect(error).to.be.an.instanceof(TypeError);
        expect(error.message).to.equal('Floor not found');
    });

    it('should throw an error when room name is invalid (too long)', async () => {
        // Arrange
        const roomDTO = {
            name : "Sample Room Sample Room Sample Room Sample Room Sample Room Sample Room",
            description: "Sample Room Description",
            category: "OTHER",
            dimensions: {
                initialPosition: {
                    xPosition: 0,
                    yPosition: 0
                },
                finalPosition: {
                    xPosition: 8,
                    yPosition: 8
                }
            },
            doorPosition: {
                xPosition: 8,
                yPosition: 5
            },
            floorId: "123456"
        };

        floorTypeRepo.findByDomainId.resolves(floorMock);

        // Act
        let error = null;
        try {
            await roomFactory.createRoom(roomDTO);
        } catch (e) {
            error = e;
        }

        // Assert
        expect(error).to.be.an.instanceof(TypeError);
        expect(error.message).to.equal('Room name is not within range 1 to 50.');
    });

    it('should throw an error when room description is invalid (too long)', async () => {
        // Arrange
        const roomDTO = {
            name : "Sample Room",
            description: "Sample Room Description Sample Room Description Sample Room Description " +
            'Sample Room Description Sample Room Description Sample Room Description Sample Room Description ' +
            'Sample Room Description Sample Room Description Sample Room Description Sample Room Description ',
            category: "OTHER",
            dimensions: {
                initialPosition: {
                    xPosition: 0,
                    yPosition: 0
                },
                finalPosition: {
                    xPosition: 8,
                    yPosition: 8
                }
            },
            doorPosition: {
                xPosition: 8,
                yPosition: 5
            },
            floorId: "123456"
        };

        floorTypeRepo.findByDomainId.resolves(floorMock);

        // Act
        let error = null;
        try {
            await roomFactory.createRoom(roomDTO);
        } catch (e) {
            error = e;
        }

        // Assert
        expect(error).to.be.an.instanceof(TypeError);
        expect(error.message).to.equal('Room description is not within range 1 to 250.');
    });

    it('should throw an error when room is being created on an area that already occupied', async () => {
        // Arrange
        const roomDTO = {
            name : "Sample Room",
            description: "Sample Room Description",
            category: "OTHER",
            dimensions: {
                initialPosition: {
                    xPosition: 0,
                    yPosition: 0
                },
                finalPosition: {
                    xPosition: 8,
                    yPosition: 8
                }
            },
            doorPosition: {
                xPosition: 8,
                yPosition: 5
            },
            doorOrientation: 'EAST',
            floorId: "123456"
        };

        floorTypeRepo.findByDomainId.resolves(floorMock);
        roomAreaChecker.checkIfAreaIsAvailableForRoom.resolves(Result.fail<boolean>('Area already occupied.',
          FailureType.InvalidInput));

        // Act
        let error = null;
        try {
            await roomFactory.createRoom(roomDTO);
        } catch (e) {
            error = e;
        }

        // Assert
        expect(error).to.be.an.instanceof(TypeError);
        expect(error.message).to.equal('Area already occupied.');
    });

    it('should throw an error when room category is invalid (value that does not exist)', async () => {
        // Arrange
        const roomDTO = {
            name : "Sample Room",
            description: "Sample Room Description",
            category: "INVALID",
            dimensions: {
                initialPosition: {
                    xPosition: 0,
                    yPosition: 0
                },
                finalPosition: {
                    xPosition: 8,
                    yPosition: 8
                }
            },
            doorPosition: {
                xPosition: 8,
                yPosition: 5
            },
            floorId: "123456"
        };

        floorTypeRepo.findByDomainId.resolves(floorMock);

        // Act
        let error = null;
        try {
            await roomFactory.createRoom(roomDTO);
        } catch (e) {
            error = e;
        }

        // Assert
        expect(error).to.be.an.instanceof(TypeError);
        expect(error.message).to.equal('Invalid Category.');
    });

    it('should throw an error when room xPosition of initialPosition is invalid (negative number)', async () => {
        // Arrange
        const roomDTO = {
            name : "Sample Room",
            description: "Sample Room Description",
            category: "OTHER",
            dimensions: {
                initialPosition: {
                    xPosition: -2,
                    yPosition: 2
                },
                finalPosition: {
                    xPosition: 8,
                    yPosition: 8
                }
            },
            doorPosition: {
                xPosition: 8,
                yPosition: 5
            },
            floorId: "123456"
        };

        floorTypeRepo.findByDomainId.resolves(floorMock);

        // Act
        let error = null;
        try {
            await roomFactory.createRoom(roomDTO);
        } catch (e) {
            error = e;
        }

        // Assert
        expect(error).to.be.an.instanceof(TypeError);
        expect(error.message).to.equal('XPosition must be positive.');
    });

    it('should throw an error when room YPosition of initialPosition is invalid (negative number)', async () => {
        // Arrange
        const roomDTO = {
            name : "Sample Room",
            description: "Sample Room Description",
            category: "OTHER",
            dimensions: {
                initialPosition: {
                    xPosition: 2,
                    yPosition: -2
                },
                finalPosition: {
                    xPosition: 8,
                    yPosition: 8
                }
            },
            doorPosition: {
                xPosition: 8,
                yPosition: 5
            },
            floorId: "123456"
        };

        floorTypeRepo.findByDomainId.resolves(floorMock);

        // Act
        let error = null;
        try {
            await roomFactory.createRoom(roomDTO);
        } catch (e) {
            error = e;
        }

        // Assert
        expect(error).to.be.an.instanceof(TypeError);
        expect(error.message).to.equal('YPosition must be positive.');
    });

    it('should throw an error when room xPosition of finalPosition is invalid (negative number)', async () => {
        // Arrange
        const roomDTO = {
            name : "Sample Room",
            description: "Sample Room Description",
            category: "OTHER",
            dimensions: {
                initialPosition: {
                    xPosition: 2,
                    yPosition: 2
                },
                finalPosition: {
                    xPosition: -8,
                    yPosition: 8
                }
            },
            doorPosition: {
                xPosition: 8,
                yPosition: 5
            },
            floorId: "123456"
        };

        floorTypeRepo.findByDomainId.resolves(floorMock);

        // Act
        let error = null;
        try {
            await roomFactory.createRoom(roomDTO);
        } catch (e) {
            error = e;
        }

        // Assert
        expect(error).to.be.an.instanceof(TypeError);
        expect(error.message).to.equal('XPosition must be positive.');
    });

    it('should throw an error when room YPosition of finalPosition is invalid (negative number)', async () => {
        // Arrange
        const roomDTO = {
            name : "Sample Room",
            description: "Sample Room Description",
            category: "OTHER",
            dimensions: {
                initialPosition: {
                    xPosition: 2,
                    yPosition: 2
                },
                finalPosition: {
                    xPosition: 8,
                    yPosition: -8
                }
            },
            doorPosition: {
                xPosition: 8,
                yPosition: 5
            },
            floorId: "123456"
        };

        floorTypeRepo.findByDomainId.resolves(floorMock);

        // Act
        let error = null;
        try {
            await roomFactory.createRoom(roomDTO);
        } catch (e) {
            error = e;
        }

        // Assert
        expect(error).to.be.an.instanceof(TypeError);
        expect(error.message).to.equal('YPosition must be positive.');
    });

    it('should throw an error when room initialPosition is equal than final Position', async () => {
        // Arrange
        const roomDTO = {
            name : "Sample Room",
            description: "Sample Room Description",
            category: "OTHER",
            dimensions: {
                initialPosition: {
                    xPosition: 2,
                    yPosition: 2
                },
                finalPosition: {
                    xPosition: 2,
                    yPosition: 2
                }
            },
            doorPosition: {
                xPosition: 8,
                yPosition: 5
            },
            floorId: "123456"
        };

        floorTypeRepo.findByDomainId.resolves(floorMock);

        // Act
        let error = null;
        try {
            await roomFactory.createRoom(roomDTO);
        } catch (e) {
            error = e;
        }

        // Assert
        expect(error).to.be.an.instanceof(TypeError);
        expect(error.message).to.equal('Initial position cannot be equal to final position.');
    });

    it('should throw an error when room initialPosition is greater than final Position', async () => {
        // Arrange
        const roomDTO = {
            name : "Sample Room",
            description: "Sample Room Description",
            category: "OTHER",
            dimensions: {
                initialPosition: {
                    xPosition: 2,
                    yPosition: 2
                },
                finalPosition: {
                    xPosition: 1,
                    yPosition: 1
                }
            },
            doorPosition: {
                xPosition: 8,
                yPosition: 5
            },
            doorOrientation: 'NORTH',
            floorId: "123456"
        };

        floorTypeRepo.findByDomainId.resolves(floorMock);

        // Act
        let error = null;
        try {
            await roomFactory.createRoom(roomDTO);
        } catch (e) {
            error = e;
        }

        // Assert
        expect(error).to.be.an.instanceof(TypeError);
        expect(error.message).to.equal('Initial position cannot be greater than final position.');
    });

    it('should throw an error when room xPosition of doorPosition is invalid (negative number)', async () => {
        // Arrange
        const roomDTO = {
            name : "Sample Room",
            description: "Sample Room Description",
            category: "OTHER",
            dimensions: {
                initialPosition: {
                    xPosition: 2,
                    yPosition: 2
                },
                finalPosition: {
                    xPosition: 8,
                    yPosition: 8
                }
            },
            doorPosition: {
                xPosition: -8,
                yPosition: 5
            },
            floorId: "123456"
        };

        floorTypeRepo.findByDomainId.resolves(floorMock);

        // Act
        let error = null;
        try {
            await roomFactory.createRoom(roomDTO);
        } catch (e) {
            error = e;
        }

        // Assert
        expect(error).to.be.an.instanceof(TypeError);
        expect(error.message).to.equal('XPosition must be positive.');
    });

    it('should throw an error when room YPosition of doorPosition is invalid (negative number)', async () => {
        // Arrange
        const roomDTO = {
            name : "Sample Room",
            description: "Sample Room Description",
            category: "OTHER",
            dimensions: {
                initialPosition: {
                    xPosition: 2,
                    yPosition: 2
                },
                finalPosition: {
                    xPosition: 8,
                    yPosition: 8
                }
            },
            doorPosition: {
                xPosition: 8,
                yPosition: -5
            },
            floorId: "123456"
        };

        floorTypeRepo.findByDomainId.resolves(floorMock);

        // Act
        let error = null;
        try {
            await roomFactory.createRoom(roomDTO);
        } catch (e) {
            error = e;
        }

        // Assert
        expect(error).to.be.an.instanceof(TypeError);
        expect(error.message).to.equal('YPosition must be positive.');
    });

    it('should throw an error when room finalPosition is outOfBounds', async () => {
        // Arrange
        const roomDTO = {
            name : "Sample Room",
            description: "Sample Room Description",
            category: "OTHER",
            dimensions: {
                initialPosition: {
                    xPosition: 2,
                    yPosition: 2
                },
                finalPosition: {
                    xPosition: 28,
                    yPosition: 28
                }
            },
            doorPosition: {
                xPosition: 2,
                yPosition: 5
            },
            doorOrientation: 'WEST',
            floorId: "123456"
        };

        floorTypeRepo.findByDomainId.resolves(floorMock);
        const result = Result.ok<boolean>(true);
        roomAreaChecker.checkIfAreaIsAvailableForRoom.resolves(result);
        doorPositionChecker.isPositionValid.resolves(result);

        // Act
        let error = null;
        try {
            await roomFactory.createRoom(roomDTO);
        } catch (e) {
            error = e;
        }

        // Assert
        expect(error).to.be.an.instanceof(TypeError);
        expect(error.message).to.equal('Room dimensions are out of bounds.');
    });

    it('should throw an error when door orientation is invalid (value that does not exist)', async () => {
        // Arrange
        const roomDTO = {
            name : "Sample Room",
            description: "Sample Room Description",
            category: "OTHER",
            dimensions: {
                initialPosition: {
                    xPosition: 0,
                    yPosition: 0
                },
                finalPosition: {
                    xPosition: 8,
                    yPosition: 8
                }
            },
            doorPosition: {
                xPosition: 8,
                yPosition: 5
            },
            doorOrientation: 'INVALID',
            floorId: "123456"
        };

        floorTypeRepo.findByDomainId.resolves(floorMock);

        // Act
        let error = null;
        try {
            await roomFactory.createRoom(roomDTO);
        } catch (e) {
            error = e;
        }

        // Assert
        expect(error).to.be.an.instanceof(TypeError);
        expect(error.message).to.equal('Invalid Door Orientation.');
    });

    it('should throw an error when door orientation is invalid (not facing the outside of the room - SOUTH)', async () => {
        // Arrange
        const roomDTO = {
            name : "Sample Room",
            description: "Sample Room Description",
            category: "OTHER",
            dimensions: {
                initialPosition: {
                    xPosition: 0,
                    yPosition: 0
                },
                finalPosition: {
                    xPosition: 8,
                    yPosition: 8
                }
            },
            doorPosition: {
                xPosition: 8,
                yPosition: 5
            },
            doorOrientation: 'SOUTH',
            floorId: "123456"
        };

        floorTypeRepo.findByDomainId.resolves(floorMock);
        const resultTrue = Result.ok(true);
        roomAreaChecker.checkIfAreaIsAvailableForRoom.resolves(resultTrue);
        const resultFalse =
          Result.fail<boolean>('Invalid door orientation, it should face the outside of the room.',
            FailureType.InvalidInput);
        doorPositionChecker.isPositionValid.resolves(resultFalse);

        // Act
        let error = null;
        try {
            await roomFactory.createRoom(roomDTO);
        } catch (e) {
            error = e;
        }

        // Assert
        expect(error).to.be.an.instanceof(TypeError);
        expect(error.message).to.equal('Invalid door orientation, it should face the outside of the room.');
    });

    it('should throw an error when door orientation is invalid (not facing the outside of the room - NORTH)', async () => {
        // Arrange
        const roomDTO = {
            name : "Sample Room",
            description: "Sample Room Description",
            category: "OTHER",
            dimensions: {
                initialPosition: {
                    xPosition: 0,
                    yPosition: 0
                },
                finalPosition: {
                    xPosition: 8,
                    yPosition: 8
                }
            },
            doorPosition: {
                xPosition: 5,
                yPosition: 8
            },
            doorOrientation: 'NORTH',
            floorId: "123456"
        };

        floorTypeRepo.findByDomainId.resolves(floorMock);
        const resultTrue = Result.ok(true);
        roomAreaChecker.checkIfAreaIsAvailableForRoom.resolves(resultTrue);
        const resultFalse =
          Result.fail<boolean>('Invalid door orientation, it should face the outside of the room.',
            FailureType.InvalidInput);
        doorPositionChecker.isPositionValid.resolves(resultFalse);

        // Act
        let error = null;
        try {
            await roomFactory.createRoom(roomDTO);
        } catch (e) {
            error = e;
        }

        // Assert
        expect(error).to.be.an.instanceof(TypeError);
        expect(error.message).to.equal('Invalid door orientation, it should face the outside of the room.');
    });
});