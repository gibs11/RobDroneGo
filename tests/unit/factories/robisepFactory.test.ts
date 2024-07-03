import {expect} from 'chai';
import * as sinon from 'sinon';
import RobisepFactory from '../../../src/factories/robisepFactory';
import {RobisepType} from "../../../src/domain/robisepType/RobisepType";
import {RobisepTypeDesignation} from "../../../src/domain/robisepType/RobisepTypeDesignation";
import {RobisepTypeBrand} from "../../../src/domain/robisepType/RobisepTypeBrand";
import {TaskType} from "../../../src/domain/common/TaskType";
import {RobisepTypeModel} from "../../../src/domain/robisepType/RobisepTypeModel";
import {UniqueEntityID} from "../../../src/core/domain/UniqueEntityID";
import RoomDataSource from "../../datasource/RoomDataSource";

describe('robisepFactory', () => {
    // Create sinon sandbox for isolating tests
    const sandbox = sinon.createSandbox();

    // Building for the robisep
    let robisepTypeMock;
    let roomMock;

    let robisepTypeRepoMock;
    let roomRepoMock;
    let robisepFactory;

    beforeEach(() => {
        robisepTypeMock = RobisepType.create({
            designation: RobisepTypeDesignation.create("Sample Robisep Type").getValue(),
            brand: RobisepTypeBrand.create("Sample Robisep Brand").getValue(),
            model: RobisepTypeModel.create("Sample Robisep Model").getValue(),
            tasksType: [TaskType.TRANSPORT]
            }, new UniqueEntityID("123456")
        )

        roomMock = RoomDataSource.getFirstRoomT();

        robisepTypeRepoMock = {
            findByDomainId: sinon.stub(),
        }

        roomRepoMock = {
            findByDomainId: sinon.stub(),
        }

        robisepFactory = new RobisepFactory(robisepTypeRepoMock, roomRepoMock);
    });

    afterEach(() => {
        sandbox.restore();
        sinon.restore();
    });

    it('should create a valid robisep', async () => {
        // Arrange
        const robisepDTO = {
            nickname: "Sample Robisep",
            serialNumber: "123456",
            code: "123456",
            description: "Sample Robisep Description",
            robisepTypeId: "123456",
            roomId: "123456",
        };

        robisepTypeRepoMock.findByDomainId.resolves(robisepTypeMock);

        roomRepoMock.findByDomainId.resolves(roomMock);

        const robisep = await robisepFactory.createRobisep(robisepDTO);

        // Assert
        expect(robisep.nickname.value).to.equal(robisepDTO.nickname);
        expect(robisep.serialNumber.value).to.equal(robisepDTO.serialNumber);
        expect(robisep.code.value).to.equal(robisepDTO.code);
        expect(robisep.description.value).to.equal(robisepDTO.description);
    });

    it('should create a valid robisep without robisep description', async () => {
        // Arrange
        const robisepDTO = {
            nickname: "Sample Robisep",
            serialNumber: "123456",
            code: "123456",
            robisepTypeId: "123456",
            roomId: "123456",
        };

        robisepTypeRepoMock.findByDomainId.resolves(robisepTypeMock);

        roomRepoMock.findByDomainId.resolves(roomMock);

        const robisep = await robisepFactory.createRobisep(robisepDTO);

        // Assert
        expect(robisep.nickname.value).to.equal(robisepDTO.nickname);
        expect(robisep.serialNumber.value).to.equal(robisepDTO.serialNumber);
        expect(robisep.code.value).to.equal(robisepDTO.code);
    });

    it('should throw an error when robisepType is not found', async () => {
        // Arrange
        const robisepDTO = {
            nickname: "Sample Robisep",
            serialNumber: "123456",
            code: "123456",
            description: "Sample Robisep Description",
            robisepTypeId: "123456",
            roomId: "123456",
        };

        robisepTypeRepoMock.findByDomainId.resolves(null);

        roomRepoMock.findByDomainId.resolves(roomMock);

        // Act
        let error = null;
        try {
            await robisepFactory.createRobisep(robisepDTO);
        } catch (e) {
            error = e;
        }

        // Assert
        expect(error).to.be.an.instanceof(Error);
        expect(error.message).to.equal('RobisepType not found.');
    });

    it('should throw an error when room is not found', async () => {
        // Arrange
        const robisepDTO = {
            nickname: "Sample Robisep",
            serialNumber: "123456",
            code: "123456",
            description: "Sample Robisep Description",
            robisepTypeId: "123456",
            roomId: "123456",
        };

        robisepTypeRepoMock.findByDomainId.resolves(robisepTypeMock);

        roomRepoMock.findByDomainId.resolves(null);

        // Act
        let error = null;
        try {
            await robisepFactory.createRobisep(robisepDTO);
        } catch (e) {
            error = e;
        }

        // Assert
        expect(error).to.be.an.instanceof(Error);
        expect(error.message).to.equal('Room not found.');
    });

    it('should throw an error when robisep nickname is invalid (too long)', async () => {
        // Arrange
        const robisepDTO = {
            nickname: "Sample Robisep Sample Robisep Sample Robisep Sample Robisep",
            serialNumber: "123456",
            code: "123456",
            description: "Sample Robisep Description",
            robisepTypeId: "123456",
            roomId: "123456",
        };

        robisepTypeRepoMock.findByDomainId.resolves(robisepTypeMock);

        roomRepoMock.findByDomainId.resolves(roomMock);

        // Act
        let error = null;
        try {
            await robisepFactory.createRobisep(robisepDTO);
        } catch (e) {
            error = e;
        }

        // Assert
        expect(error).to.be.an.instanceof(TypeError);
        expect(error.message).to.equal('Nickname is not within range 1 to 30.');
    });

    it('should throw an error when robisep serialNumber is invalid (too long)', async () => {
        // Arrange
        const robisepDTO = {
            nickname: "Sample Robisep Sample",
            serialNumber: "Sample Robisep Sample Sample Robisep Sample Sample Robisep Sample",
            code: "123456",
            description: "Sample Robisep Description",
            robisepTypeId: "123456",
            roomId: "123456",
        };

        robisepTypeRepoMock.findByDomainId.resolves(robisepTypeMock);

        roomRepoMock.findByDomainId.resolves(roomMock);

        // Act
        let error = null;
        try {
            await robisepFactory.createRobisep(robisepDTO);
        } catch (e) {
            error = e;
        }

        // Assert
        expect(error).to.be.an.instanceof(TypeError);
        expect(error.message).to.equal('SerialNumber is not within range 1 to 50.');
    });

    it('should throw an error when robisep code is invalid (too long)', async () => {
        // Arrange
        const robisepDTO = {
            nickname: "Sample Robisep Sample",
            serialNumber: "Sample Robisep Sample",
            code: "123456 123456 123456 123456 123456 123456 123456 123456",
            description: "Sample Robisep Description",
            robisepTypeId: "123456",
            roomId: "123456",
        };

        robisepTypeRepoMock.findByDomainId.resolves(robisepTypeMock);

        roomRepoMock.findByDomainId.resolves(roomMock);

        // Act
        let error = null;
        try {
            await robisepFactory.createRobisep(robisepDTO);
        } catch (e) {
            error = e;
        }

        // Assert
        expect(error).to.be.an.instanceof(TypeError);
        expect(error.message).to.equal('Code is not within range 1 to 30.');
    });

    it('should throw an error when robisep description is invalid (too long)', async () => {
        // Arrange
        const robisepDTO = {
            nickname: "Sample Robisep",
            serialNumber: "123456",
            code: "123456",
            description: "Sample Robisep Description Sample Robisep Description Sample Robisep Description Sample Robisep Description" +
            "Sample Robisep Description Sample Robisep Description Sample Robisep Description Sample Robisep Description Sample Robisep Description" +
            "Sample Robisep Description Sample Robisep Description Sample Robisep Description Sample Robisep Description Sample Robisep Description",
            robisepTypeId: "123456",
            roomId: "123456",
        };

        robisepTypeRepoMock.findByDomainId.resolves(robisepTypeMock);

        roomRepoMock.findByDomainId.resolves(roomMock);

        // Act
        let error = null;
        try {
            await robisepFactory.createRobisep(robisepDTO);
        } catch (e) {
            error = e;
        }

        // Assert
        expect(error).to.be.an.instanceof(TypeError);
        expect(error.message).to.equal('Description is not within range 1 to 250.');
    });

});