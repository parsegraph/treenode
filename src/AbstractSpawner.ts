import { Keystroke } from "parsegraph-input";
import Color from "parsegraph-color";
import Navport from "parsegraph-viewport";
import {
  turnPositive,
  Alignment,
  reverseDirection,
  Direction,
  PreferredAxis,
} from "parsegraph-direction";
import { PaintedNode } from "parsegraph-artist";
import { ActionCarousel } from "parsegraph-viewport";
import { BlockCaret, DefaultBlockPalette } from "parsegraph-block";
import TreeNode from "./TreeNode";
import BlockTreeNode from "./BlockTreeNode";
import AbstractTreeList from "./AbstractTreeList";
import FunctionalTreeNode from "./FunctionalTreeNode";

const makeProtoBlock = (
  nav: Navport,
  text: any,
  builders: { [name: string]: () => TreeNode }
) => {
  const ftn = new FunctionalTreeNode(nav);
  let state: TreeNode = null;
  ftn.setCreator(() => {
    if (state) {
      return state.root();
    }
    const car = new BlockCaret("b");
    const origStyle = car.node().value().blockStyle();
    car
      .node()
      .value()
      .setBlockStyle({
        ...origStyle,
        borderThickness: 6,
        borderColor: origStyle.backgroundColor,
        backgroundColor: new Color(0, 0, 0, 0),
        dashes: [3, 1],
      });
    car.label(text);
    const root = car.root();

    const ac = new ActionCarousel(nav.carousel());
    Object.keys(builders).forEach((name) => {
      const builder = builders[name];
      ac.addAction(name, () => {
        root.disconnectNode();
        const node = builder();
        node.setOnScheduleUpdate(() => {
          ftn.invalidate();
        });
        state = node;
        ac.uninstall();
        ftn.invalidate();
      });
    });

    ac.install(car.root());
    return car.root();
  });
  return ftn;
};

export default abstract class AbstractSpawner extends AbstractTreeList {
  _lastRow: PaintedNode;
  _palette: DefaultBlockPalette;

  constructor(nav: Navport, children: TreeNode[]) {
    super(nav, new BlockTreeNode("u"), children);
    this._palette = new DefaultBlockPalette();
  }

  abstract getDirection(): Direction;

  abstract getPreferredAxis(): PreferredAxis;

  abstract getAlignment(): Alignment;

  getConnectDirection() {
    return turnPositive(this.getDirection());
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
    bud.setLayoutPreference(this.getPreferredAxis());
    this.commandsFor(value).install(bud);
    return bud;
  }

  commandsFor(value: TreeNode) {
    const ac = new ActionCarousel(this.nav().carousel(), this.palette());
    ac.addAction("Delete", () => {
      this.removeChild(value);
    });
    ac.addAction("Append", () => {
      this.insertAfter(this.createNew(), value);
    });
    ac.addAction("Insert", () => {
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
    root.setLayoutPreference(this.getPreferredAxis());
    this.commandsFor(value).install(root);
  }

  _builder: () => TreeNode;

  setBuilder(builder: () => TreeNode) {
    this._builder = builder;
  }

  addBuilders(builders: { [name: string]: () => TreeNode }) {
    this.setBuilder(() => makeProtoBlock(this.nav(), "\u2026", builders));
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
    return this._palette.spawn("u");
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
    bud.pull(this.getConnectDirection());
    // bud.setNodeAlignmentMode(this.getConnectDirection(), this.getAlignment());
    bud.connectNode(this.getConnectDirection(), child);
    const firstBud = this.makeFirstBud(childValue);
    bud.connectNode(reverseDirection(this.getDirection()), firstBud);
    const nextBud = this.makeNextBud(childValue);
    bud.connectNode(this.getDirection(), nextBud);
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
    lastChild.connectNode(this.getDirection(), bud);
    bud.connectNode(this.getConnectDirection(), child);
    // bud.setNodeAlignmentMode(this.getConnectDirection(), this.getAlignment());
    bud.pull(this.getConnectDirection());
    const nextBud = this.makeNextBud(childValue);
    bud.connectNode(this.getDirection(), nextBud);
    this._lastRow = nextBud;
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
