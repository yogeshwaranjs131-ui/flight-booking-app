import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FaEnvelope, FaLock, FaPlane, FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login(formData);

      if (data.twoFactorRequired) {
        // If 2FA is required, navigate to the verification page
        navigate('/verify-2fa', { state: { userId: data.userId } });
      } else {
        // If 2FA is not required, redirect based on user role
        if (data && data.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/"); // Redirect to the home page
        }
      }
    } catch (err) {
      setError(err.message || "Error logging in. Please try again.");
      console.error("Login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-128px)] flex bg-gray-100">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" name="email" placeholder="Email address" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-blue focus:border-indigo-blue transition" required />
            </div>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-indigo-blue focus:border-indigo-blue transition" required />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <a href="/forgot-password" className="font-medium text-indigo-blue hover:text-indigo-accent">Forgot your password?</a>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 cursor-pointer">
            {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="mt-2 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-indigo-blue hover:text-indigo-accent">
              Register here
            </Link>
          </p>
        </div>
      </div>

      {/* Flight Background Image Section */}
      <div 
        className="hidden lg:block lg:w-1/2 bg-cover bg-center relative" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-12 text-center">
          <FaPlane className="text-6xl mb-4 text-indigo-300" />
          <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
          <p className="text-lg text-gray-200">Your next adventure is just a login away. Access your bookings and explore new destinations.</p>
        </div>
      </div>
    </div>
  );
}

export default Login;