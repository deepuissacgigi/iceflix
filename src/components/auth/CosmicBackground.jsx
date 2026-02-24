import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sparkles, Float, Trail } from '@react-three/drei';
import * as THREE from 'three';

const ParticleField = () => {
    const count = 100;
    const mesh = useRef();

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        particles.forEach((particle, i) => {
            let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
            t = particle.t += speed / 2;
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;
            const s = Math.cos(t);

            dummy.position.set(
                (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            );
            dummy.scale.set(s, s, s);
            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();

            mesh.current.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[null, null, count]}>
            <dodecahedronGeometry args={[0.2, 0]} />
            <meshPhoneMaterial color="#8f00ff" emissive="#8f00ff" emissiveIntensity={0.5} wireframe={false} />
        </instancedMesh>
    );
};

const CosmicBackground = () => {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, background: 'black' }}>
            <Canvas
                camera={{ position: [0, 0, 15], fov: 75 }}
                gl={{ antialias: true }}
            >
                <color attach="background" args={['#000000']} />

                {/* Dynamic Lighting */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} color="#8f00ff" intensity={5} distance={50} />
                <pointLight position={[-10, -10, -10]} color="#00ffff" intensity={5} distance={50} />

                {/* Main Animation */}
                <ParticleField />

                {/* Atmosphere */}
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Sparkles
                    count={300}
                    size={2}
                    speed={0.4}
                    opacity={0.5}
                    scale={[20, 20, 20]}
                    color="#ffffff"
                />
            </Canvas>
        </div>
    );
};

export default CosmicBackground;
