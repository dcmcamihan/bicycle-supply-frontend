import React from 'react';
import MagicBento from '../../../components/shared/MagicBento';

const FeatureGrid = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
      <MagicBento 
        textAutoHide={true}
        enableStars={true}
        enableSpotlight={true}
        enableBorderGlow={true}
        enableTilt={true}
        enableMagnetism={true}
        clickEffect={true}
        spotlightRadius={300}
        particleCount={12}
        glowColor="184, 135, 43"
      />
    </div>
  );
};

export default FeatureGrid;
