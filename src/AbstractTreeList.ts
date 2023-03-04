import { PaintedNode } from "parsegraph-artist";
import Direction from "parsegraph-direction";
import Navport from "parsegraph-viewport";
import TreeNode from "./TreeNode";
import AbstractTreeNode from "./AbstractTreeNode";
import TreeList from "./TreeList";
import { logEnterc, logLeave, logc, logEnter } from "parsegraph-log";

export default abstract class AbstractTreeList<T extends TreeNode = TreeNode>
  extends AbstractTreeNode
  implements TreeList<T>
{
  _children: T[];
  _title: TreeNode;
  _onRemove: (removed: T)=>void;

  abstract connectInitialChild(
    root: PaintedNode,
    child: PaintedNode,
    childValue: T
  ): PaintedNode;
  abstract connectChild(
    lastChild: PaintedNode,
    child: PaintedNode,
    childValue: T
  ): PaintedNode;

  constructor(nav: Navport, title: TreeNode, children: T[]) {
    super(nav);
    if (children) {
      this._children = [...children];
    } else {
      this._children = [];
    }
    this._title = title;
    this._onRemove = null;
    this.invalidate();
  }

  setOnRemove(onRemove: (removed: T) => void) {
    this._onRemove = onRemove;
  }

  length(): number {
    return this._children.length;
  }

  checkChild(child: any) {
    if (child === this) {
      throw new Error("Refusing to add list to itself");
    }
    if (this.indexOf(child) >= 0) {
      throw new Error("Child already contained in this list");
    }
  }

  appendChild(child: T) {
    logEnterc("Tree operations", "Appending node");
    this.checkChild(child);
    this._children.push(child);
    child.setOnScheduleUpdate(() => this.invalidate());
    this.invalidate();
    logLeave();
  }

  indexOf(child: TreeNode) {
    for (let i = 0; i < this._children.length; ++i) {
      if (this._children[i] === child) {
        return i;
      }
    }
    return -1;
  }

  insertBefore(child: T, ref: T): boolean {
    if (ref == null) {
      if (this.length() > 0) {
        return this.insertBefore(child, this.childAt(0));
      }
      this.appendChild(child);
      return true;
    }
    logEnterc("Tree operations", "Inserting node before ref");
    this.checkChild(child);
    const idx = this.indexOf(ref);
    if (idx >= 0) {
      this._children.splice(idx, 0, child);
      child.setOnScheduleUpdate(() => this.invalidate());
      this.invalidate();
    } else {
      throw new Error("Failed to find ref");
    }
    logLeave();
    return idx >= 0;
  }

  insertAfter(child: T, ref: T): boolean {
    if (ref == null) {
      this.appendChild(child);
      return true;
    }
    this.checkChild(child);
    const idx = this.indexOf(ref);
    if (idx === this.length() - 1) {
      this.appendChild(child);
      return true;
    }
    return this.insertBefore(child, this.childAt(idx + 1));
  }

  replaceChild(refChild: T, newChild: T) {
    const idx = this.indexOf(refChild);
    if (idx < 0) {
      return;
    }
    refChild.setOnScheduleUpdate(null);
    newChild.setOnScheduleUpdate(() => this.invalidate());
    const origChild = this._children[idx];
    this._onRemove?.(origChild);
    this._children[idx] = newChild;
    this.invalidate();
  }

  removeChild(child: T) {
    const idx = this.indexOf(child);
    if (idx >= 0) {
      logc("Tree operations", "Removing child node");
      this._children.splice(idx, 1);
      child.setOnScheduleUpdate(null);
      this.invalidate();
      this._onRemove?.(child);
    }
    return idx >= 0;
  }

  childAt(index: number): T {
    return this._children[index];
  }

  clear(): void {
    while (this.length() > 0) {
      this.removeChild(this.childAt(0));
    }
  }

  connectSpecial(childValue: T): PaintedNode {
    logc(
      "Tree rendering",
      `${childValue}, child of ${this}, did not render a value`
    );
    return null;
  }

  clearNode(rootNode: PaintedNode): void {
    rootNode.disconnectNode(Direction.DOWNWARD);
    rootNode.disconnectNode(Direction.BACKWARD);
    rootNode.disconnectNode(Direction.FORWARD);
  }

  title(): TreeNode {
    return this._title;
  }

  setTitle(title: TreeNode) {
    if (this._title === title) {
      return;
    }
    this._title = title;
    this.invalidate();
  }

  render(): PaintedNode {
    logc(
      "Tree rendering",
      "Rendering tree list of size " + this._children.length
    );
    this.clearNode(this.title().root());
    let lastChild: PaintedNode = null;
    this._children.forEach((child, i) => {
      const childRoot = child.root();
      if (!childRoot) {
        lastChild = this.connectSpecial(child) || lastChild;
      } else if (i == 0) {
        lastChild = this.connectInitialChild(
          this.title().root(),
          childRoot,
          child
        );
      } else {
        lastChild = this.connectChild(lastChild, childRoot, child);
      }
    });
    return this.title().root();
  }
}
