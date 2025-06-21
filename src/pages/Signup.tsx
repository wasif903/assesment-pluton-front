import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../api";
import FormFieldError from "../components/FormFieldError";

const Signup: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string | string[] }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const navigate = useNavigate();
  const registerMutation = useRegister();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (registerMutation.isError) {
      const error = registerMutation.error as any;
      const apiError = error?.response?.data;
      setFieldErrors({});
      setGeneralError(null);
      if (apiError?.details && Array.isArray(apiError.details)) {
        // Map details to fields if possible
        const errors: { [key: string]: string[] } = {};
        apiError.details.forEach((msg: string) => {
          if (msg.toLowerCase().includes("username")) errors.username = [...(errors.username || []), msg];
          else if (msg.toLowerCase().includes("email")) errors.email = [...(errors.email || []), msg];
          else if (msg.toLowerCase().includes("password")) errors.password = [...(errors.password || []), msg];
          else errors.general = [...(errors.general || []), msg];
        });
        setFieldErrors(errors);
        if (errors.general) setGeneralError(errors.general.join(" "));
      } else if (apiError?.message) {
        setGeneralError(apiError.message);
      } else {
        setGeneralError("Registration failed. Try again.");
      }
    }
  }, [registerMutation.isError, registerMutation.error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);
    registerMutation.mutate({ username: name, email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {generalError && <FormFieldError error={generalError} />}
          <div>
            <label className="block text-gray-700 mb-1">Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <FormFieldError error={fieldErrors.username} />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FormFieldError error={fieldErrors.email} />
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
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup; 