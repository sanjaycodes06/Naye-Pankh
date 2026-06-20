import { useState } from "react";

/**
 * Lightweight form state manager.
 * Usage: const { values, errors, handleChange, setError, reset } = useForm(initialValues)
 */
const useForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const setError = (field, message) =>
    setErrors((prev) => ({ ...prev, [field]: message }));

  const setFieldValue = (field, value) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values, errors, isSubmitting,
    handleChange, setError, setFieldValue, reset,
    setIsSubmitting, setErrors,
  };
};

export default useForm;
