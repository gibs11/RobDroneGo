import * as sinon from 'sinon';
import {UniqueEntityID} from '../../../../src/core/domain/UniqueEntityID';
import {RobisepType} from "../../../../src/domain/robisepType/RobisepType";
import {RobisepTypeDesignation} from "../../../../src/domain/robisepType/RobisepTypeDesignation";
import {RobisepTypeBrand} from "../../../../src/domain/robisepType/RobisepTypeBrand";
import {RobisepTypeModel} from "../../../../src/domain/robisepType/RobisepTypeModel";
import {TaskType} from "../../../../src/domain/common/TaskType";


describe('RobisepType', () => {
    it('should create a valid Robisep object, passing a Robisep id, designation, brand, model and task types', () => {

        // Arrange
        const designation = RobisepTypeDesignation.create('Sample designation');
        const brand = RobisepTypeBrand.create('Sample brand');
        const model = RobisepTypeModel.create('Sample model');
        const tasks: TaskType[] = [TaskType.TRANSPORT, TaskType.SURVEILLANCE];

        const validRobisepProps = {
            designation: designation.getValue(),
            brand: brand.getValue(),
            model: model.getValue(),
            tasksType: tasks
        }
        const robisepId = new UniqueEntityID();

        // Act
        const robisepResult = RobisepType.create(validRobisepProps, robisepId);

        // Assert
        sinon.assert.match(robisepResult.isSuccess, true);

        const robisep = robisepResult.getValue();
        sinon.assert.match(robisep.id.equals(robisepId), true);
        sinon.assert.match(robisep.designation.equals(designation.getValue()), true);
        sinon.assert.match(robisep.brand.equals(brand.getValue()), true);
        sinon.assert.match(robisep.model.equals(model.getValue()), true);
        sinon.assert.match(robisep.tasksType, tasks);
    });


    it('should create a valid Robisep object, without passing a Robisep id', () => {

        // Arrange
        const designation = RobisepTypeDesignation.create('Sample designation');
        const brand = RobisepTypeBrand.create('Sample brand');
        const model = RobisepTypeModel.create('Sample model');
        const tasks: TaskType[] = [TaskType.TRANSPORT, TaskType.SURVEILLANCE];

        const validRobisepProps = {
            designation: designation.getValue(),
            brand: brand.getValue(),
            model: model.getValue(),
            tasksType: tasks
        }

        // Act
        const robisepResult = RobisepType.create(validRobisepProps);

        // Assert
        sinon.assert.match(robisepResult.isSuccess, true);
    });


    it('should not create a valid Robisep object - null designation', () => {

        // Arrange
        const brand = RobisepTypeBrand.create('Sample brand');
        const model = RobisepTypeModel.create('Sample model');
        const tasks: TaskType[] = [TaskType.TRANSPORT, TaskType.SURVEILLANCE];

        const validRobisepProps = {
            designation: null,
            brand: brand.getValue(),
            model: model.getValue(),
            tasksType: tasks
        }
        const robisepId = new UniqueEntityID();

        // Act
        const robisepResult = RobisepType.create(validRobisepProps, robisepId);

        // Assert
        sinon.assert.match(robisepResult.isFailure, true);
    });


    it('should not create a valid Robisep object - null brand', () => {

        // Arrange
        const designation = RobisepTypeDesignation.create('Sample designation');
        const model = RobisepTypeModel.create('Sample model');
        const tasks: TaskType[] = [TaskType.TRANSPORT, TaskType.SURVEILLANCE];

        const validRobisepProps = {
            designation: designation.getValue(),
            brand: null,
            model: model.getValue(),
            tasksType: tasks
        }
        const robisepId = new UniqueEntityID();

        // Act
        const robisepResult = RobisepType.create(validRobisepProps, robisepId);

        // Assert
        sinon.assert.match(robisepResult.isFailure, true);
    });


    it('should not create a valid Robisep object - null model', () => {

        // Arrange
        const designation = RobisepTypeDesignation.create('Sample designation');
        const brand = RobisepTypeBrand.create('Sample brand');
        const tasks: TaskType[] = [TaskType.TRANSPORT, TaskType.SURVEILLANCE];

        const validRobisepProps = {
            designation: designation.getValue(),
            brand: brand.getValue(),
            model: null,
            tasksType: tasks
        }
        const robisepId = new UniqueEntityID();

        // Act
        const robisepResult = RobisepType.create(validRobisepProps, robisepId);

        // Assert
        sinon.assert.match(robisepResult.isFailure, true);
    });


    it('should not create a valid Robisep object - null tasks', () => {

        // Arrange
        const designation = RobisepTypeDesignation.create('Sample designation');
        const brand = RobisepTypeBrand.create('Sample brand');
        const model = RobisepTypeModel.create('Sample model');

        const validRobisepProps = {
            designation: designation.getValue(),
            brand: brand.getValue(),
            model: model.getValue(),
            tasksType: null
        }
        const robisepId = new UniqueEntityID();

        // Act
        const robisepResult = RobisepType.create(validRobisepProps, robisepId);

        // Assert
        sinon.assert.match(robisepResult.isFailure, true);
    });


    it('should not create a valid Robisep object - repeated tasks', () => {

        // Arrange
        const designation = RobisepTypeDesignation.create('Sample designation');
        const brand = RobisepTypeBrand.create('Sample brand');
        const model = RobisepTypeModel.create('Sample model');
        const tasks: TaskType[] = [TaskType.TRANSPORT, TaskType.SURVEILLANCE, TaskType.TRANSPORT];

        const validRobisepProps = {
            designation: designation.getValue(),
            brand: brand.getValue(),
            model: model.getValue(),
            tasksType: tasks
        }
        const robisepId = new UniqueEntityID();

        // Act
        const robisepResult = RobisepType.create(validRobisepProps, robisepId);

        // Assert
        sinon.assert.match(robisepResult.isFailure, true);
    });


    it('should not create a valid Robisep object - empty tasks', () => {

        // Arrange
        const designation = RobisepTypeDesignation.create('Sample designation');
        const brand = RobisepTypeBrand.create('Sample brand');
        const model = RobisepTypeModel.create('Sample model');
        const tasks: TaskType[] = [];

        const validRobisepProps = {
            designation: designation.getValue(),
            brand: brand.getValue(),
            model: model.getValue(),
            tasksType: tasks
        }
        const robisepId = new UniqueEntityID();

        // Act
        const robisepResult = RobisepType.create(validRobisepProps, robisepId);

        // Assert
        sinon.assert.match(robisepResult.isFailure, true);
    });
});
