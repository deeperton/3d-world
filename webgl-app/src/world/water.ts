import * as Three from 'three';

export function generateWater(size: number, riverHeight: number): Three.Mesh {
  const geometry = new Three.PlaneGeometry(size, size, 128, 128);
  geometry.rotateX(-Math.PI / 2);

  const material = new Three.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new Three.Color(0x487fc2) },
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      varying vec2 vUv;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);

        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));

        vec2 u = f * f * (3.0 - 2.0 * f);

        return mix(
          mix(a, b, u.x),
          mix(c, d, u.x),
          u.y
        );
      }

      void main() {
        vec2 st = vUv * 10.0; 
        float n = noise(st + uTime * 0.1);

        gl_FragColor = vec4(uColor * (0.7 + n * 0.3), 0.7);
      }
    `,
    transparent: true,
  });

  const mesh = new Three.Mesh(geometry, material);
  mesh.position.y = riverHeight + 0.08;

  return mesh;
}

export function updateWater(mesh: Three.Mesh, time: number) {
  const material = mesh.material as Three.ShaderMaterial;
  material.uniforms.uTime.value = time;
}
