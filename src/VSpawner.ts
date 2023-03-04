import { Alignment, Direction, PreferredAxis } from "parsegraph-direction";
import AbstractSpawner from "./AbstractSpawner";
import { PaintedNode } from "parsegraph-artist";
import TreeNode from "./TreeNode";

export default class VSpawner<T extends TreeNode = TreeNode> extends AbstractSpawner<T> {
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
