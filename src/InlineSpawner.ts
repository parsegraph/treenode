import AbstractSpawner from "./AbstractSpawner";
import { Keystroke } from "parsegraph-input";
import Color from "parsegraph-color";
import Navport from "parsegraph-viewport";
import {
  turnPositive,
  Alignment,
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

export default class InlineSpawner extends AbstractSpawner {
  constructor(nav: Navport, children: TreeNode[]) {
    super(nav, children);
    this.setTitle(new BlockTreeNode("b"));
  }

  getDirection() {
    return Direction.DOWNWARD;
  }

  getConnectDirection() {
    return Direction.DOWNWARD;
  }

  getAlignment() {
    return Alignment.CENTER;
  }

  getPreferredAxis() {
    return PreferredAxis.HORIZONTAL;
  }

  connectInitialChild(
    root: PaintedNode,
    child: PaintedNode,
    childValue: TreeNode
  ): PaintedNode {
    const bud = this.makeFirstBud(childValue);
    root.connectNode(Direction.INWARD, bud);
    bud.connectNode(this.getDirection(), child);
    const nextBud = this.makeNextBud(childValue);
    child.connectNode(this.getDirection(), nextBud);
    this._lastRow = nextBud;
    return this._lastRow;
  }

  connectChild(
    lastChild: PaintedNode,
    child: PaintedNode,
    childValue: TreeNode
  ): PaintedNode {
    lastChild.connectNode(this.getDirection(), child);
    const nextBud = this.makeNextBud(childValue);
    child.connectNode(this.getDirection(), nextBud);
    this._lastRow = nextBud;
    return this._lastRow;
  }
}