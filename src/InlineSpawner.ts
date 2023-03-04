import AbstractSpawner from "./AbstractSpawner";
import { Keystroke } from "parsegraph-input";
import Color from "parsegraph-color";
import Navport from "parsegraph-viewport";
import {
  turnPositive,
  Alignment,
  SHRINK_SCALE,
  reverseDirection,
  Direction,
  PreferredAxis,
} from "parsegraph-direction";
import { PaintedNode } from "parsegraph-artist";
import { ActionCarousel } from "parsegraph-viewport";
import { BlockCaret, DefaultBlockPalette } from "parsegraph-block";
import TreeNode from "./TreeNode";
import BlockTreeNode from "./BlockTreeNode";
import AbstractTreeList from "./AbstractTreeList";
import FunctionalTreeNode from "./FunctionalTreeNode";

export default class InlineSpawner<
  T extends TreeNode = TreeNode
> extends AbstractSpawner<T> {
  _direction: Direction;

  constructor(nav: Navport, children: T[]) {
    super(nav, children);
    this.setTitle(new BlockTreeNode("b"));
    this._direction = Direction.DOWNWARD;
  }

  getDirection() {
    return this._direction;
  }

  setDirection(dir: Direction) {
    if (this.getDirection() === dir) {
      return;
    }
    this._direction = dir;
    this.invalidate();
  }

  getAlignment() {
    return Alignment.CENTER;
  }

  getPreferredAxis() {
    return PreferredAxis.HORIZONTAL;
  }

  clearNode(rootNode: PaintedNode): void {
    rootNode.disconnectNode(Direction.INWARD);
  }

  connectInitialChild(
    root: PaintedNode,
    child: PaintedNode,
    childValue: T
  ): PaintedNode {
    const bud = this.makeFirstBud(childValue);
    root.connectNode(Direction.INWARD, bud);
    bud.crease();
    bud.state().setScale(SHRINK_SCALE);
    bud.connectNode(this.getDirection(), child);
    const nextBud = this.makeNextBud(childValue);
    child.connectNode(this.getDirection(), nextBud);
    this._lastRow = nextBud;
    return this._lastRow;
  }

  connectChild(
    lastChild: PaintedNode,
    child: PaintedNode,
    childValue: T
  ): PaintedNode {
    lastChild.connectNode(this.getDirection(), child);
    const nextBud = this.makeNextBud(childValue);
    child.connectNode(this.getDirection(), nextBud);
    this._lastRow = nextBud;
    return this._lastRow;
  }
}
