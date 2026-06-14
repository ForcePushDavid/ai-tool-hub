'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitButton({ formAction, children, className, variant = 'primary', style }) {
  const { pending } = useFormStatus();

  return (
    <button
      formAction={formAction}
      className={`btn btn-${variant} ${className || ''}`}
      disabled={pending}
      style={style}
    >
      {pending ? (
        <>
          <svg className="loading-spinner-btn" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="31.4 31.4" />
          </svg>
          Moment...
        </>
      ) : (
        children
      )}
    </button>
  );
}
