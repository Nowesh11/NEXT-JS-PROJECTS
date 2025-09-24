/**
 * Accessible Form Components
 * WCAG 2.1 AA compliant form elements with comprehensive validation
 */

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { 
  useScreenReader, 
  formValidation, 
  aria, 
  focusVisible,
  ScreenReaderOnly,
  LiveRegion
} from '../../lib/accessibility';

// Form Context
const FormContext = React.createContext();

// Main Form Component
export const AccessibleForm = ({ 
  children, 
  onSubmit, 
  validation = {}, 
  initialValues = {},
  className = '',
  ...props 
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { announce } = useScreenReader();
  const formRef = useRef(null);

  // Validate field
  const validateField = (name, value) => {
    const fieldValidation = validation[name];
    if (!fieldValidation) return '';

    for (const rule of fieldValidation) {
      const error = rule(value, values);
      if (error) return error;
    }
    return '';
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    Object.keys(validation).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) newErrors[name] = error;
    });
    return newErrors;
  };

  // Handle field change
  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle field blur
  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
    
    if (error) {
      announce(`${name} field has an error: ${error}`, 'assertive');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formErrors = validateForm();
    setErrors(formErrors);
    setTouched(Object.keys(validation).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    if (Object.keys(formErrors).length > 0) {
      const errorCount = Object.keys(formErrors).length;
      announce(`Form has ${errorCount} error${errorCount > 1 ? 's' : ''}. Please review and correct.`, 'assertive');
      
      // Focus first error field
      const firstErrorField = Object.keys(formErrors)[0];
      const errorElement = formRef.current?.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.focus();
      }
      
      setIsSubmitting(false);
      return;
    }
    
    try {
      await onSubmit?.(values);
      announce('Form submitted successfully', 'polite');
    } catch (error) {
      announce(`Form submission failed: ${error.message}`, 'assertive');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contextValue = {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    validateField
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={`space-y-6 ${className}`}
        noValidate
        {...props}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
};

// Form Field Wrapper
export const FormField = ({ 
  name, 
  label, 
  description, 
  required = false, 
  children, 
  className = '' 
}) => {
  const { errors, touched } = React.useContext(FormContext);
  const hasError = touched[name] && errors[name];
  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;
  const descriptionId = `${fieldId}-description`;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label 
          htmlFor={fieldId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">*</span>
          )}
        </label>
      )}
      
      {description && (
        <p 
          id={descriptionId}
          className="text-sm text-gray-600 dark:text-gray-400"
        >
          {description}
        </p>
      )}
      
      {React.cloneElement(children, {
        id: fieldId,
        name,
        required,
        'aria-describedby': [
          description ? descriptionId : null,
          hasError ? errorId : null
        ].filter(Boolean).join(' ') || undefined,
        'aria-invalid': hasError ? 'true' : 'false'
      })}
      
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-2 text-red-600 dark:text-red-400"
            role="alert"
            aria-live="polite"
          >
            <ExclamationCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span id={errorId} className="text-sm">
              {errors[name]}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Text Input Component
export const TextInput = forwardRef(({ 
  type = 'text', 
  placeholder, 
  className = '', 
  ...props 
}, ref) => {
  const { values, handleChange, handleBlur } = React.useContext(FormContext);
  const value = values[props.name] || '';

  return (
    <input
      ref={ref}
      type={type}
      value={value}
      onChange={(e) => handleChange(props.name, e.target.value)}
      onBlur={() => handleBlur(props.name)}
      placeholder={placeholder}
      className={`
        w-full px-4 py-3 glass-morphism rounded-xl 
        text-gray-800 dark:text-white 
        placeholder-gray-500 dark:placeholder-gray-400 
        border border-gray-200 dark:border-gray-700
        ${focusVisible.input}
        transition-all duration-200
        ${className}
      `}
      {...props}
    />
  );
});

TextInput.displayName = 'TextInput';

// Password Input Component
export const PasswordInput = forwardRef(({ 
  placeholder = '••••••••', 
  className = '', 
  showToggle = true,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const { values, handleChange, handleBlur } = React.useContext(FormContext);
  const value = values[props.name] || '';
  const toggleId = `${props.name}-toggle`;

  return (
    <div className="relative">
      <input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(e) => handleChange(props.name, e.target.value)}
        onBlur={() => handleBlur(props.name)}
        placeholder={placeholder}
        className={`
          w-full px-4 py-3 glass-morphism rounded-xl 
          text-gray-800 dark:text-white 
          placeholder-gray-500 dark:placeholder-gray-400 
          border border-gray-200 dark:border-gray-700
          ${showToggle ? 'pr-12' : ''}
          ${focusVisible.input}
          transition-all duration-200
          ${className}
        `}
        aria-describedby={showToggle ? `${toggleId}-desc` : undefined}
        {...props}
      />
      
      {showToggle && (
        <>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`
              absolute right-3 top-1/2 transform -translate-y-1/2 
              text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
              transition-colors rounded p-1
              ${focusVisible.button}
            `}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-describedby={`${toggleId}-desc`}
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" aria-hidden="true" />
            ) : (
              <EyeIcon className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
          
          <ScreenReaderOnly>
            <div id={`${toggleId}-desc`}>
              {showPassword ? 'Password is currently visible' : 'Password is currently hidden'}
            </div>
          </ScreenReaderOnly>
        </>
      )}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

// Textarea Component
export const Textarea = forwardRef(({ 
  rows = 4, 
  placeholder, 
  className = '', 
  ...props 
}, ref) => {
  const { values, handleChange, handleBlur } = React.useContext(FormContext);
  const value = values[props.name] || '';

  return (
    <textarea
      ref={ref}
      rows={rows}
      value={value}
      onChange={(e) => handleChange(props.name, e.target.value)}
      onBlur={() => handleBlur(props.name)}
      placeholder={placeholder}
      className={`
        w-full px-4 py-3 glass-morphism rounded-xl 
        text-gray-800 dark:text-white 
        placeholder-gray-500 dark:placeholder-gray-400 
        border border-gray-200 dark:border-gray-700
        ${focusVisible.input}
        transition-all duration-200 resize-vertical
        ${className}
      `}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

// Select Component
export const Select = forwardRef(({ 
  options = [], 
  placeholder = 'Select an option', 
  className = '', 
  ...props 
}, ref) => {
  const { values, handleChange, handleBlur } = React.useContext(FormContext);
  const value = values[props.name] || '';

  return (
    <select
      ref={ref}
      value={value}
      onChange={(e) => handleChange(props.name, e.target.value)}
      onBlur={() => handleBlur(props.name)}
      className={`
        w-full px-4 py-3 glass-morphism rounded-xl 
        text-gray-800 dark:text-white 
        border border-gray-200 dark:border-gray-700
        ${focusVisible.input}
        transition-all duration-200
        ${className}
      `}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
});

Select.displayName = 'Select';

// Checkbox Component
export const Checkbox = forwardRef(({ 
  label, 
  description, 
  className = '', 
  ...props 
}, ref) => {
  const { values, handleChange } = React.useContext(FormContext);
  const checked = values[props.name] || false;
  const checkboxId = `checkbox-${props.name}`;
  const descriptionId = description ? `${checkboxId}-desc` : undefined;

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <input
        ref={ref}
        id={checkboxId}
        type="checkbox"
        checked={checked}
        onChange={(e) => handleChange(props.name, e.target.checked)}
        className={`
          w-4 h-4 mt-1 text-cultural-500 bg-gray-100 dark:bg-gray-700 
          border-gray-300 dark:border-gray-600 rounded 
          ${focusVisible.input}
        `}
        aria-describedby={descriptionId}
        {...props}
      />
      
      <div className="flex-1">
        {label && (
          <label 
            htmlFor={checkboxId}
            className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            {label}
          </label>
        )}
        
        {description && (
          <p 
            id={descriptionId}
            className="text-sm text-gray-600 dark:text-gray-400 mt-1"
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

// Radio Group Component
export const RadioGroup = ({ 
  name, 
  options = [], 
  className = '', 
  ...props 
}) => {
  const { values, handleChange } = React.useContext(FormContext);
  const value = values[name] || '';

  return (
    <fieldset className={`space-y-3 ${className}`} {...props}>
      {options.map((option, index) => {
        const radioId = `${name}-${index}`;
        const isChecked = value === option.value;
        
        return (
          <div key={option.value} className="flex items-start gap-3">
            <input
              id={radioId}
              type="radio"
              name={name}
              value={option.value}
              checked={isChecked}
              onChange={(e) => handleChange(name, e.target.value)}
              className={`
                w-4 h-4 mt-1 text-cultural-500 bg-gray-100 dark:bg-gray-700 
                border-gray-300 dark:border-gray-600 
                ${focusVisible.input}
              `}
            />
            
            <div className="flex-1">
              <label 
                htmlFor={radioId}
                className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {option.label}
              </label>
              
              {option.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </fieldset>
  );
};

// Submit Button Component
export const SubmitButton = ({ 
  children, 
  loadingText = 'Submitting...', 
  className = '', 
  ...props 
}) => {
  const { isSubmitting } = React.useContext(FormContext);

  return (
    <motion.button
      type="submit"
      disabled={isSubmitting}
      className={`
        w-full flex items-center justify-center gap-2 px-6 py-3 
        bg-gradient-to-r from-cultural-500 to-cultural-600 
        text-white font-medium rounded-xl 
        hover:from-cultural-600 hover:to-cultural-700 
        disabled:opacity-50 disabled:cursor-not-allowed 
        ${focusVisible.button}
        transition-all duration-200
        ${className}
      `}
      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
      {...props}
    >
      {isSubmitting ? (
        <>
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

// Validation Rules
export const validationRules = {
  required: (message = 'This field is required') => (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message;
    }
    return '';
  },
  
  email: (message = 'Please enter a valid email address') => (value) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return message;
    }
    return '';
  },
  
  minLength: (min, message) => (value) => {
    if (value && value.length < min) {
      return message || `Must be at least ${min} characters`;
    }
    return '';
  },
  
  maxLength: (max, message) => (value) => {
    if (value && value.length > max) {
      return message || `Must be no more than ${max} characters`;
    }
    return '';
  },
  
  pattern: (regex, message = 'Invalid format') => (value) => {
    if (value && !regex.test(value)) {
      return message;
    }
    return '';
  },
  
  match: (fieldName, message) => (value, allValues) => {
    if (value && value !== allValues[fieldName]) {
      return message || `Must match ${fieldName}`;
    }
    return '';
  }
};

export default {
  AccessibleForm,
  FormField,
  TextInput,
  PasswordInput,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
  SubmitButton,
  validationRules
};