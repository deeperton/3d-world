import * as THREE from 'three';

export class Firework {
  mesh: THREE.Points;
  velocity: THREE.Vector3;
  velocityVertical: THREE.Vector3;
  exploded = false;
  particles: THREE.Points[] = [];
  lifespan = 1.5;
  time = 0;

  constructor(position: THREE.Vector3) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([0, 0, 0]);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffff00,
      size: 0.3,
      sizeAttenuation: true,
    });

    this.mesh = new THREE.Points(geometry, material);
    this.mesh.position.copy(position);
    this.velocity = new THREE.Vector3(0, 0.4 + Math.random() * 0.2, 0);
    this.velocityVertical = new THREE.Vector3(0, 8.4 + Math.random() * 0.2, 0);
  }

  update(delta: number, scene: THREE.Scene) {
    this.time += delta;

    if (!this.exploded) {
      this.mesh.position.addScaledVector(this.velocityVertical, delta);
      if (this.time > this.lifespan) {
        this.exploded = true;
        scene.remove(this.mesh);
        this.explode(scene);
      }
    } else {
      for (const p of this.particles) {
        p.userData.time += delta;
        p.position.addScaledVector(p.userData.velocity, delta);
        const mat = p.material as THREE.PointsMaterial;
        mat.opacity = 1.0 - p.userData.time / 2.0;
        if (p.userData.time > 2.0) {
          scene.remove(p);
        }
      }
    }
  }

  explode(scene: THREE.Scene) {
    const count = Math.round(Math.random() * 100 + 50);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: Math.random() * 0xffffff,
      size: 0.2,
      transparent: true,
      opacity: 1.0,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    points.position.copy(this.mesh.position);
    points.userData = {
      velocity: [],
      time: 0
    };

    for (let i = 0; i < count; i++) {
      const v = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      );
      v.multiplyScalar(2.0);
      const clone = points.clone();
      clone.userData = {
        velocity: v,
        time: 0
      };
      clone.position.copy(this.mesh.position);
      this.particles.push(clone);
      scene.add(clone);
    }
  }
}
