import sinon from 'sinon';
import {expect, use} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import RoomService from "../../../src/services/ServicesImpl/roomService";
import RoomDataSource from "../../datasource/RoomDataSource";
import {Floor} from "../../../src/domain/floor/floor";
import {Room} from "../../../src/domain/room/Room";

use(chaiAsPromised);

describe('RoomService', () => {

  let roomRepoMock;
  let floorRepoMock;
  let roomFactoryMock;
  let roomService;
  let floorMock: Floor;
  let roomMock: Room;


  describe('createRoom', () => {

    describe('Unit Test', () => {
      beforeEach(() => {
        roomRepoMock = {
          findByDomainId: sinon.stub(),
          findByName: sinon.stub(),
          save: sinon.stub(),
        };
        floorRepoMock = {
          findByDomainId: sinon.stub(),
        };
        roomFactoryMock = {
          createRoom: sinon.stub(),
        };
        roomMock = RoomDataSource.getRoomA();
        floorMock = roomMock.floor;
        roomService = new RoomService(roomRepoMock, floorRepoMock, roomFactoryMock);
      });

      afterEach(() => {
        sinon.restore();
      });

      it('Success - Unit Test', async () => {
        // Arrange
        const roomDTO = {
          name: 'room1',
          description: 'some description',
          category: 'OTHER',
          dimensions: {
            initialPosition: {
              xPosition: 0,
              yPosition: 0,
            },
            finalPosition: {
              xPosition: 4,
              yPosition: 4,
            }
          },
          doorPosition: {
            xPosition: 4,
            yPosition: 4,
          },
          doorOrientation: 'WEST',
          floorId: '1',
        };

        // Mocks
        floorRepoMock.findByDomainId.resolves(floorMock);
        roomRepoMock.findByName.resolves(null);
        roomFactoryMock.createRoom.resolves(roomMock);
        roomRepoMock.save.resolves(roomMock);

        // Act
        const result = await roomService.createRoom(roomDTO);


        // Assert
        expect(result.isFailure).to.be.false;
      });


      it('Failure - Unit Test - Room Name already exists', async () => {
        // Arrange
        const roomDTO = {
          name: 'room1',
          description: 'some description',
          category: 'OTHER',
          dimensions: {
            initialPosition: {
              xPosition: 0,
              yPosition: 0,
            },
            finalPosition: {
              xPosition: 4,
              yPosition: 4,
            }
          },
          doorPosition: {
            xPosition: 4,
            yPosition: 4,
          },
          doorOrientation: 'WEST',
          floorId: '1',
        };

        // Mocks
        floorRepoMock.findByDomainId.resolves(floorMock);
        roomRepoMock.findByName.resolves(roomMock);
        roomFactoryMock.createRoom.resolves(roomMock);
        roomRepoMock.save.resolves(roomMock);

        // Act
        const result = await roomService.createRoom(roomDTO);

        // Assert
        expect(result.isFailure).to.be.true;
      });


      it('Failure - Unit Test - Floor does not exist', async () => {
        // Arrange
        const roomDTO = {
          name: 'room1',
          description: 'some description',
          category: 'OTHER',
          dimensions: {
            initialPosition: {
              xPosition: 0,
              yPosition: 0,
            },
            finalPosition: {
              xPosition: 4,
              yPosition: 4,
            }
          },
          doorPosition: {
            xPosition: 4,
            yPosition: 4,
          },
          doorOrientation: 'WEST',
          floorId: '1',
        };

        // Mocks
        floorRepoMock.findByDomainId.resolves(null);
        roomRepoMock.findByName.resolves(null);
        roomFactoryMock.createRoom.resolves(roomMock);
        roomRepoMock.save.resolves(roomMock);

        // Act
        const result = await roomService.createRoom(roomDTO);

        // Assert
        expect(result.isFailure).to.be.true;
      });


      it('Success - Integration With Domain', async () => {
        // Arrange
        const roomDTO = {
          name: 'room1',
          description: 'some description',
          category: 'OTHER',
          dimensions: {
            initialPosition: {
              xPosition: 0,
              yPosition: 0,
            },
            finalPosition: {
              xPosition: 4,
              yPosition: 4,
            }
          },
          doorPosition: {
            xPosition: 4,
            yPosition: 4,
          },
          doorOrientation: 'WEST',
          floorId: '1',
        };

        // Mocks
        floorRepoMock.findByDomainId.resolves(floorMock);
        roomRepoMock.findByName.resolves(null);
        roomFactoryMock.createRoom.resolves(roomMock);

        // Act
        const result = await roomService.createRoom(roomDTO);

        // Assert
        expect(result.isFailure).to.be.false;
      });
    });
  });

  describe('listRooms', () => {

      describe('Unit Test', () => {
        beforeEach(() => {
          roomRepoMock = {
            findAll: sinon.stub(),
            findByFloorId: sinon.stub(),
          };
          roomMock = RoomDataSource.getRoomA();
          roomService = new RoomService(roomRepoMock, floorRepoMock, roomFactoryMock);
        });

        afterEach(() => {
          sinon.restore();
        });

        it('Success - Unit Test - List All', async () => {
          // Arrange
          roomRepoMock.findAll.resolves([roomMock]);

          // Act
          const result = await roomService.listRooms();

          // Assert
          expect(result).to.be.an('array');
        });


        it('Success - Unit Test - List By Floor', async () => {
          // Arrange
          roomRepoMock.findByFloorId.resolves([roomMock]);

          // Act
          const result = await roomService.listRoomsByFloor('1');

          // Assert
          expect(result.isFailure).to.be.false;
        });

        it('Failure - Unit Test - List By Floor', async () => {
          // Arrange
          roomRepoMock.findByFloorId.throws(new TypeError('Error'));

          // Act
          const result = await roomService.listRoomsByFloor('1');

          // Assert
          expect(result.isFailure).to.be.true;
        });


        it('Failure - Unit Test - List By Floor', async () => {
          // Arrange
          roomRepoMock.findByFloorId.throws(new Error('Error'));

          // Act
          const result = await roomService.listRoomsByFloor('1');

          // Assert
          expect(result.isFailure).to.be.true;
        });
      });
  });
});