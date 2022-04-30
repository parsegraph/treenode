import { BasicProjector } from "parsegraph-projector";
import TimingBelt from "parsegraph-timingbelt";
import BlockTreeNode from "./BlockTreeNode";
// import TreeLabel from "./TreeLabel";
// import WrappingTreeList from "./WrappingTreeList";
// import InlineTreeList from "./InlineTreeList";
import Navport, { renderFullscreen } from "parsegraph-viewport";
import { Projection } from "parsegraph-projector";
// import BasicTreeList from "./BasicTreeList";
// import Multislot from "./Multislot";
import Spawner from "./Spawner";
import Color from "parsegraph-color";

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
  const root = buildGraph();
  const topElem = document.getElementById("demo");
  renderFullscreen(topElem, root, new Color(0, 0, 0, 1));
});
