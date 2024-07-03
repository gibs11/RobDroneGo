import { Repo } from '../../core/infra/Repo';
import { RobisepType } from '../../domain/robisepType/RobisepType';
import { RobisepTypeID } from '../../domain/robisepType/RobisepTypeID';

export default interface IRobisepTypeRepo extends Repo<RobisepType> {
  save(robisepType: RobisepType): Promise<RobisepType>;
  findAll(): Promise<RobisepType[]>;
  findByDomainId(robisepTypeId: RobisepTypeID | string): Promise<RobisepType>;
  existsSerialNumberInsideBrand(brand: string, serialNumber: string): Promise<boolean>;
  findByDesignation(designation: string): Promise<RobisepType>;
}
