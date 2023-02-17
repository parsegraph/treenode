import { Keystroke } from "parsegraph-input";
import Navport from "parsegraph-viewport";
import { Alignment, Direction, PreferredAxis } from "parsegraph-direction";
import { PaintedNode } from "parsegraph-artist";
import { ActionCarousel } from "parsegraph-viewport";
import { DefaultBlockPalette } from "parsegraph-block";
import TreeNode from "./TreeNode";
import BlockTreeNode from "./BlockTreeNode";
import AbstractTreeList from "./AbstractTreeList";
import AbstractSpawner from './AbstractSpawner';

export default class Spawner extends AbstractSpawner {
  getDirection() {
    return Direction.FORWARD;
  }

  getPreferredAxis() {
    return PreferredAxis.VERTICAL;
  }
}
