import { Mapper } from '../core/infra/Mapper';
import { RobisepType } from '../domain/robisepType/RobisepType';
import { UniqueEntityID } from '../core/domain/UniqueEntityID';
import IRobisepTypeDTO from '../dto/IRobisepTypeDTO';
import IRobisepTypeOutDTO from '../dto/out/IRobisepTypeOutDTO';
import { RobisepTypeDesignation } from '../domain/robisepType/RobisepTypeDesignation';
import { RobisepTypeBrand } from '../domain/robisepType/RobisepTypeBrand';
import { RobisepTypeModel } from '../domain/robisepType/RobisepTypeModel';
import { TaskType } from '../domain/common/TaskType';

export class RobisepTypeMap extends Mapper<RobisepType> {
  public static toDTO(robisepType: RobisepType): IRobisepTypeOutDTO {
    return {
      domainId: robisepType.id.toString(),
      designation: robisepType.designation.value,
      brand: robisepType.brand.value,
      model: robisepType.model.value,
      tasksType: robisepType.tasksType.map(task => task.toString()),
    } as IRobisepTypeDTO;
  }

  public static async toDomain(robisepType: any): Promise<RobisepType> {
    // RobisepType Designation
    const robisepTypeDesignationOrError = RobisepTypeDesignation.create(robisepType.designation);
    if (robisepTypeDesignationOrError.isFailure) {
      throw new TypeError(robisepTypeDesignationOrError.errorMessage());
    }

    // RobisepType Brand
    const robisepTypeBrandOrError = RobisepTypeBrand.create(robisepType.brand);
    if (robisepTypeBrandOrError.isFailure) {
      throw new TypeError(robisepTypeBrandOrError.errorMessage());
    }

    // RobisepType Model
    const robisepTypeModelOrError = RobisepTypeModel.create(robisepType.model);
    if (robisepTypeModelOrError.isFailure) {
      throw new TypeError(robisepTypeModelOrError.errorMessage());
    }

    // TasksType
    const tasksType = [];

    // Check if robisepTypeDTO.tasksType values belong to TaskType
    let validTaskType = false;
    for (let position = 0; position < robisepType.tasksType.length; position++) {
      for (const taskType in TaskType) {
        if (robisepType.tasksType[position].toUpperCase().trim() === taskType) {
          validTaskType = true;
          tasksType.push(TaskType[taskType]);
        }
      }
      if (!validTaskType) {
        throw new TypeError(
          'Invalid tasksType provided - ' +
            robisepType.tasksType[position].toUpperCase() +
            '. Valid values are: ' +
            Object.values(TaskType),
        );
      }
      validTaskType = false;
    }

    // Check if tasksType is empty
    if (tasksType.length === 0) {
      throw new TypeError('At least one Task Type must be provided.');
    }

    // RobisepType
    const robisepTypeOrError = RobisepType.create(
      {
        designation: robisepTypeDesignationOrError.getValue(),
        brand: robisepTypeBrandOrError.getValue(),
        model: robisepTypeModelOrError.getValue(),
        tasksType: tasksType,
      },
      new UniqueEntityID(robisepType.domainId),
    );

    robisepTypeOrError.isFailure ? console.log(robisepTypeOrError.error) : '';

    return robisepTypeOrError.isSuccess ? robisepTypeOrError.getValue() : null;
  }

  public static toPersistence(robisepType: RobisepType): any {
    return {
      domainId: robisepType.id.toString(),
      designation: robisepType.designation.value,
      brand: robisepType.brand.value,
      model: robisepType.model.value,
      tasksType: robisepType.tasksType,
    };
  }
}
