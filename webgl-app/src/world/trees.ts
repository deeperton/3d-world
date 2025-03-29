import * as Three from 'three';
import { getHeight, getMaxTreeHeight, getNoise } from './terrain.ts';

// Create a single tree
function createTree(x: number, z: number): Three.Group {
  const tree = new Three.Group();

  // Tree trunk
  const trunkGeometry = new Three.CylinderGeometry(0.3, 0.3, 3);
  const trunkMaterial = new Three.MeshStandardMaterial({ color: 0x8B5A2B });
  const trunk = new Three.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.set(0, 1.5, 0);
  tree.add(trunk);

  // Tree leaves
  const leavesGeometry = new Three.ConeGeometry(1.5, 3, 8);
  const leavesMaterial = new Three.MeshStandardMaterial({ color: 0x228B22 });
  const leaves = new Three.Mesh(leavesGeometry, leavesMaterial);
  leaves.position.set(0, 3, 0);
  tree.add(leaves);

  // Position the tree at the correct height
  const y = getHeight(x, z);
  tree.position.set(x, y, z);

  return tree;
}



// Generate multiple trees
export function generateTrees(size: number, count: number): Three.Group {
  const trees = new Three.Group();
  const maxTreeHeight = getMaxTreeHeight(size);

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * size;
    const z = (Math.random() - 0.5) * size;
    const y = getHeight(x, z);

    if (y < maxTreeHeight) {
      trees.add(createTree(x, z));
    }
  }

  return trees;
}
