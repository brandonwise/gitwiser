/**
 * Heartbeat Pulse Visualization
 * 
 * Real-time pulse visualization showing repository health.
 * Steady = healthy. CVEs flash as arrhythmias.
 */

import { useRef, useEffect, useMemo } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { useSecurityStore } from '../../stores/securityStore'

interface HeartbeatProps {
  size?: 'sm' | 'md' | 'lg'
  showStats?: boolean
}

const sizeConfig = {
  sm: { width: 200, height: 80, strokeWidth: 2 },
  md: { width: 400, height: 120, strokeWidth: 3 },
  lg: { width: 600, height: 160, strokeWidth: 4 },
}

export function Heartbeat({ size = 'md', showStats = true }: HeartbeatProps) {
  const config = sizeConfig[size]
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  
  const { 
    overallRiskScore, 
    criticalVulnCount, 
    highVulnCount,
    secretsCount 
  } = useSecurityStore()
  
  // Determine health status
  const health = useMemo(() => {
    if (criticalVulnCount > 0 || secretsCount > 3) {
      return { status: 'critical', color: '#ff4444', bpm: 120, label: 'Critical' }
    }
    if (highVulnCount > 0 || secretsCount > 0) {
      return { status: 'elevated', color: '#ff8c00', bpm: 90, label: 'Elevated' }
    }
    if (overallRiskScore > 30) {
      return { status: 'warning', color: '#ffcc00', bpm: 75, label: 'Warning' }
    }
    return { status: 'healthy', color: '#44cc44', bpm: 60, label: 'Healthy' }
  }, [overallRiskScore, criticalVulnCount, highVulnCount, secretsCount])
  
  // Animated BPM display
  const springBpm = useSpring(60, { damping: 30, stiffness: 100 })
  springBpm.set(health.bpm)
  const displayBpm = useTransform(springBpm, v => Math.round(v))
  
  // Canvas heartbeat animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // High DPI support
    const dpr = window.devicePixelRatio || 1
    canvas.width = config.width * dpr
    canvas.height = config.height * dpr
    ctx.scale(dpr, dpr)
    
    let offset = 0
    const speed = 2 // pixels per frame
    
    // Generate heartbeat wave points
    const generateHeartbeat = (x: number, hasArrhythmia: boolean): number => {
      const period = 120 // pixels per beat
      const phase = (x % period) / period
      
      // Normal heartbeat pattern: flat -> P wave -> QRS complex -> T wave -> flat
      if (phase < 0.1) {
        // Flat baseline
        return 0
      } else if (phase < 0.2) {
        // P wave (small bump)
        const t = (phase - 0.1) / 0.1
        return Math.sin(t * Math.PI) * 0.15
      } else if (phase < 0.3) {
        // Flat
        return 0
      } else if (phase < 0.35) {
        // Q wave (small dip)
        const t = (phase - 0.3) / 0.05
        return -Math.sin(t * Math.PI) * 0.1
      } else if (phase < 0.45) {
        // R wave (tall spike) - add irregularity for arrhythmia
        const t = (phase - 0.35) / 0.1
        const baseHeight = Math.sin(t * Math.PI) * 1.0
        if (hasArrhythmia) {
          return baseHeight * (0.7 + Math.random() * 0.6)
        }
        return baseHeight
      } else if (phase < 0.55) {
        // S wave (dip below baseline)
        const t = (phase - 0.45) / 0.1
        return -Math.sin(t * Math.PI) * 0.25
      } else if (phase < 0.7) {
        // T wave (medium bump)
        const t = (phase - 0.55) / 0.15
        return Math.sin(t * Math.PI) * 0.3
      } else {
        // Flat baseline
        return 0
      }
    }
    
    const draw = () => {
      ctx.clearRect(0, 0, config.width, config.height)
      
      const centerY = config.height / 2
      const amplitude = config.height * 0.35
      
      // Draw glow effect
      ctx.save()
      ctx.shadowBlur = 15
      ctx.shadowColor = health.color
      
      // Draw heartbeat line
      ctx.beginPath()
      ctx.strokeStyle = health.color
      ctx.lineWidth = config.strokeWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      const hasArrhythmia = health.status === 'critical'
      
      for (let x = 0; x < config.width; x++) {
        const y = centerY - generateHeartbeat(x + offset, hasArrhythmia) * amplitude
        
        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      
      ctx.stroke()
      ctx.restore()
      
      // Draw fading trail effect at the right edge
      const gradient = ctx.createLinearGradient(config.width - 100, 0, config.width, 0)
      gradient.addColorStop(0, 'rgba(10, 10, 15, 0)')
      gradient.addColorStop(1, 'rgba(10, 10, 15, 1)')
      ctx.fillStyle = gradient
      ctx.fillRect(config.width - 100, 0, 100, config.height)
      
      // Draw leading dot
      const dotX = config.width - 10
      const dotY = centerY - generateHeartbeat(dotX + offset, hasArrhythmia) * amplitude
      
      ctx.beginPath()
      ctx.arc(dotX, dotY, 4, 0, Math.PI * 2)
      ctx.fillStyle = health.color
      ctx.shadowBlur = 20
      ctx.shadowColor = health.color
      ctx.fill()
      
      // Adjust speed based on BPM
      const adjustedSpeed = speed * (health.bpm / 60)
      offset += adjustedSpeed
      
      animationRef.current = requestAnimationFrame(draw)
    }
    
    draw()
    
    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [config, health])
  
  return (
    <div className="rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <motion.span 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ 
              duration: 60 / health.bpm, 
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            💓
          </motion.span>
          Repository Heartbeat
        </h3>
        
        {/* Status badge */}
        <motion.div
          className="flex items-center gap-2 px-3 py-1 rounded-full"
          style={{ backgroundColor: `${health.color}20` }}
          animate={{ opacity: health.status === 'critical' ? [1, 0.5, 1] : 1 }}
          transition={{ duration: 0.5, repeat: health.status === 'critical' ? Infinity : 0 }}
        >
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: health.color }}
          />
          <span 
            className="text-sm font-medium"
            style={{ color: health.color }}
          >
            {health.label}
          </span>
        </motion.div>
      </div>
      
      {/* Heartbeat canvas */}
      <div 
        className="relative rounded-lg overflow-hidden"
        style={{ backgroundColor: 'rgba(10, 10, 15, 0.8)' }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: config.width,
            height: config.height,
          }}
        />
        
        {/* BPM overlay */}
        <div className="absolute top-2 right-3 text-right">
          <motion.div 
            className="text-2xl font-bold font-mono"
            style={{ color: health.color }}
          >
            {displayBpm}
          </motion.div>
          <div className="text-xs text-[var(--color-text-muted)]">BPM</div>
        </div>
        
        {/* Grid lines */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />
      </div>
      
      {/* Stats row */}
      {showStats && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
          <HeartbeatStat 
            label="Critical" 
            value={criticalVulnCount} 
            color={criticalVulnCount > 0 ? '#ff4444' : '#44cc44'} 
            pulse={criticalVulnCount > 0}
          />
          <HeartbeatStat 
            label="High Risk" 
            value={highVulnCount} 
            color={highVulnCount > 0 ? '#ff8c00' : '#44cc44'} 
            pulse={highVulnCount > 0}
          />
          <HeartbeatStat 
            label="Secrets" 
            value={secretsCount} 
            color={secretsCount > 0 ? '#ff4444' : '#44cc44'} 
            pulse={secretsCount > 0}
          />
          <HeartbeatStat 
            label="Risk Score" 
            value={overallRiskScore} 
            color={health.color} 
          />
        </div>
      )}
    </div>
  )
}

function HeartbeatStat({ 
  label, 
  value, 
  color, 
  pulse = false 
}: { 
  label: string
  value: number
  color: string
  pulse?: boolean
}) {
  return (
    <div className="text-center">
      <motion.div 
        className="text-xl font-bold font-mono"
        style={{ color }}
        animate={pulse ? { opacity: [1, 0.5, 1] } : {}}
        transition={pulse ? { duration: 1, repeat: Infinity } : {}}
      >
        {value}
      </motion.div>
      <div className="text-xs text-[var(--color-text-muted)]">{label}</div>
    </div>
  )
}

// Mini version for header/sidebar
export function HeartbeatMini() {
  const { overallRiskScore, criticalVulnCount } = useSecurityStore()
  
  const isHealthy = criticalVulnCount === 0 && overallRiskScore < 30
  const color = isHealthy ? '#44cc44' : criticalVulnCount > 0 ? '#ff4444' : '#ff8c00'
  
  return (
    <motion.div 
      className="flex items-center gap-2 px-3 py-1.5 rounded-full"
      style={{ backgroundColor: `${color}15` }}
      animate={{ 
        boxShadow: [
          `0 0 0px ${color}00`,
          `0 0 15px ${color}40`,
          `0 0 0px ${color}00`,
        ]
      }}
      transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.span 
        className="text-sm"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
      >
        💓
      </motion.span>
      <span 
        className="text-xs font-medium"
        style={{ color }}
      >
        {isHealthy ? 'Healthy' : criticalVulnCount > 0 ? 'Critical' : 'Elevated'}
      </span>
    </motion.div>
  )
}
