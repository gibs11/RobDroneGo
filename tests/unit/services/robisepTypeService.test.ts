import sinon from 'sinon';
import {expect, use} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {RobisepType} from "../../../src/domain/robisepType/RobisepType";
import RobisepTypeDataSource from "../../datasource/robisepTypeDataSource";
import RobisepTypeService from "../../../src/services/ServicesImpl/robisepTypeService";
import IRobisepTypeDTO from "../../../src/dto/IRobisepTypeDTO";

use(chaiAsPromised);

describe('RobisepTypeService', () => {

  let robisepTypeRepoMock;
  let robisepTypeRepoMockService;
  let robisepTypeMock: RobisepType;


  describe('createRobisepType', () => {

    describe('Unit Test', () => {
      beforeEach(() => {
        robisepTypeRepoMock = {
          findByDomainId: sinon.stub(),
          findByDesignation: sinon.stub(),
          save: sinon.stub(),
        };
        robisepTypeMock = RobisepTypeDataSource.getRobisepTypeA();
        robisepTypeRepoMockService = new RobisepTypeService(robisepTypeRepoMock);
      });

      afterEach(() => {
        sinon.restore();
      });

      it('Success - Unit Test', async () => {
        // Arrange
        const robisepTypeDTO: IRobisepTypeDTO = {
          domainId: 'domainId',
          designation: 'designation',
          brand: 'brand',
          model: 'model',
          tasksType: ['TRANSPORT']
        }

        // Mocks
        robisepTypeRepoMock.findByDesignation.resolves(null);
        robisepTypeRepoMock.save.resolves(robisepTypeMock);

        // Act
        const result = await robisepTypeRepoMockService.createRobisepType(robisepTypeDTO);


        // Assert
        expect(result.isFailure).to.be.false;
      });


      it('Failure - Unit Test - Room Name already exists', async () => {
        // Arrange
        const robisepTypeDTO: IRobisepTypeDTO = {
          domainId: 'domainId',
          designation: 'designation',
          brand: 'brand',
          model: 'model',
          tasksType: ['TRANSPORT']
        }

        // Mocks
        robisepTypeRepoMock.findByDesignation.resolves(robisepTypeMock);

        // Act
        const result = await robisepTypeRepoMockService.createRobisepType(robisepTypeDTO);

        // Assert
        expect(result.isFailure).to.be.true;
      });


      it('Failure - Unit Test - Non Alphanumeric Designation', async () => {
        // Arrange
        const robisepTypeDTO: IRobisepTypeDTO = {
          domainId: 'domainId',
          designation: 'designation___',
          brand: 'brand',
          model: 'model',
          tasksType: ['TRANSPORT']
        }

        // Mocks
        robisepTypeRepoMock.findByDesignation.resolves(null);
        robisepTypeRepoMock.save.resolves(robisepTypeMock);

        // Act
        const result = await robisepTypeRepoMockService.createRobisepType(robisepTypeDTO);

        // Assert
        expect(result.isFailure).to.be.true;
      });


      it('Failure - Unit Test - Designation to long', async () => {
        // Arrange
        const robisepTypeDTO: IRobisepTypeDTO = {
          domainId: 'domainId',
          designation: 'designation'.repeat(10),
          brand: 'brand',
          model: 'model',
          tasksType: ['TRANSPORT']
        }

        // Mocks
        robisepTypeRepoMock.findByDesignation.resolves(null);
        robisepTypeRepoMock.save.resolves(robisepTypeMock);

        // Act
        const result = await robisepTypeRepoMockService.createRobisepType(robisepTypeDTO);

        // Assert
        expect(result.isFailure).to.be.true;
      });


      it('Failure - Unit Test - Brand to long', async () => {
        // Arrange
        const robisepTypeDTO: IRobisepTypeDTO = {
          domainId: 'domainId',
          designation: 'designation',
          brand: 'brand'.repeat(30),
          model: 'model',
          tasksType: ['TRANSPORT']
        }

        // Mocks
        robisepTypeRepoMock.findByDesignation.resolves(null);
        robisepTypeRepoMock.save.resolves(robisepTypeMock);

        // Act
        const result = await robisepTypeRepoMockService.createRobisepType(robisepTypeDTO);

        // Assert
        expect(result.isFailure).to.be.true;
      });


      it('Failure - Unit Test - Model to long', async () => {
        // Arrange
        const robisepTypeDTO: IRobisepTypeDTO = {
          domainId: 'domainId',
          designation: 'designation',
          brand: 'brand',
          model: 'model'.repeat(50),
          tasksType: ['TRANSPORT']
        }

        // Mocks
        robisepTypeRepoMock.findByDesignation.resolves(null);
        robisepTypeRepoMock.save.resolves(robisepTypeMock);

        // Act
        const result = await robisepTypeRepoMockService.createRobisepType(robisepTypeDTO);

        // Assert
        expect(result.isFailure).to.be.true;
      });


      it('Failure - Unit Test - Non existing task type', async () => {
        // Arrange
        const robisepTypeDTO: IRobisepTypeDTO = {
          domainId: 'domainId',
          designation: 'designation',
          brand: 'brand',
          model: 'model',
          tasksType: ['INVALID']
        }

        // Mocks
        robisepTypeRepoMock.findByDesignation.resolves(null);
        robisepTypeRepoMock.save.resolves(robisepTypeMock);

        // Act
        const result = await robisepTypeRepoMockService.createRobisepType(robisepTypeDTO);

        // Assert
        expect(result.isFailure).to.be.true;
      });
    });
  });

  describe('listRooms', () => {

    describe('Unit Test', () => {
      beforeEach(() => {
        robisepTypeRepoMock = {
          findAll: sinon.stub(),
        };
        robisepTypeMock = RobisepTypeDataSource.getRobisepTypeA();
        robisepTypeRepoMockService = new RobisepTypeService(robisepTypeRepoMock);
      });

      afterEach(() => {
        sinon.restore();
      });

      it('Success - Unit Test - List All', async () => {
        // Arrange
        robisepTypeRepoMock.findAll.resolves([robisepTypeMock]);

        // Act
        const result = await robisepTypeRepoMockService.listRobisepTypes();

        // Assert
        expect(result).to.be.an('array');
      });
    });
  });
});