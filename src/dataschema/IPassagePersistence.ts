export interface IPassagePersistence {
  _id: string;
  passageStartPoint: {
    floorId: string;
    firstCoordinates: {
      x: number;
      y: number;
    };
    lastCoordinates: {
      x: number;
      y: number;
    };
  };
  passageEndPoint: {
    floorId: string;
    firstCoordinates: {
      x: number;
      y: number;
    };
    lastCoordinates: {
      x: number;
      y: number;
    };
  };
}
