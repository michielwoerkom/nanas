import { useEffect, useRef } from 'react'

const TOKENS = [
  '0',
  '1',
  '0.0',
  '1.0',
  '-0',
  '0.1',
  '42',
  'Inf',
  '-1',
  '2.0',
  '3.14',
  '0.5',
  '-Inf',
  '1e3',
  '8',
  'NaN',
  '69',
  '420',
]

const LIME = { r: 201, g: 247, b: 79 }

function hash(n) {
  const x = Math.sin(n * 127.1) * 43758.5453
  return x - Math.floor(x)
}

function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function buildCells(width, height) {
  const gapX = 54
  const gapY = 28
  const cols = Math.ceil(width / gapX) + 1
  const rows = Math.ceil(height / gapY) + 1
  const cells = []
  let i = 0
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const jitterX = (hash(i + 11) - 0.5) * 8
      const jitterY = (hash(i + 29) - 0.5) * 6
      cells.push({
        x: col * gapX + gapX * 0.5 + jitterX,
        y: row * gapY + gapY * 0.5 + jitterY,
        token: TOKENS[Math.floor(hash(i + 7) * (TOKENS.length - 1))],
        heat: 0,
        phase: hash(i + 53) * Math.PI * 2,
      })
      i += 1
    }
  }
  return cells
}

export default function NanField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d', { alpha: false })
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')

    let width = 0
    let height = 0
    let dpr = 1
    let cells = []
    let frame = 0
    const mouse = { x: 0, y: 0, hasPointer: false }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cells = buildCells(width, height)
    }

    const drawStatic = () => {
      ctx.fillStyle = '#141618'
      ctx.fillRect(0, 0, width, height)
      ctx.font = '500 10px ui-monospace, SFMono-Regular, Menlo, monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (const cell of cells) {
        ctx.fillStyle = `rgba(${LIME.r}, ${LIME.g}, ${LIME.b}, 0.1)`
        ctx.fillText(cell.token, cell.x, cell.y)
      }
    }

    const tick = (now) => {
      const t = now * 0.001
      ctx.fillStyle = '#141618'
      ctx.fillRect(0, 0, width, height)
      ctx.font = '500 10px ui-monospace, SFMono-Regular, Menlo, monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const wx = width * (0.5 + Math.sin(t * 0.12) * 0.3)
      const wy = height * (0.5 + Math.cos(t * 0.09) * 0.24)
      const wanderRadius = 100 + (Math.sin(t * 0.28) + 1) * 35

      for (const cell of cells) {
        const mouseDist = mouse.hasPointer
          ? Math.hypot(cell.x - mouse.x, cell.y - mouse.y)
          : Infinity
        cell.heat +=
          (1 - smoothstep(8, 88, mouseDist) - cell.heat) * 0.18

        const wander =
          1 - smoothstep(16, wanderRadius, Math.hypot(cell.x - wx, cell.y - wy))
        const blink = Math.sin(t * 0.62 + cell.phase) > 0.93 ? 1 : 0
        const glow = Math.max(wander * 0.9, blink, cell.heat)

        const nan = cell.heat > 0.55
        const alpha = (0.08 + glow * 0.4) * (nan ? 1.15 : 1)
        if (alpha < 0.02) continue

        ctx.fillStyle = `rgba(${LIME.r}, ${LIME.g}, ${LIME.b}, ${alpha})`
        ctx.fillText(nan ? 'NaN' : cell.token, cell.x, cell.y)
      }

      frame = window.requestAnimationFrame(tick)
    }

    const onPointerMove = (event) => {
      mouse.x = event.clientX
      mouse.y = event.clientY
      mouse.hasPointer = true
    }

    const onPointerLeave = () => {
      mouse.hasPointer = false
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('mouseleave', onPointerLeave)

    if (motion.matches) {
      drawStatic()
    } else {
      frame = window.requestAnimationFrame(tick)
    }

    const onMotion = () => {
      window.cancelAnimationFrame(frame)
      resize()
      if (motion.matches) drawStatic()
      else frame = window.requestAnimationFrame(tick)
    }
    motion.addEventListener('change', onMotion)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('mouseleave', onPointerLeave)
      motion.removeEventListener('change', onMotion)
    }
  }, [])

  return <canvas ref={canvasRef} className="nan-field" aria-hidden="true" />
}
