import React, { useState, useEffect, useRef } from 'react';

const CategoryAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = 'Enter category',
  className = '',
  name = 'category'
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const wrapperRef = useRef(null);

  // Validation constants
  const MIN_LENGTH = 3;
  const MAX_LENGTH = 50;
  const INVALID_CHARS_REGEX = /[<>{}[\]\\|`~^]/;
  const VALID_CHARS_REGEX = /^[a-zA-Z0-9\s\-&/().,]+$/;

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear error when value changes
  useEffect(() => {
    if (error && value) {
      setError('');
    }
  }, [value]);

  // Validate category input
  const validateCategory = (category) => {
    const trimmed = category.trim();
    
    // Check minimum length
    if (trimmed.length > 0 && trimmed.length < MIN_LENGTH) {
      return { valid: false, message: `Category must be at least ${MIN_LENGTH} characters` };
    }
    
    // Check maximum length
    if (trimmed.length > MAX_LENGTH) {
      return { valid: false, message: `Category must not exceed ${MAX_LENGTH} characters` };
    }
    
    // Check for invalid characters (XSS protection)
    if (INVALID_CHARS_REGEX.test(trimmed)) {
      return { valid: false, message: 'Category contains invalid characters' };
    }
    
    // Check if contains only valid characters
    if (trimmed.length > 0 && !VALID_CHARS_REGEX.test(trimmed)) {
      return { valid: false, message: 'Only letters, numbers, spaces, and - & / ( ) . , are allowed' };
    }
    
    return { valid: true, message: '' };
  };

  // Sanitize input (remove HTML tags and dangerous characters)
  const sanitizeInput = (input) => {
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>{}[\]\\|`~^]/g, '') // Remove dangerous characters
      .trim();
  };

  // Fetch suggestions when user types
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(
        `${API_BASE}/api/categories/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      
      if (data.categories && data.categories.length > 0) {
        setSuggestions(data.categories);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Save category to backend
  const saveCategory = async (category) => {
    // Validate before saving
    const validation = validateCategory(category);
    if (!validation.valid) {
      setError(validation.message);
      return false;
    }

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: category.trim() }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to save category');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Network error. Please try again.');
      return false;
    }
  };

  const handleInputChange = (e) => {
    let newValue = e.target.value;
    
    // Prevent exceeding max length while typing
    if (newValue.length > MAX_LENGTH) {
      setError(`Maximum ${MAX_LENGTH} characters allowed`);
      return;
    }
    
    // Sanitize input in real-time
    newValue = sanitizeInput(newValue);
    
    // Clear error if input is valid
    const validation = validateCategory(newValue);
    if (validation.valid) {
      setError('');
    }
    
    // Update parent component
    const syntheticEvent = {
      target: {
        name: name,
        value: newValue
      }
    };
    onChange(syntheticEvent);
    
    // Fetch suggestions
    fetchSuggestions(newValue);
  };

  const handleSuggestionClick = (suggestion) => {
    // Create a synthetic event to match the expected onChange signature
    const syntheticEvent = {
      target: {
        name: name,
        value: suggestion
      }
    };
    onChange(syntheticEvent);
    setShowSuggestions(false);
    setSuggestions([]);
    setError('');
  };

  const handleBlur = () => {
    // Validate and save the category when the user finishes typing
    if (value && value.trim()) {
      const validation = validateCategory(value);
      if (!validation.valid) {
        setError(validation.message);
        return;
      }
      saveCategory(value.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && showSuggestions && suggestions.length > 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[0]);
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        style={error ? { borderColor: '#ef4444' } : {}}
      />
      
      {/* Error message */}
      {error && (
        <div
          style={{
            color: '#ef4444',
            fontSize: '12px',
            marginTop: '4px',
            position: 'absolute',
            left: 0,
            top: '100%',
          }}
        >
          {error}
        </div>
      )}
      
      {/* Character counter */}
      {value && !error && (
        <div
          style={{
            fontSize: '11px',
            color: value.length > MAX_LENGTH * 0.9 ? '#f59e0b' : '#9ca3af',
            marginTop: '4px',
            position: 'absolute',
            right: 0,
            top: '100%',
          }}
        >
          {value.length}/{MAX_LENGTH}
        </div>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent blur event
                handleSuggestionClick(suggestion);
              }}
              style={{
                padding: '10px 15px',
                cursor: 'pointer',
                borderBottom: index < suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
      
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '12px',
            color: '#999',
          }}
        >
          ...
        </div>
      )}
    </div>
  );
};

export default CategoryAutocomplete;
