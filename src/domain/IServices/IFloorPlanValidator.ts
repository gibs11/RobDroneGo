import { Floor } from '../floor/floor';
import IFloorDTO from '../../dto/IFloorDTO';

export default interface IFloorPlanValidator {
  /**
   * Check if the floor plan is valid.
   * It will check if the floor number in the floor plan is coherent with the one in the floor.
   * It will also check if the floor plan is valid JSON.
   * Finally, it will check if the grid dimensions are coherent with the building the floor belongs to.
   */
  isFloorPlanValid(floorDTO: IFloorDTO, floor: Floor): boolean;
}
