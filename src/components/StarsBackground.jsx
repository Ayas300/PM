import React, { useEffect, useRef, useState } from 'react';
import './StarsBackground.css';

const StarsBackground = ({
  starColor = '#FFF',
  speed = 0.5,
  factor = 0.05, // Density factor
  backgroundColor = 'radial-gradient(ellipse at bottom, #262626 0%, #000 100%)'
}) => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Set canvas size
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const stars = [];
    const numStars = Math.floor((dimensions.width * dimensions.height) * (factor / 100)); // Adjust density calculation

    // Star class/object generator
    const createStar = () => {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5, // Size between 0.5 and 2
        speedX: (Math.random() - 0.5) * speed,
        speedY: (Math.random() - 0.5) * speed,
        opacity: Math.random(),
        opacitySpeed: Math.random() * 0.02 + 0.005
      };
    };

    // Initialize stars
    for (let i = 0; i < numStars; i++) {
      stars.push(createStar());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(star => {
        // Update position
        star.x += star.speedX;
        star.y += star.speedY;

        // Wrap around screen
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        // Twinkle effect
        star.opacity += star.opacitySpeed;
        if (star.opacity > 1 || star.opacity < 0.2) {
          star.opacitySpeed = -star.opacitySpeed;
        }

        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = starColor;
        ctx.globalAlpha = Math.max(0, Math.min(1, star.opacity));
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimensions, starColor, speed, factor]);

  return (
    <div 
      className="stars-background-container"
      style={{ background: backgroundColor }}
    >
      <canvas ref={canvasRef} className="stars-canvas" />
    </div>
  );
};

export default StarsBackground;
