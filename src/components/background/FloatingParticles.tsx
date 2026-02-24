import React, { useMemo } from 'react';

interface FloatingParticlesProps {
  colors: string[];
}

const FloatingParticles: React.FC<FloatingParticlesProps> = ({ colors }) => {
  const particles = useMemo(() => {
    return [...Array(25)].map((_, i) => ({
      width: `${4 + Math.random() * 8}px`,
      height: `${4 + Math.random() * 8}px`,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 20}s`,
      animationDuration: `${15 + Math.random() * 25}s`,
    }));
  }, [colors]);

  return (
    <div className="absolute inset-0">
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-20 animate-float"
          style={{
            ...particle,
            filter: 'blur(1px)'
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;