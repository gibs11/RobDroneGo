import { Inject, Service } from 'typedi';
import IRobisepRepo from '../services/IRepos/IRobisepRepo';
import { Document, FilterQuery, Model } from 'mongoose';
import { IRobisepTypePersistence } from '../dataschema/IRobisepTypePersistence';
import { IRobisepPersistence } from '../dataschema/IRobisepPersistence';
import { Robisep } from '../domain/robisep/Robisep';
import { RobisepID } from '../domain/robisep/RobisepID';
import { RobisepState } from '../domain/robisep/RobisepState';
import { RobisepMap } from '../mappers/RobisepMap';

@Service()
export default class RobisepRepo implements IRobisepRepo {
  private models: any;

  constructor(@Inject('robisepSchema') private robisepSchema: Model<IRobisepPersistence & Document>) {}

  private createBaseQuery(): any {
    return {
      where: {},
    };
  }

  public async exists(robisep: Robisep): Promise<boolean> {
    const idX = robisep.id instanceof RobisepID ? (<RobisepID>robisep.id).toString() : robisep.id;

    const query = { domainId: idX };
    const robisepDocument = await this.robisepSchema.findOne(query as FilterQuery<IRobisepTypePersistence & Document>);

    return !!robisepDocument === true;
  }

  public async save(robisep: Robisep): Promise<Robisep> {
    const query = { domainId: robisep.id.toString() };

    const robisepDocument = await this.robisepSchema.findOne(query);

    try {
      if (robisepDocument === null) {
        const rawRobisep: any = RobisepMap.toPersistence(robisep);

        const robisepTypeCreated = await this.robisepSchema.create(rawRobisep);
        return RobisepMap.toDomain(robisepTypeCreated);
      } else {
        robisepDocument.nickname = robisep.nickname.value;
        robisepDocument.serialNumber = robisep.serialNumber.value;
        robisepDocument.code = robisep.code.value;
        robisepDocument.state = RobisepState[robisep.state];
        robisepDocument.description = robisep.description.value;
        robisepDocument.robisepTypeId = robisep.robisepType.id.toString();
        robisepDocument.roomId = robisep.roomId.id.toString();

        await robisepDocument.save();

        return robisep;
      }
    } catch (err) {
      throw err;
    }
  }

  public async findByDomainId(robisepId: RobisepID | string): Promise<Robisep> {
    const query = { domainId: robisepId.toString() };
    const robisepDocument = await this.robisepSchema.findOne(query).exec();

    if (robisepDocument != null) {
      return RobisepMap.toDomain(robisepDocument);
    } else {
      return null;
    }
  }

  public async findARobisepTypeWithSameSerialNumber(serialNumber: string, robisepTypeId: string): Promise<Robisep> {
    const query = { serialNumber: serialNumber, robisepTypeId: robisepTypeId };
    const robisepDocument = await this.robisepSchema.findOne(query);

    if (robisepDocument != null) {
      return RobisepMap.toDomain(robisepDocument);
    }
    return null;
  }

  public async findByNickname(nickname: string): Promise<Robisep[]> {
    const query = { nickname: nickname };
    const robisepDocuments = await this.robisepSchema.find(query);
    return await Promise.all(robisepDocuments.map(async robisep => RobisepMap.toDomain(robisep)));
  }

  public async findByCode(code: string): Promise<Robisep> {
    const query = { code: code };
    const robisepDocument = await this.robisepSchema.findOne(query);

    if (robisepDocument != null) {
      return RobisepMap.toDomain(robisepDocument);
    }
    return null;
  }

  public async findAll(): Promise<Robisep[]> {
    const robisepDocuments = await this.robisepSchema.find();
    return await Promise.all(robisepDocuments.map(async robisep => RobisepMap.toDomain(robisep)));
  }

  public async findByTaskType(taskType: string[]): Promise<Robisep[]> {
    const pipeline = [
      {
        $lookup: {
          from: 'robiseptypes',
          localField: 'robisepTypeId',
          foreignField: 'domainId',
          as: 'joined_docs',
        },
      },
      {
        $match: {
          'joined_docs.tasksType': { $in: taskType },
        },
      },
    ];

    const robisepDocuments = await this.robisepSchema.aggregate(pipeline);
    return await Promise.all(robisepDocuments.map(async robisep => RobisepMap.toDomain(robisep)));
  }
}
