import { PaintedNode } from "parsegraph-artist";
import Navport from "parsegraph-viewport";
import { logEnterc, logLeave } from "parsegraph-log";

export type ScheduleUpdateCallback = () => void;
export default abstract class TreeNode {
  _root: PaintedNode;
  _needsUpdate: boolean;
  _onScheduleUpdate: ScheduleUpdateCallback;

  _nav: Navport;

  nav() {
    return this._nav;
  }

  setNav(nav: Navport) {
    this._nav = nav;
    this.invalidate();
  }

  constructor(nav: Navport) {
    this._nav = nav;
    this._needsUpdate = true;
    this._onScheduleUpdate = null;
    this._root = null;
  }

  abstract render(): PaintedNode;

  root(): PaintedNode {
    if (this.needsUpdate()) {
      this._root = this.render();
      this._needsUpdate = false;
    }
    return this._root;
  }

  invalidate() {
    if (this.needsUpdate()) {
      return;
    }
    logEnterc("Schedule updates", "Tree node needs update");
    this._needsUpdate = true;
    if (this._onScheduleUpdate) {
      this._onScheduleUpdate();
    }
    logLeave();
  }

  needsUpdate(): boolean {
    return this._needsUpdate;
  }

  setOnScheduleUpdate(callback: () => void): void {
    this._onScheduleUpdate = callback;
  }
}
