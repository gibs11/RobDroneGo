export interface IRoomPersistence {
  domainId: string;
  name: string;
  description: string;
  category: string;
  dimensions: {
    initialPosition: {
      xPosition: number;
      yPosition: number;
    };
    finalPosition: {
      xPosition: number;
      yPosition: number;
    };
  };
  doorPosition: {
    xPosition: number;
    yPosition: number;
  };
  doorOrientation: string;
  floorId: string;
}
