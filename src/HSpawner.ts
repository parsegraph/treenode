import { Alignment, Direction, PreferredAxis } from "parsegraph-direction";
import AbstractSpawner from "./AbstractSpawner";
import TreeNode from "./TreeNode";

export default class HSpawner<
  T extends TreeNode = TreeNode
> extends AbstractSpawner<T> {
  getDirection() {
    return Direction.FORWARD;
  }

  getAlignment() {
    return Alignment.CENTER;
  }

  getPreferredAxis() {
    return PreferredAxis.VERTICAL;
  }
}
