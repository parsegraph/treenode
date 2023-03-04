import Navport, { render } from "parsegraph-viewport";
import Direction from "parsegraph-direction";
import Color from "parsegraph-color";
import VSpawner from "./VSpawner";
import InlineSpawner from "./InlineSpawner";
import { BlockCaret } from "parsegraph-block";
import TreeNode from "./TreeNode";
import FunctionalTreeNode from "./FunctionalTreeNode";
import { ActionCarousel } from "parsegraph-viewport";
import { BasicProjector } from "parsegraph-projector";
import { AbstractScene } from "parsegraph-scene";
import TimingBelt from "parsegraph-timingbelt";
import InlineTreeList from "./InlineTreeList";
import BlockTreeNode from "./BlockTreeNode";
import { BlockNode } from "parsegraph-block";

import WrappingTreeList from "./WrappingTreeList";
import {StemBlock} from "./AbstractSpawner";
import TreeList from "./TreeList";
import TreeListGenerator from "./TreeListGenerator";
import AbstractTreeNode from "./AbstractTreeNode";
import StringTreeNode from "./StringTreeNode";

const LOCAL_STORAGE_KEY = "parsegraph-treenode-json";

const makeProtoBlock = (nav:Navport, onBuild: (val: JSONTreeNode | StemBlock<JSONTreeNode>, orig: StemBlock<JSONTreeNode>)=>void, onDelete?: (node: JSONTreeNode | StemBlock<JSONTreeNode>)=>void) => {
  const builders: { [name: string]: (node: JSONTreeNode) => (JSONTreeNode | null) } = {
    "Object": () => new JSONObjectNode(nav),
    "Value": () => new JSONValueNode(nav, "Value"),
    "Array": () => new JSONArrayNode(nav),
  };
  if (onDelete) {
    builders["Delete"] = (node: JSONTreeNode) => {
      onDelete(node);
      return null;
    };
  }
  return new StemBlock<JSONTreeNode>(nav, onBuild, builders);
}

abstract class JSONTreeNode extends AbstractTreeNode {
  abstract toJSON(): any;
}

class JSONObjectNode extends JSONTreeNode {
  _keys: InlineSpawner<JSONObjectEntryNode>;

  constructor(nav: Navport) {
    super(nav);
    this._keys = new InlineSpawner(nav, []);
    this._keys.setOnScheduleUpdate(()=>this.invalidate());
    this._keys.setBuilder(() => new JSONObjectEntryNode(nav, this._keys));
  }

  keys() {
    return this._keys;
  }

  render() {
    return this._keys.root();
  }

  toJSON() {
    const obj: { [key: string]: any } = {};
    for(let i = 0; i < this._keys.length(); ++i) {
      const entry = this._keys.childAt(i);
      if (entry instanceof StemBlock) {
        continue;
      }
      obj[entry.key()] = entry.value();
    }
    return obj;
  }
}

class JSONObjectEntryNode extends AbstractTreeNode {
  _list: TreeList<StemBlock<JSONObjectEntryNode> | JSONObjectEntryNode>;
  _keyBlock: StringTreeNode;
  _valueBlock: StemBlock<JSONTreeNode> | JSONTreeNode;
  _keyName: string;

  constructor(nav: Navport, list: TreeList<JSONObjectEntryNode | StemBlock<JSONObjectEntryNode>>) {
    super(nav);
    this._list = list;
    this._keyName = "Key";
    this._keyBlock = new StringTreeNode(nav, this._keyName, async (val: string) =>{
      this._keyName = val;
    });
    this._valueBlock = makeProtoBlock(nav, (val)=>{
      this.setValue(val);
    });

    this._keyBlock.setOnScheduleUpdate(() => this.invalidate());
    this._valueBlock.setOnScheduleUpdate(() => this.invalidate());
  }

  render() {
    const bc = new BlockCaret("u");
    const ac = new ActionCarousel(this.nav().carousel());
    ac.addAction("Delete", ()=>this._list.removeChild(this));
    ac.install(bc.root());
    bc.connect("b", this._keyBlock.root());
    bc.connect("f", this._valueBlock.root());
    return bc.root();
  }

  key() {
    return this._keyName;
  }

  setKey(key: string) {
    if (this._keyName === key) {
      return;
    }
    this._keyName = key;
    this._keyBlock.setText(key);
    this.invalidate();
  }

  setValue(val: JSONTreeNode | StemBlock<JSONTreeNode>) {
    if (val === this._valueBlock) {
      return;
    }
    this._valueBlock.setOnScheduleUpdate(null);
    val.setOnScheduleUpdate(() => this.invalidate());
    this._valueBlock = val;
    this.invalidate();
  }

  value(): JSONTreeNode {
    if (this._valueBlock instanceof StemBlock) {
      return undefined;
    }
    return this._valueBlock.toJSON();
  }
}

/*const makeProtoBlock = (
  nav: Navport,
  onDelete?: () => void,
  extraActions: { [name: string]: (nav: Navport) => TreeNode } = null
) => {
  const ftn = new FunctionalTreeNode(nav);
  let state: TreeNode = null;
  ftn.setCreator(() => {
    if (state) {
      return state.root();
    }
    const car = new BlockCaret("b");
    const style = car.node().value().blockStyle();
    car
      .node()
      .value()
      .setBlockStyle({
        ...style,
        borderColor: style.backgroundColor,
        backgroundColor: new Color(0, 0, 0, 0),
        fontColor: new Color(1, 1, 1, 1),
        borderThickness: 6,
        dashes: [3, 1],
      });

    car.label("\u2026");
    const root = car.root();

    const ac = new ActionCarousel(nav.carousel());
    ac.addAction("Object", () => {
      root.disconnectNode();

      const list = objectNode(nav);
      list.setOnScheduleUpdate(() => {
        ftn.invalidate();
      });
      state = list;
      ac.uninstall();
      ftn.invalidate();
    });
    ac.addAction("Value", () => {
      root.disconnectNode();
      state = makeBlock(nav, "Value");
      state.setOnScheduleUpdate(() => ftn.invalidate());
      ac.uninstall();
      ftn.invalidate();
    });
    ac.addAction("Array", () => {
      root.disconnectNode();
      state = makeArray(nav);
      state.setOnScheduleUpdate(() => ftn.invalidate());
      ac.uninstall();
      ftn.invalidate();
    });
    if (onDelete) {
      ac.addAction("Delete", onDelete);
    }
    if (extraActions) {
      Object.keys(extraActions).forEach((name) => {
        const creator = extraActions[name];
        ac.addAction(name, () => {
          state = creator(nav);
          state.setOnScheduleUpdate(() => ftn.invalidate());
          ac.uninstall();
          ftn.invalidate();
        });
      });
    }

    ac.install(car.root());
    return car.root();
  });
  return ftn;
};*/

class JSONArrayNode extends JSONTreeNode {
  _list: InlineSpawner<JSONTreeNode>;

  constructor(nav: Navport) {
    super(nav);
    this._list = new InlineSpawner(nav, []);
    this._list.setDirection(Direction.FORWARD);
    this._list.setOnScheduleUpdate(()=>this.invalidate());
    this._list.setBuilder(() => makeProtoBlock(nav, (val, orig)=>this._list.replaceChild(orig, val), (node)=>this._list.removeChild(node)));
  }

  list() {
    return this._list;
  }

  render() {
    return this._list.root();
  }

  toJSON() {
    const gen = new TreeListGenerator<any, JSONTreeNode | StemBlock<JSONTreeNode>>();
    gen.setList(this._list);

    gen.setGenerator((node, EMPTY)=>{
      if (node instanceof StemBlock) {
        return EMPTY;
      }
      return node.toJSON();
    });
    return gen.generate();
  }
}

class JSONValueNode extends JSONTreeNode {
  _val: string | number | boolean | null;

  constructor(nav: Navport, val: string | number | boolean | null) {
    super(nav);
    this._val = val;
  }

  toJSON() {
    return this._val;
  }

  render() {
    const car = new BlockCaret("b");
    const val = this.toJSON();
    if (val === null) {
      car.label('null');
    } else {
      car.label(this.toJSON().toString());
    }

    const ac = new ActionCarousel(this.nav().carousel());

    ac.install(car.root());
    return car.root();
  }
}

const buildGraph = (nav: Navport) => {
  const list = new VSpawner<JSONTreeNode>(nav, []);
  list.setBuilders({
    "Object": () => new JSONObjectNode(nav),
    "Value": () => new JSONValueNode(nav, "Value"),
    "Array": () => new JSONArrayNode(nav),
    "Delete": (node: JSONTreeNode) => {
      list.removeChild(node);
      return null;
    }
  });
  return list;
};

class Overlay extends AbstractScene {
  _nav: Navport;
  constructor(proj: BasicProjector, nav: Navport) {
    super(proj);
    this._nav = nav;
  }

  render() {
    const ctx = this.projector().overlay();
    ctx.resetTransform();
    const fontSize = Math.round(20 / window.visualViewport.scale);
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textBaseline = "top";
    ctx.fillStyle = "black";
    const proj = this.projector();
    const lineHeight = fontSize * 1.1;
    ctx.fillText(
      `proj=${proj.width()}x${proj.height()} container=${
        proj.container().clientWidth
      }x${proj.container().clientHeight}`,
      0,
      0
    );
    const cam = this._nav.camera();
    ctx.fillText(`cam x=${cam.x()}x${cam.y()}`, 0, lineHeight);
    ctx.fillText(`cam scale=${cam.scale()}`, 0, 2 * lineHeight);
    ctx.fillText(`doc=${document.body.clientWidth}`, 0, 3 * lineHeight);
    ctx.fillText(`vvp scale=${window.visualViewport.scale}`, 0, 4 * lineHeight);
    return false;
  }
}

const generate = (nav: Navport, item: any)=>{
  if (Array.isArray(item)) {
    const node = new JSONArrayNode(nav);
    item.forEach(subItem => node.list().appendChild(generate(nav, subItem)));
    return node;
  }
  if (typeof item === "object") {
    const node = new JSONObjectNode(nav);
    Object.keys(item).forEach(key => {
      const entry = new JSONObjectEntryNode(nav, node.keys());
      entry.setKey(key);
      entry.setValue(generate(nav, item[key]));
      node.keys().appendChild(entry);
    });
    return node;
  }
  return new JSONValueNode(nav, item);
};

document.addEventListener("DOMContentLoaded", () => {
  const nav = new Navport(null);

  const rootNode = buildGraph(nav);
  try {
    JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)).forEach((item: any) => {
      rootNode.appendChild(generate(nav, item));
    });
  } catch(ex) {
    console.log(ex);
  }

  rootNode.setOnScheduleUpdate(() => {
    nav.setRoot(rootNode.root());
    console.log(
       "PGs",
       rootNode
         .root()
         .paintGroup()
         .dump()
         .map((pg) => pg.id())
         .join(", ")
     );
     console.log("PG next", rootNode.root().paintGroup().next());
     console.log("PG prev", rootNode.root().paintGroup().prev());

    nav.scheduleRepaint();
    console.log("creating", rootNode.length());
    const gen = new TreeListGenerator<JSONTreeNode | StemBlock<JSONTreeNode>>();
    gen.setList(rootNode);
    gen.setGenerator((node, EMPTY) => {
      if (node instanceof StemBlock) {
        return EMPTY;
      }
      return node.toJSON();
    });
    const created = gen.generate();
    console.log("generated", created);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(created));
    console.log("done");
  });
  nav.setRoot(rootNode.root());
  /* nav.carousel().setCarouselSize(
    nav.carousel()._carouselSize /
    window.visualViewport.scale
  );*/

  const proj = new BasicProjector();
  const belt = new TimingBelt();
  setTimeout(() => {
    nav.showInCamera(rootNode.root());
    const dpi = window.visualViewport.scale;
    nav.camera().setScale(1 / dpi);
    nav.camera().setOrigin((dpi * proj.width()) / 2, (dpi * proj.height()) / 2);
    nav.scheduleRender();
  }, 100);
  render(document.getElementById("demo"), nav, proj, belt);
  belt.addRenderable(new Overlay(proj, nav));
});
