interface BuildingDimensionsDTO {
  width: number;
  length: number;
}

export default interface IBuildingOutDTO {
  domainId: string;
  buildingName?: string;
  buildingDimensions: BuildingDimensionsDTO;
  buildingDescription?: string;
  buildingCode: string;
}
