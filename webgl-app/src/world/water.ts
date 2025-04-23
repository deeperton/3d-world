import * as Three from 'three';

export function generateWater(size: number, riverHeight: number): Three.Mesh {
  const geometry = new Three.PlaneGeometry(size, size, 128, 128);
  geometry.rotateX(-Math.PI / 2);

  const material = new Three.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new Three.Color(0x0373fc) },
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec3 pos = position;
        pos.y += sin(pos.x * 0.2 + uTime * 0.5) * 0.2;
        pos.y += cos(pos.z * 0.3 + uTime * 0.3) * 0.2;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying vec2 vUv;

      void main() {
        gl_FragColor = vec4(uColor, 0.8);
      }
    `,
    transparent: true,
  });

  const mesh = new Three.Mesh(geometry, material);
  mesh.position.y = riverHeight + 0.05;

  return mesh;
}

export function updateWater(mesh: Three.Mesh, time: number) {
  const material = mesh.material as Three.ShaderMaterial;
  material.uniforms.uTime.value = time;
}
