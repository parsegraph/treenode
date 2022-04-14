import AbstractTreeList from "./AbstractTreeList";
import TreeNode from "./TreeNode";
import { PaintedNode } from "parsegraph-artist";
import Direction, { SHRINK_SCALE } from "parsegraph-direction";

export const INLINE_TREE_LIST_SYMBOL = Symbol("InlineTreeList");
export default class InlineTreeList extends AbstractTreeList {
  constructor(title: TreeNode, children: TreeNode[]) {
    super(title, children);
  }

  type() {
    return INLINE_TREE_LIST_SYMBOL;
  }

  connectInitialChild(root: PaintedNode, child: PaintedNode): PaintedNode {
    child.crease();
    root.connectNode(Direction.INWARD, child);
    child.state().setScale(SHRINK_SCALE);
    return child;
  }

  connectChild(lastChild: PaintedNode, child: PaintedNode): PaintedNode {
    lastChild.connectNode(Direction.FORWARD, child);
    child.crease();
    return child;
  }
}
