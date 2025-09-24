import { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { LanguageContext } from '../../contexts/LanguageContext';
import { ThemeContext } from '../../contexts/ThemeContext';

export default function AdminLogin() {
  const { t } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { signIn } = await import('next-auth/react');
      
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials. Please try again.');
      } else if (result?.ok) {
        // Redirect to admin dashboard
        router.push('/admin');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-primary-blue to-accent-purple p-8" data-aos="fade-in">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10 animate-float"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/80 to-accent-purple/80 backdrop-blur-sm"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="card-glass-light p-12 rounded-3xl shadow-2xl border border-white/20" data-aos="slide-up" data-aos-delay="200">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-4 mb-4">
              <i className="fas fa-shield-alt text-4xl text-primary-blue"></i>
              <h1 className="text-3xl font-bold text-gradient-primary">TLS Admin</h1>
            </div>
            <p className="text-gray-600 text-lg font-medium">Sign in to access the admin dashboard</p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-medium animate-shake" data-aos="fade-in">
                <i className="fas fa-exclamation-triangle text-red-500"></i>
                <span>{error}</span>
              </div>
            )}
            
            <div className="flex flex-col gap-3">
              <label htmlFor="email" className="flex items-center gap-3 font-semibold text-gray-700 text-base">
                <i className="fas fa-envelope text-primary-blue w-4"></i>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email"
                className="input-field"
                disabled={loading}
              />
            </div>
            
            <div className="flex flex-col gap-3">
              <label htmlFor="password" className="flex items-center gap-3 font-semibold text-gray-700 text-base">
                <i className="fas fa-lock text-primary-blue w-4"></i>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your password"
                  className="input-field pr-14"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-blue transition-colors p-2 rounded-lg hover:bg-primary-blue/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              className="btn-primary w-full py-4 text-lg font-semibold flex items-center justify-center gap-3 mt-4 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300"
              disabled={loading || !formData.email || !formData.password}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Signing in...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  Sign In
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
              <i className="fas fa-info-circle text-primary-blue"></i>
              Contact system administrator for access
            </p>
          </div>
        </div>
      </div>
    </div>
   );
  }