//generate a sphere around the terrain
import * as Three from 'three';

export function generateSphere(radius: number): Three.Mesh {
  const geometry = new Three.SphereGeometry(radius, 32, 32);

  const material = new Three.ShaderMaterial({
    uniforms: {
      topColor: { value: new Three.Color(0x1e3a8a) },   // dark blue (top)
      bottomColor: { value: new Three.Color(0x60a5fa) } // light blue (bottom)
    },
    vertexShader: `
      varying vec3 vPosition;
      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      varying vec3 vPosition;
      void main() {
        float mixValue = (vPosition.y + 50.0) / 100.0; // normalisation Y from -50 to 50
        gl_FragColor = vec4(mix(bottomColor, topColor, mixValue), 1.0);
      }
    `,
    side: Three.BackSide
  });

  return new Three.Mesh(geometry, material);
}