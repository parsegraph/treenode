import { Alignment, Direction, PreferredAxis } from "parsegraph-direction";
import AbstractSpawner from "./AbstractSpawner";

export default class Spawner extends AbstractSpawner {
  getDirection() {
    return Direction.FORWARD;
  }

  getAlignment() {
    return Alignment.CENTER;
  }

  getPreferredAxis() {
    return PreferredAxis.VERTICAL;
  }
}
