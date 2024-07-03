import { expect } from 'chai';
import sinon from 'sinon';
import FloorDataSource from "../../datasource/floorDataSource";
import RoomAreaChecker from "../../../src/domain/ServicesImpl/roomAreaChecker";
import RoomDataSource from "../../datasource/RoomDataSource";


describe('DoorPositionChecker', () => {

  let roomRepoMock;
  let passageRepoMock;
  let elevatorRepoMock;
  let roomAreaChecker;

  beforeEach(() => {
    roomRepoMock = {
      findByFloorId: sinon.stub(),
      checkIfRoomExistInArea: sinon.stub()
    };
    passageRepoMock = {
      checkIfPassageExistInArea: sinon.stub()
    }
    elevatorRepoMock = {
      checkIfElevatorExistInArea: sinon.stub()
    }

    roomAreaChecker = new RoomAreaChecker(roomRepoMock, elevatorRepoMock, passageRepoMock);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('checkIfAreaIsAvailableForRoom', () => {
    it('should return true if area is available', async () => {
      const initialX = 0;
      const initialY = 0;
      const finalX = 10;
      const finalY = 10;
      const doorX = 7;
      const doorY = 5;
      const doorOrientation = 'NORTH';
      const floor = FloorDataSource.getFirstFloor();

      // Mocks
      roomRepoMock.findByFloorId.resolves([]);
      roomRepoMock.checkIfRoomExistInArea.resolves(false);
      passageRepoMock.checkIfPassageExistInArea.resolves(false);
      elevatorRepoMock.checkIfElevatorExistInArea.resolves(false);

      // Act
      const result = await roomAreaChecker.checkIfAreaIsAvailableForRoom(
        initialX,
        initialY,
        finalX,
        finalY,
        doorX,
        doorY,
        doorOrientation,
        floor,
      );

      // Assert
      expect(result.isSuccess).to.be.true;

      // Restore the stubs
      sinon.restore();
    });
  });


  it('should return false if the room is blocking another`s door', async () => {
    const initialX = 6;
    const initialY = 0;
    const finalX = 8;
    const finalY = 5;
    const doorX = 7;
    const doorY = 5;
    const doorOrientation = 'SOUTH';
    const floor = FloorDataSource.getFirstFloor();

    // Mocks
    roomRepoMock.findByFloorId.resolves([RoomDataSource.getRoomA()]);

    // Act
    const result = await roomAreaChecker.checkIfAreaIsAvailableForRoom(
      initialX,
      initialY,
      finalX,
      finalY,
      doorX,
      doorY,
      doorOrientation,
      floor,
    );

    // Assert
    expect(result.isSuccess).to.be.false;

    // Restore the stubs
    sinon.restore();
  });


  it('should return false if the room is blocking another`s door with its door', async () => {
    const initialX = 7;
    const initialY = 2;
    const finalX = 9;
    const finalY = 5;
    const doorX = 7;
    const doorY = 2;
    const doorOrientation = 'WEST';
    const floor = FloorDataSource.getFirstFloor();

    // Mocks
    roomRepoMock.findByFloorId.resolves([RoomDataSource.getRoomA()]);
    roomRepoMock.checkIfRoomExistInArea.resolves(false);
    passageRepoMock.checkIfPassageExistInArea.resolves(false);
    elevatorRepoMock.checkIfElevatorExistInArea.resolves(false);

    // Act
    const result = await roomAreaChecker.checkIfAreaIsAvailableForRoom(
      initialX,
      initialY,
      finalX,
      finalY,
      doorX,
      doorY,
      doorOrientation,
      floor,
    );

    // Assert
    expect(result.isSuccess).to.be.false;

    // Restore the stubs
    sinon.restore();
  });


  it('should return false if the room is facing a room', async () => {
    const initialX = 6;
    const initialY = 0;
    const finalX = 15;
    const finalY = 10;
    const doorX = 6;
    const doorY = 15;
    const doorOrientation = 'EAST';
    const floor = FloorDataSource.getFirstFloor();

    // Mocks
    roomRepoMock.findByFloorId.resolves([]);
    roomRepoMock.checkIfRoomExistInArea.resolves(true);

    // Act
    const result = await roomAreaChecker.checkIfAreaIsAvailableForRoom(
      initialX,
      initialY,
      finalX,
      finalY,
      doorX,
      doorY,
      doorOrientation,
      floor,
    );

    // Assert
    expect(result.isSuccess).to.be.false;

    // Restore the stubs
    sinon.restore();
  });


  it('should return false if the room is facing an elevator', async () => {
    const initialX = 6;
    const initialY = 0;
    const finalX = 15;
    const finalY = 10;
    const doorX = 7;
    const doorY = 5;
    const doorOrientation = 'SOUTH';
    const floor = FloorDataSource.getFirstFloor();

    // Mocks
    roomRepoMock.findByFloorId.resolves([]);
    roomRepoMock.checkIfRoomExistInArea.resolves(false);
    elevatorRepoMock.checkIfElevatorExistInArea.resolves(true);

    // Act
    const result = await roomAreaChecker.checkIfAreaIsAvailableForRoom(
      initialX,
      initialY,
      finalX,
      finalY,
      doorX,
      doorY,
      doorOrientation,
      floor,
    );

    // Assert
    expect(result.isSuccess).to.be.false;

    // Restore the stubs
    sinon.restore();
  });


  it('should return false if the room is facing a passage', async () => {
    const initialX = 6;
    const initialY = 0;
    const finalX = 15;
    const finalY = 10;
    const doorX = 7;
    const doorY = 5;
    const doorOrientation = 'SOUTH';
    const floor = FloorDataSource.getFirstFloor();

    // Mocks
    roomRepoMock.findByFloorId.resolves([]);
    roomRepoMock.checkIfRoomExistInArea.resolves(false);
    elevatorRepoMock.checkIfElevatorExistInArea.resolves(false);
    passageRepoMock.checkIfPassageExistInArea.resolves(true);

    // Act
    const result = await roomAreaChecker.checkIfAreaIsAvailableForRoom(
      initialX,
      initialY,
      finalX,
      finalY,
      doorX,
      doorY,
      doorOrientation,
      floor,
    );

    // Assert
    expect(result.isSuccess).to.be.false;

    // Restore the stubs
    sinon.restore();
  });


  it('should return false if room orientation is invalid', async () => {
    const initialX = 6;
    const initialY = 0;
    const finalX = 15;
    const finalY = 10;
    const doorX = 7;
    const doorY = 5;
    const doorOrientation = 'INVALID';
    const floor = FloorDataSource.getFirstFloor();

    // Mocks
    roomRepoMock.findByFloorId.resolves([RoomDataSource.getRoomA()]);
    roomRepoMock.checkIfRoomExistInArea.resolves(false);
    elevatorRepoMock.checkIfElevatorExistInArea.resolves(false);
    passageRepoMock.checkIfPassageExistInArea.resolves(false);

    // Act
    const result = await roomAreaChecker.checkIfAreaIsAvailableForRoom(
      initialX,
      initialY,
      finalX,
      finalY,
      doorX,
      doorY,
      doorOrientation,
      floor,
    );

    // Assert
    expect(result.isSuccess).to.be.false;

    // Restore the stubs
    sinon.restore();
  });
});