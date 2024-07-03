export interface ISurveillanceTaskPersistence {
  _id: string;
  robisepType: string;
  robisepId: string | null;
  taskCode: number;
  email: string;
  taskState: string;
  emergencyPhoneNumber: string;
  startingPointToWatch: string;
  endingPointToWatch: string;
}
