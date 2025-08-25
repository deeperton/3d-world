import * as Three from 'three';
import { getHeight, getMaxTreeHeight, getNoise, getPath } from './terrain.ts';
import { FREQ_BINS_X, FREQ_BINS_Y } from '../sound/interfaces.ts';

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

let localTrees: Three.Group | null = null;

export function animateTrees(freqData: number[][]) {
  if (!localTrees) return;

  localTrees.children.forEach(tree => {
    const { freqIndexX, freqIndexY, originalY } = tree.userData;
    const volume = freqData[freqIndexX]?.[freqIndexY] || 0;

    tree.position.y = originalY + volume * 5;
  });
}

// Generate multiple trees based on noise
export function generateTrees(size: number, count: number): Three.Group {
  const pathFunc = getPath(); // Дороги у нас без дерев
  const trees = new Three.Group();
  const maxTreeHeight = getMaxTreeHeight(size);
  const noise = getNoise();

  const gridSize = Math.ceil(Math.sqrt(count) * 1.5);

  for (let gridX = 0; gridX < gridSize; gridX++) {
    for (let gridZ = 0; gridZ < gridSize; gridZ++) {
      const baseX = (gridX / gridSize - 0.5) * size;
      const baseZ = (gridZ / gridSize - 0.5) * size;

      const x = baseX;
      const z = baseZ;

      const noiseValue = noise(x * 0.1, z * 0.1);
      const pathZ = pathFunc.pathFunction(x);
      const distanceFromPath = Math.abs(z - pathZ);

      if (distanceFromPath < pathFunc.pathWidth / 1.5) continue;
      if (noiseValue <= 0.2) continue;

      const y = getHeight(x, z);
      if (y >= maxTreeHeight) continue;

      // **Частотні індекси**
      const freqX = Math.floor(((x + size / 2) / size) * FREQ_BINS_X);
      const freqY = Math.floor(((y + maxTreeHeight) / maxTreeHeight) * FREQ_BINS_Y);

      const tree = createTree(x, z);
      tree.userData.freqIndexX = freqX;
      tree.userData.freqIndexY = freqY;
      tree.userData.originalY = tree.position.y; // Запам’ятовуємо початкову висоту

      trees.add(tree);
      if (trees.children.length >= count) return trees;
    }
  }
  localTrees = trees;
  return trees;
}
