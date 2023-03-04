import TreeNode from "./TreeNode";
import Navport from "parsegraph-viewport";

export default interface TreeList<T = TreeNode> extends TreeNode {
  nav(): Navport;
  clear(): void;
  length(): number;
  childAt(index: number): T;
  appendChild(child: T): void;
  indexOf(child: T): number;
  insertBefore(child: T, ref: T): boolean;
  insertAfter(child: T, ref: T): boolean;
  replaceChild(refChild: T, newChild: T): void;
  removeChild(child: T): boolean;
}
