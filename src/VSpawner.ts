import {
  Alignment,
  Direction,
  PreferredAxis,
} from "parsegraph-direction";
import AbstractSpawner from "./AbstractSpawner";

export default class VSpawner extends AbstractSpawner {
  getDirection() {
    return Direction.DOWNWARD;
  }

  getAlignment() {
    return Alignment.CENTER;
  }

  getPreferredAxis() {
    return PreferredAxis.HORIZONTAL;
  }
}
