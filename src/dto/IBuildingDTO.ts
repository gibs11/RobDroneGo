interface BuildingDimensionsDTO {
  width: number;
  length: number;
}

export default interface IBuildingDTO {
  domainId: string;
  buildingName?: string;
  buildingDimensions: BuildingDimensionsDTO;
  buildingDescription?: string;
  buildingCode: string;
}
