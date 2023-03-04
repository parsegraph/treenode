import TreeNode from "./TreeNode";
import TreeList from "./TreeList";

export default class TreeListGenerator<Node = TreeNode, Item = any> {
  _list: TreeList<Node>;
  _generator: (node: Node, EMPTY: any) => Item;

  constructor() {
    this._list = null;
    this._generator = null;
  }

  setList(list: TreeList<Node>) {
    this._list = list;
  }

  list() {
    return this._list;
  }

  setGenerator(generator: (node: Node, EMPTY: any) => Item) {
    this._generator = generator;
  }

  generate() {
    if (!this.list() || !this._generator) {
      return [];
    }

    const arr: any[] = [];
    const list = this.list();
    for (let i = 0; i < list.length(); ++i) {
      const item = this._generator(list.childAt(i), arr);
      if (item !== arr) {
        arr.push(item);
      }
    }
    return arr;
  }
}
