import Block, { BlockNode } from "parsegraph-block";
import { DirectionNode } from "parsegraph-direction";
import { DOMContent, DOMContentArtist } from "parsegraph-artist";
import AbstractTreeNode from "./AbstractTreeNode";
import Viewport from "parsegraph-viewport";

const domArtist = new DOMContentArtist();

type TextNodeCallback = (val: string) => Promise<void>;

export default class StringTreeNode extends AbstractTreeNode {
  _callback: TextNodeCallback;

  _text: string;

  constructor(
    nav: Viewport,
    initialText: string = "",
    callback: TextNodeCallback = null
  ) {
    super(nav);

    this.setText(initialText);

    this.setCallback(callback);
  }

  setText(text: string) {
    this._text = text;
    this.invalidate();
  }

  text() {
    return this._text;
  }

  render() {
    const n: DirectionNode<Block | DOMContent> = new BlockNode("b");
    const block = n.value() as Block;

    const text = this.text();
    console.log("Key", text);
    block.setLabel(text);

    const div = document.createElement("div");
    const c = document.createElement("input");
    c.style.pointerEvents = "all";
    c.value = text;

    const returnToView = () => {
      n.setValue(block);
      block.setNode(n as DirectionNode<Block>);
    };

    const commit = () => {
      origValue = c.value;
      returnToView();
    };

    let origValue = text;
    c.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        // Commit
        e.preventDefault();
        if (!this._callback) {
          commit();
          return;
        }
        this._callback(c.value)
          .then(() => {
            commit();
          })
          .catch(() => {});
      } else if (e.key === "Escape") {
        // Cancel
        e.preventDefault();
        c.value = origValue;
        returnToView();
      }
    });
    div.appendChild(c);
    const edit = new DOMContent(() => div);
    edit.setArtist(domArtist);

    block.interact().setClickListener(() => {
      // Replace with DOMContent
      edit.setNode(this as any);
      n.setValue(edit);
      return false;
    });

    return n;
  }

  setCallback(callback: TextNodeCallback) {
    this._callback = callback;
  }
}
