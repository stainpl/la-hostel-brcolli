// src/components/ui/ParticleBackground.tsx
'use client'

import { useCallback } from 'react'
import Particles from 'react-tsparticles'
import type { Engine } from 'tsparticles-engine'
import { loadSlim } from 'tsparticles-slim'

export default function ParticleBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    // Load the slim bundle (includes links, move, interactivity)
    await loadSlim(engine)
  }, [])

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true },  // cover the viewport
        fpsLimit: 60,
        particles: {
          number: { value: 80, density: { enable: true, area: 800 } },
          color: { value: '#ffffff' },
          shape: { type: 'circle' },
          opacity: { value: 0.5 },
          size: { value: { min: 1, max: 3 } },
          move: {
            enable: true,
            speed: 1,
            outModes: { default: 'out' },
          },
          links: {
            enable: true,
            distance: 120,
            color: '#ffffff',
            opacity: 0.4,
            width: 1,
          },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: 'grab' },
            onClick: { enable: true, mode: 'push' },
            resize: true,
          },
          modes: {
            grab: { distance: 140, links: { opacity: 0.5 } },
            push: { quantity: 4 },
          },
        },
        detectRetina: true,
        background: { opacity: 0 },
      }}
    />
  )
}
