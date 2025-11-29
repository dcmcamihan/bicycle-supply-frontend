import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { History, Heart, Zap } from 'lucide-react';

const DEFAULT_ITEMS = [
  {
    title: 'Text Animations',
    description: 'Cool text animations for your projects.',
    id: 1
  },
  {
    title: 'Animations',
    description: 'Smooth animations for your projects.',
    id: 2
  },
  {
    title: 'Components',
    description: 'Reusable components for your projects.',
    id: 3
  },
  {
    title: 'Backgrounds',
    description: 'Beautiful backgrounds and patterns for your projects.',
    id: 4
  },
  {
    title: 'Common UI',
    description: 'Common UI components are coming soon!',
    id: 5
  }
];

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: 'spring', stiffness: 300, damping: 40, mass: 0.8 };

export default function Carousel({
  items = DEFAULT_ITEMS,
  baseWidth = 620,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false
}) {
  const containerPadding = 16;
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;

  const carouselItems = loop ? [...items, items[0]] : items;
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const containerRef = useRef(null);
  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  useEffect(() => {
    if (autoplay && (!pauseOnHover || !isHovered)) {
      const timer = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev === items.length - 1 && loop) {
            return prev + 1;
          }
          if (prev === carouselItems.length - 1) {
            return loop ? 0 : prev;
          }
          return prev + 1;
        });
      }, autoplayDelay);
      return () => clearInterval(timer);
    }
  }, [autoplay, autoplayDelay, isHovered, loop, items.length, carouselItems.length, pauseOnHover]);

  const effectiveTransition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationComplete = () => {
    if (loop && currentIndex === carouselItems.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      setTimeout(() => setIsResetting(false), 50);
    }
  };

  const handleDragEnd = (_, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      if (loop && currentIndex === items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(prev => Math.min(prev + 1, carouselItems.length - 1));
      }
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      if (loop && currentIndex === 0) {
        setCurrentIndex(items.length - 1);
      } else {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
      }
    }
  };

  const dragProps = loop
    ? {}
    : {
        dragConstraints: {
          left: -trackItemOffset * (carouselItems.length - 1),
          right: 0
        }
      };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden p-4 ${
        round ? 'rounded-full border border-white' : 'rounded-3xl bg-gradient-to-br from-slate-900/50 to-slate-900/30 backdrop-blur-sm border border-emerald-500/20 shadow-2xl'
      }`}
      style={{
        width: `${baseWidth}px`,
        ...(round && { height: `${baseWidth}px` })
      }}
    >
      <motion.div
        className="flex"
        drag="x"
        dragElastic={0.2}
        dragMomentum={true}
        {...dragProps}
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          x,
          willChange: 'transform'
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselItems.map((item, index) => {
          return (
            <motion.div
              key={index}
              className={`relative shrink-0 flex flex-col ${
                round
                  ? 'items-center justify-center text-center bg-[#060010] border-0'
                  : 'items-start justify-between bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 border border-emerald-500/30 rounded-2xl shadow-lg hover:border-emerald-400/50 hover:shadow-emerald-500/20 transition-all duration-300'
              } overflow-hidden cursor-grab active:cursor-grabbing`}
              style={{
                width: itemWidth,
                height: round ? itemWidth : '100%',
                ...(round && { borderRadius: '50%' }),
                willChange: 'transform'
              }}
              transition={effectiveTransition}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <div className={`${round ? 'p-0 m-0' : 'mb-4 p-6'}`}>
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/40 to-emerald-600/30 border border-emerald-500/50 text-emerald-300">
                  {item.icon}
                </span>
              </div>
              <div className="p-6 pt-0">
                <div className="mb-3 font-bold text-xl text-white">{item.title}</div>
                <p className="text-sm text-gray-300 leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      <div className={`flex w-full justify-center ${round ? 'absolute z-20 bottom-12 left-1/2 -translate-x-1/2' : ''}`}>
        <div className="mt-6 flex w-auto gap-3 px-8">
          {items.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                currentIndex % items.length === index
                  ? round
                    ? 'bg-white'
                    : 'bg-emerald-500'
                  : round
                    ? 'bg-[#555]'
                    : 'bg-slate-600'
              }`}
              animate={{
                scale: currentIndex % items.length === index ? 1 : 1,
                width: currentIndex % items.length === index ? 32 : 8
              }}
              onClick={() => setCurrentIndex(index)}
              transition={{ duration: 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
