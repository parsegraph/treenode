import Navport from "parsegraph-viewport";
import { PaintedNode } from "parsegraph-artist";
import TreeNode from "./TreeNode";
import { logEnterc, logLeave } from "parsegraph-log";

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
    logEnterc("Tree rendering", "Rendering functional tree node");
    const c = this._creator();
    logLeave();
    return c;
  }
}
