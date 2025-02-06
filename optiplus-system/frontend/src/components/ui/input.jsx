// frontend/src/components/ui/input.jsx
import React from 'react';
import '../../styles/ui.css';

export const Input = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <input
      className={`input ${className}`}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export const Label = ({ className = '', ...props }) => (
  <label className={`form-label ${className}`} {...props} />
);

export const FormGroup = ({ className = '', ...props }) => (
  <div className={`form-group ${className}`} {...props} />
);