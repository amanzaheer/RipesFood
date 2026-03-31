"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, useGLTF } from "@react-three/drei";
import {
  Component,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import * as THREE from "three";

const CONTAINER_GLB = "/models/container.glb";

useGLTF.preload(CONTAINER_GLB);

/** Loads `public/models/container.glb` (real mesh + materials). */
function GltfOrange({ mouseTarget, onModelReady }) {
  const { scene } = useGLTF(CONTAINER_GLB);
  const model = useMemo(() => scene.clone(true), [scene]);
  const parallaxGroupRef = useRef(null);

  useLayoutEffect(() => {
    model.position.set(0, 0, 0);
    model.rotation.set(0, 0, 0);
    model.scale.set(1, 1, 1);

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (!maxDim || maxDim <= 0) return;

    // Make the background model fill the hero banner more noticeably.
    const targetSize = 5.1;
    const scale = targetSize / maxDim;
    model.scale.setScalar(scale);
    const box2 = new THREE.Box3().setFromObject(model);
    const center2 = box2.getCenter(new THREE.Vector3());
    model.position.sub(center2);

    onModelReady?.();
  }, [model, onModelReady]);

  useFrame(() => {
    if (!parallaxGroupRef.current) return;
    const x = mouseTarget.current.x;
    const y = mouseTarget.current.y;
    const w = typeof window !== "undefined" ? window.innerWidth : 1024;
    const narrow = w < 640;
    const posMul = narrow ? 0.03 : w < 1024 ? 0.07 : 0.12;
    const rotMul = narrow ? 0.2 : 0.35;
    parallaxGroupRef.current.rotation.y = x * rotMul;
    parallaxGroupRef.current.rotation.x = -y * (narrow ? 0.15 : 0.25);
    parallaxGroupRef.current.position.x = x * posMul;
    parallaxGroupRef.current.position.y = y * (narrow ? 0.04 : 0.08);
  });

  return (
    <group>
      <group ref={parallaxGroupRef}>
        <primitive object={model} />
      </group>
    </group>
  );
}

/** Only used if `orange.glb` is missing or fails to load. */
function ProceduralOrangeFallback({ mouseTarget, onModelReady }) {
  const parallaxGroupRef = useRef(null);

  useEffect(() => {
    onModelReady?.();
  }, [onModelReady]);

  useFrame(() => {
    if (!parallaxGroupRef.current) return;
    const x = mouseTarget.current.x;
    const y = mouseTarget.current.y;
    const w = typeof window !== "undefined" ? window.innerWidth : 1024;
    const narrow = w < 640;
    const posMul = narrow ? 0.03 : w < 1024 ? 0.07 : 0.12;
    const rotMul = narrow ? 0.2 : 0.35;
    parallaxGroupRef.current.rotation.y = x * rotMul;
    parallaxGroupRef.current.rotation.x = -y * (narrow ? 0.15 : 0.25);
    parallaxGroupRef.current.position.x = x * posMul;
    parallaxGroupRef.current.position.y = y * (narrow ? 0.04 : 0.08);
  });

  return (
    <group>
      <group ref={parallaxGroupRef}>
        <group scale={2.1} rotation={[0.25, -0.4, 0]}>
          <mesh>
            <sphereGeometry args={[1, 64, 48]} />
            <meshStandardMaterial
              color="#ff7a00"
              roughness={0.38}
              metalness={0.12}
              emissive="#b84800"
              emissiveIntensity={0.55}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}

class OrangeLoadErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <ProceduralOrangeFallback
          mouseTarget={this.props.mouseTarget}
          onModelReady={this.props.onModelReady}
        />
      );
    }
    return this.props.children;
  }
}

function ParticleField({ mouseTarget }) {
  const pointsRef = useRef(null);

  const { positions, seeds } = useMemo(() => {
    const mulberry32 = (a) => {
      return () => {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    };

    const count =
      typeof window !== "undefined" && window.innerWidth < 768 ? 48 : 140;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const rng = mulberry32(123456);

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const x = (rng() - 0.5) * 6;
      const y = (rng() - 0.5) * 4;
      const z = (rng() - 0.5) * 6;

      positions[ix + 0] = x;
      positions[ix + 1] = y;
      positions[ix + 2] = z;

      seeds[i] = rng() * Math.PI * 2;
    }

    return { positions, seeds };
  }, []);

  useFrame(({ clock }) => {
    const points = pointsRef.current;
    if (!points) return;

    const t = clock.getElapsedTime();

    const attr = points.geometry.attributes.position;
    for (let i = 0; i < seeds.length; i++) {
      const ix = i * 3;
      const phase = seeds[i];

      attr.array[ix + 0] =
        positions[ix + 0] + Math.sin(t * 0.55 + phase) * 0.08;
      attr.array[ix + 1] =
        positions[ix + 1] + Math.cos(t * 0.45 + phase) * 0.06;
      attr.array[ix + 2] =
        positions[ix + 2] + Math.sin(t * 0.35 + phase) * 0.05;
    }
    attr.needsUpdate = true;

    const x = mouseTarget.current.x;
    const y = mouseTarget.current.y;
    const w = typeof window !== "undefined" ? window.innerWidth : 1024;
    const narrow = w < 640;
    const xm = narrow ? 0.04 : 0.12;
    const pm = narrow ? 0.02 : 0.06;

    points.rotation.y = t * 0.06 + x * xm;
    points.rotation.x = -y * (narrow ? 0.04 : 0.08);
    points.position.x = x * pm;
    points.position.y = y * (narrow ? 0.02 : 0.04);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#fbbf24"
        size={0.025}
        transparent
        opacity={0.22}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function Scene({ onModelReady }) {
  const mouseTarget = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onPointerMove = (event) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      mouseTarget.current.x = (event.clientX / w) * 2 - 1;
      mouseTarget.current.y = (event.clientY / h) * 2 - 1;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  const narrowGl =
    typeof window !== "undefined" && window.innerWidth < 1024;

  return (
    <Canvas
      className="block h-full w-full max-w-full min-h-dvh overflow-hidden pointer-events-none select-none"
      dpr={narrowGl ? 1 : [1, 1.5]}
      camera={{ position: [0, 0, 4.9], fov: 42 }}
      gl={{
        antialias: !narrowGl,
        alpha: false,
        powerPreference: narrowGl ? "default" : "high-performance",
      }}
      onCreated={({ gl }) => {
        const setBg = () => {
          gl.setClearColor("#050505", 1);
        };
        setBg();
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.domElement.addEventListener("webglcontextrestored", setBg, false);
      }}
    >
      <color attach="background" args={["#050505"]} />
      <hemisphereLight color="#ffd4a8" groundColor="#1a1008" intensity={0.95} />
      <directionalLight position={[5, 8, 6]} intensity={1.35} />
      <pointLight position={[-4, 2, 4]} intensity={0.5} color="#ffa04d" />

      <Suspense fallback={null}>
        <ParticleField mouseTarget={mouseTarget} />
        <Float speed={2.2} rotationIntensity={0.45} floatIntensity={1.15}>
          <OrangeLoadErrorBoundary
            mouseTarget={mouseTarget}
            onModelReady={onModelReady}
          >
            <GltfOrange mouseTarget={mouseTarget} onModelReady={onModelReady} />
          </OrangeLoadErrorBoundary>
        </Float>
      </Suspense>
    </Canvas>
  );
}
