import { PaintedNode } from "parsegraph-artist";
import Direction from 'parsegraph-direction';
import Navport from "parsegraph-viewport";
import TreeNode from "./TreeNode";
import TreeList from "./TreeList";
import FunctionalTreeNode, { TreeNodeCreator } from "./FunctionalTreeNode";

export default abstract class AbstractTreeList
  extends TreeNode
  implements TreeList
{
  _children: TreeNode[];
  _title: TreeNode;

  abstract connectInitialChild(
    root: PaintedNode,
    child: PaintedNode,
    childValue: TreeNode
  ): PaintedNode;
  abstract connectChild(
    lastChild: PaintedNode,
    child: PaintedNode,
    childValue: TreeNode
  ): PaintedNode;

  constructor(nav: Navport, title: TreeNode, children: TreeNode[]) {
    super(nav);
    if (children) {
      this._children = [...children];
    } else {
      this._children = [];
    }
    this._title = title;
    this.invalidate();
  }

  length(): number {
    return this._children.length;
  }

  checkChild(child: TreeNode) {
    if (child === this) {
      throw new Error("Refusing to add list to itself");
    }
    if (this.indexOf(child) >= 0) {
      throw new Error("Child already contained in this list");
    }
  }

  makeFuncTreeNode(creator: TreeNodeCreator): TreeNode {
    const child = new FunctionalTreeNode(this.nav());
    child.setCreator(creator);
    child.setOnScheduleUpdate(() => this.invalidate());
    return child;
  }

  appendChild(child: TreeNode | TreeNodeCreator) {
    if (typeof child === "function") {
      child = this.makeFuncTreeNode(child);
    }
    this.checkChild(child);
    this._children.push(child);
    child.setOnScheduleUpdate(() => this.invalidate());
    this.invalidate();
  }

  indexOf(child: TreeNode) {
    for (let i = 0; i < this._children.length; ++i) {
      if (this._children[i] === child) {
        return i;
      }
    }
    return -1;
  }

  insertBefore(child: TreeNode | TreeNodeCreator, ref: TreeNode): boolean {
    if (ref == null) {
      if (this.length() > 0) {
        return this.insertBefore(child, this.childAt(0));
      }
      this.appendChild(child);
      return true;
    }
    if (typeof child === "function") {
      child = this.makeFuncTreeNode(child);
    }
    this.checkChild(child);
    const idx = this.indexOf(ref);
    if (idx >= 0) {
      this._children.splice(idx, 0, child);
      child.setOnScheduleUpdate(() => this.invalidate());
      this.invalidate();
    } else {
      throw new Error("Failed to find ref");
    }
    return idx >= 0;
  }

  insertAfter(child: TreeNode | TreeNodeCreator, ref: TreeNode): boolean {
    if (ref == null) {
      this.appendChild(child);
      return true;
    }
    if (typeof child === "function") {
      child = this.makeFuncTreeNode(child);
    }
    this.checkChild(child);
    const idx = this.indexOf(ref);
    if (idx === this.length() - 1) {
      this.appendChild(child);
      return true;
    }
    return this.insertBefore(child, this.childAt(idx + 1));
  }

  removeChild(child: TreeNode) {
    const idx = this.indexOf(child);
    if (idx >= 0) {
      this._children.splice(idx, 1);
      child.setOnScheduleUpdate(null);
      this.invalidate();
    }
    return idx >= 0;
  }

  childAt(index: number) {
    return this._children[index];
  }

  clear(): void {
    while (this.length() > 0) {
      this.removeChild(this.childAt(0));
    }
  }

  connectSpecial(childValue: TreeNode): PaintedNode {
    console.log(`${childValue}, child of ${this}, did not render a value`);
    return null;
  }

  clearNode(rootNode: PaintedNode):void {
    rootNode.disconnectNode(Direction.DOWNWARD);
    rootNode.disconnectNode(Direction.BACKWARD);
    rootNode.disconnectNode(Direction.FORWARD);
  }

  render(): PaintedNode {
    if (this._children.length === 0) {
      this.clearNode(this._title.root());
      return this._title.root();
    }
    let lastChild: PaintedNode = null;
    this._children.forEach((child, i) => {
      const childRoot = child.root();
      if (!childRoot) {
        lastChild = this.connectSpecial(child) || lastChild;
      } else if (i == 0) {
        lastChild = this.connectInitialChild(
          this._title.root(),
          childRoot,
          child
        );
      } else {
        lastChild = this.connectChild(lastChild, childRoot, child);
      }
    });
    return this._title.root();
  }
}
