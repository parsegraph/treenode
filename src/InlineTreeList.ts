import Navport from "parsegraph-viewport";
import { PaintedNode } from "parsegraph-artist";
import Direction, { SHRINK_SCALE } from "parsegraph-direction";
import TreeNode from "./TreeNode";
import AbstractTreeList from "./AbstractTreeList";

export default class InlineTreeList<
  T extends TreeNode = TreeNode
> extends AbstractTreeList<T> {
  _connectDir: Direction;

  constructor(nav: Navport, title: TreeNode, children: T[]) {
    super(nav, title, children);
    this._connectDir = Direction.FORWARD;
  }

  setConnectDirection(dir: Direction) {
    if (this._connectDir === dir) {
      return;
    }
    this._connectDir = dir;
    this.invalidate();
  }

  getConnectDirection() {
    return this._connectDir;
  }

  connectInitialChild(root: PaintedNode, child: PaintedNode): PaintedNode {
    child.crease();
    root.connectNode(Direction.INWARD, child);
    child.crease();
    child.state().setScale(SHRINK_SCALE);
    return child;
  }

  connectChild(lastChild: PaintedNode, child: PaintedNode): PaintedNode {
    lastChild.connectNode(this._connectDir, child);
    return child;
  }
}
