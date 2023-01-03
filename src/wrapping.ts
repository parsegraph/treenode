import Navport, { render } from "parsegraph-viewport";
import Spawner from "./Spawner";
import { BlockCaret } from "parsegraph-block";
import TreeNode from "./TreeNode";
import FunctionalTreeNode from "./FunctionalTreeNode";
import { ActionCarousel } from "parsegraph-viewport";
import BlockTreeNode from "./BlockTreeNode";
import {BasicProjector} from 'parsegraph-projector';
import {AbstractScene} from 'parsegraph-scene';
import TimingBelt from 'parsegraph-timingbelt';
import {showInCamera} from 'parsegraph-showincamera';

import WrappingTreeList from './WrappingTreeList';

const makeProtoBlock = (nav: Navport, list: Spawner, text: any) => {
  const ftn = new FunctionalTreeNode(nav);
  let state: TreeNode = null;
  ftn.setCreator(() => {
    if (state) {
      return state.root();
    }
    const car = new BlockCaret("b");
    car.label(text);
    const root = car.root();

    const ac = new ActionCarousel(nav.carousel());
    ac.addAction("Spawner", () => {
      root.disconnectNode();
      const list = new Spawner(nav, []);
      list.setBuilder(() => makeProtoBlock(nav, list, list.length()));
      for (let i = 0; i < 1; ++i) {
        list.appendChild(makeProtoBlock(nav, list, i + 1));
      }
      list.setOnScheduleUpdate(() => {
        ftn.invalidate();
      });
      state = list;
      ac.uninstall();
      ftn.invalidate();
    });
    ac.addAction("Create Label", () => {
      root.disconnectNode();
      state = makeBlock(nav, null, "Hey its a label");
      state.setOnScheduleUpdate(() => ftn.invalidate());
      ac.uninstall();
      ftn.invalidate();
    });
    ac.addAction("Create Wrapping Tree List", () => {
      root.disconnectNode();
      state = makeWrappingTreeList(nav);
      state.setOnScheduleUpdate(() => ftn.invalidate());
      ac.uninstall();
      ftn.invalidate();
    });

    ac.install(car.root());
    return car.root();
  });
  return ftn;
};

const makeWrappingTreeList = (nav: Navport) => {
  const list = new WrappingTreeList(nav, new BlockTreeNode("b", "WrappingTreeList"), []);
  return list;
}

const makeBlock = (nav: Navport, list: Spawner, text: any) => {
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
  const list = new Spawner(nav, []);
  list.setBuilder(() => makeProtoBlock(nav, list, list.length()));
  list.setOnScheduleUpdate(() => nav.scheduleRepaint());
  /*for (let i = 0; i < 1; ++i) {
    list.appendChild(makeProtoBlock(nav, list, i + 1));
  }*/
  return list;
};

class Overlay extends AbstractScene {
  _nav: Navport;
  constructor(proj: BasicProjector, nav:Navport) {
    super(proj);
    this._nav = nav;
  }

  render() {
    const ctx = this.projector().overlay();
    ctx.resetTransform();
    const fontSize = Math.round(20/window.visualViewport.scale);
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'black';
    const proj = this.projector();
    const lineHeight = fontSize * 1.1;
    ctx.fillText(`proj=${proj.width()}x${proj.height()} container=${proj.container().clientWidth}x${proj.container().clientHeight}`, 0, 0);
    const cam = this._nav.camera();
    ctx.fillText(`cam x=${cam.x()}x${cam.y()}`, 0, lineHeight);
    ctx.fillText(`cam scale=${cam.scale()}`, 0, 2*lineHeight);
    ctx.fillText(`doc=${document.body.clientWidth}`, 0, 3*lineHeight);
    ctx.fillText(`vvp scale=${window.visualViewport.scale}`, 0, 4*lineHeight);
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
  /*nav.carousel().setCarouselSize(
    nav.carousel()._carouselSize /
    window.visualViewport.scale
  );*/

  const proj = new BasicProjector();
  const belt = new TimingBelt();
  setTimeout(() => {
    nav.showInCamera(rootNode.root());
    const dpi = window.visualViewport.scale;
    nav.camera().setScale(1/dpi);
    nav.camera().setOrigin(dpi*proj.width()/2, dpi*proj.height()/2);
    nav.scheduleRender();
  }, 100);
  render(document.getElementById("demo"), nav, proj, belt);
  belt.addRenderable(new Overlay(proj, nav));
});
