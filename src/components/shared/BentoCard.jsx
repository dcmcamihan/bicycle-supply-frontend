import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';

// Green and gold palette from the landing theme
const GLOW_COLORS = {
  green: '3, 75, 58', // #034b3a - emerald
  gold: '184, 135, 43', // #b8872b - warm gold
  darkGreen: '2, 43, 34' // #032b22 - deep green
};

const DEFAULT_PARTICLE_COUNT = 12;
const MOBILE_BREAKPOINT = 768;

const createParticleElement = (x, y, glowColor = GLOW_COLORS.gold) => {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${glowColor}, 0.8);
    box-shadow: 0 0 8px rgba(${glowColor}, 0.7);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const ParticleCard = ({
  children,
  className = '',
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = GLOW_COLORS.gold,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false
}) => {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const timeoutsRef = useRef([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;

    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach(particle => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        }
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;

    if (!particlesInitialized.current) {
      initializeParticles();
    }

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const clone = particle.cloneNode(true);
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          yoyo: true
        });

        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true
        });
      }, index * 100);

      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;

    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 5,
          rotateY: 5,
          duration: 0.3,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }

      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const handleMouseMove = e => {
      if (!enableTilt && !enableMagnetism) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05;
        const magnetY = (y - centerY) * 0.05;

        magnetismAnimationRef.current = gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const handleClick = e => {
      if (!clickEffect) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;

      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        {
          scale: 0,
          opacity: 1
        },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => ripple.remove()
        }
      );
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('click', handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('click', handleClick);
      clearAllParticles();
    };
  }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor]);

  return (
    <div
      ref={cardRef}
      className={`${className} relative overflow-hidden`}
      style={{ ...style, position: 'relative', overflow: 'hidden' }}
    >
      {children}
    </div>
  );
};

const BentoCard = ({ children, className, colSpan = 1, rowSpan = 1, title, icon: Icon, enableParticles = true, disableAnimations = false }) => {
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isMobile = useState(() => window.innerWidth <= MOBILE_BREAKPOINT)[0];

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const div = cardRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setOpacity(1);

    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    setRotation({ x: yPct * -10, y: xPct * 10 });
  };

  const handleMouseLeave = () => {
    setOpacity(0);
    setRotation({ x: 0, y: 0 });
  };

  const cardStyles = {
    gridColumn: `span ${colSpan}`,
    gridRow: `span ${rowSpan}`,
    transformStyle: "preserve-3d",
    transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
    transition: "transform 0.1s ease-out",
    backgroundColor: 'rgba(3, 43, 34, 0.5)',
    borderColor: 'rgba(184, 135, 43, 0.5)',
    boxShadow: opacity > 0 ? `0 0 40px 2px rgba(184, 135, 43, ${opacity * 0.6}), inset 0 0 60px rgba(184, 135, 43, ${opacity * 0.3})` : 'none'
  };

  const cardClasses = `relative overflow-hidden rounded-3xl border border-solid bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 backdrop-blur-xl shadow-2xl transition-shadow duration-300 ${className || ''}`;

  const cardContent = (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 rounded-3xl"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, rgba(184, 135, 43, 0.5) 0%, rgba(184, 135, 43, 0.3) 20%, rgba(184, 135, 43, 0.1) 40%, transparent 70%)`
        }}
      />
      
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 rounded-3xl border border-solid" 
        style={{
          opacity: opacity * 0.8,
          borderColor: `rgba(184, 135, 43, ${0.8 * opacity})`,
          boxShadow: `inset 0 0 40px rgba(184, 135, 43, ${0.3 * opacity}), 0 0 30px rgba(184, 135, 43, ${0.4 * opacity})`
        }}
      />
      
      <div className="relative flex h-full flex-col p-6 z-10">
        {Icon && (
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 text-amber-400 shadow-inner">
            <Icon size={24} />
          </div>
        )}
        {title && <h3 className="mb-2 text-xl font-bold text-white tracking-tight">{title}</h3>}
        <div className="text-gray-300 text-sm leading-relaxed">{children}</div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-amber-500/20" 
      />
    </>
  );

  if (!disableAnimations && !isMobile && enableParticles) {
    return (
      <ParticleCard
        className={cardClasses}
        style={cardStyles}
        disableAnimations={false}
        particleCount={DEFAULT_PARTICLE_COUNT}
        glowColor={GLOW_COLORS.gold}
        enableTilt={true}
        clickEffect={true}
        enableMagnetism={false}
      >
        {cardContent}
      </ParticleCard>
    );
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cardClasses}
      style={cardStyles}
    >
      {cardContent}
    </div>
  );
};

export { BentoCard, ParticleCard, GLOW_COLORS, DEFAULT_PARTICLE_COUNT };
export default BentoCard;
