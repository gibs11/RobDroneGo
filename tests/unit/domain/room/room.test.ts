import * as sinon from 'sinon';
import {Floor} from "../../../../src/domain/floor/floor";
import {RoomName} from "../../../../src/domain/room/RoomName";
import {RoomCategory} from "../../../../src/domain/room/RoomCategory";
import {Room} from "../../../../src/domain/room/Room";
import {RoomDimensions} from "../../../../src/domain/room/RoomDimensions";
import {Position} from "../../../../src/domain/room/Position";
import {RoomDescription} from "../../../../src/domain/room/RoomDescription";
import {UniqueEntityID} from "../../../../src/core/domain/UniqueEntityID";
import {Building} from "../../../../src/domain/building/building";
import BuildingDataSource from "../../../datasource/buildingDataSource";
import {FloorNumber} from "../../../../src/domain/floor/floorNumber";
import {DoorOrientation} from "../../../../src/domain/room/DoorOrientation";


describe('Room', () => {
    // Create sinon sandbox for isolated test
    const sandbox = sinon.createSandbox();

    // Room
    let floorTypeMock: Floor;
    let buildingTypeMock: Building;

    beforeEach(() => {
        buildingTypeMock = BuildingDataSource.getBuildingA();
        floorTypeMock = Floor.create({
            building: buildingTypeMock,
            floorNumber: FloorNumber.create(1).getValue(),
            floorDescription: null,
            floorPlan: null
        }).getValue();

    });

    afterEach(() => {
        sandbox.restore();
        sinon.restore();
    });

    it('should create a valid Room object, passing a Room id, name, description, category, dimensions, ' +
        'doorPosition and floor Id', () => {

        // Arrange
        const name = RoomName.create('Sample name');
        const description = RoomDescription.create('Sample description');
        const category = RoomCategory.AUDITORIUM;
        const initialPosition = Position.create(1, 1);
        const finalPosition = Position.create(2, 2);
        const dimensions = RoomDimensions
            .create(initialPosition.getValue(), finalPosition.getValue());
        const doorPosition = Position.create(1, 2);
        const doorOrientation = DoorOrientation.NORTH;

        const roomProps = {
            name: name.getValue(),
            description: description.getValue(),
            category: category,
            dimensions: dimensions.getValue(),
            doorPosition: doorPosition.getValue(),
            doorOrientation: doorOrientation,
            floor: floorTypeMock
        }
        const roomId = new UniqueEntityID();

        // Act
        const roomResult = Room.create(roomProps, roomId);

        // Assert
        sinon.assert.match(roomResult.isSuccess, true);

        const room = roomResult.getValue();
        sinon.assert.match(room.id, roomId);
        sinon.assert.match(room.name.value, name.getValue().value);
        sinon.assert.match(room.description.value, description.getValue().value);
        sinon.assert.match(room.category, category);
        sinon.assert.match(room.dimensions.initialPosition.yPosition, dimensions.getValue().initialPosition.xPosition);
        sinon.assert.match(room.dimensions.initialPosition.yPosition, dimensions.getValue().initialPosition.yPosition);
        sinon.assert.match(room.dimensions.finalPosition.xPosition, dimensions.getValue().finalPosition.xPosition);
        sinon.assert.match(room.dimensions.finalPosition.yPosition, dimensions.getValue().finalPosition.yPosition);
        sinon.assert.match(room.doorPosition.xPosition, doorPosition.getValue().xPosition);
        sinon.assert.match(room.doorPosition.yPosition, doorPosition.getValue().yPosition);
        sinon.assert.match(room.floor, floorTypeMock);
    });


    it('should create a valid Room object, without passing a Room id', () => {

        // Arrange
        const name = RoomName.create('Sample name');
        const description = RoomDescription.create('Sample description');
        const category = RoomCategory.AUDITORIUM;
        const initialPosition = Position.create(1, 1);
        const finalPosition = Position.create(2, 2);
        const dimensions = RoomDimensions
            .create(initialPosition.getValue(), finalPosition.getValue());
        const doorPosition = Position.create(1, 2);
        const doorOrientation = DoorOrientation.NORTH;

        const roomProps = {
            name: name.getValue(),
            description: description.getValue(),
            category: category,
            dimensions: dimensions.getValue(),
            doorPosition: doorPosition.getValue(),
            doorOrientation: doorOrientation,
            floor: floorTypeMock
        }

        // Act
        const roomResult = Room.create(roomProps);

        // Assert
        sinon.assert.match(roomResult.isSuccess, true);

        const room = roomResult.getValue();
        sinon.assert.match(room.name.value, name.getValue().value);
        sinon.assert.match(room.description.value, description.getValue().value);
        sinon.assert.match(room.category, category);
        sinon.assert.match(room.dimensions.initialPosition.yPosition, dimensions.getValue().initialPosition.xPosition);
        sinon.assert.match(room.dimensions.initialPosition.yPosition, dimensions.getValue().initialPosition.yPosition);
        sinon.assert.match(room.dimensions.finalPosition.xPosition, dimensions.getValue().finalPosition.xPosition);
        sinon.assert.match(room.dimensions.finalPosition.yPosition, dimensions.getValue().finalPosition.yPosition);
        sinon.assert.match(room.doorPosition.xPosition, doorPosition.getValue().xPosition);
        sinon.assert.match(room.doorPosition.yPosition, doorPosition.getValue().yPosition);
        sinon.assert.match(room.floor, floorTypeMock);
    });


    it('should not create a valid Room object - null name', () => {

        // Arrange
        const description = RoomDescription.create('Sample description');
        const category = RoomCategory.AUDITORIUM;
        const initialPosition = Position.create(1, 1);
        const finalPosition = Position.create(2, 2);
        const dimensions = RoomDimensions
            .create(initialPosition.getValue(), finalPosition.getValue());
        const doorPosition = Position.create(1, 2);
        const doorOrientation = DoorOrientation.NORTH;

        const roomProps = {
            name: null,
            description: description.getValue(),
            category: category,
            dimensions: dimensions.getValue(),
            doorPosition: doorPosition.getValue(),
            doorOrientation: doorOrientation,
            floor: floorTypeMock
        }

        // Act
        const roomResult = Room.create(roomProps);

        // Assert
        sinon.assert.match(roomResult.isFailure, true);
    });


    it('should not create a valid Room object - null description', () => {

        // Arrange
        const name = RoomName.create('Sample name');
        const category = RoomCategory.AUDITORIUM;
        const initialPosition = Position.create(1, 1);
        const finalPosition = Position.create(2, 2);
        const dimensions = RoomDimensions
            .create(initialPosition.getValue(), finalPosition.getValue());
        const doorPosition = Position.create(1, 2);
        const doorOrientation = DoorOrientation.NORTH;

        const roomProps = {
            name: name.getValue(),
            description: null,
            category: category,
            dimensions: dimensions.getValue(),
            doorPosition: doorPosition.getValue(),
            doorOrientation: doorOrientation,
            floor: floorTypeMock
        }

        // Act
        const roomResult = Room.create(roomProps);

        // Assert
        sinon.assert.match(roomResult.isFailure, true);
    });


    it('should not create a valid Room object - null dimensions', () => {

        // Arrange
        const name = RoomName.create('Sample name');
        const description = RoomDescription.create('Sample description');
        const category = RoomCategory.AUDITORIUM;
        const doorPosition = Position.create(1, 2);
        const doorOrientation = DoorOrientation.NORTH;

        const roomProps = {
            name: name.getValue(),
            description: description.getValue(),
            category: category,
            dimensions: null,
            doorPosition: doorPosition.getValue(),
            doorOrientation: doorOrientation,
            floor: floorTypeMock
        }

        // Act
        const roomResult = Room.create(roomProps);

        // Assert
        sinon.assert.match(roomResult.isFailure, true);
    });


    it('should not create a valid Room object - null doorPosition', () => {

        // Arrange
        const name = RoomName.create('Sample name');
        const description = RoomDescription.create('Sample description');
        const category = RoomCategory.AUDITORIUM;
        const initialPosition = Position.create(1, 1);
        const finalPosition = Position.create(2, 2);
        const dimensions = RoomDimensions
            .create(initialPosition.getValue(), finalPosition.getValue());
        const doorOrientation = DoorOrientation.NORTH;

        const roomProps = {
            name: name.getValue(),
            description: description.getValue(),
            category: category,
            dimensions: dimensions.getValue(),
            doorPosition: null,
            doorOrientation: doorOrientation,
            floor: floorTypeMock
        }

        // Act
        const roomResult = Room.create(roomProps);

        // Assert
        sinon.assert.match(roomResult.isFailure, true);
    });


    it('should not create a valid Room object - null doorOrientation', () => {

        // Arrange
        const name = RoomName.create('Sample name');
        const description = RoomDescription.create('Sample description');
        const category = RoomCategory.AUDITORIUM;
        const initialPosition = Position.create(1, 1);
        const finalPosition = Position.create(1, 2);
        const dimensions = RoomDimensions
          .create(initialPosition.getValue(), finalPosition.getValue());
        const doorPosition = Position.create(1, 1);

        const roomProps = {
            name: name.getValue(),
            description: description.getValue(),
            category: category,
            dimensions: dimensions.getValue(),
            doorPosition: doorPosition.getValue(),
            doorOrientation: null,
            floor: floorTypeMock,
        }

        // Act
        const roomResult = Room.create(roomProps);

        // Assert
        sinon.assert.match(roomResult.isFailure, true);
    });


    it('should not create a valid Room object - null floor', () => {

        // Arrange
        const name = RoomName.create('Sample name');
        const description = RoomDescription.create('Sample description');
        const category = RoomCategory.AUDITORIUM;
        const initialPosition = Position.create(1, 1);
        const finalPosition = Position.create(1, 2);
        const dimensions = RoomDimensions
            .create(initialPosition.getValue(), finalPosition.getValue());
        const doorPosition = Position.create(1, 1);
        const doorOrientation = DoorOrientation.NORTH;

        const roomProps = {
            name: name.getValue(),
            description: description.getValue(),
            category: category,
            dimensions: dimensions.getValue(),
            doorPosition: doorPosition.getValue(),
            doorOrientation: doorOrientation,
            floor: null,
        }

        // Act
        const roomResult = Room.create(roomProps);

        // Assert
        sinon.assert.match(roomResult.isFailure, true);
    });


    it('should not create a valid Room object - final Position is out of bounds (greater than building width/length', () => {

            // Arrange
            const name = RoomName.create('Sample name');
            const description = RoomDescription.create('Sample description');
            const category = RoomCategory.AUDITORIUM;
            const initialPosition = Position.create(1, 1);
            const finalPosition = Position.create(15, 20);
            const dimensions = RoomDimensions
                .create(initialPosition.getValue(), finalPosition.getValue());
            const doorPosition = Position.create(1, 1);
            const doorOrientation = DoorOrientation.NORTH;

            const roomProps = {
                name: name.getValue(),
                description: description.getValue(),
                category: category,
                dimensions: dimensions.getValue(),
                doorPosition: doorPosition.getValue(),
                doorOrientation: doorOrientation,
                floor: floorTypeMock
            }

            // Act
            const roomResult = Room.create(roomProps);

            // Assert
            sinon.assert.match(roomResult.isFailure, true);
    });
});
