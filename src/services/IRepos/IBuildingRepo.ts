import { Repo } from '../../core/infra/Repo';
import { Building } from '../../domain/building/building';

export default interface IBuildingRepo extends Repo<Building> {
  save(building: Building): Promise<Building>;
  findByDomainId(buildingId: string): Promise<Building>;
  findByBuildingCode(buildingCode: string): Promise<Building>;
  findAll(): Promise<Building[]>;
  findWithMinAndMaxFloors(minFloors: number, maxFloors: number): Promise<Building[]>;
}
