import {expect} from 'chai';
import * as sinon from 'sinon';
import {UniqueEntityID} from '../../../src/core/domain/UniqueEntityID';
import {RobisepTypeDesignation} from "../../../src/domain/robisepType/RobisepTypeDesignation";
import {RobisepTypeBrand} from "../../../src/domain/robisepType/RobisepTypeBrand";
import {RobisepTypeModel} from "../../../src/domain/robisepType/RobisepTypeModel";
import {TaskType} from "../../../src/domain/common/TaskType";
import {RobisepType} from "../../../src/domain/robisepType/RobisepType";
import {RobisepTypeMap} from "../../../src/mappers/RobisepTypeMap";

describe('RobisepTypeMap', () => {
    describe('toDTO', () => {
        it('should convert a RobisepType entity to a DTO', () => {
            // Arrange
            const robisepTypeId = new UniqueEntityID();
            const designation = RobisepTypeDesignation.create('Sample RobisepType 1').getValue();
            const brand = RobisepTypeBrand.create('Sample RobisepType Brand').getValue();
            const model = RobisepTypeModel.create('Sample RobisepType Model').getValue();
            const tasksType = [TaskType.TRANSPORT, TaskType.SURVEILLANCE];
            const building = RobisepType.create({designation, brand, model, tasksType}, robisepTypeId).getValue();
            // Act
            const dto = RobisepTypeMap.toDTO(building);

            // Assert
            expect(dto.domainId).to.equal(robisepTypeId.toString());
            expect(dto.designation).to.equal(designation.value);
            expect(dto.brand).to.equal(brand.value);
            expect(dto.model).to.equal(model.value);
        });
    });

    describe('toDomain', () => {
        it('should convert a valid raw object to a RobisepType entity', async () => {
            // Arrange
            const rawRobisepType = {
                domainId: '123',
                designation: "Sample RobisepType 1",
                brand: "Sample RobisepType Brand",
                model: "Sample RobisepType Model",
                tasksType: ["TRANSPORT"]
            };

            // Act
            const robisepType = await RobisepTypeMap.toDomain(rawRobisepType);

            // Assert
            sinon.assert.match(robisepType.id.toString(), rawRobisepType.domainId);
            sinon.assert.match(robisepType.designation.value, rawRobisepType.designation);
            sinon.assert.match(robisepType.brand.value, rawRobisepType.brand);
            sinon.assert.match(robisepType.model.value, rawRobisepType.model);
            sinon.assert.match(robisepType.tasksType, rawRobisepType.tasksType);
            sinon.assert.match(robisepType instanceof RobisepType, true);
        });

        it('should convert a valid raw object to a Building entity, with no name passed', async () => {
            // Arrange
            const rawRobisepType = {
                domainId: '123',
                designation: "Sample Designation 1",
                brand: "Sample RobisepType Brand",
                model: "Sample RobisepType Model",
                tasksType: ["TRANSPORT"]
            };

            // Act
            const robisepType = await RobisepTypeMap.toDomain(rawRobisepType);

            // Assert
            sinon.assert.match(robisepType.id.toString(), rawRobisepType.domainId);
            sinon.assert.match(robisepType.designation.value, rawRobisepType.designation);
            sinon.assert.match(robisepType.brand.value, rawRobisepType.brand);
            sinon.assert.match(robisepType.model.value, rawRobisepType.model);
            sinon.assert.match(robisepType.tasksType, rawRobisepType.tasksType);
            sinon.assert.match(robisepType instanceof RobisepType, true);
        });

        it('should return null for raw object with invalid designation', async () => {
            // Arrange
            const rawRobisepType = {
                domainId: '123',
                designation: '@@-@@', // Invalid designation
                brand: "Sample RobisepType Brand",
                model: "Sample RobisepType Model",
                tasksType: ["TRANSPORT"]
            };

            // Act & Assert
            try {
                await RobisepTypeMap.toDomain(rawRobisepType);
            } catch (TypeError) {
                sinon.assert.match(TypeError.message, 'Designation must be alphanumeric.');
            }
        });
    });

    it('should return null for raw object with invalid brand', async () => {
        // Arrange
        const rawRobisepType = {
            domainId: '123',
            designation: "Sample Designation 1",
            brand: 'Super huge brand name to fail because it is too long to fit on the brand field', // Invalid brand
            model: "Sample RobisepType Model",
            tasksType: ["TRANSPORT"]
        };

        // Act & Assert
        try {
            await RobisepTypeMap.toDomain(rawRobisepType);
            sinon.assert.fail('The method should have thrown an error');
        } catch (TypeError) {
            sinon.assert.match(TypeError.message, 'RobisepTypeBrand is not within range 1 to 50.');
        }
    });

    it('should return null for raw object with invalid model', async () => {
        // Arrange
        const rawRobisepType = {
            domainId: '123',
            designation: "Sample Designation 1",
            brand: "Sample RobisepType Brand",
            model: 'Super huge model name to fail because it is too long to fit on the model field' +
                'The message above will not do it, so I have to write more to break the 100 caracthers', // Invalid model
            tasksType: ["TRANSPORT"]
        };

        // Act & Assert
        try {
            await RobisepTypeMap.toDomain(rawRobisepType);
            sinon.assert.fail('The method should have thrown an error');
        } catch (TypeError) {
            sinon.assert.match(TypeError.message, 'RobisepTypeModel is not within range 1 to 100.');
        }
    });


    it('should return null for raw object with empty tasksType', async () => {
        // Arrange
        const rawRobisepType = {
            domainId: '123',
            designation: "Sample Designation 1",
            brand: "Sample RobisepType Brand",
            model: "Sample RobisepType Model",
            tasksType: []
        };

        // Act & Assert
        try {
            await RobisepTypeMap.toDomain(rawRobisepType);
            sinon.assert.fail('The method should have thrown an error');
        } catch (TypeError) {
            sinon.assert.match(TypeError.message, 'At least one Task Type must be provided.');
        }
    });


    it('should return null for raw object with invalid tasksType', async () => {
        // Arrange
        const rawRobisepType = {
            domainId: '123',
            designation: "Sample Designation 1",
            brand: "Sample RobisepType Brand",
            model: "Sample RobisepType Model",
            tasksType: ["invalid"]
        };

        // Act & Assert
        try {
            await RobisepTypeMap.toDomain(rawRobisepType);
            sinon.assert.fail('The method should have thrown an error');
        } catch (TypeError) {
            sinon.assert.match(TypeError.message, 'Invalid tasksType provided - ' + rawRobisepType.tasksType.toString().toUpperCase() +
                ". Valid values are: " + Object.values(TaskType));
        }
    });


    describe('toPersistence', () => {
        it('should convert a RobisepType entity to a raw object', () => {
            // Arrange
            const buildingId = new UniqueEntityID();
            const designation = RobisepTypeDesignation.create('Sample RobisepType 1').getValue();
            const brand = RobisepTypeBrand.create('Sample RobisepType Brand').getValue();
            const model = RobisepTypeModel.create('Sample RobisepType Model').getValue();
            const tasksType = [TaskType.TRANSPORT];
            const robisepType = RobisepType.create({
                designation,
                brand,
                model,
                tasksType
            }, buildingId).getValue();

            // Act
            const raw = RobisepTypeMap.toPersistence(robisepType);

            // Assert
            expect(raw.domainId).to.equal(buildingId.toString());
            expect(raw.designation).to.equal(designation.value);
            expect(raw.brand).to.equal(brand.value);
            expect(raw.model).to.equal(model.value);
            expect(raw.tasksType).to.equal(tasksType);
        });
    });
});

