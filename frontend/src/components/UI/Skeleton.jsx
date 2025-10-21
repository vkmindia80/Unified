import React from 'react';

const Skeleton = ({ 
  variant = 'text',
  width,
  height,
  className = '',
  count = 1,
  circle = false,
}) => {
  const baseClasses = 'skeleton rounded animate-shimmer';
  
  const variants = {
    text: 'h-4',
    title: 'h-6',
    subtitle: 'h-5',
    card: 'h-32',
    avatar: 'w-10 h-10 rounded-full',
    button: 'h-10 w-24 rounded-lg',
  };

  const variantClass = variants[variant] || variants.text;
  const circleClass = circle ? 'rounded-full' : '';
  
  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`${baseClasses} ${variantClass} ${circleClass} ${className}`}
      style={{
        width: width || (circle ? height : undefined),
        height: height,
      }}
    />
  ));

  return count > 1 ? <div className="space-y-2">{items}</div> : items[0];
};

export default Skeleton;
