import Navport from "parsegraph-viewport";
import { PaintedNode } from "parsegraph-artist";
import TreeNode from "./TreeNode";

export type TreeNodeCreator = () => PaintedNode;

export default class FunctionalTreeNode extends TreeNode {
  _creator: TreeNodeCreator;

  constructor(nav: Navport) {
    super(nav);
  }

  setCreator(creator: TreeNodeCreator) {
    this._creator = creator;
    this.invalidate();
  }

  render(): PaintedNode {
    return this._creator();
  }
}
