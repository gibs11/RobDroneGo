import ITaskOutDTO from '../../../src/dto/out/ITaskOutDTO';
import ITaskDTO from '../../../src/dto/ITaskDTO';
import RobisepTypeDataSource from '../robisepTypeDataSource';
import { TaskState } from '../../../src/domain/task/taskState';
import { UniqueEntityID } from '../../../src/core/domain/UniqueEntityID';
import { PhoneNumber } from '../../../src/domain/common/phoneNumber';
import RoomDataSource from '../RoomDataSource';
import { PickUpAndDeliveryTask } from '../../../src/domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTask';
import { PersonalName } from '../../../src/domain/common/personalName';
import { PickUpAndDeliveryTaskDescription } from '../../../src/domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTaskDescription';
import { PickUpAndDeliveryTaskConfirmationCode } from '../../../src/domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTaskConfirmationCode';
import { PickUpAndDeliveryTaskPersonContact } from '../../../src/domain/task/pickUpAndDeliveryTask/pickUpAndDeliveryTaskPersonContact';
import { TaskCode } from '../../../src/domain/task/taskCode';
import RobisepDataSource from '../RobisepDataSource';

class PickUpAndDeliveryTaskDataSource {
  static getRoomAToRoomProlog1PickUpAndDeliveryTaskOutDTO(): ITaskOutDTO {
    return {
      domainId: '1',
      robisepType: RobisepTypeDataSource.getRobisepTypeAdto(),
      state: TaskState.REQUESTED,
      taskCode: 1,
      email: 'email@isep.ipp.pt',
      pickUpAndDeliveryTask: {
        pickUpPersonContact: {
          name: 'John',
          phoneNumber: '912345678',
        },
        deliveryPersonContact: {
          name: 'Jane',
          phoneNumber: '912543876',
        },
        description: 'Description A to Prolog1',
        confirmationCode: 1234,
        pickUpRoom: RoomDataSource.getRoomAdto(),
        deliveryRoom: RoomDataSource.getRoomProlog1dto(),
      },
    };
  }

  static getRoomBToRoomProlog1PickUpAndDeliveryTaskOutDTO(): ITaskOutDTO {
    return {
      domainId: '2',
      robisepType: RobisepTypeDataSource.getRobisepTypeAdto(),
      state: TaskState.REQUESTED,
      taskCode: 2,
      email: 'email@isep.ipp.pt',
      pickUpAndDeliveryTask: {
        pickUpPersonContact: {
          name: 'Jane',
          phoneNumber: '912543876',
        },
        deliveryPersonContact: {
          name: 'John',
          phoneNumber: '912345678',
        },
        description: 'Description B to Prolog1',
        confirmationCode: 1221,
        pickUpRoom: RoomDataSource.getRoomBdto(),
        deliveryRoom: RoomDataSource.getRoomProlog1dto(),
      },
    };
  }
  static getRoomAToRoomProlog1PickUpAndDeliveryAcceptedTaskOutDTO(): ITaskOutDTO {
    return {
      domainId: '1',
      robisepType: RobisepTypeDataSource.getRobisepTypeAdto(),
      robisep: RobisepDataSource.getRobisepADTO(),
      state: TaskState.REQUESTED,
      taskCode: 1,
      email: 'email@isep.ipp.pt',
      pickUpAndDeliveryTask: {
        pickUpPersonContact: {
          name: 'John',
          phoneNumber: '912345678',
        },
        deliveryPersonContact: {
          name: 'Jane',
          phoneNumber: '912543876',
        },
        description: 'Description A to Prolog1',
        confirmationCode: 1234,
        pickUpRoom: RoomDataSource.getRoomAdto(),
        deliveryRoom: RoomDataSource.getRoomProlog1dto(),
      },
    }
  }

  static getRoomBToRoomProlog1PickUpAndDeliveryAcceptedTaskOutDTO(): ITaskOutDTO {
    return {
      domainId: '2',
      robisepType: RobisepTypeDataSource.getRobisepTypeAdto(),
      robisep: RobisepDataSource.getRobisepADTO(),
      state: TaskState.REQUESTED,
      taskCode: 2,
      email: 'email@isep.ipp.pt',
      pickUpAndDeliveryTask: {
        pickUpPersonContact: {
          name: 'Jane',
          phoneNumber: '912543876',
        },
        deliveryPersonContact: {
          name: 'John',
          phoneNumber: '912345678',
        },
        description: 'Description B to Prolog1',
        confirmationCode: 1221,
        pickUpRoom: RoomDataSource.getRoomBdto(),
        deliveryRoom: RoomDataSource.getRoomProlog1dto(),
      },
    }
  }

  static getRoomAToRoomProlog1PickUpAndDeliveryTaskDTO(): ITaskDTO {
    return {
      domainId: '1',
      robisepType: RobisepTypeDataSource.getRobisepTypeAdto().domainId,
      taskCode: 1,
      iamId: 'iamId',
      pickUpAndDeliveryTask: {
        pickUpPersonContact: {
          name: 'John',
          phoneNumber: '912345678',
        },
        deliveryPersonContact: {
          name: 'Jane',
          phoneNumber: '912543876',
        },
        description: 'Description A to Prolog 1',
        confirmationCode: 1234,
        pickUpRoom: RoomDataSource.getRoomAdto().domainId,
        deliveryRoom: RoomDataSource.getRoomProlog1dto().domainId,
      },
    };
  }

  static getRoomBToRoomProlog1PickUpAndDeliveryTaskDTO(): ITaskDTO {
    return {
      domainId: '2',
      robisepType: RobisepTypeDataSource.getRobisepTypeAdto().domainId,
      taskCode: 2,
      iamId: 'iamId',
      pickUpAndDeliveryTask: {
        pickUpPersonContact: {
          name: 'Jane',
          phoneNumber: '912543876',
        },
        deliveryPersonContact: {
          name: 'John',
          phoneNumber: '912345678',
        },
        description: 'Description B to C',
        confirmationCode: 1221,
        pickUpRoom: RoomDataSource.getRoomBdto().domainId,
        deliveryRoom: RoomDataSource.getRoomProlog1dto().domainId,
      },
    };
  }

  static getRoomAToRoomProlog1PickUpAndDeliveryTask(): PickUpAndDeliveryTask {
    return PickUpAndDeliveryTask.create(
      {
        taskState: TaskState.REQUESTED,
        taskCode: TaskCode.create(1).getValue(),
        email: 'email@isep.ipp.pt',
        robisepType: RobisepTypeDataSource.getRobisepTypeA(),
        pickUpPersonContact: PickUpAndDeliveryTaskPersonContact.create({
          personPersonalName: PersonalName.create('John').getValue(),
          personPhoneNumber: PhoneNumber.create('912345678').getValue(),
        }).getValue(),
        pickUpRoom: RoomDataSource.getRoomA(),
        deliveryPersonContact: PickUpAndDeliveryTaskPersonContact.create({
          personPersonalName: PersonalName.create('Jane').getValue(),
          personPhoneNumber: PhoneNumber.create('912543876').getValue(),
        }).getValue(),
        deliveryRoom: RoomDataSource.getRoomProlog1(),
        description: PickUpAndDeliveryTaskDescription.create('Description A to Prolog 1').getValue(),
        confirmationCode: PickUpAndDeliveryTaskConfirmationCode.create(1234).getValue(),
      },
      new UniqueEntityID('1'),
    ).getValue();
  }

  static getRoomBToRoomProlog1PickUpAndDeliveryTask(): PickUpAndDeliveryTask {
    return PickUpAndDeliveryTask.create(
      {
        taskState: TaskState.REQUESTED,
        taskCode: TaskCode.create(2).getValue(),
        email: 'email@isep.ipp.pt',
        robisepType: RobisepTypeDataSource.getRobisepTypeA(),
        pickUpPersonContact: PickUpAndDeliveryTaskPersonContact.create({
          personPersonalName: PersonalName.create('Jane').getValue(),
          personPhoneNumber: PhoneNumber.create('912543876').getValue(),
        }).getValue(),
        pickUpRoom: RoomDataSource.getRoomB(),
        deliveryPersonContact: PickUpAndDeliveryTaskPersonContact.create({
          personPersonalName: PersonalName.create('John').getValue(),
          personPhoneNumber: PhoneNumber.create('912345678').getValue(),
        }).getValue(),
        deliveryRoom: RoomDataSource.getRoomProlog1(),
        description: PickUpAndDeliveryTaskDescription.create('Description B to Prolog 1').getValue(),
        confirmationCode: PickUpAndDeliveryTaskConfirmationCode.create(1221).getValue(),
      },
      new UniqueEntityID('2'),
    ).getValue();
  }

  static getRoomAToRoomProlog1PickUpAndDeliveryAcceptedTask(): PickUpAndDeliveryTask {
    return PickUpAndDeliveryTask.create({
      taskState: TaskState.REQUESTED,
      taskCode: TaskCode.create(1).getValue(),
      email: 'email@isep.ipp.pt',
      robisepType: RobisepTypeDataSource.getRobisepTypeA(),
      robisep: RobisepDataSource.getRobisepA(),
      pickUpPersonContact: PickUpAndDeliveryTaskPersonContact.create({
        personPersonalName: PersonalName.create('John').getValue(),
        personPhoneNumber: PhoneNumber.create('912345678').getValue(),
      }).getValue(),
      pickUpRoom: RoomDataSource.getRoomA(),
      deliveryPersonContact: PickUpAndDeliveryTaskPersonContact.create({
        personPersonalName: PersonalName.create('Jane').getValue(),
        personPhoneNumber: PhoneNumber.create('912543876').getValue(),
      }).getValue(),
      deliveryRoom: RoomDataSource.getRoomProlog1(),
      description: PickUpAndDeliveryTaskDescription.create('Description A to Prolog 1').getValue(),
      confirmationCode: PickUpAndDeliveryTaskConfirmationCode.create(1234).getValue(),
    }, new UniqueEntityID('1')).getValue();
  }

  static getRoomBToRoomProlog1PickUpAndDeliveryAcceptedTask(): PickUpAndDeliveryTask {
    return PickUpAndDeliveryTask.create({
      taskState: TaskState.REQUESTED,
      taskCode: TaskCode.create(2).getValue(),
      email: 'email@isep.ipp.pt',
      robisepType: RobisepTypeDataSource.getRobisepTypeA(),
      robisep: RobisepDataSource.getRobisepA(),
      pickUpPersonContact: PickUpAndDeliveryTaskPersonContact.create({
        personPersonalName: PersonalName.create('Jane').getValue(),
        personPhoneNumber: PhoneNumber.create('912543876').getValue(),
      }).getValue(),
      pickUpRoom: RoomDataSource.getRoomB(),
      deliveryPersonContact: PickUpAndDeliveryTaskPersonContact.create({
        personPersonalName: PersonalName.create('John').getValue(),
        personPhoneNumber: PhoneNumber.create('912345678').getValue(),
      }).getValue(),
      deliveryRoom: RoomDataSource.getRoomProlog1(),
      description: PickUpAndDeliveryTaskDescription.create('Description B to Prolog 1').getValue(),
      confirmationCode: PickUpAndDeliveryTaskConfirmationCode.create(1221).getValue(),
    }, new UniqueEntityID('2')).getValue();
  }

  static getRoomBToRoomProlog1PickUpAndDeliveryTaskWithRobisep(): PickUpAndDeliveryTask {
    return PickUpAndDeliveryTask.create(
      {
        taskState: TaskState.REQUESTED,
        taskCode: TaskCode.create(2).getValue(),
        email: 'email@isep.ipp.pt',
        robisepType: RobisepTypeDataSource.getRobisepTypeA(),
        pickUpPersonContact: PickUpAndDeliveryTaskPersonContact.create({
          personPersonalName: PersonalName.create('Jane').getValue(),
          personPhoneNumber: PhoneNumber.create('912543876').getValue(),
        }).getValue(),
        pickUpRoom: RoomDataSource.getRoomB(),
        deliveryPersonContact: PickUpAndDeliveryTaskPersonContact.create({
          personPersonalName: PersonalName.create('John').getValue(),
          personPhoneNumber: PhoneNumber.create('912345678').getValue(),
        }).getValue(),
        deliveryRoom: RoomDataSource.getRoomProlog1(),
        description: PickUpAndDeliveryTaskDescription.create('Description B to Prolog 1').getValue(),
        confirmationCode: PickUpAndDeliveryTaskConfirmationCode.create(1221).getValue(),
        robisep: RobisepDataSource.getRobisepA(),
      },
      new UniqueEntityID('2'),
    ).getValue();
  }
}

export default PickUpAndDeliveryTaskDataSource;
