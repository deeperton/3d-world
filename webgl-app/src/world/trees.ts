import * as Three from 'three';
import { getHeight, getMaxTreeHeight, getNoise, getPath } from './terrain.ts';
import { FREQ_BINS_X, FREQ_BINS_Y } from '../sound/interfaces.ts';

function cone() {
  return new Three.ConeGeometry(1.5, 3, 8);
}

function cylinder() {
  return new Three.CylinderGeometry(0.5, 0.8, 2);
}

function sphere() {
  return new Three.SphereGeometry(1.5, 8, 8);
}

function dodecahedron() {
  return new Three.DodecahedronGeometry(1.5, 1);
}

const treeShapes = [cone, cylinder, sphere, dodecahedron];

// Function to randomly select a tree shape
function getRandomTreeShape(x: number, y: number) {
  const randomIndex = Math.floor(getNoise()(x * 0.1, y * 0.1) * treeShapes.length) % treeShapes.length;
  return treeShapes[randomIndex]();
}

// Create a single tree
function createTree(x: number, z: number): Three.Group {
  const tree = new Three.Group();

  // Trunk
  const trunkGeometry = new Three.CylinderGeometry(0.3, 0.3, 2);
  const trunkMaterial = new Three.MeshStandardMaterial({
    color: 0x8B5A2B,
    metalness: 0.1,
    roughness: 0.8
  });
  const trunk = new Three.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.set(0, 1.0, 0);
  tree.add(trunk);

  // Leaves (glass effect)
  const leavesGeometry = getRandomTreeShape(x, z);
  const leavesMaterial = new Three.MeshPhysicalMaterial({
    color: 0x88e1f2,
    transparent: true,
    opacity: 0.5,
    roughness: 0,
    transmission: 1,
    thickness: 0.5,
    metalness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0
  });
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
  const pathFunc = getPath();
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

      // Calculate frequency indices based on tree position
      const freqX = Math.floor(((x + size / 2) / size) * FREQ_BINS_X);
      const freqY = Math.floor(((y + maxTreeHeight) / maxTreeHeight) * FREQ_BINS_Y);

      const tree = createTree(x, z);
      tree.userData.freqIndexX = freqX;
      tree.userData.freqIndexY = freqY;
      tree.userData.originalY = tree.position.y;

      trees.add(tree);
      if (trees.children.length >= count) return trees;
    }
  }
  localTrees = trees;
  return trees;
}
