import IFloorPlanValidator from '../IServices/IFloorPlanValidator';
import { Floor } from '../floor/floor';
import { Service } from 'typedi';

import config from '../../../config';

import IFloorDTO from '../../dto/IFloorDTO';

const HEIGHT_INCREMENT_FOR_PLAN = config.configurableValues.floor.floorPlanLengthIncrement;
const WIDTH_INCREMENT_FOR_PLAN = config.configurableValues.floor.floorPlanWidthIncrement;

@Service()
export default class FloorPlanJSONValidator implements IFloorPlanValidator {
  public isFloorPlanValid(floorDTO: IFloorDTO, floor: Floor): boolean {
    // Check if the floor number in the floor plan is coherent with the one in the floor
    const floorNumberInFloorPlan = floorDTO.floorPlan.planFloorNumber;
    if (floorNumberInFloorPlan !== floor.floorNumber.value) {
      return false;
    }

    // Check if the grid dimensions are coherent with the building the floor belongs to
    const floorPlanWidth = floorDTO.floorPlan.planFloorSize.width;
    const floorPlanHeight = floorDTO.floorPlan.planFloorSize.height;

    if (
      floorPlanWidth !== floor.building.dimensions.width + WIDTH_INCREMENT_FOR_PLAN ||
      floorPlanHeight !== floor.building.dimensions.length + HEIGHT_INCREMENT_FOR_PLAN
    ) {
      return false;
    }

    return (
      this.isTexturePath(floorDTO.floorPlan.floorWallTexture) &&
      this.isTexturePath(floorDTO.floorPlan.floorElevatorTexture) &&
      this.isTexturePath(floorDTO.floorPlan.floorDoorTexture)
    );
  }

  private isTexturePath(texture: string): boolean {
    // Verify that the texture path starts with ./textures and ends with .jpg and .png
    return (
      texture.startsWith('./textures') &&
      (texture.endsWith('.jpg') || texture.endsWith('.png') || texture.endsWith('.jpeg'))
    );
  }
}
