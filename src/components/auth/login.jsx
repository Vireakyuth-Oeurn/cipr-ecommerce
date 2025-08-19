import { useState, useContext } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import leftlogo from '../../assets/left-logo.png';
import logo from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../Context/AppContext';

function LoginPage() {
    const navigate = useNavigate();
    const { setToken } = useContext(AppContext);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});
        
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            console.log('API Response:', data);

            if (res.ok && (data.access_token || data.token)) {
                const token = data.access_token || data.token;
                console.log('Token received:', token);
                setToken(token);
                navigate("/");
            } else {
                console.log("Full login error response:", data);
                
                if (data.error && data.error.validation_errors) {
                    const validationErrors = {};
                    data.error.validation_errors.forEach(error => {
                        validationErrors[error.field] = [error.message];
                    });
                    setErrors(validationErrors);
                } else if (data.errors) {
                    setErrors(data.errors);
                // } else if (data.error) {
                //     setErrors({ general: data.error.message || 'Login failed' });
                // } else {
                //     setErrors({ general: data.message || 'Login failed' });
                // }
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ general: 'Network error. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (errors[e.target.name]) {
            setErrors(prev => ({ ...prev, [e.target.name]: null }));
        }
    };

    return (
        <div className="min-h-screen bg-white grid grid-cols-3">
            <div className="flex bg-white">
                <img src={leftlogo} alt="Login Visual" className="max-w-full h-auto" />
            </div>

            <div className="flex items-center justify-center">
                <form onSubmit={handleLogin} className="max-w-md w-full">
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-bold text-black mb-2">WELCOME BACK</h2>
                        <p className="text-sm text-gray-600 font-medium">SIGN IN</p>
                    </div>

                    {errors.general && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600 text-sm">{errors.general}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className={`w-full px-4 py-3 border rounded-none text-sm focus:outline-none focus:border-black transition-colors ${
                                    errors.email ? 'border-red-300' : 'border-gray-300'
                                }`}
                                disabled={isLoading}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
                        </div>
                       
                        <div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className={`w-full px-4 py-3 border rounded-none text-sm focus:outline-none focus:border-black transition-colors pr-12 ${
                                        errors.password ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-black text-white py-3 px-4 font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Logging in...' : 'Log In'}
                        </button>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <a href="/register" className="text-black font-medium underline hover:no-underline">
                                Sign Up
                            </a>
                        </p>
                    </div>
                </form>
            </div>

            <div className="flex items-center justify-center bg-white p-8">
                <img src={logo} alt="Logo" className="max-w-full h-auto" />
            </div>
        </div>
    );
}

export default LoginPage;