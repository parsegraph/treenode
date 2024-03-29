import Navport from "parsegraph-viewport";
import { PaintedNode } from "parsegraph-artist";
import AbstractTreeNode from "./AbstractTreeNode";
import { logEnterc, logLeave } from "parsegraph-log";

export type TreeNodeCreator = () => PaintedNode;

export default class FunctionalTreeNode extends AbstractTreeNode {
  _creator: TreeNodeCreator;

  constructor(nav: Navport, creator?: TreeNodeCreator) {
    super(nav);
    this._creator = creator;
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
