import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../api";
import FormFieldError from "../components/FormFieldError";

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string | string[] }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const mutation = useLogin();
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (mutation.isError) {
      const error = mutation.error as any;
      const apiError = error?.response?.data;
      setFieldErrors({});
      setGeneralError(null);
      if (apiError?.details && Array.isArray(apiError.details)) {
        // Map details to fields if possible
        const errors: { [key: string]: string[] } = {};
        apiError.details.forEach((msg: string) => {
          if (msg.toLowerCase().includes("identifier") || msg.toLowerCase().includes("email")) errors.identifier = [...(errors.identifier || []), msg];
          else if (msg.toLowerCase().includes("password")) errors.password = [...(errors.password || []), msg];
          else errors.general = [...(errors.general || []), msg];
        });
        setFieldErrors(errors);
        if (errors.general) setGeneralError(errors.general.join(" "));
      } else if (apiError?.message) {
        setGeneralError(apiError.message);
      } else {
        setGeneralError("Login failed. Try again.");
      }
    }
  }, [mutation.isError, mutation.error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);
    mutation.mutate({ identifier, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <FormFieldError error={fieldErrors.identifier} />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <FormFieldError error={fieldErrors.password} />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Logging in..." : "Login"}
          </button>
          {generalError && <FormFieldError error={generalError} />}
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login; 