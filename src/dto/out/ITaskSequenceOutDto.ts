export interface SequenceDTO {
  taskCode: number;
  taskType: string;
  robisepType: string;
  taskState: string;
  goal: string;
}

export default interface ITaskSequenceOutDTO {
  robisepNickname: string;
  Sequence: SequenceDTO[];
  cost: number;
}
