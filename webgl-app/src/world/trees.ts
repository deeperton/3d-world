import * as Three from 'three';
import { getHeight, getMaxTreeHeight, getNoise, getPath } from './terrain.ts';

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

// Generate multiple trees based on noise
export function generateTrees(size: number, count: number): Three.Group {
  const pathFunc = getPath(); // Get the current path function, on the path we don't place trees
  const trees = new Three.Group();
  const maxTreeHeight = getMaxTreeHeight(size);
  const noise = getNoise();

  // Number of grid cells (more cells = more precise placement)
  const gridSize = Math.ceil(Math.sqrt(count) * 1.5);
  // const cellSize = size / gridSize;

  // Create a grid for potential tree positions
  for (let gridX = 0; gridX < gridSize; gridX++) {
    for (let gridZ = 0; gridZ < gridSize; gridZ++) {
      // Convert grid position to world coordinates
      const baseX = (gridX / gridSize - 0.5) * size;
      const baseZ = (gridZ / gridSize - 0.5) * size;

      // Add some variety within the cell
      const jitterX = 0;//(Math.random() - 0.5) * cellSize * 0.8;
      const jitterZ = 0;//(Math.random() - 0.5) * cellSize * 0.8;

      const x = baseX + jitterX;
      const z = baseZ + jitterZ;

      // Use noise to determine if we place a tree here
      // Scale the coordinates for the noise function
      const noiseValue = noise(x * 0.1, z * 0.1);

      // Calculate the z-position of the path at this x-coordinate
      const pathZ = pathFunc.pathFunction(x);
      // Calculate distance from the path center
      const distanceFromPath = Math.abs(z - pathZ);
      // If inside the path, we don't place a tree
      if (distanceFromPath < pathFunc.pathWidth / 1.5) {
        continue;
      }

      // Only place trees where noise value is positive (creates natural clusters)
      if (noiseValue > 0.2) {
        const y = getHeight(x, z);

        // Only place trees below the maximum tree height
        if (y < maxTreeHeight) {
          trees.add(createTree(x, z));
        }
      }

      // Exit if we've placed enough trees
      if (trees.children.length >= count) {
        return trees;
      }
    }
  }

  return trees;
}
