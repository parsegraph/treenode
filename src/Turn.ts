import Direction from 'parsegraph-direction';
import { DefaultBlockPalette } from "parsegraph-block";
import { PaintedNode } from "parsegraph-artist";
import TreeNode from "./TreeNode";

export default class Turn extends TreeNode {
  _palette: DefaultBlockPalette;
  _connectDir: Direction;
  _connected: TreeNode;

  constructor(dir: Direction, connected: TreeNode) {
    super(null);
    this._palette = new DefaultBlockPalette();
    this._connectDir = dir;
    this._connected = connected;
    this._connected.setOnScheduleUpdate(()=>this.invalidate());
    this.invalidate();
  }

  render(): PaintedNode {
    const root = this._palette.spawn('u');
    root.connectNode(this._connectDir, this._connected.root());
    return root;
  }
}

