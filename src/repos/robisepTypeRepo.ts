import { Service, Inject } from 'typedi';
import IRobisepTypeRepo from '../services/IRepos/IRobisepTypeRepo';
import { RobisepType } from '../domain/robisepType/RobisepType';
import { Document, FilterQuery, Model } from 'mongoose';
import { IRobisepTypePersistence } from '../dataschema/IRobisepTypePersistence';
import { RobisepTypeMap } from '../mappers/RobisepTypeMap';
import { RobisepTypeID } from '../domain/robisepType/RobisepTypeID';

@Service()
export default class RobisepTypeRepo implements IRobisepTypeRepo {
  private models: any;

  constructor(@Inject('robisepTypeSchema') private robisepTypeSchema: Model<IRobisepTypePersistence & Document>) {}

  private createBaseQuery(): any {
    return {
      where: {},
    };
  }

  public async exists(robisepType: RobisepType): Promise<boolean> {
    const idX = robisepType.id instanceof RobisepTypeID ? (<RobisepTypeID>robisepType.id).toString() : robisepType.id;

    const query = { domainId: idX };
    const robisepTypeDocument = await this.robisepTypeSchema.findOne(
      query as FilterQuery<IRobisepTypePersistence & Document>,
    );

    return !!robisepTypeDocument === true;
  }

  public async save(robisepType: RobisepType): Promise<RobisepType> {
    const query = { domainId: robisepType.id.toString() };

    const robisepTypeDocument = await this.robisepTypeSchema.findOne(query);

    try {
      if (robisepTypeDocument === null) {
        const rawRobisepType: any = RobisepTypeMap.toPersistence(robisepType);

        const robisepTypeCreated = await this.robisepTypeSchema.create(rawRobisepType);

        return RobisepTypeMap.toDomain(robisepTypeCreated);
      } else {
        robisepTypeDocument.designation = robisepType.designation.value;
        robisepTypeDocument.brand = robisepType.brand.value;
        robisepTypeDocument.model = robisepType.model.value;
        robisepTypeDocument.tasksType = robisepType.tasksType.map(task => task.toString()); // Transform TaskType to string[]
        await robisepTypeDocument.save();

        return robisepType;
      }
    } catch (err) {
      throw err;
    }
  }

  public async findAll(): Promise<RobisepType[]> {
    const robisepTypeRecords = await this.robisepTypeSchema.find();
    const robisepTypes = robisepTypeRecords.map(robisepTypeRecord => RobisepTypeMap.toDomain(robisepTypeRecord));
    return Promise.all(robisepTypes);
  }

  public async findByDomainId(robisepTypeId: RobisepTypeID | string): Promise<RobisepType> {
    const query = { domainId: robisepTypeId };
    const robisepTypeRecord = await this.robisepTypeSchema.findOne(
      query as FilterQuery<IRobisepTypePersistence & Document>,
    );

    if (robisepTypeRecord != null) return RobisepTypeMap.toDomain(robisepTypeRecord);

    return null;
  }

  public async existsSerialNumberInsideBrand(brand: string, serialNumber: string): Promise<boolean> {
    const query = { brand: brand, serialNumber: serialNumber };
    const robisepTypeRecord = await this.robisepTypeSchema.findOne(
      query as FilterQuery<IRobisepTypePersistence & Document>,
    );

    return robisepTypeRecord != null;
  }

  public async findByDesignation(designation: string): Promise<RobisepType> {
    const query = { designation: designation };
    const robisepTypeRecord = await this.robisepTypeSchema.findOne(
      query as FilterQuery<IRobisepTypePersistence & Document>,
    );

    if (robisepTypeRecord != null) return RobisepTypeMap.toDomain(robisepTypeRecord);

    return null;
  }
}
