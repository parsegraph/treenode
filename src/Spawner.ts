import { Keystroke } from "parsegraph-input";
import Navport from "parsegraph-viewport";
import { Alignment, Direction, PreferredAxis } from "parsegraph-direction";
import { PaintedNode } from "parsegraph-artist";
import { ActionCarousel } from "parsegraph-viewport";
import { DefaultBlockPalette } from "parsegraph-block";
import TreeNode from "./TreeNode";
import BlockTreeNode from "./BlockTreeNode";
import AbstractTreeList from "./AbstractTreeList";

export default class Spawner extends AbstractTreeList {
  _lastRow: PaintedNode;
  _palette: DefaultBlockPalette;

  constructor(nav: Navport, children: TreeNode[]) {
    super(nav, new BlockTreeNode("u"), children);
    this._palette = new DefaultBlockPalette();
  }

  connectSpecial(): PaintedNode {
    return this._lastRow;
  }

  palette() {
    return this._palette;
  }

  makeBud(value: TreeNode): PaintedNode {
    const bud = this._palette.spawn("u");
    bud
      .value()
      .interact()
      .setKeyListener((_: Keystroke) => {
        return true;
      });
    bud.setLayoutPreference(PreferredAxis.VERTICAL);
    this.commandsFor(value).install(bud);
    return bud;
  }

  commandsFor(value: TreeNode) {
    const ac = new ActionCarousel(this.nav().carousel(), this.palette());
    ac.addAction("Delete", () => {
      console.log("Deleting this node");
      this.removeChild(value);
    });
    ac.addAction("Append", () => {
      console.log("Adding node");
      this.insertAfter(this.createNew(), value);
    });
    ac.addAction("Insert", () => {
      console.log("Insert node");
      this.insertBefore(this.createNew(), value);
    });
    return ac;
  }

  installRootBud(root: PaintedNode, value: TreeNode) {
    root
      .value()
      .interact()
      .setKeyListener((_: Keystroke) => {
        return true;
      });
    root.setLayoutPreference(PreferredAxis.VERTICAL);
    this.commandsFor(value).install(root);
  }

  _builder: () => TreeNode;

  setBuilder(builder: () => TreeNode) {
    this._builder = builder;
  }

  createNew(): TreeNode {
    if (this._builder) {
      return this._builder();
    }
    const child = new BlockTreeNode("b", "Added");
    child.setOnScheduleUpdate(() => this.invalidate());
    return child;
  }

  makeFirstBud(value: TreeNode): PaintedNode {
    const bud = this.makeSmallBud();
    bud
      .value()
      .interact()
      .setClickListener(() => {
        this.insertBefore(this.createNew(), value);
      });
    return bud;
  }

  makeSmallBud(): PaintedNode {
    const bud = this._palette.spawn("u");
    /* bud.setBlockStyle({
      ...bud.blockStyle(),
      minWidth: BUD_RADIUS * 2,
      minHeight: BUD_RADIUS * 2,
      borderRoundness: BUD_RADIUS * 4,
      borderThickness: BUD_RADIUS * 2 * (2 / 3),
      horizontalPadding: 0,
      verticalPadding: 0,
    });*/
    return bud;
  }

  makeNextBud(value: TreeNode): PaintedNode {
    const bud = this.makeSmallBud();
    if (this._builder) {
      bud
        .value()
        .interact()
        .setClickListener(() => {
          this.insertAfter(this.createNew(), value);
        });
    }
    return bud;
  }

  connectInitialChild(
    root: PaintedNode,
    child: PaintedNode,
    childValue: TreeNode
  ): PaintedNode {
    this.installRootBud(root, childValue);
    const bud = root;
    root.setNodeAlignmentMode(Direction.DOWNWARD, Alignment.CENTER);
    bud.connectNode(Direction.DOWNWARD, child);
    const firstBud = this.makeFirstBud(childValue);
    bud.connectNode(Direction.BACKWARD, firstBud);
    const nextBud = this.makeNextBud(childValue);
    bud.connectNode(Direction.FORWARD, nextBud);
    this._lastRow = nextBud;
    console.log(this._lastRow.state().id());
    return this._lastRow;
  }

  connectChild(
    lastChild: PaintedNode,
    child: PaintedNode,
    childValue: TreeNode
  ): PaintedNode {
    const bud = this.makeBud(childValue);
    lastChild.connectNode(Direction.FORWARD, bud);
    bud.connectNode(Direction.DOWNWARD, child);
    const nextBud = this.makeNextBud(childValue);
    bud.connectNode(Direction.FORWARD, nextBud);
    this._lastRow = nextBud;
    console.log(this._lastRow);
    return this._lastRow;
  }

  render() {
    if (this.length() > 0) {
      return super.render();
    }
    this._title
      .root()
      .value()
      .interact()
      .setClickListener(() => {
        this.appendChild(this.createNew());
      });
    return super.render();
  }
}
