/**
 * Quantiverse UI Component Library
 * Professional, reusable components for a startup-grade experience
 */

import React from 'react';
import { Loader2, AlertCircle, CheckCircle2, Info, ChevronRight } from 'lucide-react';

// ============================================
// PAGE HEADER
// ============================================
export const PageHeader = ({ 
  title, 
  subtitle, 
  children, 
  breadcrumb,
  className = '' 
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      {breadcrumb && (
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-3">
          {breadcrumb.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="w-4 h-4" />}
              {item.href ? (
                <a href={item.href} className="hover:text-indigo-600 transition-colors">
                  {item.label}
                </a>
              ) : (
                <span className="text-slate-700 font-medium">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-slate-600 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// STAT CARD
// ============================================
export const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  changeType = 'neutral',
  className = '' 
}) => {
  const changeColors = {
    positive: 'text-emerald-600 bg-emerald-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-slate-600 bg-slate-50'
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {change && (
            <span className={`inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${changeColors[changeType]}`}>
              {change}
            </span>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-indigo-50 rounded-xl">
            <Icon className="w-6 h-6 text-indigo-600" />
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// CONTENT CARD
// ============================================
export const ContentCard = ({ 
  title, 
  subtitle,
  children, 
  footer,
  padding = 'normal',
  className = '' 
}) => {
  const paddingClasses = {
    none: '',
    compact: 'p-4',
    normal: 'p-6',
    large: 'p-8'
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-slate-100">
          {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
      )}
      <div className={paddingClasses[padding]}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
          {footer}
        </div>
      )}
    </div>
  );
};

// ============================================
// ACTION BUTTON
// ============================================
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-indigo-500',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </>
      )}
    </button>
  );
};

// ============================================
// EMPTY STATE
// ============================================
export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {Icon && (
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-slate-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      {description && (
        <p className="text-slate-500 max-w-sm mb-6">{description}</p>
      )}
      {action}
    </div>
  );
};

// ============================================
// LOADING SKELETON
// ============================================
export const Skeleton = ({ 
  variant = 'text', 
  width, 
  height,
  className = '' 
}) => {
  const variants = {
    text: 'h-4 rounded',
    title: 'h-8 rounded',
    avatar: 'rounded-full',
    card: 'rounded-xl',
    button: 'h-10 rounded-lg'
  };

  return (
    <div 
      className={`bg-slate-200 animate-pulse ${variants[variant]} ${className}`}
      style={{ width, height }}
    />
  );
};

export const CardSkeleton = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-6">
    <Skeleton variant="avatar" width={48} height={48} className="mb-4" />
    <Skeleton variant="title" width="60%" className="mb-2" />
    <Skeleton variant="text" width="100%" className="mb-2" />
    <Skeleton variant="text" width="80%" />
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-slate-200">
        <Skeleton variant="avatar" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="60%" />
        </div>
        <Skeleton variant="button" width={80} />
      </div>
    ))}
  </div>
);

// ============================================
// BADGE
// ============================================
export const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '' 
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-indigo-100 text-indigo-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-sky-100 text-sky-700'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

// ============================================
// ALERT
// ============================================
export const Alert = ({ 
  variant = 'info', 
  title, 
  children,
  className = '' 
}) => {
  const variants = {
    info: { bg: 'bg-sky-50 border-sky-200', icon: Info, iconColor: 'text-sky-600', title: 'text-sky-800', text: 'text-sky-700' },
    success: { bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2, iconColor: 'text-emerald-600', title: 'text-emerald-800', text: 'text-emerald-700' },
    warning: { bg: 'bg-amber-50 border-amber-200', icon: AlertCircle, iconColor: 'text-amber-600', title: 'text-amber-800', text: 'text-amber-700' },
    error: { bg: 'bg-red-50 border-red-200', icon: AlertCircle, iconColor: 'text-red-600', title: 'text-red-800', text: 'text-red-700' }
  };

  const { bg, icon: Icon, iconColor, title: titleColor, text: textColor } = variants[variant];

  return (
    <div className={`rounded-lg border p-4 ${bg} ${className}`}>
      <div className="flex gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
        <div>
          {title && <h4 className={`font-medium mb-1 ${titleColor}`}>{title}</h4>}
          <div className={`text-sm ${textColor}`}>{children}</div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// INPUT
// ============================================
export const Input = ({ 
  label, 
  error, 
  hint,
  icon: Icon,
  className = '',
  ...props 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="w-5 h-5 text-slate-400" />
          </div>
        )}
        <input
          className={`
            block w-full rounded-lg border bg-white px-3 py-2 text-slate-900 
            placeholder:text-slate-400 transition-colors
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}
          `}
          {...props}
        />
      </div>
      {hint && !error && (
        <p className="mt-1.5 text-sm text-slate-500">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// ============================================
// SELECT
// ============================================
export const Select = ({ 
  label, 
  error, 
  options = [],
  placeholder = 'Select an option',
  className = '',
  ...props 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        className={`
          block w-full rounded-lg border bg-white px-3 py-2 text-slate-900 
          transition-colors appearance-none cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
          ${error ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}
        `}
        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// ============================================
// DIVIDER
// ============================================
export const Divider = ({ label, className = '' }) => {
  if (label) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-slate-500">{label}</span>
        </div>
      </div>
    );
  }
  return <div className={`border-t border-slate-200 ${className}`} />;
};

// ============================================
// PROGRESS BAR
// ============================================
export const ProgressBar = ({ 
  value = 0, 
  max = 100, 
  showLabel = false,
  size = 'md',
  color = 'primary',
  className = '' 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  };

  const colors = {
    primary: 'bg-indigo-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
    danger: 'bg-red-600'
  };

  return (
    <div className={className}>
      <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${sizes[size]}`}>
        <div 
          className={`${colors[color]} ${sizes[size]} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-sm text-slate-600 text-right">{Math.round(percentage)}%</p>
      )}
    </div>
  );
};

// ============================================
// AVATAR
// ============================================
export const Avatar = ({ 
  src, 
  name, 
  size = 'md',
  className = '' 
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  if (src) {
    return (
      <img 
        src={src} 
        alt={name} 
        className={`rounded-full object-cover ${sizes[size]} ${className}`}
      />
    );
  }

  return (
    <div className={`rounded-full bg-indigo-100 text-indigo-700 font-medium flex items-center justify-center ${sizes[size]} ${className}`}>
      {initials}
    </div>
  );
};

export default {
  PageHeader,
  StatCard,
  ContentCard,
  Button,
  EmptyState,
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  Badge,
  Alert,
  Input,
  Select,
  Divider,
  ProgressBar,
  Avatar
};
