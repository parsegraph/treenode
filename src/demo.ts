import Direction from "parsegraph-direction";
import Navport, { render } from "parsegraph-viewport";
import HSpawner from "./HSpawner";
import VSpawner from "./VSpawner";
import { BlockCaret } from "parsegraph-block";
import TreeNode from "./TreeNode";
import FunctionalTreeNode from "./FunctionalTreeNode";
import { ActionCarousel } from "parsegraph-viewport";
import BlockTreeNode from "./BlockTreeNode";
import { BasicProjector } from "parsegraph-projector";
import { AbstractScene } from "parsegraph-scene";
import TimingBelt from "parsegraph-timingbelt";
import { showInCamera } from "parsegraph-showincamera";
import Turn from "./Turn";

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
  const hSpawner = (turn: boolean) => () => {
    const list = new HSpawner(nav, []);
    list.addBuilders({
      ...builders,
      HSpawner: hSpawner(false),
      VSpawner: vSpawner(true),
    });
    list.appendChild(list.createNew());
    return turn ? new Turn(Direction.DOWNWARD, list) : list;
  };
  const vSpawner = (turn: boolean) => () => {
    const list = new VSpawner(nav, []);
    list.addBuilders({
      ...builders,
      HSpawner: hSpawner(true),
      VSpawner: vSpawner(false),
    });
    list.appendChild(list.createNew());
    return turn ? new Turn(Direction.FORWARD, list) : list;
  };
  const builders = {
    "Create Label": () => {
      return makeBlock(nav, null, "Hey its a label");
    },
  };

  const list = hSpawner(false)();
  list.setOnScheduleUpdate(() => nav.scheduleRepaint());
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
