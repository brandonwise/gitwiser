/**
 * Attack Surface Radar
 * 
 * Circular radar sweep visualization revealing entry points,
 * exposed secrets, and vulnerable dependencies.
 */

import { useRef, useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSecurityStore } from '../../stores/securityStore'

interface RadarTarget {
  id: string
  label: string
  category: 'secret' | 'vulnerability' | 'entry-point' | 'dependency'
  severity: 'critical' | 'high' | 'medium' | 'low'
  angle: number // 0-360 degrees
  distance: number // 0-1 (center to edge)
  details?: string
}

interface AttackRadarProps {
  size?: number
}

const CATEGORY_COLORS = {
  secret: '#ff4444',
  vulnerability: '#ff8c00',
  'entry-point': '#ffcc00',
  dependency: '#4488ff',
}

const SEVERITY_SIZES = {
  critical: 12,
  high: 10,
  medium: 8,
  low: 6,
}

export function AttackRadar({ size = 400 }: AttackRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [sweepAngle, setSweepAngle] = useState(0)
  const [revealedTargets, setRevealedTargets] = useState<Set<string>>(new Set())
  const [selectedTarget, setSelectedTarget] = useState<RadarTarget | null>(null)
  
  const { secrets, vulnerabilities, dependencies } = useSecurityStore()
  
  // Generate radar targets from security data
  const targets = useMemo<RadarTarget[]>(() => {
    const result: RadarTarget[] = []
    let angleOffset = 0
    
    // Add secrets
    secrets.forEach((secret, i) => {
      result.push({
        id: `secret-${secret.id}`,
        label: secret.pattern.name,
        category: 'secret',
        severity: secret.pattern.severity,
        angle: (i * 360 / Math.max(secrets.length, 8) + angleOffset) % 360,
        distance: 0.3 + Math.random() * 0.5,
        details: `${secret.file}:${secret.line}`,
      })
    })
    angleOffset += 45
    
    // Add vulnerabilities
    const allVulns = vulnerabilities.flatMap(v => 
      v.vulnerabilities.map(vuln => ({
        ...vuln,
        packageName: v.dependency.name,
      }))
    )
    
    allVulns.slice(0, 20).forEach((vuln, i) => {
      result.push({
        id: `vuln-${vuln.id}-${i}`,
        label: vuln.id,
        category: 'vulnerability',
        severity: vuln.severity.toLowerCase() as 'critical' | 'high' | 'medium' | 'low',
        angle: (i * 360 / Math.max(allVulns.length, 8) + angleOffset) % 360,
        distance: 0.4 + Math.random() * 0.4,
        details: vuln.packageName,
      })
    })
    angleOffset += 90
    
    // Add risky dependencies
    const riskyDeps = vulnerabilities.filter(v => v.riskScore > 20)
    riskyDeps.slice(0, 10).forEach((dep, i) => {
      result.push({
        id: `dep-${dep.dependency.name}`,
        label: dep.dependency.name,
        category: 'dependency',
        severity: dep.riskScore > 70 ? 'critical' : dep.riskScore > 40 ? 'high' : 'medium',
        angle: (i * 360 / Math.max(riskyDeps.length, 6) + angleOffset) % 360,
        distance: 0.5 + Math.random() * 0.3,
        details: `Risk: ${dep.riskScore}`,
      })
    })
    
    // Add some synthetic entry points for visual interest
    const entryPoints = ['API', 'Auth', 'Config', 'Env', 'Secrets']
    entryPoints.forEach((ep, i) => {
      if (secrets.length > 0 || vulnerabilities.length > 0) {
        result.push({
          id: `entry-${ep}`,
          label: ep,
          category: 'entry-point',
          severity: 'medium',
          angle: (i * 72 + 180) % 360,
          distance: 0.2 + Math.random() * 0.3,
          details: 'Potential attack vector',
        })
      }
    })
    
    return result
  }, [secrets, vulnerabilities, dependencies])
  
  // Animate radar sweep
  useEffect(() => {
    let animationId: number
    let lastTime = performance.now()
    
    const animate = (time: number) => {
      const delta = time - lastTime
      lastTime = time
      
      setSweepAngle(prev => {
        const next = (prev + delta * 0.05) % 360
        
        // Check which targets the sweep passes
        targets.forEach(target => {
          const targetAngle = target.angle
          if (
            (prev < targetAngle && next >= targetAngle) ||
            (prev > next && (targetAngle >= prev || targetAngle < next))
          ) {
            setRevealedTargets(set => new Set([...set, target.id]))
          }
        })
        
        return next
      })
      
      animationId = requestAnimationFrame(animate)
    }
    
    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [targets])
  
  // Draw radar background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)
    
    const center = size / 2
    const maxRadius = size / 2 - 20
    
    // Clear
    ctx.fillStyle = 'rgba(10, 10, 15, 1)'
    ctx.fillRect(0, 0, size, size)
    
    // Draw concentric rings
    ctx.strokeStyle = 'rgba(68, 136, 255, 0.2)'
    ctx.lineWidth = 1
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath()
      ctx.arc(center, center, maxRadius * (i / 4), 0, Math.PI * 2)
      ctx.stroke()
    }
    
    // Draw cross lines
    ctx.beginPath()
    ctx.moveTo(center - maxRadius, center)
    ctx.lineTo(center + maxRadius, center)
    ctx.moveTo(center, center - maxRadius)
    ctx.lineTo(center, center + maxRadius)
    ctx.stroke()
    
    // Draw diagonal lines
    ctx.strokeStyle = 'rgba(68, 136, 255, 0.1)'
    const diag = maxRadius * 0.707
    ctx.beginPath()
    ctx.moveTo(center - diag, center - diag)
    ctx.lineTo(center + diag, center + diag)
    ctx.moveTo(center - diag, center + diag)
    ctx.lineTo(center + diag, center - diag)
    ctx.stroke()
    
    // Draw sweep
    const sweepRad = (sweepAngle - 90) * Math.PI / 180
    
    // Sweep gradient
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, maxRadius)
    gradient.addColorStop(0, 'rgba(68, 255, 136, 0.3)')
    gradient.addColorStop(1, 'rgba(68, 255, 136, 0)')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.moveTo(center, center)
    ctx.arc(center, center, maxRadius, sweepRad - 0.5, sweepRad)
    ctx.lineTo(center, center)
    ctx.fill()
    
    // Sweep line
    ctx.strokeStyle = 'rgba(68, 255, 136, 0.8)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(center, center)
    ctx.lineTo(
      center + Math.cos(sweepRad) * maxRadius,
      center + Math.sin(sweepRad) * maxRadius
    )
    ctx.stroke()
    
    // Center dot
    ctx.fillStyle = '#44ff88'
    ctx.beginPath()
    ctx.arc(center, center, 4, 0, Math.PI * 2)
    ctx.fill()
    
  }, [size, sweepAngle])
  
  const center = size / 2
  const maxRadius = size / 2 - 20
  
  return (
    <div className="rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] p-4">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <span>📡</span>
        Attack Surface Radar
      </h3>
      
      <div className="relative" style={{ width: size, height: size }}>
        {/* Canvas background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 rounded-full"
          style={{ width: size, height: size }}
        />
        
        {/* Target blips */}
        <AnimatePresence>
          {targets.map(target => {
            if (!revealedTargets.has(target.id)) return null
            
            const rad = (target.angle - 90) * Math.PI / 180
            const x = center + Math.cos(rad) * target.distance * maxRadius
            const y = center + Math.sin(rad) * target.distance * maxRadius
            const color = CATEGORY_COLORS[target.category]
            const blipSize = SEVERITY_SIZES[target.severity]
            
            return (
              <motion.button
                key={target.id}
                className="absolute rounded-full cursor-pointer"
                style={{
                  left: x - blipSize / 2,
                  top: y - blipSize / 2,
                  width: blipSize,
                  height: blipSize,
                  backgroundColor: color,
                  boxShadow: `0 0 ${blipSize}px ${color}`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  boxShadow: [
                    `0 0 ${blipSize}px ${color}`,
                    `0 0 ${blipSize * 2}px ${color}`,
                    `0 0 ${blipSize}px ${color}`,
                  ]
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ 
                  duration: 0.3,
                  boxShadow: { duration: 2, repeat: Infinity }
                }}
                onClick={() => setSelectedTarget(
                  selectedTarget?.id === target.id ? null : target
                )}
                whileHover={{ scale: 1.5 }}
              />
            )
          })}
        </AnimatePresence>
        
        {/* Selected target details */}
        <AnimatePresence>
          {selectedTarget && (
            <motion.div
              className="absolute left-1/2 bottom-4 -translate-x-1/2 px-4 py-3 rounded-lg bg-black/90 backdrop-blur border border-white/20 min-w-[200px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[selectedTarget.category] }}
                />
                <span className="text-sm font-medium">{selectedTarget.label}</span>
              </div>
              <div className="text-xs text-[var(--color-text-muted)]">
                {selectedTarget.category.replace('-', ' ')} • {selectedTarget.severity}
              </div>
              {selectedTarget.details && (
                <code className="text-xs text-[var(--color-text-subtle)] mt-1 block">
                  {selectedTarget.details}
                </code>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Corner labels */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-[var(--color-text-muted)]">
          NORTH
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-[var(--color-text-muted)]">
          SOUTH
        </div>
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">
          WEST
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">
          EAST
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-[var(--color-text-muted)] capitalize">
              {cat.replace('-', ' ')}
            </span>
          </div>
        ))}
      </div>
      
      {/* Stats bar */}
      <div className="flex items-center justify-around mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
        <div className="text-center">
          <div className="text-xl font-bold" style={{ color: CATEGORY_COLORS.secret }}>
            {secrets.length}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">Secrets</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold" style={{ color: CATEGORY_COLORS.vulnerability }}>
            {vulnerabilities.reduce((sum, v) => sum + v.vulnerabilities.length, 0)}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">Vulns</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold" style={{ color: CATEGORY_COLORS.dependency }}>
            {targets.filter(t => t.category === 'dependency').length}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">Risky Deps</div>
        </div>
      </div>
    </div>
  )
}
