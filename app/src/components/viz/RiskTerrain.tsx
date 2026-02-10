/**
 * Risk Terrain Map
 * 
 * 3D topographic surface visualization where elevation represents risk level.
 * Animate over time to show shifting risk landscape.
 */

import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { useSecurityStore } from '../../stores/securityStore'

interface RiskTerrainProps {
  width?: number
  height?: number
}

// Generate terrain heightmap data
function generateTerrainData(
  riskScore: number,
  secretsCount: number,
  criticalVulns: number,
  highVulns: number,
  gridSize: number = 50
): Float32Array {
  const data = new Float32Array(gridSize * gridSize)
  
  // Base terrain - gentle rolling hills
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const x = i / gridSize
      const y = j / gridSize
      
      // Perlin-like noise approximation
      let height = 0
      height += Math.sin(x * 4) * Math.cos(y * 4) * 0.2
      height += Math.sin(x * 8 + 1.5) * Math.cos(y * 6 + 0.5) * 0.1
      height += Math.sin(x * 12) * Math.sin(y * 10) * 0.05
      
      // Add risk-based peaks
      if (riskScore > 0) {
        // Central risk peak
        const dx = x - 0.5
        const dy = y - 0.5
        const distFromCenter = Math.sqrt(dx * dx + dy * dy)
        height += Math.max(0, 1 - distFromCenter * 3) * (riskScore / 100) * 0.8
      }
      
      // Add critical vulnerability spikes
      if (criticalVulns > 0) {
        const spike1 = Math.exp(-Math.pow((x - 0.3) * 8, 2) - Math.pow((y - 0.7) * 8, 2))
        const spike2 = Math.exp(-Math.pow((x - 0.8) * 8, 2) - Math.pow((y - 0.3) * 8, 2))
        height += (spike1 + spike2) * Math.min(criticalVulns * 0.3, 1)
      }
      
      // Add high vulnerability hills
      if (highVulns > 0) {
        const hill1 = Math.exp(-Math.pow((x - 0.6) * 5, 2) - Math.pow((y - 0.6) * 5, 2))
        const hill2 = Math.exp(-Math.pow((x - 0.2) * 5, 2) - Math.pow((y - 0.4) * 5, 2))
        height += (hill1 + hill2) * Math.min(highVulns * 0.15, 0.5)
      }
      
      // Add secret craters (inverted peaks)
      if (secretsCount > 0) {
        const crater1 = Math.exp(-Math.pow((x - 0.4) * 6, 2) - Math.pow((y - 0.2) * 6, 2))
        const crater2 = Math.exp(-Math.pow((x - 0.7) * 6, 2) - Math.pow((y - 0.8) * 6, 2))
        // Secrets create dangerous hot zones
        height += (crater1 + crater2) * Math.min(secretsCount * 0.2, 0.8)
      }
      
      data[i * gridSize + j] = height
    }
  }
  
  return data
}

// Get terrain color based on height
function getTerrainColor(height: number): THREE.Color {
  if (height > 0.7) return new THREE.Color('#ff4444') // Critical - red peaks
  if (height > 0.5) return new THREE.Color('#ff8c00') // High - orange
  if (height > 0.3) return new THREE.Color('#ffcc00') // Medium - yellow
  if (height > 0.1) return new THREE.Color('#88cc44') // Low - yellow-green
  return new THREE.Color('#44cc44') // Safe - green valleys
}

function TerrainMesh({ 
  data, 
  gridSize 
}: { 
  data: Float32Array
  gridSize: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // Create geometry with height data
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(10, 10, gridSize - 1, gridSize - 1)
    const positions = geo.attributes.position.array as Float32Array
    const colors = new Float32Array(positions.length)
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const idx = i * gridSize + j
        const posIdx = idx * 3
        
        // Set Z (height) from our data
        const height = data[idx]
        positions[posIdx + 2] = height * 3 // Scale height for visual impact
        
        // Set vertex color based on height
        const color = getTerrainColor(height)
        colors[posIdx] = color.r
        colors[posIdx + 1] = color.g
        colors[posIdx + 2] = color.b
      }
    }
    
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    
    return geo
  }, [data, gridSize])
  
  // Gentle animation
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle wave animation
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.02
    }
  })
  
  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <meshStandardMaterial
        vertexColors
        flatShading
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  )
}

// Floating labels for risk zones
function RiskLabel({ 
  position, 
  label, 
  color 
}: { 
  position: [number, number, number]
  label: string
  color: string
}) {
  return (
    <Html position={position} center distanceFactor={15}>
      <div 
        className="px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
        style={{ 
          backgroundColor: `${color}30`,
          color,
          border: `1px solid ${color}50`,
        }}
      >
        {label}
      </div>
    </Html>
  )
}

// Contour lines
function ContourLines() {
  const lines = useMemo(() => {
    const levels = [0.2, 0.4, 0.6, 0.8]
    const result: { points: [number, number, number][]; color: string }[] = []
    
    levels.forEach(level => {
      const points: [number, number, number][] = []
      const radius = 2 + level * 3
      const segments = 32
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2
        points.push([
          Math.cos(angle) * radius,
          level * 2.5,
          Math.sin(angle) * radius
        ])
      }
      result.push({ 
        points, 
        color: getTerrainColor(level).getStyle() 
      })
    })
    
    return result
  }, [])
  
  return (
    <>
      {lines.map((line, i) => (
        <Line
          key={i}
          points={line.points}
          color={line.color}
          lineWidth={1}
          transparent
          opacity={0.5}
        />
      ))}
    </>
  )
}

// Legend component
function TerrainLegend() {
  return (
    <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10">
      <h4 className="text-xs font-semibold mb-2 text-white">Risk Elevation</h4>
      <div className="space-y-1">
        {[
          { color: '#ff4444', label: 'Critical (Peak)' },
          { color: '#ff8c00', label: 'High' },
          { color: '#ffcc00', label: 'Medium' },
          { color: '#88cc44', label: 'Low' },
          { color: '#44cc44', label: 'Safe (Valley)' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div 
              className="w-3 h-2 rounded-sm" 
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-gray-300">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Stats overlay
function TerrainStats() {
  const { overallRiskScore, criticalVulnCount, highVulnCount, secretsCount } = useSecurityStore()
  
  return (
    <div className="absolute top-4 right-4 p-3 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10">
      <h4 className="text-xs font-semibold mb-2 text-white">Terrain Analysis</h4>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-lg font-bold text-white">{overallRiskScore}</div>
          <div className="text-gray-400">Peak Height</div>
        </div>
        <div>
          <div className="text-lg font-bold text-red-400">{criticalVulnCount}</div>
          <div className="text-gray-400">Danger Zones</div>
        </div>
        <div>
          <div className="text-lg font-bold text-orange-400">{highVulnCount}</div>
          <div className="text-gray-400">High Ridges</div>
        </div>
        <div>
          <div className="text-lg font-bold text-yellow-400">{secretsCount}</div>
          <div className="text-gray-400">Hot Spots</div>
        </div>
      </div>
    </div>
  )
}

function TerrainScene() {
  const { overallRiskScore, secretsCount, criticalVulnCount, highVulnCount } = useSecurityStore()
  const gridSize = 50
  
  const terrainData = useMemo(() => 
    generateTerrainData(overallRiskScore, secretsCount, criticalVulnCount, highVulnCount, gridSize),
    [overallRiskScore, secretsCount, criticalVulnCount, highVulnCount]
  )
  
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#4488ff" />
      
      {/* Terrain mesh */}
      <TerrainMesh data={terrainData} gridSize={gridSize} />
      
      {/* Contour lines */}
      <ContourLines />
      
      {/* Risk zone labels */}
      {criticalVulnCount > 0 && (
        <RiskLabel 
          position={[-2, 3, 2]} 
          label="⚠️ Critical Zone" 
          color="#ff4444" 
        />
      )}
      {secretsCount > 0 && (
        <RiskLabel 
          position={[2, 2.5, -2]} 
          label="🔑 Secret Detected" 
          color="#ff8c00" 
        />
      )}
      
      {/* Base plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#0a0a0f" />
      </mesh>
      
      {/* Grid helper */}
      <gridHelper args={[12, 12, '#222', '#111']} position={[0, 0, 0]} />
      
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={5}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  )
}

export function RiskTerrain({ width = 600, height = 400 }: RiskTerrainProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div 
      className="rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4 border-b border-[var(--color-border-subtle)]">
        <h3 className="font-semibold flex items-center gap-2">
          <span>🏔️</span>
          Risk Terrain Map
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Elevation represents risk level. Higher peaks = greater danger.
        </p>
      </div>
      
      <div className="relative" style={{ width, height }}>
        <Canvas
          camera={{ position: [8, 8, 8], fov: 50 }}
          gl={{ antialias: true }}
          style={{ background: 'linear-gradient(to bottom, #0a0a15, #050510)' }}
        >
          <TerrainScene />
        </Canvas>
        
        <TerrainLegend />
        <TerrainStats />
        
        {/* Interaction hint */}
        <div 
          className="absolute bottom-4 right-4 text-xs text-gray-500 transition-opacity"
          style={{ opacity: isHovered ? 1 : 0.5 }}
        >
          Drag to rotate • Scroll to zoom
        </div>
      </div>
    </div>
  )
}
