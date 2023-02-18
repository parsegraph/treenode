import { PaintedNode } from "parsegraph-artist";

export type ScheduleUpdateCallback = () => void;
export default interface TreeNode {
  root(): PaintedNode;
  setOnScheduleUpdate(callback: ScheduleUpdateCallback): void;
}

