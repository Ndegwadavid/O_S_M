// frontend/src/components/ui/select.jsx
import React, { useState, useRef, useEffect } from 'react';

const Select = ({ children, value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={selectRef} className="select-container">
      {React.Children.map(children, child => {
        return React.cloneElement(child, {
          isOpen,
          setIsOpen,
          value,
          onChange
        });
      })}
    </div>
  );
};

const SelectTrigger = ({ isOpen, setIsOpen, value, children, className = '' }) => {
  return (
    <button
      type="button"
      className={`select-trigger ${isOpen ? 'open' : ''} ${className}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      {children}
      <span className="select-arrow">▼</span>
    </button>
  );
};

const SelectContent = ({ isOpen, children, className = '' }) => {
  if (!isOpen) return null;
  
  return (
    <div className={`select-content ${className}`}>
      {children}
    </div>
  );
};

const SelectItem = ({ value, children, onChange, className = '' }) => {
  return (
    <div
      className={`select-item ${className}`}
      onClick={() => onChange && onChange(value)}
    >
      {children}
    </div>
  );
};

const SelectValue = ({ value, placeholder = 'Select option...' }) => {
  return <span className="select-value">{value || placeholder}</span>;
};

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
};