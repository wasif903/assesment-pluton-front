import React from "react";

interface FormFieldErrorProps {
  error?: string | string[];
}

const FormFieldError: React.FC<FormFieldErrorProps> = ({ error }) => {
  if (!error) return null;
  if (Array.isArray(error)) {
    return (
      <ul className="text-red-600 text-sm mt-1">
        {error.map((err, idx) => (
          <li key={idx}>{err}</li>
        ))}
      </ul>
    );
  }
  return <div className="text-red-600 text-sm mt-1">{error}</div>;
};

export default FormFieldError; 