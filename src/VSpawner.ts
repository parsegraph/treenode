import { Alignment, Direction, PreferredAxis } from "parsegraph-direction";
import AbstractSpawner from "./AbstractSpawner";
import { PaintedNode } from "parsegraph-artist";

export default class VSpawner extends AbstractSpawner {
  clearNode(rootNode: PaintedNode): void {
    rootNode.disconnectNode(Direction.UPWARD);
    rootNode.disconnectNode(Direction.DOWNWARD);
    rootNode.disconnectNode(Direction.FORWARD);
  }

  getDirection() {
    return Direction.DOWNWARD;
  }

  getAlignment() {
    return Alignment.CENTER;
  }

  getPreferredAxis() {
    return PreferredAxis.HORIZONTAL;
  }
}
