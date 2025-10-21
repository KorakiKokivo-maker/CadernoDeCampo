import React from 'react';

// heroicons are loaded from CDN in index.html
// FIX: Using module augmentation for 'react' to properly extend JSX.IntrinsicElements
// instead of `declare global`. This was causing issues with type resolution for standard HTML elements,
// leading to errors like "Property 'div' does not exist on type 'JSX.IntrinsicElements'".
declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'hero-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                name: string;
            };
        }
    }
}

interface IconProps {
  name: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6' }) => {
  // FIX: Changed 'class' to 'className' for consistency with React standards for JSX.
  return <hero-icon name={name} className={className} />;
};

export default Icon;