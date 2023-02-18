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

const objKey = (nav: Navport) => {
  const keyBlock = makeBlock(nav, "Key");
  const valueBlock = makeProtoBlock(nav, "");
  const ftn = new FunctionalTreeNode(nav);
  keyBlock.setOnScheduleUpdate(() => ftn.invalidate());
  valueBlock.setOnScheduleUpdate(() => ftn.invalidate());
  ftn.setCreator(() => {
    const bc = new BlockCaret("u");
    bc.connect("b", keyBlock.root());
    bc.connect("f", valueBlock.root());
    return bc.root();
  });
  return ftn;
};

const objectNode = (nav: Navport) => {
  const list = new InlineSpawner(nav, []);
  list.setBuilder(()=>{
    return objKey(nav);
  });
  return list;
};

const makeProtoBlock = (
  nav: Navport,
  text: any,
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
      state = makeWrappingTreeList(nav);
      state.setOnScheduleUpdate(() => ftn.invalidate());
      ac.uninstall();
      ftn.invalidate();
    });
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
};

const makeWrappingTreeList = (nav: Navport) => {
  const title = new FunctionalTreeNode(nav);
  const list = new WrappingTreeList(nav, title, []);

  const newBlock = () => {
    const block = makeProtoBlock(nav, list.length(), {
      Newline: () => list.getNewline(),
    });
    block.setOnScheduleUpdate(() => list.invalidate());
    return block;
  };
  list.appendChild(newBlock());

  title.setCreator(() => {
    const car = new BlockCaret("s");
    const ac = new ActionCarousel(nav.carousel());
    ac.addAction("Append", () => {
      list.appendChild(newBlock());
    });
    ac.addAction("Insert", () => {
      if (list.length() === 0) {
        list.appendChild(newBlock());
      } else {
        list.insertBefore(newBlock(), list.childAt(0));
      }
    });
    ac.addAction("Pop", () => {
      if (list.length() === 0) {
        return;
      }
      list.removeChild(list.childAt(list.length() - 1));
    });
    ac.addAction("Shift", () => {
      if (list.length() === 0) {
        return;
      }
      list.removeChild(list.childAt(0));
    });

    ac.install(car.root());
    return car.root();
  });
  return list;
};

const makeBlock = (nav: Navport, text: any) => {
  const block = new FunctionalTreeNode(nav);
  block.setCreator(() => {
    const car = new BlockCaret("b");
    car.label(text);

    const ac = new ActionCarousel(nav.carousel());
    ac.addAction("Edit", () => {
      nav.web().show("/edit");
    });

    ac.install(car.root());
    return car.root();
  });
  return block;
};

const buildGraph = (nav: Navport): TreeNode => {
  const list = new VSpawner(nav, []);
  list.setBuilder(() => makeProtoBlock(nav, list.length()));
  list.setOnScheduleUpdate(() => nav.scheduleRepaint());
  /* for (let i = 0; i < 1; ++i) {
    list.appendChild(makeProtoBlock(nav, i + 1));
  }*/
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

document.addEventListener("DOMContentLoaded", () => {
  const nav = new Navport(null);
  const rootNode = buildGraph(nav);
  rootNode.setOnScheduleUpdate(() => {
    nav.setRoot(rootNode.root());
    nav.scheduleRepaint();
    console.log("REPAINT");
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
