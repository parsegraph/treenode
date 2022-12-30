import Navport, { render } from "parsegraph-viewport";
import Spawner from "./Spawner";
import { BlockCaret } from "parsegraph-block";
import TreeNode from "./TreeNode";
import FunctionalTreeNode from "./FunctionalTreeNode";
import { ActionCarousel } from "parsegraph-viewport";
import BlockTreeNode from "./BlockTreeNode";

const makeProtoBlock = (nav: Navport, list: Spawner, text: any) => {
  const ftn = new FunctionalTreeNode(nav);
  let state:TreeNode = null;
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
      list.setOnScheduleUpdate(()=>{
        ftn.invalidate();
      });
      state = list;
      ac.uninstall();
      ftn.invalidate();
    });
    ac.addAction("Create Label", () => {
      root.disconnectNode();
      state = makeBlock(nav, null, "Hey its a label");
      state.setOnScheduleUpdate(()=>ftn.invalidate());
      ac.uninstall();
      ftn.invalidate();
    });

    ac.install(car.root());
    return car.root();
  });
  return ftn;
};

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
  for (let i = 0; i < 1; ++i) {
    list.appendChild(makeProtoBlock(nav, list, i + 1));
  }
  return list;
};

document.addEventListener("DOMContentLoaded", () => {
  const nav = new Navport(null);
  const rootNode = buildGraph(nav);
  rootNode.setOnScheduleUpdate(() => {
    nav.setRoot(rootNode.root());
    nav.scheduleRepaint();
    console.log("REPAINT");
  });
  nav.setRoot(rootNode.root());
  setTimeout(()=>{
    nav.showInCamera(rootNode.root());
  }, 0);
  return render(document.getElementById("demo"), nav);
});
