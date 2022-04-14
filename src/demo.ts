import { Pizza } from "parsegraph-artist";
import { WorldTransform } from "parsegraph-scene";
import { DefaultBlockPalette } from "parsegraph-block";
import { BasicProjector } from "parsegraph-projector";
import TimingBelt from "parsegraph-timingbelt";
import Camera from "parsegraph-camera";
import { showInCamera } from "parsegraph-showincamera";
import BlockTreeNode from "./BlockTreeNode";

const palette = new DefaultBlockPalette();

const buildGraph = () => {
  const block = new BlockTreeNode("b", "Hey its your block");
  return block.render();
};

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("demo");
  root.style.position = "relative";

  const proj = new BasicProjector();
  const belt = new TimingBelt();
  root.appendChild(proj.container());

  setTimeout(() => {
    proj.glProvider().canvas();
    proj.overlay();
    proj.render();
    proj.glProvider().gl().viewport(0, 0, proj.width(), proj.height());
    proj.overlay().resetTransform();
    proj.overlay().translate(proj.width() / 2, proj.height() / 2);
    belt.addRenderable(pizza);
    cam.setSize(proj.width(), proj.height());
    showInCamera(pizza.root(), cam, false);
    const wt = WorldTransform.fromCamera(pizza.root(), cam);
    pizza.setWorldTransform(wt);
  }, 0);

  const pizza = new Pizza(proj);

  const cam = new Camera();
  const n = palette.spawn();
  n.value().setLabel("No time");
  pizza.populate(n);

  const refresh = () => {
    const n = buildGraph();
    pizza.populate(n);
    proj.glProvider().render();
    cam.setSize(proj.width(), proj.height());
    showInCamera(pizza.root(), cam, false);
    proj.overlay().resetTransform();
    proj.overlay().clearRect(0, 0, proj.width(), proj.height());
    proj.overlay().scale(cam.scale(), cam.scale());
    proj.overlay().translate(cam.x(), cam.y());
    const wt = WorldTransform.fromCamera(pizza.root(), cam);
    pizza.setWorldTransform(wt);
    belt.scheduleUpdate();
    const rand = () => Math.floor(Math.random() * 255);
    document.body.style.backgroundColor = `rgb(${rand()}, ${rand()}, ${rand()})`;
  };
  setTimeout(refresh, 0);
});
