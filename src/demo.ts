import { BasicProjector } from "parsegraph-projector";
import TimingBelt from "parsegraph-timingbelt";
import BlockTreeNode from "./BlockTreeNode";
// import TreeLabel from "./TreeLabel";
// import WrappingTreeList from "./WrappingTreeList";
// import InlineTreeList from "./InlineTreeList";
import { Viewport } from "parsegraph-graphpainter";
import { Projection } from "parsegraph-projector";
// import BasicTreeList from "./BasicTreeList";
// import Multislot from "./Multislot";
import Spawner from "./Spawner";

const buildGraph = () => {
  const list = new Spawner([]);
  // const list = new BasicTreeList(block, []);
  // const list = new InlineTreeList(block, []);
  for (let i = 0; i < 10; ++i) {
    list.appendChild(new BlockTreeNode("b", "" + (1 + i)));
  }
  return list.render();
};

document.addEventListener("DOMContentLoaded", () => {
  const belt = new TimingBelt();
  const root = buildGraph();
  const comp = new Viewport(root);
  root.value().setOnScheduleUpdate(() => comp.scheduleUpdate());
  // const freezer = new Freezer();
  // root.value().getCache().freeze(freezer);

  document.body.addEventListener("resize", () => {
    belt.scheduleUpdate();
  });

  const topElem = document.getElementById("demo");

  const projector = new BasicProjector();
  projector.glProvider().container();
  projector.overlay();
  topElem.appendChild(projector.container());
  projector.container().style.position = "absolute";
  const proj = new Projection(projector, comp);
  belt.addRenderable(proj);
});
