import sinon from 'sinon';
import {expect, use} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {RobisepType} from "../../../src/domain/robisepType/RobisepType";
import RobisepTypeDataSource from "../../datasource/robisepTypeDataSource";
import RobisepService from "../../../src/services/ServicesImpl/robisepService";
import IRobisepDTO from "../../../src/dto/IRobisepDTO";
import {Robisep} from "../../../src/domain/robisep/Robisep";
import RobisepDataSource from "../../datasource/RobisepDataSource";
import RobisepFactory from "../../../src/factories/robisepFactory";
import {Room} from "../../../src/domain/room/Room";
import RoomDataSource from "../../datasource/RoomDataSource";

use(chaiAsPromised);

describe('RobisepService', () => {

  let robisepRepoMock;
  let robisepTypeRepoMock;
  let roomRepoMock;
  let robisepFactoryMock;
  let robisepService;
  let robisepMock: Robisep;
  let robisepTypeMock: RobisepType;
  let roomMock: Room;


  describe('createRobisep', () => {


    describe('Create Robisep', () => {

      describe('Unit Test', () => {
        beforeEach(() => {
          robisepRepoMock = {
            findByDomainId: sinon.stub(),
            findByCode: sinon.stub(),
            findARobisepTypeWithSameSerialNumber: sinon.stub(),
            save: sinon.stub(),
          };

          robisepTypeRepoMock = {
            findByDomainId: sinon.stub(),
          }

          robisepFactoryMock = {
            createRobisep: sinon.stub(),
          };

          robisepMock = RobisepDataSource.getRobisepA();
          robisepTypeMock = RobisepTypeDataSource.getRobisepTypeA();
          roomMock = RoomDataSource.getFirstRoomT();
          robisepService = new RobisepService(robisepRepoMock, robisepFactoryMock);
        });

        afterEach(() => {
          sinon.restore();
        });

        it('Success - Unit Test', async () => {
          // Arrange
          const robisepTypeDTO: IRobisepDTO = {
            domainId: 'domainId',
            nickname: 'nickname',
            serialNumber: 'serialNumber',
            code: 'code',
            description: 'description',
            robisepTypeId: '1',
            roomId: '1',
          }

          // Mocks
          robisepRepoMock.findByDomainId.resolves(null);
          robisepRepoMock.findByCode.resolves(null);
          robisepRepoMock.findARobisepTypeWithSameSerialNumber.resolves(null);
          robisepFactoryMock.createRobisep.resolves(robisepMock);
          robisepRepoMock.save.resolves(robisepMock);

          // Act
          const result = await robisepService.createRobisep(robisepTypeDTO);


          // Assert
          expect(result.isFailure).to.be.false;
        });


        it('Failure - Unit Test - robisepType does not exists', async () => {
          // Arrange
          const robisepTypeDTO: IRobisepDTO = {
            domainId: 'domainId',
            nickname: 'nickname',
            serialNumber: 'serialNumber',
            code: 'code',
            description: 'description',
            robisepTypeId: '1',
            roomId: '1',
          }

          // Mocks
          robisepRepoMock.findByDomainId.resolves(null);

          // Act
          const result = await robisepService.createRobisep(robisepTypeDTO);

          // Assert
          expect(result.isFailure).to.be.true;
        });


        it('Failure - Unit Test - Code already exists', async () => {
          // Arrange
          const robisepTypeDTO: IRobisepDTO = {
            domainId: 'domainId',
            nickname: 'nickname',
            serialNumber: 'serialNumber',
            code: 'code',
            description: 'description',
            robisepTypeId: '1',
            roomId: '1',
          }

          // Mocks
          robisepRepoMock.findByDomainId.resolves(null);
          robisepRepoMock.findByCode.resolves(robisepTypeMock);

          // Act
          const result = await robisepService.createRobisep(robisepTypeDTO);

          // Assert
          expect(result.isFailure).to.be.true;
        });


        it('Failure - Unit Test - Serial Number already exists', async () => {
          // Arrange
          const robisepTypeDTO: IRobisepDTO = {
            domainId: 'domainId',
            nickname: 'nickname',
            serialNumber: 'serialNumber',
            code: 'code',
            description: 'description',
            robisepTypeId: '1',
            roomId: '1',
          }

          // Mocks
          robisepRepoMock.findByDomainId.resolves(null);
          robisepRepoMock.findByCode.resolves(null);
          robisepRepoMock.findARobisepTypeWithSameSerialNumber.resolves(robisepTypeMock);

          // Act
          const result = await robisepService.createRobisep(robisepTypeDTO);

          // Assert
          expect(result.isFailure).to.be.true;
        });


        it('Failure - Unit Test - Creation fails', async () => {
          // Arrange
          const robisepTypeDTO: IRobisepDTO = {
            domainId: 'domainId',
            nickname: 'nickname',
            serialNumber: 'serialNumber',
            code: 'code',
            description: 'description',
            robisepTypeId: '1',
            roomId: '1',
          }

          // Mocks
          robisepRepoMock.findByDomainId.resolves(null);
          robisepRepoMock.findByCode.resolves(null);
          robisepRepoMock.findARobisepTypeWithSameSerialNumber.resolves(null);
          robisepFactoryMock.createRobisep.throws(new Error('Error'));

          // Act
          const result = await robisepService.createRobisep(robisepTypeDTO);

          // Assert
          expect(result.isFailure).to.be.true;
        });


        it('Failure - Unit Test - Saves fails', async () => {
          // Arrange
          const robisepTypeDTO: IRobisepDTO = {
            domainId: 'domainId',
            nickname: 'nickname',
            serialNumber: 'serialNumber',
            code: 'code',
            description: 'description',
            robisepTypeId: '1',
            roomId: '1',
          }

          // Mocks
          robisepRepoMock.findByDomainId.resolves(null);
          robisepRepoMock.findByCode.resolves(null);
          robisepRepoMock.findARobisepTypeWithSameSerialNumber.resolves(null);
          robisepFactoryMock.createRobisep.resolves(robisepMock);
          robisepRepoMock.save.throws(new Error('Error'));

          // Act
          const result = await robisepService.createRobisep(robisepTypeDTO);

          // Assert
          expect(result.isFailure).to.be.true;
        });
      });

      describe('Integration with Factory', () => {

        beforeEach(() => {
          robisepRepoMock = {
            findByDomainId: sinon.stub(),
            findByCode: sinon.stub(),
            findARobisepTypeWithSameSerialNumber: sinon.stub(),
            save: sinon.stub(),
          };

          roomRepoMock = {
            findByDomainId: sinon.stub(),
          };

          robisepFactoryMock = new RobisepFactory(robisepTypeRepoMock, roomRepoMock);
          robisepMock = RobisepDataSource.getRobisepA();
          robisepTypeMock = RobisepTypeDataSource.getRobisepTypeA();
          robisepService = new RobisepService(robisepRepoMock, robisepFactoryMock);
        });

        afterEach(() => {
          sinon.restore();
        });


        it('Failure - Unit Test - Non Alphanumeric Nickname', async () => {
          // Arrange
          const robisepTypeDTO: IRobisepDTO = {
            domainId: 'domainId',
            nickname: 'nickname@',
            serialNumber: 'serialNumber',
            code: 'code',
            description: 'description',
            robisepTypeId: '1',
            roomId: '1',
          }

          // Mocks
          roomRepoMock.findByDomainId.resolves(roomMock);
          robisepRepoMock.findByDomainId.resolves(null);
          robisepRepoMock.findByCode.resolves(null);
          robisepRepoMock.findARobisepTypeWithSameSerialNumber.resolves(null);

          // Act
          const result = await robisepService.createRobisep(robisepTypeDTO);

          // Assert
          expect(result.isFailure).to.be.true;
        });


        it('Failure - Unit Test - Nickname to long', async () => {
          // Arrange
          const robisepTypeDTO: IRobisepDTO = {
            domainId: 'domainId',
            nickname: 'nickname'.repeat(100),
            serialNumber: 'serialNumber',
            code: 'code',
            description: 'description',
            robisepTypeId: '1',
            roomId: '1',
          }

          // Mocks
          roomRepoMock.findByDomainId.resolves(roomMock);
          robisepRepoMock.findByDomainId.resolves(null);
          robisepRepoMock.findByCode.resolves(null);
          robisepRepoMock.findARobisepTypeWithSameSerialNumber.resolves(null);

          // Act
          const result = await robisepService.createRobisep(robisepTypeDTO);

          // Assert
          expect(result.isFailure).to.be.true;
        });


        it('Failure - Unit Test - Non Alphanumeric Serial Number', async () => {
          // Arrange
          const robisepTypeDTO: IRobisepDTO = {
            domainId: 'domainId',
            nickname: 'nickname',
            serialNumber: 'serialNumber@',
            code: 'code',
            description: 'description',
            robisepTypeId: '1',
            roomId: '1',
          }

          // Mocks
          roomRepoMock.findByDomainId.resolves(roomMock);
          robisepRepoMock.findByDomainId.resolves(null);
          robisepRepoMock.findByCode.resolves(null);
          robisepRepoMock.findARobisepTypeWithSameSerialNumber.resolves(null);

          // Act
          const result = await robisepService.createRobisep(robisepTypeDTO);

          // Assert
          expect(result.isFailure).to.be.true;
        });


        it('Failure - Unit Test - Serial Number to long', async () => {
          // Arrange
          const robisepTypeDTO: IRobisepDTO = {
            domainId: 'domainId',
            nickname: 'nickname',
            serialNumber: 'serialNumber'.repeat(100),
            code: 'code',
            description: 'description',
            robisepTypeId: '1',
            roomId: '1',
          }

          // Mocks
          roomRepoMock.findByDomainId.resolves(roomMock);
          robisepRepoMock.findByDomainId.resolves(null);
          robisepRepoMock.findByCode.resolves(null);
          robisepRepoMock.findARobisepTypeWithSameSerialNumber.resolves(null);

          // Act
          const result = await robisepService.createRobisep(robisepTypeDTO);

          // Assert
          expect(result.isFailure).to.be.true;
        });


        it('Failure - Unit Test - Non Alphanumeric Code', async () => {
          // Arrange
          const robisepTypeDTO: IRobisepDTO = {
            domainId: 'domainId',
            nickname: 'nickname',
            serialNumber: 'serialNumber',
            code: 'code@',
            description: 'description',
            robisepTypeId: '1',
            roomId: '1',
          }

          // Mocks
          roomRepoMock.findByDomainId.resolves(roomMock);
          robisepRepoMock.findByDomainId.resolves(null);
          robisepRepoMock.findByCode.resolves(null);
          robisepRepoMock.findARobisepTypeWithSameSerialNumber.resolves(null);

          // Act
          const result = await robisepService.createRobisep(robisepTypeDTO);

          // Assert
          expect(result.isFailure).to.be.true;
        });


        it('Failure - Unit Test - Code to long', async () => {
          // Arrange
          const robisepTypeDTO: IRobisepDTO = {
            domainId: 'domainId',
            nickname: 'nickname',
            serialNumber: 'serialNumber',
            code: 'code'.repeat(100),
            description: 'description',
            robisepTypeId: '1',
            roomId: '1',
          }

          // Mocks
          roomRepoMock.findByDomainId.resolves(roomMock);
          robisepRepoMock.findByDomainId.resolves(null);
          robisepRepoMock.findByCode.resolves(null);
          robisepRepoMock.findARobisepTypeWithSameSerialNumber.resolves(null);

          // Act
          const result = await robisepService.createRobisep(robisepTypeDTO);

          // Assert
          expect(result.isFailure).to.be.true;
        });


        it('Failure - Unit Test - Description to long', async () => {
          // Arrange
          const robisepTypeDTO: IRobisepDTO = {
            domainId: 'domainId',
            nickname: 'nickname',
            serialNumber: 'serialNumber',
            code: 'code',
            description: 'description'.repeat(100),
            robisepTypeId: '1',
            roomId: '1',
          }

          // Mocks
          roomRepoMock.findByDomainId.resolves(roomMock);
          robisepRepoMock.findByDomainId.resolves(null);
          robisepRepoMock.findByCode.resolves(null);
          robisepRepoMock.findARobisepTypeWithSameSerialNumber.resolves(null);

          // Act
          const result = await robisepService.createRobisep(robisepTypeDTO);

          // Assert
          expect(result.isFailure).to.be.true;
        });
      });
    });
  });

  describe('listRobiseps', () => {

    describe('Unit Test', () => {
      beforeEach(() => {
        robisepRepoMock = {
          findAll: sinon.stub(),
          findByNickname: sinon.stub(),
          findByTaskType: sinon.stub(),
        };
        robisepMock = RobisepDataSource.getRobisepA();
        robisepTypeMock = RobisepTypeDataSource.getRobisepTypeA();
        robisepService = new RobisepService(robisepRepoMock, robisepFactoryMock);
      });

      afterEach(() => {
        sinon.restore();
      });

      it('Success - Unit Test - List All', async () => {
        // Arrange
        robisepRepoMock.findAll.resolves([robisepMock]);

        // Act
        const result = await robisepService.listRobiseps();

        // Assert
        expect(result).to.be.an('array');
      });


      describe('listRobisepsByNicknameOrTaskType', () => {

        it('Success - Unit Test - List By Nickname', async () => {
          // Arrange
          robisepRepoMock.findByNickname.resolves([robisepMock]);

          // Act
          const result = await robisepService.listRobisepsByNicknameOrTaskType('nickname', null);

          // Assert
          expect(result.isFailure).to.be.false;
        });


        it('Success - Unit Test - List By TaskType', async () => {
          // Arrange
          robisepRepoMock.findByTaskType.resolves([robisepMock]);

          // Act
          const result = await robisepService.listRobisepsByNicknameOrTaskType(null, ['TRANSPORT']);

          // Assert
          expect(result.isFailure).to.be.false;
        });


        it('Failure - Unit Test - Two values passed', async () => {
          // Arrange
          robisepRepoMock.findByTaskType.resolves([robisepMock]);

          // Act
          const result = await robisepService.listRobisepsByNicknameOrTaskType('nickname', ['TRANSPORT']);

          // Assert
          expect(result.isFailure).to.be.true;
        });


        it('Failure - Unit Test - none values passed', async () => {
          // Arrange
          robisepRepoMock.findByTaskType.resolves([robisepMock]);

          // Act
          const result = await robisepService.listRobisepsByNicknameOrTaskType(null, null);

          // Assert
          expect(result.isFailure).to.be.true;
        });
      });
    });
  });


  describe('disableRobisep', () => {

    describe('Unit Test', () => {
      beforeEach(() => {
        robisepRepoMock = {
          findByDomainId: sinon.stub(),
          save: sinon.stub(),
        };
        robisepMock = RobisepDataSource.getRobisepA();
        robisepTypeMock = RobisepTypeDataSource.getRobisepTypeA();
        robisepService = new RobisepService(robisepRepoMock, robisepFactoryMock);
      });

      afterEach(() => {
        sinon.restore();
      });

      it('Success - Disable Robisep', async () => {
        // Arrange
        robisepRepoMock.findByDomainId.resolves(robisepMock);
        robisepRepoMock.save.resolves(robisepMock);

        // Act
        const result = await robisepService.disableRobisep('domainId', {state: 'INACTIVE'});

        // Assert
        expect(result.isSuccess).to.be.true;
      });

      it('Failure - Robisep not found', async () => {
        // Arrange
        robisepRepoMock.findByDomainId.resolves(null);

        // Act
        const result = await robisepService.disableRobisep('domainId', {state: 'INACTIVE'});

        // Assert
        expect(result.isSuccess).to.be.false;
      });

      it('Failure - State is already inactive', async () => {
        // Arrange
        robisepRepoMock.findByDomainId.resolves(robisepMock);
        robisepRepoMock.save.resolves(robisepMock);

        // Act
        robisepMock.disable();
        const result = await robisepService.disableRobisep('domainId', {state: 'INACTIVE'});

        // Assert
        expect(result.isSuccess).to.be.false;
      });
    });
  });
});