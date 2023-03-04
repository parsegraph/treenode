import { assert } from "chai";
import Navport from 'parsegraph-viewport';
import TreeNode, { BlockTreeNode, VSpawner } from "../src/index";

describe("VSpawner", function () {
  const nav = new Navport();

  it("can be constructed", () => {
    assert.isOk(new VSpawner(nav, []));
  });

  it("can add and remove nodes", () => {
    const spawner = new VSpawner(nav, []);

    let removed: TreeNode;
    spawner.setOnRemove((node)=>{
      removed = node;
    });

    const block = new BlockTreeNode();
    spawner.appendChild(block);
    spawner.removeChild(block);
    assert.equal(removed, block);

    const block2 = new BlockTreeNode();
    spawner.appendChild(block2);
    spawner.removeChild(block2);
    assert.equal(removed, block2);

    spawner.setOnRemove(null);
    spawner.appendChild(block);
    spawner.removeChild(block);
    assert.equal(removed, block2);
  });

  it("can replace nodes", () => {
    const spawner = new VSpawner(nav, []);

    let removed: TreeNode;
    spawner.setOnRemove((node)=>{
      removed = node;
    });

    const block = new BlockTreeNode();
    spawner.appendChild(block);
    const block2 = new BlockTreeNode();
    spawner.replaceChild(block, block2);
    assert.equal(removed, block);
  });
});
