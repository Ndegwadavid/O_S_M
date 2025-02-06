// frontend/src/components/ui/label.jsx
import React from 'react';

const Label = React.forwardRef(({ className = '', ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`label ${className}`}
        {...props}
      />
    );
  });

Label.displayName = "Label";

export { Label };