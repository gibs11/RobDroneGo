import {RobisepType} from "../../src/domain/robisepType/RobisepType";
import IRobisepTypeDTO from "../../src/dto/IRobisepTypeDTO";
import {UniqueEntityID} from "../../src/core/domain/UniqueEntityID";
import {RobisepTypeDesignation} from "../../src/domain/robisepType/RobisepTypeDesignation";
import {RobisepTypeBrand} from "../../src/domain/robisepType/RobisepTypeBrand";
import {RobisepTypeModel} from "../../src/domain/robisepType/RobisepTypeModel";
import {TaskType} from "../../src/domain/common/TaskType";

class RobisepTypeDataSource {

    static getRobisepTypeAdto(): IRobisepTypeDTO {
        return {
            domainId: '1',
            designation: 'RobisepType A',
            brand: 'Description A',
            model: 'A',
            tasksType: [TaskType.TRANSPORT],
        };
    }
    static getRobisepTypeBdto(): IRobisepTypeDTO {
        return {
            domainId: '2',
            designation: 'RobisepType B',
            brand: 'Description B',
            model: 'B',
            tasksType: [TaskType.SURVEILLANCE],
        };
    }
    static getRobisepTypeCdto(): IRobisepTypeDTO {
        return {
            domainId: '3',
            designation: 'RobisepType C',
            brand: 'Description C',
            model: 'C',
            tasksType: [TaskType.SURVEILLANCE, TaskType.TRANSPORT],
        };
    }

    static getRobisepTypeA(): RobisepType {
        return RobisepType.create({
            designation: RobisepTypeDesignation.create('RobisepType A').getValue(),
            brand: RobisepTypeBrand.create('Description A').getValue(),
            model: RobisepTypeModel.create('A').getValue(),
            tasksType: [TaskType.TRANSPORT],
        }, new UniqueEntityID('1'))
            .getValue();
    }

    static getRobisepTypeB(): RobisepType {
        return RobisepType.create({
            designation: RobisepTypeDesignation.create('RobisepType B').getValue(),
            brand: RobisepTypeBrand.create('Description B').getValue(),
            model: RobisepTypeModel.create('B').getValue(),
            tasksType: [TaskType.SURVEILLANCE],
        }, new UniqueEntityID('2'))
            .getValue();
    }

    static getRobisepTypeC(): RobisepType {
        return RobisepType.create({
            designation: RobisepTypeDesignation.create('RobisepType C').getValue(),
            brand: RobisepTypeBrand.create('Description C').getValue(),
            model: RobisepTypeModel.create('C').getValue(),
            tasksType: [TaskType.SURVEILLANCE, TaskType.TRANSPORT],
        }, new UniqueEntityID('3'))
            .getValue();
    }
}

export default RobisepTypeDataSource;
