// frontend/src/components/ui/button.jsx
import React from 'react';
import '../../styles/ui.css';

export const Button = React.forwardRef(({ 
  className = '', 
  variant = 'primary',
  type = 'button',
  ...props 
}, ref) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = 'Button';