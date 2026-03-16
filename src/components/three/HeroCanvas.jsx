import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Torus, Box } from '@react-three/drei'
import { MeshWobbleMaterial } from '@react-three/drei'

function RotatingObject({ pos, size, color }) {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.3
      ref.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })
  return (
    <Float position={pos} speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={ref}>
        <boxGeometry args={[size, size, size]} />
        <MeshWobbleMaterial color={color} factor={0.2} speed={2} emissive={color} emissiveIntensity={0.4} />
      </mesh>
    </Float>
  )
}

function Scene() {
  const torusRef = useRef()
  useFrame((state) => {
    if (torusRef.current) {
      torusRef.current.rotation.z = state.clock.elapsedTime * 0.3
    }
  })
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#8b5cf6" />
      <pointLight position={[-5, -5, 5]} intensity={1} color="#22d3ee" />
      <RotatingObject pos={[-2, 1, 0]} size={0.8} color="#8b5cf6" />
      <RotatingObject pos={[2, -1, 0]} color="#22d3ee" size={0.6} />
      <mesh ref={torusRef} position={[0, 0, 0]}>
        <torusGeometry args={[2.5, 0.3, 16, 100]} />
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.2} />
      </mesh>
    </>
  )
}

export default function HeroCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 60 }} style={{ width: '100%', height: '100%' }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
      <Scene />
    </Canvas>
  )
}
