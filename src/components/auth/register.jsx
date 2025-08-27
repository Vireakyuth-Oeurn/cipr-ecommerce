import React, { useContext, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import login from '../../assets/login.png';
import logo from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

function RegisterPage() {
    const navigate = useNavigate();
    const { setToken } = useContext(AppContext);

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        email: '',
        password: '',
        password_confirmation: ''
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (errors[e.target.name]) {
            setErrors(prev => ({ ...prev, [e.target.name]: null }));
        }
    };

    async function handleRegister(e) {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(formData),
            });
            
            const data = await res.json();
            console.log("API Response:", data);
            
            if (res.ok && data.access_token && data.code === 200) {
                console.log("Registration successful:", data);
                setToken(data.access_token); 
                navigate("/");
            } else {
                console.log("Full error response:", data);
                
                if (data.error && data.error.validation_errors) {
                    const validationErrors = {};
                    data.error.validation_errors.forEach(error => {
                        validationErrors[error.field] = [error.message];
                    });
                    setErrors(validationErrors);
                } else if (data.errors) {
                    setErrors(data.errors);
                } else if (data.error) {
                    setErrors({ general: data.error.message || 'Registration failed' });
                } else {
                    setErrors({ general: data.message || 'Registration failed' });
                }
                console.error("Registration failed:", data);
            }
        } catch (error) {
            console.error("Network error:", error);
            setErrors({ general: 'Network error. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Mobile Layout (default) */}
            <div className="lg:hidden">
                {/* Mobile Header with Logo */}
                <div className="flex items-center justify-center py-6 px-4 bg-white">
                    <img src={logo} alt="Logo" className="h-16 w-auto" />
                </div>

                {/* Mobile Form Container */}
                <div className="px-4 pb-8">
                    <div className="max-w-sm mx-auto">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-black mb-2">WELCOME</h2>
                            <p className="text-sm text-gray-600 font-medium">SIGN UP</p>
                        </div>

                        {errors.general && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-600 text-sm">{errors.general}</p>
                            </div>
                        )}

                        <form onSubmit={handleRegister}>
                            <div className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your name"
                                        className={`w-full px-4 py-3 border rounded-none text-sm focus:outline-none focus:border-black transition-colors ${
                                            errors.name ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        disabled={isLoading}
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
                                </div>

                                <div>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        placeholder="Enter your age"
                                        className={`w-full px-4 py-3 border rounded-none text-sm focus:outline-none focus:border-black transition-colors ${
                                            errors.age ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        disabled={isLoading}
                                    />
                                    {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age[0]}</p>}
                                </div>

                                <div>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-none text-sm focus:outline-none focus:border-black transition-colors ${
                                            errors.gender ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        disabled={isLoading}
                                    >
                                        <option value="">Select your gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender[0]}</p>}
                                </div>

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
                                            placeholder="Create Password"
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

                                <div>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="password_confirmation"
                                            value={formData.password_confirmation}
                                            onChange={handleChange}
                                            placeholder="Confirm Password"
                                            className={`w-full px-4 py-3 border rounded-none text-sm focus:outline-none focus:border-black transition-colors pr-12 ${
                                                errors.password_confirmation ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            disabled={isLoading}
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation[0]}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-black text-white py-3 px-4 font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </div>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Already have account?{' '}
                                    <a href="/login" className="text-black font-medium underline hover:no-underline">
                                        Sign In
                                    </a>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Desktop Layout (lg and above) */}
            <div className="hidden lg:grid lg:grid-cols-3 min-h-screen">
                {/* Left Column - Logo */}
                <div className="flex items-center justify-center bg-white p-8">
                    <img src={logo} alt="Logo" className="max-w-full h-auto" />
                </div>

                {/* Center Column - Form */}
                <div className="flex items-center justify-center p-8">
                    <div className="max-w-md w-full">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-black mb-2">WELCOME</h2>
                            <p className="text-sm text-gray-600 font-medium">SIGN UP</p>
                        </div>

                        {errors.general && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-600 text-sm">{errors.general}</p>
                            </div>
                        )}

                        <form onSubmit={handleRegister}>
                            <div className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your name"
                                        className={`w-full px-4 py-3 border rounded-none text-sm focus:outline-none focus:border-black transition-colors ${
                                            errors.name ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        disabled={isLoading}
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
                                </div>

                                <div>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        placeholder="Enter your age"
                                        className={`w-full px-4 py-3 border rounded-none text-sm focus:outline-none focus:border-black transition-colors ${
                                            errors.age ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        disabled={isLoading}
                                    />
                                    {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age[0]}</p>}
                                </div>

                                <div>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-none text-sm focus:outline-none focus:border-black transition-colors ${
                                            errors.gender ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        disabled={isLoading}
                                    >
                                        <option value="">Select your gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender[0]}</p>}
                                </div>

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
                                            placeholder="Create Password"
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

                                <div>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="password_confirmation"
                                            value={formData.password_confirmation}
                                            onChange={handleChange}
                                            placeholder="Confirm Password"
                                            className={`w-full px-4 py-3 border rounded-none text-sm focus:outline-none focus:border-black transition-colors pr-12 ${
                                                errors.password_confirmation ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            disabled={isLoading}
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation[0]}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-black text-white py-3 px-4 font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </div>

                            <div className="mt-8 text-center">
                                <p className="text-sm text-gray-600">
                                    Already have account?{' '}
                                    <a href="/login" className="text-black font-medium underline hover:no-underline">
                                        Sign In
                                    </a>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column - Image */}
                <div className="flex bg-white items-center justify-center">
                    <img src={login} alt="Login Visual" className="max-w-full h-auto object-cover" />
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;