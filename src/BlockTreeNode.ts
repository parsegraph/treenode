import { DefaultBlockPalette } from "parsegraph-block";
import { PaintedNode } from "parsegraph-artist";
import AbstractTreeNode from "./AbstractTreeNode";

export default class BlockTreeNode extends AbstractTreeNode {
  _label: string;
  _nodeType: string | number;
  _palette: DefaultBlockPalette;
  _style: any;

  constructor(nodeType?: string | number, label?: string, style?: any) {
    super(null);
    this._palette = new DefaultBlockPalette();
    this._nodeType = nodeType;
    this._label = label;
    this._style = style;
    this.invalidate();
  }

  getStyle() {
    return this._style;
  }

  getType(): any {
    return this._nodeType;
  }
  setType(nodeType: any) {
    this._nodeType = nodeType;
    this.invalidate();
  }
  getLabel(): string {
    return this._label;
  }
  setLabel(label: string) {
    this._label = label;
    this.invalidate();
  }

  render(): PaintedNode {
    const root = this._palette.spawn(this.getType());
    if (this._label != null) {
      root.value().setLabel(this._label);
    }
    if (this._style) {
      root.value().setBlockStyle(this._style);
    }
    return root;
  }
}
