import { PaintedNode } from "parsegraph-artist";
import { BlockCaret, DefaultBlockPalette } from "parsegraph-block";

import AbstractTreeNode from "./AbstractTreeNode";

export default class TreeLabel extends AbstractTreeNode {
  _label: string;
  _type: any;
  _palette: DefaultBlockPalette;

  constructor(type?: any, label?: string) {
    super(null);
    this._palette = new DefaultBlockPalette();
    this._type = type || "b";
    this._label = label || "";
  }
  getValue(): any {
    return this._label;
  }
  render(): PaintedNode {
    const car = new BlockCaret(this._type);
    car.label(this.getValue());
    return car.root() as PaintedNode;
  }
}
