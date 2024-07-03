export interface IBuildingPersistence {
  _id: string;
  buildingName: string | null;
  buildingDimensions: {
    width: number;
    length: number;
  };
  buildingDescription: string | null;
  buildingCode: string;
}
