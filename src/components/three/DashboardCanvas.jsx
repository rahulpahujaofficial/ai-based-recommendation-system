import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Text3D, Center, MeshWobbleMaterial, Torus } from '@react-three/drei'
import * as THREE from 'three'

function FloatingProduct({ position, color, icon }) {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <octahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </Float>
  )
}

function OrbitRing({ radius, speed, color, count = 5 }) {
  const groupRef = useRef()
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * speed
    }
  })

  const positions = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2
      return [Math.cos(angle) * radius, Math.sin(angle * 0.5) * 0.3, Math.sin(angle) * radius]
    })
  }, [count, radius])

  return (
    <group ref={groupRef}>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 6, 0, 0]}>
        <torusGeometry args={[radius, 0.02, 8, 80]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.4} />
      </mesh>
    </group>
  )
}

function CoreSphere() {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.2, 4]} />
      <MeshWobbleMaterial
        color="#6d28d9"
        emissive="#4c1d95"
        emissiveIntensity={0.5}
        metalness={0.9}
        roughness={0.1}
        factor={0.3}
        speed={1}
      />
    </mesh>
  )
}

function DashboardScene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 3, 3]} intensity={2} color="#8b5cf6" />
      <pointLight position={[-3, -3, -3]} intensity={1} color="#22d3ee" />

      <CoreSphere />
      <OrbitRing radius={2.2} speed={0.5} color="#8b5cf6" count={6} />
      <OrbitRing radius={3.2} speed={0.3} color="#22d3ee" count={8} />
      <OrbitRing radius={4} speed={0.15} color="#ec4899" count={10} />

      <FloatingProduct position={[3, 1, 0]} color="#f59e0b" />
      <FloatingProduct position={[-3, -1, 0]} color="#10b981" />
      <FloatingProduct position={[0, 3, -1]} color="#ec4899" />
    </>
  )
}

export default function DashboardCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <DashboardScene />
    </Canvas>
  )
}
