import { expect } from 'chai';
import * as sinon from 'sinon';
import { BuildingMap } from '../../../src/mappers/BuildingMap';
import { Building } from '../../../src/domain/building/building';
import { BuildingName } from '../../../src/domain/building/buildingName';
import { BuildingDimensions } from '../../../src/domain/building/buildingDimensions';
import { BuildingDescription } from '../../../src/domain/building/buildingDescription';
import { BuildingCode } from '../../../src/domain/building/buildingCode';
import { UniqueEntityID } from '../../../src/core/domain/UniqueEntityID';

describe('BuildingMap', () => {
  describe('toDTO', () => {
    it('should convert a Building entity to a DTO', () => {
      // Arrange
      const buildingId = new UniqueEntityID();
      const buildingName = BuildingName.create('Sample Building Name').getValue();
      const buildingDimensions = BuildingDimensions.create({ width: 5, length: 10 }).getValue();
      const buildingDescription = BuildingDescription.create('Sample Building Description').getValue();
      const buildingCode = BuildingCode.create('TEST').getValue();
      const building = Building.create({ buildingName, buildingDimensions, buildingDescription, buildingCode }, buildingId).getValue();

      // Act
      const dto = BuildingMap.toDTO(building);

      // Assert
      expect(dto.domainId).to.equal(buildingId.toString());
      expect(dto.buildingName).to.equal(buildingName.value);
      expect(dto.buildingDimensions.width).to.equal(buildingDimensions.width);
      expect(dto.buildingDimensions.length).to.equal(buildingDimensions.length);
      expect(dto.buildingDescription).to.equal(buildingDescription.value);
      expect(dto.buildingCode).to.equal(buildingCode.value);
    });

    it('should convert a Building entity to a DTO, with no name or id being passed', () => {
      // Arrange
      const buildingDimensions = BuildingDimensions.create({ width: 5, length: 10 }).getValue();
      const buildingDescription = BuildingDescription.create('Sample Building Description').getValue();
      const buildingCode = BuildingCode.create('TEST').getValue();

      const building = Building.create({ buildingDimensions, buildingDescription, buildingCode }).getValue();

      // Act
      const dto = BuildingMap.toDTO(building);

      // Assert
      expect(dto.buildingDescription).to.equal(buildingDescription.value);
      expect(dto.buildingCode).to.equal(buildingCode.value);
      expect(dto.buildingDimensions.width).to.equal(buildingDimensions.width);
      expect(dto.buildingDimensions.length).to.equal(buildingDimensions.length);
    });

    it('should convert a Building entity to a DTO, with no description being passed', () => {
      // Arrange
      const buildingId = new UniqueEntityID();
      const buildingName = BuildingName.create('Sample Building Name').getValue();
      const buildingDimensions = BuildingDimensions.create({ width: 5, length: 10 }).getValue();
      const buildingCode = BuildingCode.create('TEST').getValue();
      const building = Building.create({ buildingName, buildingDimensions, buildingCode }, buildingId).getValue();

      // Act
      const dto = BuildingMap.toDTO(building);

      // Assert
      expect(dto.domainId).to.equal(buildingId.toString());
      expect(dto.buildingName).to.equal(buildingName.value);
      expect(dto.buildingDimensions.width).to.equal(buildingDimensions.width);
      expect(dto.buildingDimensions.length).to.equal(buildingDimensions.length);
      expect(dto.buildingCode).to.equal(buildingCode.value);
    });
  });

  describe('toDomain', () => {
    it('should convert a valid raw object to a Building entity', async () => {
      // Arrange
      const rawBuilding = {
        domainId: '123',
        buildingName: 'Sample Building Name',
        buildingDimensions: { width: 5, length: 10 },
        buildingDescription: 'Sample Building Description',
        buildingCode: 'TEST',
      };

      // Act
      const building = await BuildingMap.toDomain(rawBuilding);

      // Assert
      sinon.assert.match(building.id.toString(), rawBuilding.domainId);
      sinon.assert.match(building.name.value, rawBuilding.buildingName);
      sinon.assert.match(building.dimensions.width, rawBuilding.buildingDimensions.width);
      sinon.assert.match(building.dimensions.length, rawBuilding.buildingDimensions.length);
      sinon.assert.match(building.description.value, rawBuilding.buildingDescription);
      sinon.assert.match(building.code.value, rawBuilding.buildingCode);
      sinon.assert.match(building instanceof Building, true);
    });

    it('should convert a valid raw object to a Building entity, with no name passed', async () => {
      // Arrange
      const rawBuilding = {
        domainId: '123',
        buildingDimensions: { width: 5, length: 10 },
        buildingDescription: 'Sample Building Description',
        buildingCode: 'TEST',
      };

      // Act
      const building = await BuildingMap.toDomain(rawBuilding);

      // Assert
      sinon.assert.match(building.id.toString(), rawBuilding.domainId);
      sinon.assert.match(building.dimensions.width, rawBuilding.buildingDimensions.width);
      sinon.assert.match(building.dimensions.length, rawBuilding.buildingDimensions.length);
      sinon.assert.match(building.description.value, rawBuilding.buildingDescription);
      sinon.assert.match(building.code.value, rawBuilding.buildingCode);
      sinon.assert.match(building instanceof Building, true);
    });

    it('should convert a valid raw object to a Building entity, with no description passed', async () => {
      // Arrange
      const rawBuilding = {
        domainId: '123',
        buildingName: 'Sample Building Name',
        buildingDimensions: { width: 5, length: 10 },
        buildingCode: 'TEST',
      };

      // Act
      const building = await BuildingMap.toDomain(rawBuilding);

      // Assert
      sinon.assert.match(building.id.toString(), rawBuilding.domainId);
      sinon.assert.match(building.name.value, rawBuilding.buildingName);
      sinon.assert.match(building.dimensions.width, rawBuilding.buildingDimensions.width);
      sinon.assert.match(building.dimensions.length, rawBuilding.buildingDimensions.length);
      sinon.assert.match(building.code.value, rawBuilding.buildingCode);
      sinon.assert.match(building instanceof Building, true);
    });

    it('should throw type error for raw object with invalid buildingDimensions', async () => {
      // Arrange
      const rawBuilding = {
        domainId: '123',
        buildingName: 'Sample Building Name',
        buildingDimensions: { width: 0, length: -5 }, // Invalid dimensions
        buildingDescription: 'Sample Building Description',
        buildingCode: 'TEST',
      };

      // Act & Assert
      await BuildingMap.toDomain(rawBuilding).catch((e) => {
        sinon.assert.match(e instanceof TypeError, true);
      });
    });

    it('should throw type error for raw object with invalid buildingCode', async () => {
      // Arrange
      const rawBuilding = {
        domainId: '123',
        buildingName: 'Sample Building Name',
        buildingDimensions: { width: 5, length: 10 },
        buildingDescription: 'Sample Building Description',
        buildingCode: 'INVALID', // Invalid building code
      };

      // Act & Assert
      await BuildingMap.toDomain(rawBuilding).catch((e) => {
        sinon.assert.match(e instanceof TypeError, true);
      });
    });

    it('should throw type error for raw object with invalid buildingDescription', async () => {
      // Arrange
      const rawBuilding = {
        domainId: '123',
        buildingName: 'Sample Building Name',
        buildingDimensions: { width: 5, length: 10 },
        buildingDescription: '@@-@@', // Invalid building description
        buildingCode: 'TEST',
      };

      // Act & Assert
      await BuildingMap.toDomain(rawBuilding).catch((e) => {
        sinon.assert.match(e instanceof TypeError, true);
      });
    });

    it('should throw type error for raw object with invalid buildingName', async () => {
      // Arrange
      const rawBuilding = {
        domainId: '123',
        buildingName: '@@@@Name---', // Invalid building name
        buildingDimensions: { width: 5, length: 10 },
        buildingDescription: 'Sample Building Description',
        buildingCode: 'TEST',
      };

      // Act & Assert
      await BuildingMap.toDomain(rawBuilding).catch((e) => {
        sinon.assert.match(e instanceof TypeError, true);
      });
    });
  });

  describe('toPersistence', () => {
    it('should convert a Building entity to a raw object', () => {
      // Arrange
      const buildingId = new UniqueEntityID();
      const buildingName = BuildingName.create('Sample Building Name').getValue();
      const buildingDimensions = BuildingDimensions.create({ width: 5, length: 10 }).getValue();
      const buildingDescription = BuildingDescription.create('Sample Building Description').getValue();
      const buildingCode = BuildingCode.create('TEST').getValue();
      const building = Building.create({ buildingName, buildingDimensions, buildingDescription, buildingCode }, buildingId).getValue();

      // Act
      const raw = BuildingMap.toPersistence(building);

      // Assert
      expect(raw.domainId).to.equal(buildingId.toString());
      expect(raw.buildingName).to.equal(buildingName.value);
      expect(raw.buildingDimensions.width).to.equal(buildingDimensions.width);
      expect(raw.buildingDimensions.length).to.equal(buildingDimensions.length);
      expect(raw.buildingDescription).to.equal(buildingDescription.value);
      expect(raw.buildingCode).to.equal(buildingCode.value);
    });

    it('should convert a Building entity to a raw object, with no name being passed', () => {
      // Arrange
      const buildingDimensions = BuildingDimensions.create({ width: 5, length: 10 }).getValue();
      const buildingDescription = BuildingDescription.create('Sample Building Description').getValue();
      const buildingCode = BuildingCode.create('TEST').getValue();
      const building = Building.create({ buildingDimensions, buildingDescription, buildingCode }).getValue();

      // Act
      const raw = BuildingMap.toPersistence(building);

      // Assert
      expect(raw.buildingDescription).to.equal(buildingDescription.value);
      expect(raw.buildingCode).to.equal(buildingCode.value);
      expect(raw.buildingDimensions.width).to.equal(buildingDimensions.width);
      expect(raw.buildingDimensions.length).to.equal(buildingDimensions.length);
    });

    it('should convert a Building entity to a raw object, with no description being passed', () => {
      // Arrange
      const buildingName = BuildingName.create('Sample Building Name').getValue();
      const buildingDimensions = BuildingDimensions.create({ width: 5, length: 10 }).getValue();
      const buildingCode = BuildingCode.create('TEST').getValue();
      const building = Building.create({ buildingName, buildingDimensions, buildingCode }).getValue();

      // Act
      const raw = BuildingMap.toPersistence(building);

      // Assert
      expect(raw.buildingName).to.equal(buildingName.value);
      expect(raw.buildingCode).to.equal(buildingCode.value);
      expect(raw.buildingDimensions.width).to.equal(buildingDimensions.width);
      expect(raw.buildingDimensions.length).to.equal(buildingDimensions.length);
    });
  });
});
