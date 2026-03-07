import React from 'react';
import { Input } from '@/components/atoms/Input';
import { FieldError } from 'react-hook-form';

type FormFieldProps = {
  label: string;
  error?: FieldError;
  description?: string;
} & React.ComponentProps<typeof Input>;

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, description, ...props }, ref) => (
    <div className="w-full">
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      <Input ref={ref} isError={!!error} {...props} />
      {error && <p className="mt-2 text-sm text-red-600 font-bold">{error.message}</p>}
      {!error && description && <p className="mt-2 text-sm text-gray-500 font-medium">{description}</p>}
    </div>
  )
);
FormField.displayName = 'FormField';
