import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/userContext';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';

export default function Register() {
    const navigate = useNavigate();
    const auth = useAuth();
    const {user} = useAuth()
    const { register: registerUser } = auth || { register: async () => { } };
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: '',
        type: 'FREELANCER' as 'FREELANCER' | 'CLIENT', // Default value
        agreeToTerms: false,
    });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (formData.firstname.trim().length < 3) {
            errors.firstname = 'First name must be at least 3 characters';
        }

        if (formData.lastname.trim().length < 3) {
            errors.lastname = 'Last name must be at least 3 characters';
        }

        if (formData.username.trim().length < 3) {
            errors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.username.trim())) {
            errors.username = 'Username cannot contain spaces';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.password.trim()) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        } else if (!/[A-Z]/.test(formData.password)) {
            errors.password = 'Password must contain at least one uppercase letter';
        } else if (!/[a-z]/.test(formData.password)) {
            errors.password = 'Password must contain at least one lowercase letter';
        } else if (!/[0-9]/.test(formData.password)) {
            errors.password = 'Password must contain at least one number';
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
            errors.password = 'Password must contain at least one special character';
        }

        // add other password rules
        if (!formData.confirmPassword.trim()) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.agreeToTerms) {
            errors.agreeToTerms = 'You must agree to the Terms and Privacy Policy';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // Clear error for this field when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            // call backend API for register and update auth context
            await registerUser(formData);

            // Navigate to dashboard
            // if (res.user?.type == "FREELANCER"){
            //     navigate('/freedashboard');
            // } else {
            //     navigate('/dashboard');
            // }
            navigate('/dashboard');

        } catch (err: any) {
            setError(err.message || 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar />
            <main className="flex-1 flex items-center justify-center px-6 py-20">
                <Card className="w-full max-w-md border-border/50 bg-background-elevated">
                    <CardHeader className="space-y-2 text-center">
                        <CardTitle className="text-2xl font-semibold">Create your account</CardTitle>
                        <CardDescription>
                            Start your {formData.type === 'FREELANCER' ? 'freelancing' : 'hiring'} journey in seconds.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {error && (
                            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        {/* ROLE SELECTOR: Updates the role inside formData */}
                        {/* <div className="flex gap-2 p-1 bg-background rounded-lg">
                            {(['FREELANCER', 'CLIENT'] as const).map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: r })}
                                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                                        formData.role === r ? 'bg-primary text-white' : 'text-foreground-muted hover:text-foreground'
                                    }`}
                                >
                                    {r === 'FREELANCER' ? 'I am a Freelancer' : 'I am a Client'}
                                </button>
                            ))}
                        </div> */}

                        {/* ROLE SELECTOR: Updates the role inside formData */}
                        <div className="relative flex p-1 bg-background rounded-lg">
                            {/* Sliding background */}
                            <div
                                className={`
                            absolute top-1 bottom-1 w-1/2 rounded-md bg-primary transition-transform duration-300
                            ${formData.type === 'FREELANCER' ? 'translate-x-0' : 'translate-x-full'}
                            `}
                            />

                            {/* Buttons (sit above the slider) */}
                            {(['FREELANCER', 'CLIENT'] as const).map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: r })}
                                    className={`
                                relative z-10 flex-1 py-2 px-3 rounded-md text-sm font-medium
                                transition-colors duration-200 hover:cursor-pointer
                                ${formData.type === r ? 'text-white' : 'text-foreground-muted hover:text-foreground'}
                            `}
                                >
                                    {r === 'FREELANCER' ? 'Join as Freelancer' : 'Hire Talent'}
                                </button>
                            ))}
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* First name and Last name Field */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs uppercase font-bold text-foreground-muted">First Name</label>
                                    <input name="firstname" value={formData.firstname} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none" placeholder="First name" />
                                    {validationErrors.firstname && <p className="text-[10px] text-red-400">{validationErrors.firstname}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs uppercase font-bold text-foreground-muted">Last Name</label>
                                    <input name="lastname" value={formData.lastname} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none" placeholder="Last name" />
                                    {validationErrors.lastname && <p className="text-[10px] text-red-400">{validationErrors.lastname}</p>}
                                </div>
                            </div>

                            {/* Username */}
                            <div className="space-y-1">
                                <label className="text-xs uppercase font-bold text-foreground-muted">Username</label>
                                <input name="username" value={formData.username} onChange={handleChange} placeholder="cool_coder" className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none" />
                                {validationErrors.username && <p className="text-[10px] text-red-400">{validationErrors.username}</p>}
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="name@gmail.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className={`w-full px-4 py-2.5 rounded-lg bg-background border ${validationErrors.email
                                        ? 'border-red-500/50 focus:border-red-500'
                                        : 'border-border focus:border-primary'
                                        } text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 ${validationErrors.email
                                            ? 'focus:ring-red-500/30'
                                            : 'focus:ring-primary/30'
                                        } transition-colors disabled:opacity-50`}
                                />
                                {validationErrors.email && (
                                    <p className="text-xs text-red-400">{validationErrors.email}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                                    Create Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={`w-full px-4 py-2.5 rounded-lg bg-background border ${validationErrors.password
                                            ? 'border-red-500/50 focus:border-red-500'
                                            : 'border-border focus:border-primary'
                                            } text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 ${validationErrors.password
                                                ? 'focus:ring-red-500/30'
                                                : 'focus:ring-primary/30'
                                            } transition-colors disabled:opacity-50 pr-10`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={loading}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors disabled:opacity-50"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-foreground-muted">
                                    Must be at least 8 characters
                                </p>
                                {validationErrors.password && (
                                    <p className="text-xs text-red-400">{validationErrors.password}</p>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={`w-full px-4 py-2.5 rounded-lg bg-background border ${validationErrors.confirmPassword
                                            ? 'border-red-500/50 focus:border-red-500'
                                            : 'border-border focus:border-primary'
                                            } text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 ${validationErrors.confirmPassword
                                                ? 'focus:ring-red-500/30'
                                                : 'focus:ring-primary/30'
                                            } transition-colors disabled:opacity-50 pr-10`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={loading}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors disabled:opacity-50"
                                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                {validationErrors.confirmPassword && (
                                    <p className="text-xs text-red-400">{validationErrors.confirmPassword}</p>
                                )}
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-start gap-2">
                                <input
                                    id="agreeToTerms"
                                    type="checkbox"
                                    name="agreeToTerms"
                                    checked={formData.agreeToTerms}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="mt-1 w-4 h-4 rounded border-border bg-background accent-primary cursor-pointer"
                                />
                                <label htmlFor="agreeToTerms" className="text-xs text-foreground-muted">
                                    I agree to the{' '}
                                    <Link to="/terms" className="text-primary hover:text-primary/80 transition-colors">
                                        Terms and Conditions
                                    </Link>
                                    {' '}and{' '}
                                    <Link to="/privacy" className="text-primary hover:text-primary/80 transition-colors">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>
                            {validationErrors.agreeToTerms && (
                                <p className="text-xs text-red-400">{validationErrors.agreeToTerms}</p>
                            )}

                            {/* Create Account Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors disabled:opacity-60"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Button>
                        </form>

                        {/* Sign In Link */}
                        <p className="text-sm text-center text-foreground-muted">
                            Already have an account?{' '}
                            <Link
                                to="/auth/sign-in"
                                className="text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                                Sign In
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
