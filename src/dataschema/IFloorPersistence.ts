export interface IFloorPersistence {
  _id: string;
  building: string;
  floorNumber: number;
  floorDescription: string | null;
  floorPlan: string | null;
}
