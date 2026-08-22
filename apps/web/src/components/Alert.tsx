import React from 'react';

export interface AlertProps {
  type?: 'error' | 'success' | 'info' | 'warning';
  title?: string;
  message?: string;
  errors?: Record<string, string | string[]>;
  onClose?: () => void;
}

export function Alert({ type = 'info', title, message, errors, onClose }: AlertProps) {
  if (!message && !title && (!errors || Object.keys(errors).length === 0)) {
    return null;
  }

  const alertClass = `alert alert-${type}`;

  return (
    <div className={alertClass} role="alert">
      <div className="alert-content">
        {title && <strong className="alert-title">{title}</strong>}
        {message && <div className="alert-message">{message}</div>}
        {errors && Object.keys(errors).length > 0 && (
          <ul className="alert-errors">
            {Object.entries(errors).map(([field, err]) => {
              const errorText = Array.isArray(err) ? err.join(', ') : err;
              return (
                <li key={field}>
                  <span className="error-field">{field}:</span> {errorText}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {onClose && (
        <button type="button" className="alert-close" onClick={onClose} aria-label="Close alert">
          &times;
        </button>
      )}
    </div>
  );
}
