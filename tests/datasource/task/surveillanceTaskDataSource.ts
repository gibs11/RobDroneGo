import ITaskOutDTO from "../../../src/dto/out/ITaskOutDTO";
import ITaskDTO from "../../../src/dto/ITaskDTO";
import RobisepTypeDataSource from "../robisepTypeDataSource";
import {TaskState} from "../../../src/domain/task/taskState";
import {UniqueEntityID} from "../../../src/core/domain/UniqueEntityID";
import {SurveillanceTask} from "../../../src/domain/task/surveillanceTask/surveillanceTask";
import {PhoneNumber} from "../../../src/domain/common/phoneNumber";
import RoomDataSource from "../RoomDataSource";
import {TaskCode} from "../../../src/domain/task/taskCode";
import RobisepDataSource from "../RobisepDataSource";

class SurveillanceTaskDataSource {
  static getBuildingASurveillanceTaskOutDTO(): ITaskOutDTO {
    return {
      domainId: '1A',
      robisepType: RobisepTypeDataSource.getRobisepTypeBdto(),
      state: TaskState.REQUESTED,
      taskCode: 1,
      email: 'email@isep.ipp.pt',
      surveillanceTask: {
        emergencyPhoneNumber: '912345678',
        startingPointToWatch: RoomDataSource.getFirstRoomTdto(),
        endingPointToWatch: RoomDataSource.getSecondRoomTdto(),
      },
    }
  }

  static getBuildingBSurveillanceTaskOutDTO(): ITaskOutDTO {
    return {
      domainId: '1B',
      robisepType: RobisepTypeDataSource.getRobisepTypeBdto(),
      state: TaskState.REQUESTED,
      email: 'email@isep.ipp.pt',
      taskCode: 2,
      surveillanceTask: {
        emergencyPhoneNumber: '912345678',
        startingPointToWatch: RoomDataSource.getFirstRoomTdto(),
        endingPointToWatch: RoomDataSource.getSecondRoomTdto(),
      },
    }
  }
  static getBuildingASurveillanceAcceptedTaskOutDTO(): ITaskOutDTO {
    return {
      domainId: '1A',
      robisepType: RobisepTypeDataSource.getRobisepTypeBdto(),
      robisep: RobisepDataSource.getRobisepBDTO(),
      state: TaskState.REQUESTED,
      taskCode: 1,
      email: 'email@isep.ipp.pt',
      surveillanceTask: {
        emergencyPhoneNumber: '912345678',
        startingPointToWatch: RoomDataSource.getFirstRoomTdto(),
        endingPointToWatch: RoomDataSource.getSecondRoomTdto(),
      },
    }
  }

  static getBuildingBSurveillanceAcceptedTaskOutDTO(): ITaskOutDTO {
    return {
      domainId: '1B',
      robisepType: RobisepTypeDataSource.getRobisepTypeBdto(),
      robisep: RobisepDataSource.getRobisepBDTO(),
      state: TaskState.REQUESTED,
      email: 'email@isep.ipp.pt',
      taskCode: 2,
      surveillanceTask: {
        emergencyPhoneNumber: '912345678',
        startingPointToWatch: RoomDataSource.getFirstRoomTdto(),
        endingPointToWatch: RoomDataSource.getSecondRoomTdto(),
      },
    }
  }

  static getBuildingASurveillanceTaskDTO(): ITaskDTO {
    return {
      domainId: '1A',
      robisepType: RobisepTypeDataSource.getRobisepTypeBdto().domainId,
      taskCode: 1,
      iamId: 'iamId',
      surveillanceTask: {
        emergencyPhoneNumber: '912345678',
        startingPointToWatch: RoomDataSource.getFirstRoomTdto().domainId,
        endingPointToWatch: RoomDataSource.getSecondRoomTdto().domainId,
      },
    }
  }

  static getBuildingBSurveillanceTaskDTO(): ITaskDTO {
    return {
      domainId: '1B',
      robisepType: RobisepTypeDataSource.getRobisepTypeBdto().domainId,
      taskCode: 2,
      iamId: 'iamId',
      surveillanceTask: {
        emergencyPhoneNumber: '912345678',
        startingPointToWatch: RoomDataSource.getFirstRoomTdto().domainId,
        endingPointToWatch: RoomDataSource.getSecondRoomTdto().domainId,
      },
    }
  }

  static getBuildingASurveillanceTask(): SurveillanceTask {
    return SurveillanceTask.create({
      taskState: TaskState.REQUESTED,
      taskCode: TaskCode.create(1).getValue(),
      email: 'email@isep.ipp.pt',
      robisepType: RobisepTypeDataSource.getRobisepTypeB(),
      emergencyPhoneNumber: PhoneNumber.create('912345678').getValue(),
      startingPointToWatch: RoomDataSource.getFirstRoomT(),
      endingPointToWatch: RoomDataSource.getSecondRoomT(),
    }, new UniqueEntityID('1A')).getValue();
  }

  static getBuildingBSurveillanceTask(): SurveillanceTask {
    return SurveillanceTask.create({
      taskState: TaskState.REQUESTED,
      taskCode: TaskCode.create(2).getValue(),
      email: 'email@isep.ipp.pt',
      robisepType: RobisepTypeDataSource.getRobisepTypeB(),
      emergencyPhoneNumber: PhoneNumber.create('912345678').getValue(),
      startingPointToWatch: RoomDataSource.getFirstRoomT(),
      endingPointToWatch: RoomDataSource.getSecondRoomT(),
    }, new UniqueEntityID('1B')).getValue();
  }

  static getBuildingASurveillanceAcceptedTask(): SurveillanceTask {
    return SurveillanceTask.create({
      taskState: TaskState.ACCEPTED,
      taskCode: TaskCode.create(1).getValue(),
      email: 'email@isep.ipp.pt',
      robisepType: RobisepTypeDataSource.getRobisepTypeB(),
      robisep: RobisepDataSource.getRobisepB(),
      emergencyPhoneNumber: PhoneNumber.create('912345678').getValue(),
      startingPointToWatch: RoomDataSource.getFirstRoomT(),
      endingPointToWatch: RoomDataSource.getSecondRoomT(),
    }, new UniqueEntityID('1A')).getValue();
  }

  static getBuildingBSurveillanceAcceptedTask(): SurveillanceTask {
    return SurveillanceTask.create({
      taskState: TaskState.ACCEPTED,
      taskCode: TaskCode.create(2).getValue(),
      email: 'email@isep.ipp.pt',
      robisepType: RobisepTypeDataSource.getRobisepTypeB(),
      robisep: RobisepDataSource.getRobisepB(),
      emergencyPhoneNumber: PhoneNumber.create('912345678').getValue(),
      startingPointToWatch: RoomDataSource.getFirstRoomT(),
      endingPointToWatch: RoomDataSource.getSecondRoomT(),
    }, new UniqueEntityID('1B')).getValue();
  }

  static getBuildingBSurveillanceTaskWithRobisep(): SurveillanceTask {
    return SurveillanceTask.create({
      taskState: TaskState.REQUESTED,
      taskCode: TaskCode.create(2).getValue(),
      email: 'email@isep.ipp.pt',
      robisepType: RobisepTypeDataSource.getRobisepTypeB(),
      emergencyPhoneNumber: PhoneNumber.create('912345678').getValue(),
      startingPointToWatch: RoomDataSource.getFirstRoomT(),
      endingPointToWatch: RoomDataSource.getSecondRoomT(),
      robisep: RobisepDataSource.getRobisepB(),
    }, new UniqueEntityID('1B')).getValue();
  }
}

export default SurveillanceTaskDataSource;