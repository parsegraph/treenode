import { Keystroke } from "parsegraph-input";
import Navport from "parsegraph-viewport";
import { AxisOverlap, Alignment, Direction, PreferredAxis } from "parsegraph-direction";
import { PaintedNode } from "parsegraph-artist";
import { ActionCarousel } from "parsegraph-viewport";
import { DefaultBlockPalette } from "parsegraph-block";
import TreeNode from './TreeNode';
import BlockTreeNode from './BlockTreeNode';
import AbstractSpawner from './AbstractSpawner';

export default class VSpawner extends AbstractSpawner {
  getDirection() {
    return Direction.DOWNWARD;
  }

  getPreferredAxis() {
    return PreferredAxis.HORIZONTAL;
  }
}
