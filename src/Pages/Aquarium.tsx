import React, { useEffect, useRef, useState } from 'react';
import '../Styles/aquarium.css';

// Particle interface for bubbles and plankton
interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  wobble: number;
  wobbleSpeed: number;
}

// Light ray interface
interface LightRay {
  x: number;
  width: number;
  length: number;
  opacity: number;
  speed: number;
}

// Sea creature interface
interface Creature {
  type: 'turtle' | 'manta' | 'stingray';
  x: number;
  y: number;
  depth: number; // 0-1, affects size and opacity
  speed: number;
  direction: number; // 1 for right, -1 for left
  size: number;
  animationPhase: number;
  verticalOffset: number;
  verticalSpeed: number;
}

// Small fish interface
interface SmallFish {
  x: number;
  y: number;
  speed: number;
  size: number;
  schoolId: number;
  offsetX: number;
  offsetY: number;
  phase: number;
  color: string;
}

const Aquarium: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('aquarium-muted');
    return saved === null ? true : saved === 'true'; // Default to muted
  });
  const particlesRef = useRef<Particle[]>([]);
  const lightRaysRef = useRef<LightRay[]>([]);
  const creaturesRef = useRef<Creature[]>([]);
  const smallFishRef = useRef<SmallFish[]>([]);
  const timeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeParticles();
      initializeLightRays();
      initializeCreatures();
      initializeSmallFish();
    };
    
    // Initialize particles (bubbles)
    const initializeParticles = () => {
      const isMobile = window.innerWidth < 768;
      const particleCount = isMobile ? 20 : 40;
      particlesRef.current = [];
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speed: Math.random() * 20 + 10,
          opacity: Math.random() * 0.3 + 0.1,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: Math.random() * 2 + 1
        });
      }
    };

    // Initialize light rays
    const initializeLightRays = () => {
      const isMobile = window.innerWidth < 768;
      const rayCount = isMobile ? 3 : 5;
      lightRaysRef.current = [];
      
      for (let i = 0; i < rayCount; i++) {
        lightRaysRef.current.push({
          x: (canvas.width / (rayCount + 1)) * (i + 1),
          width: Math.random() * 80 + 40,
          length: canvas.height * 0.6,
          opacity: Math.random() * 0.1 + 0.05,
          speed: Math.random() * 0.3 + 0.2
        });
      }
    };

    // Initialize sea creatures
    const initializeCreatures = () => {
      const isMobile = window.innerWidth < 768;
      const creatureCount = isMobile ? 4 : 7;
      creaturesRef.current = [];
      
      const types: ('turtle' | 'manta' | 'stingray')[] = ['turtle', 'manta', 'stingray'];
      
      for (let i = 0; i < creatureCount; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const depth = Math.random();
        const direction = Math.random() > 0.5 ? 1 : -1;
        
        creaturesRef.current.push({
          type,
          x: Math.random() * canvas.width,
          y: canvas.height * 0.2 + Math.random() * canvas.height * 0.6,
          depth,
          speed: (Math.random() * 30 + 20) * (1 - depth * 0.5), // Deeper = slower
          direction,
          size: Math.random() * 40 + 60,
          animationPhase: Math.random() * Math.PI * 2,
          verticalOffset: 0,
          verticalSpeed: Math.random() * 0.3 + 0.2
        });
      }
    };

    // Initialize small fish schools
    const initializeSmallFish = () => {
      const isMobile = window.innerWidth < 768;
      const schoolCount = isMobile ? 2 : 4;
      const fishPerSchool = isMobile ? 8 : 12;
      smallFishRef.current = [];
      
      // Colorful school colors
      const schoolColors = [
        '#F4A460', // Sandy orange
        '#FFD700', // Golden yellow
        '#FF6B9D', // Pink
        '#9370DB', // Purple
        '#4ECDC4', // Turquoise
        '#FF8C42'  // Coral orange
      ];
      
      for (let school = 0; school < schoolCount; school++) {
        const schoolX = Math.random() * canvas.width;
        const schoolY = canvas.height * 0.15 + Math.random() * canvas.height * 0.7;
        const schoolSpeed = Math.random() * 40 + 30;
        const schoolColor = schoolColors[school % schoolColors.length];
        
        for (let i = 0; i < fishPerSchool; i++) {
          smallFishRef.current.push({
            x: schoolX,
            y: schoolY,
            speed: schoolSpeed,
            size: Math.random() * 3 + 2,
            schoolId: school,
            offsetX: (Math.random() - 0.5) * 60,
            offsetY: (Math.random() - 0.5) * 40,
            phase: Math.random() * Math.PI * 2,
            color: schoolColor
          });
        }
      }
    };

    // Draw sea turtle
    const drawTurtle = (creature: Creature, time: number) => {
      const scale = creature.size * (0.5 + creature.depth * 0.5);
      const flipper = Math.sin(creature.animationPhase) * 0.3;
      
      ctx.save();
      ctx.translate(creature.x, creature.y + creature.verticalOffset);
      ctx.scale(creature.direction, 1);
      ctx.globalAlpha = 0.3 + creature.depth * 0.5;
      
      // Body (shell)
      ctx.fillStyle = `rgba(60, 100, 80, ${0.8})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, scale * 0.6, scale * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Head
      ctx.beginPath();
      ctx.ellipse(scale * 0.7, 0, scale * 0.25, scale * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Front flippers
      ctx.beginPath();
      ctx.ellipse(scale * 0.3, -scale * 0.3 + flipper * scale, scale * 0.4, scale * 0.15, -0.5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.ellipse(scale * 0.3, scale * 0.3 - flipper * scale, scale * 0.4, scale * 0.15, 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Back flippers
      ctx.beginPath();
      ctx.ellipse(-scale * 0.4, -scale * 0.2 - flipper * scale * 0.5, scale * 0.3, scale * 0.12, -0.3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.ellipse(-scale * 0.4, scale * 0.2 + flipper * scale * 0.5, scale * 0.3, scale * 0.12, 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    // Draw manta ray
    const drawManta = (creature: Creature, time: number) => {
      const scale = creature.size * (0.5 + creature.depth * 0.5);
      const wingFlap = Math.sin(creature.animationPhase) * 0.12;
      
      ctx.save();
      ctx.translate(creature.x, creature.y + creature.verticalOffset);
      ctx.scale(creature.direction, 1);
      ctx.globalAlpha = 0.3 + creature.depth * 0.5;
      
      ctx.fillStyle = `rgba(45, 55, 75, ${0.85})`;
      
      // Body disc extending to wide wings (like stingray but wider)
      ctx.beginPath();
      
      // Front head area (rounded)
      ctx.moveTo(scale * 0.6, 0);
      ctx.arc(scale * 0.1, 0, scale * 0.5, -Math.PI * 0.15, Math.PI * 0.15);
      
      // Top wing extending to the side with undulation
      ctx.bezierCurveTo(
        scale * 0.4, scale * 0.6 + wingFlap * scale,
        scale * 0.2, scale * 1.0 + wingFlap * scale * 1.5,
        -scale * 0.1, scale * 1.2 + wingFlap * scale * 1.3
      );
      ctx.bezierCurveTo(
        -scale * 0.3, scale * 1.1 + wingFlap * scale * 0.8,
        -scale * 0.5, scale * 0.8 - wingFlap * scale * 0.3,
        -scale * 0.7, scale * 0.4 - wingFlap * scale * 0.5
      );
      
      // Back of body to tail connection
      ctx.bezierCurveTo(
        -scale * 0.8, scale * 0.2,
        -scale * 0.85, 0,
        -scale * 0.8, -scale * 0.2
      );
      
      // Bottom wing extending to the side with undulation
      ctx.bezierCurveTo(
        -scale * 0.5, -scale * 0.8 + wingFlap * scale * 0.3,
        -scale * 0.3, -scale * 1.1 - wingFlap * scale * 0.8,
        -scale * 0.1, -scale * 1.2 - wingFlap * scale * 1.3
      );
      ctx.bezierCurveTo(
        scale * 0.2, -scale * 1.0 - wingFlap * scale * 1.5,
        scale * 0.4, -scale * 0.6 - wingFlap * scale,
        scale * 0.6, 0
      );
      
      ctx.closePath();
      ctx.fill();
      
      // Cephalic fins (horns) at the front
      ctx.fillStyle = `rgba(40, 50, 70, ${0.9})`;
      ctx.beginPath();
      ctx.moveTo(scale * 0.6, -scale * 0.15);
      ctx.bezierCurveTo(
        scale * 0.75, -scale * 0.2,
        scale * 0.85, -scale * 0.18,
        scale * 0.9, -scale * 0.1
      );
      ctx.bezierCurveTo(
        scale * 0.85, -scale * 0.08,
        scale * 0.7, -scale * 0.05,
        scale * 0.6, -scale * 0.05
      );
      ctx.closePath();
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(scale * 0.6, scale * 0.15);
      ctx.bezierCurveTo(
        scale * 0.75, scale * 0.2,
        scale * 0.85, scale * 0.18,
        scale * 0.9, scale * 0.1
      );
      ctx.bezierCurveTo(
        scale * 0.85, scale * 0.08,
        scale * 0.7, scale * 0.05,
        scale * 0.6, scale * 0.05
      );
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = `rgba(45, 55, 75, ${0.85})`;
      
      // Long thin tail from the back
      const tailWave = Math.sin(creature.animationPhase * 2) * scale * 0.1;
      ctx.beginPath();
      ctx.moveTo(-scale * 0.85, 0);
      ctx.bezierCurveTo(
        -scale * 1.2, tailWave,
        -scale * 1.6, tailWave * 1.5,
        -scale * 2.0, tailWave * 1.2
      );
      ctx.strokeStyle = `rgba(45, 55, 75, ${0.85})`;
      ctx.lineWidth = scale * 0.04;
      ctx.lineCap = 'round';
      ctx.stroke();
      
      // Lighter belly pattern
      ctx.globalAlpha = (0.3 + creature.depth * 0.5) * 0.3;
      ctx.fillStyle = 'rgba(200, 210, 230, 0.5)';
      ctx.beginPath();
      ctx.ellipse(scale * 0.05, 0, scale * 0.4, scale * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    // Draw stingray
    const drawStingray = (creature: Creature, time: number) => {
      const scale = creature.size * (0.5 + creature.depth * 0.5);
      const undulate = Math.sin(creature.animationPhase) * 0.15;
      
      ctx.save();
      ctx.translate(creature.x, creature.y + creature.verticalOffset);
      ctx.scale(creature.direction, 1);
      ctx.globalAlpha = 0.3 + creature.depth * 0.5;
      
      ctx.fillStyle = `rgba(80, 70, 60, ${0.8})`;
      
      // Body (diamond shape with undulation)
      ctx.beginPath();
      ctx.moveTo(scale * 0.6, 0);
      ctx.quadraticCurveTo(
        scale * 0.2, -scale * 0.5 + undulate * scale,
        -scale * 0.3, -scale * 0.4
      );
      ctx.quadraticCurveTo(
        -scale * 0.6, -scale * 0.2 - undulate * scale,
        -scale * 0.8, 0
      );
      ctx.quadraticCurveTo(
        -scale * 0.6, scale * 0.2 + undulate * scale,
        -scale * 0.3, scale * 0.4
      );
      ctx.quadraticCurveTo(
        scale * 0.2, scale * 0.5 - undulate * scale,
        scale * 0.6, 0
      );
      ctx.closePath();
      ctx.fill();
      
      // Tail
      ctx.beginPath();
      ctx.moveTo(-scale * 0.8, 0);
      ctx.quadraticCurveTo(
        -scale * 1.2, undulate * scale * 0.5,
        -scale * 1.6, 0
      );
      ctx.strokeStyle = `rgba(80, 70, 60, ${0.8})`;
      ctx.lineWidth = scale * 0.08;
      ctx.stroke();
      
      ctx.restore();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Simple initialization
    setTimeout(() => setIsLoading(false), 500);

    // Animation loop
    let lastTime = 0;
    const animate = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      timeRef.current += deltaTime;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw underwater gradient background with subtle animation
      const gradientShift = Math.sin(timeRef.current * 0.1) * 5;
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#5BA3D0');
      gradient.addColorStop(0.5, '#3B7FA4');
      gradient.addColorStop(1, '#1A4D7A');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle darker gradient at bottom for depth (no hard line)
      const depthGradient = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height);
      depthGradient.addColorStop(0, 'rgba(10, 30, 50, 0)');
      depthGradient.addColorStop(1, 'rgba(10, 30, 50, 0.15)');
      ctx.fillStyle = depthGradient;
      ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);

      // Draw light rays (caustics effect)
      lightRaysRef.current.forEach(ray => {
        const sway = Math.sin(timeRef.current * ray.speed) * 30;
        const gradient = ctx.createLinearGradient(
          ray.x + sway, 0,
          ray.x + sway + ray.width, ray.length
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${ray.opacity})`);
        gradient.addColorStop(0.3, `rgba(200, 230, 255, ${ray.opacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(ray.x + sway, 0);
        ctx.lineTo(ray.x + ray.width + sway, 0);
        ctx.lineTo(ray.x + ray.width + sway * 1.5, ray.length);
        ctx.lineTo(ray.x + sway * 1.5, ray.length);
        ctx.closePath();
        ctx.fill();
      });

      // Update and draw small fish schools (in background, before main creatures)
      smallFishRef.current.forEach(fish => {
        fish.x += fish.speed * deltaTime;
        fish.phase += deltaTime * 5;
        
        const schoolWobble = Math.sin(timeRef.current * 0.5 + fish.schoolId * 2) * 15;
        const individualWobble = Math.sin(fish.phase) * 3;
        
        // Wrap around
        if (fish.x > canvas.width + 100) {
          fish.x = -100;
          fish.y = canvas.height * 0.15 + Math.random() * canvas.height * 0.7;
        }
        
        // Draw small fish
        const fishX = fish.x + fish.offsetX + individualWobble;
        const fishY = fish.y + fish.offsetY + schoolWobble;
        
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = fish.color;
        
        // Body
        ctx.beginPath();
        ctx.ellipse(fishX, fishY, fish.size * 1.2, fish.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail
        ctx.beginPath();
        ctx.moveTo(fishX - fish.size * 1.2, fishY);
        ctx.lineTo(fishX - fish.size * 1.8, fishY - fish.size * 0.5);
        ctx.lineTo(fishX - fish.size * 1.8, fishY + fish.size * 0.5);
        ctx.closePath();
        ctx.fill();
        
        // Add subtle highlight
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.ellipse(fishX + fish.size * 0.3, fishY - fish.size * 0.2, fish.size * 0.5, fish.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });

      // Sort creatures by depth (draw far ones first)
      const sortedCreatures = [...creaturesRef.current].sort((a, b) => a.depth - b.depth);

      // Update and draw creatures with water current sway
      sortedCreatures.forEach(creature => {
        // Update position with parallax based on depth
        const depthSpeed = 1 - creature.depth * 0.3; // Deeper = slower parallax
        creature.x += creature.speed * creature.direction * deltaTime * depthSpeed;
        creature.animationPhase += deltaTime * 3;
        
        // Add gentle water current sway
        const currentSway = Math.sin(timeRef.current * 0.4 + creature.x * 0.01) * 8;
        creature.verticalOffset = Math.sin(timeRef.current * creature.verticalSpeed) * 20 + currentSway;
        
        // Wrap around screen
        const margin = creature.size * 2;
        if (creature.direction > 0 && creature.x > canvas.width + margin) {
          creature.x = -margin;
          creature.y = canvas.height * 0.2 + Math.random() * canvas.height * 0.6;
        } else if (creature.direction < 0 && creature.x < -margin) {
          creature.x = canvas.width + margin;
          creature.y = canvas.height * 0.2 + Math.random() * canvas.height * 0.6;
        }

        // Draw creature based on type
        if (creature.type === 'turtle') {
          drawTurtle(creature, timeRef.current);
        } else if (creature.type === 'manta') {
          drawManta(creature, timeRef.current);
        } else if (creature.type === 'stingray') {
          drawStingray(creature, timeRef.current);
        }
      });

      // Update and draw particles (bubbles)
      particlesRef.current.forEach(particle => {
        // Update position
        particle.y -= particle.speed * deltaTime;
        particle.wobble += particle.wobbleSpeed * deltaTime;
        const wobbleX = Math.sin(particle.wobble) * 10;
        
        // Wrap around when reaching top
        if (particle.y < -10) {
          particle.y = canvas.height + 10;
          particle.x = Math.random() * canvas.width;
        }

        // Draw bubble
        ctx.beginPath();
        ctx.arc(particle.x + wobbleX, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.fill();
        
        // Add bubble highlight
        ctx.beginPath();
        ctx.arc(
          particle.x + wobbleX - particle.size * 0.3,
          particle.y - particle.size * 0.3,
          particle.size * 0.4,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * 0.6})`;
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      stopAudio();
    };
  }, []);

  // Audio functions
  const createOceanAmbience = () => {
    if (audioContextRef.current) return; // Already created

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      // Create gain node for volume control
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.3;
      gainNodeRef.current = gainNode;

      // Create brown noise for ocean sound
      const bufferSize = audioContext.sampleRate * 2;
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Amplify
      }

      // Create noise source
      const noiseNode = audioContext.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;
      noiseNodeRef.current = noiseNode;

      // Create low-pass filter for muffled underwater effect
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      filter.Q.value = 1;

      // Create subtle oscillator for wave sound
      const oscillator = audioContext.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = 0.5;
      oscillatorRef.current = oscillator;

      const oscGain = audioContext.createGain();
      oscGain.gain.value = 0.1;

      // Connect everything
      noiseNode.connect(filter);
      filter.connect(gainNode);
      oscillator.connect(oscGain);
      oscGain.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Start
      noiseNode.start();
      oscillator.start();
    } catch (error) {
      console.error('Audio creation failed:', error);
    }
  };

  const startAudio = () => {
    if (!audioContextRef.current) {
      createOceanAmbience();
    }
    
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const stopAudio = () => {
    if (audioContextRef.current?.state === 'running') {
      audioContextRef.current.suspend();
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    localStorage.setItem('aquarium-muted', String(newMutedState));
    
    if (newMutedState) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  // Start audio on user interaction if not muted
  useEffect(() => {
    if (!isMuted) {
      // Delay to avoid autoplay restrictions
      const timer = setTimeout(() => {
        startAudio();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isMuted]);

  // Fullscreen functions
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Fullscreen request failed:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error('Exit fullscreen failed:', err);
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard controls for accessibility
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'Escape' && isFullscreen) {
        document.exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen, isMuted]);

  return (
    <div className="aquarium-container" ref={containerRef}>
      {isLoading && (
        <div className="aquarium-loading">
          <div className="loading-text">Loading ocean...</div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="aquarium-canvas"
        style={{ opacity: isLoading ? 0 : 1 }}
        role="img"
        aria-label="Animated underwater ocean scene with sea turtles, manta rays, stingrays, and colorful fish"
      />
      
      {/* Control buttons container */}
      <div className="controls-container">
        {/* Audio toggle button */}
        <button
          className="control-button audio-toggle"
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute ocean sounds (Press M)" : "Mute ocean sounds (Press M)"}
          title={isMuted ? "Unmute ocean sounds (M)" : "Mute ocean sounds (M)"}
        >
          {isMuted ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>

        {/* Fullscreen toggle button */}
        <button
          className="control-button fullscreen-toggle"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen (Press F)" : "Enter fullscreen (Press F)"}
          title={isFullscreen ? "Exit fullscreen (F)" : "Enter fullscreen (F)"}
        >
          {isFullscreen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          )}
        </button>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="keyboard-hints" role="status" aria-live="polite">
        Press M to {isMuted ? 'unmute' : 'mute'} · Press F for fullscreen
      </div>
    </div>
  );
};

export default Aquarium;
