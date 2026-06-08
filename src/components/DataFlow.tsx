import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function FiberTube() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-6, 0, 0),
      new THREE.Vector3(-2, 0.5, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(2, -0.5, 0),
      new THREE.Vector3(6, 0, 0)
    ]);
  }, []);

  const geometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 300, 0.3, 64, false);
  }, [curve]);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color('#1a1a1a') },
        uColor2: { value: new THREE.Color('#ff6600') },
        uColor3: { value: new THREE.Color('#6a00ff') }
      },
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying float vDistortion;

        void main() {
          vUv = uv;
          vec3 pos = position;
          
          float t = uTime * 0.8;
          float distortion = sin(pos.x * 2.0 + t) * cos(pos.y * 3.0 + t * 0.5) * 0.3;
          distortion += sin(pos.z * 4.0 + t * 1.5) * 0.15;
          
          pos += normal * distortion;
          vDistortion = distortion;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        varying vec2 vUv;
        varying float vDistortion;

        void main() {
          float t = uTime * 0.5;
          float distFromCenter = length(vUv - 0.5);
          
          vec3 color = mix(uColor2, uColor1, distFromCenter * 2.0);
          color = mix(color, uColor3, sin(t + vUv.x * 10.0) * 0.3 + 0.2);
          color += uColor2 * abs(vDistortion) * 2.0;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
    }

    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(time * 0.1) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} material={shaderMaterial} />
  );
}

function Particles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 200;

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
      
      vel[i * 3] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    
    return { positions: pos, velocities: vel };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.elapsedTime;
    const positionArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      positionArray[i * 3] += velocities[i * 3] + Math.sin(time * 0.5 + i) * 0.002;
      positionArray[i * 3 + 1] += velocities[i * 3 + 1] + Math.cos(time * 0.3 + i) * 0.002;
      positionArray[i * 3 + 2] += velocities[i * 3 + 2];
      
      if (Math.abs(positionArray[i * 3]) > 6) positionArray[i * 3] *= -0.9;
      if (Math.abs(positionArray[i * 3 + 1]) > 3) positionArray[i * 3 + 1] *= -0.9;
      if (Math.abs(positionArray[i * 3 + 2]) > 2) positionArray[i * 3 + 2] *= -0.9;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.03}
        color="#ff6600"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

export default function DataFlow() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <FiberTube />
        <Particles />
      </Canvas>
    </div>
  );
}
