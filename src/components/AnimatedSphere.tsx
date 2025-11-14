'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

function ParticleSphere({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const { viewport } = useThree();
  
  // Create particle positions in a sphere formation
  const { positions, colors } = useMemo(() => {
    const count = 1000; // More particles for denser sphere
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Create points on a sphere surface
      const radius = 2 + (Math.random() - 0.5) * 0.3; // Slight variation in radius
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Color variation - teal/cyan with some green
      const color = new THREE.Color();
      const hue = 0.5 + (Math.random() - 0.5) * 0.1; // Teal/cyan range
      const saturation = 0.8 + Math.random() * 0.2;
      const lightness = 0.5 + Math.random() * 0.3;
      color.setHSL(hue, saturation, lightness);
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      
      // React to mouse position - tilt sphere towards mouse
      const targetRotationX = mousePosition.y * 0.3;
      const targetRotationY = mousePosition.x * 0.3;
      
      groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.1;
      groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * 0.1;
    }

    // Animate individual particles
    if (particlesRef.current) {
      const time = state.clock.elapsedTime;
      const count = particlesRef.current.count;
      const matrix = new THREE.Matrix4();
      
      // Calculate mouse influence on particles
      const mouseInfluence = Math.sqrt(mousePosition.x ** 2 + mousePosition.y ** 2);
      
      for (let i = 0; i < count; i++) {
        const baseRadius = 2;
        const variation = Math.sin(time * 0.5 + i * 0.01) * 0.2;
        // Particles expand more when mouse is near
        const mouseEffect = mouseInfluence * 0.3;
        const radius = baseRadius + variation + mouseEffect;
        
        const theta = (time * 0.2 + i * 0.01) % (Math.PI * 2);
        const phi = Math.acos((Math.sin(time * 0.15 + i * 0.008) + 1) / 2);
        
        // Offset particles towards mouse direction
        const mouseOffsetX = mousePosition.x * 0.2;
        const mouseOffsetY = mousePosition.y * 0.2;
        
        const x = radius * Math.sin(phi) * Math.cos(theta) + mouseOffsetX;
        const y = radius * Math.sin(phi) * Math.sin(theta) + mouseOffsetY;
        const z = radius * Math.cos(phi);
        
        // Scale based on position and mouse proximity
        const scale = 0.03 + Math.sin(time + i) * 0.01 + mouseInfluence * 0.02;
        matrix.compose(
          new THREE.Vector3(x, y, z),
          new THREE.Quaternion(),
          new THREE.Vector3(scale, scale, scale)
        );
        
        particlesRef.current.setMatrixAt(i, matrix);
      }
      
      particlesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={particlesRef} args={[undefined, undefined, 1000]}>
        <sphereGeometry args={[0.05, 16, 16]}>
          <instancedBufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </sphereGeometry>
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
          vertexColors
        />
      </instancedMesh>
    </group>
  );
}

function IndividualBallsSphere({ mousePosition, isHovered }: { mousePosition: { x: number; y: number }; isHovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Create array of ball positions
  const balls = useMemo(() => {
    const count = 800; // Number of individual balls
    const positions: Array<[number, number, number]> = [];
    
    for (let i = 0; i < count; i++) {
      const radius = 2 + (Math.random() - 0.5) * 0.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      positions.push([
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      ]);
    }
    
    return positions;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      const baseRotationX = state.clock.elapsedTime * 0.08;
      const baseRotationY = state.clock.elapsedTime * 0.12;
      
      // React to mouse position - tilt sphere towards mouse
      const mouseInfluence = isHovered ? 1 : 0.3;
      const targetRotationX = baseRotationX + mousePosition.y * 0.4 * mouseInfluence;
      const targetRotationY = baseRotationY + mousePosition.x * 0.4 * mouseInfluence;
      
      groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.1;
      groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * 0.1;
      
      // Scale up slightly on hover
      const targetScale = isHovered ? 1.1 : 1.0;
      const currentScale = groupRef.current.scale.x;
      groupRef.current.scale.setScalar(currentScale + (targetScale - currentScale) * 0.1);
    }
  });

  return (
    <group ref={groupRef}>
      {balls.map((position, i) => (
        <Ball key={i} position={position} index={i} mousePosition={mousePosition} isHovered={isHovered} />
      ))}
    </group>
  );
}

function Ball({ position, index, mousePosition, isHovered }: { 
  position: [number, number, number]; 
  index: number;
  mousePosition: { x: number; y: number };
  isHovered: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      const baseScale = 0.08;
      const scale = baseScale + Math.sin(time * 2 + index * 0.1) * 0.02;
      
      // Scale up more on hover
      const hoverScale = isHovered ? 1.2 : 1.0;
      meshRef.current.scale.set(scale * hoverScale, scale * hoverScale, scale * hoverScale);
      
      // Calculate distance from mouse influence point
      const mouseInfluence = Math.sqrt(mousePosition.x ** 2 + mousePosition.y ** 2);
      const mouseEffect = mouseInfluence * 0.15;
      
      // Slight position variation with mouse influence
      const variation = Math.sin(time * 0.5 + index * 0.05) * 0.05;
      const mouseOffsetX = mousePosition.x * 0.1;
      const mouseOffsetY = mousePosition.y * 0.1;
      
      meshRef.current.position.set(
        position[0] + variation + mouseOffsetX,
        position[1] + variation + mouseOffsetY,
        position[2] + variation
      );
      
      // Increase emissive intensity on hover
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      const targetIntensity = isHovered ? 1.2 : 0.7;
      material.emissiveIntensity = material.emissiveIntensity + (targetIntensity - material.emissiveIntensity) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial
        color="#00ffff"
        emissive="#00ffff"
        emissiveIntensity={0.7}
        metalness={0.95}
        roughness={0.05}
      />
    </mesh>
  );
}

export default function AnimatedSphere() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; // Normalize to -1 to 1
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1; // Normalize to -1 to 1 (inverted)
    
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1;
  
  return (
    <div 
      ref={containerRef}
      className="w-full h-full cursor-pointer" 
      style={{ minHeight: '400px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ 
          alpha: true, 
          antialias: true,
          powerPreference: "high-performance"
        }}
        dpr={[1, dpr]}
      >
        <Float speed={isHovered ? 0.5 : 1} rotationIntensity={isHovered ? 0.1 : 0.2} floatIntensity={isHovered ? 0.1 : 0.2}>
          <IndividualBallsSphere mousePosition={mousePosition} isHovered={isHovered} />
        </Float>
        
        {/* Enhanced lighting for teal/cyan glow - stronger at bottom and on hover */}
        <pointLight 
          position={[0, -3, 3]} 
          intensity={isHovered ? 4 : 3} 
          color="#00ffff" 
          distance={15} 
          decay={2} 
        />
        <pointLight 
          position={[0, -4, 2]} 
          intensity={isHovered ? 3.5 : 2.5} 
          color="#00ffff" 
          distance={12} 
          decay={2} 
        />
        <pointLight 
          position={[3, 2, 2]} 
          intensity={isHovered ? 2 : 1.5} 
          color="#00ff00" 
          distance={10} 
          decay={2} 
        />
        <pointLight 
          position={[-3, -2, -2]} 
          intensity={isHovered ? 1.8 : 1.2} 
          color="#00ffff" 
          distance={10} 
          decay={2} 
        />
        <pointLight 
          position={[0, 3, -2]} 
          intensity={isHovered ? 1.5 : 1} 
          color="#00ffff" 
          distance={8} 
          decay={2} 
        />
        
        {/* Ambient light with teal tint - brighter on hover */}
        <ambientLight intensity={isHovered ? 0.4 : 0.3} color="#00ffff" />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          autoRotate
          autoRotateSpeed={isHovered ? 0.1 : 0.2}
        />
      </Canvas>
    </div>
  );
}
