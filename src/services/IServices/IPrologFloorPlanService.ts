import { Result } from '../../core/logic/Result';
import IPrologFloorPlanDTO from '../../dto/IPrologFloorPlanDTO';

export default interface IPrologFloorPlanService {
  /**
   * This method obtains the floor plan for a given floor. The floor must belong to the building with the given ID.
   * @param floorId the floor to be obtained.
   * @returns the floor plan for the given floor.
   */
  obtainFloorPlan(floorId: string): Promise<Result<IPrologFloorPlanDTO>>;
}
