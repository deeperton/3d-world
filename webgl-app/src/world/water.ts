import * as Three from 'three';

export function generateWater(size: number, riverHeight: number): Three.Mesh {
  const geometry = new Three.PlaneGeometry(size, size, 128, 128);
  geometry.rotateX(-Math.PI / 2);

  const material = new Three.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new Three.Color(0x6595cf) },
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      
      // random number generator
      float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      void main() {
        vUv = uv;
        vec3 pos = position;
        
        // Dribble waves, small fast noise imitation
        pos.y += sin((pos.x + uTime * 2.0) * 4.0) * random(vUv);
        pos.y += cos((pos.z + uTime * 1.4) * 5.0) * random(vUv);

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
  mesh.position.y = riverHeight + 0.0005;

  return mesh;
}

export function updateWater(mesh: Three.Mesh, time: number) {
  const material = mesh.material as Three.ShaderMaterial;
  material.uniforms.uTime.value = time;
}
