import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth} from '@/context/userContext';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const { login: loginUser, login2FA, user } = useAuth();

    // is the form currently sending to the server 
    const [loading, setLoading] = useState(false);

    // for error messages display
    const [error, setError] = useState<string | null>(null);

    // show plain text or dots for the password
    const [showPassword, setShowPassword] = useState(false);

    // 2FA
    const [show2FAStep, setShow2FAStep] = useState(false);
    const [tempToken, setTempToken] = useState('');
    const [twoFACode, setTwoFACode] = useState('');
    const [twoFAError, setTwoFAError] = useState<string | null>(null);

    // get user's email and password
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // which fields have validation errors 
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // check errors in the form
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // validate email
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // validate password with the same rules as the backend

        if (!formData.password.trim()) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }


        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

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
        e.preventDefault(); // stop page reload
        setError(null); // clear previous erros

        if (!validateForm()) {
            return;
        }

        setLoading(true); // disable the button to prevent the user from spam clicking and creating multiple users at the same time for example 

        try {
            // send email and password to backend and update auth context
            const result = await loginUser(formData);

            // check 2FA
            if (result.requires2FA) {
                // if 2FA is enabled ask the user for the code (6 digit) then navigate to dashboard
                setTempToken(result.tempToken!);
                setShow2FAStep(true);
                return;
            }
            // Navigate to dashboard
            // console.log("type", result.user?.type);
            // console.log(result.user);
            // if (result.user?.type == "FREELANCER"){
            //     navigate('/freedashboard');
            // } else {
            //     navigate('/dashboard');
            // }
            navigate('/dashboard');

        } catch (err: any) {
            setError(err.message || 'Failed to sign in. Please try again.');
        } finally {
            setLoading(false); // stop showing loading state
        }
    };

    // 2FA
    const handle2FASubmit = async () => {

        if (twoFACode.trim().length !== 6) {
            setTwoFAError("Enter the full 6-digit code.");
            return;
        }

        setTwoFAError(null);
        setLoading(true);
        try {
            await login2FA(tempToken, twoFACode);
            // if (result.user?.type == "FREELANCER"){
            //     navigate('/freedashboard');
            // } else {
            //     navigate('/dashboard');
            // }
            navigate('/dashboard');
        } catch (err: any) {
            setTwoFAError("Wrong code, please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handle42SignIn = () => {
        // console.log('Google sign-in implemented!!');
        // Redirect browser to the backend trigger for 42 OAuth
        // window.location.href = 'https://localhost/api/auth/42';
        // dynamic
        // window.location.origin automatically becomes "https://10.12.4.4" 
        // or "https://localhost" based on the URL in the browser bar.
        window.location.href = `${window.location.origin}/api/auth/42`;
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar />
            <main className="flex-1 flex items-center justify-center px-6 py-20">
                <Card className="w-full max-w-md border-border/50 bg-background-elevated">
                    <CardHeader className="space-y-2 text-center">
                         {show2FAStep ? (
                            // 2FA header
                            <>
                                <CardTitle className="text-2xl font-semibold">Two-Factor Authentication</CardTitle>
                                <CardDescription>
                                    Enter the 6-digit code from your authenticator app.
                                </CardDescription>
                            </>
                        ) : (
                            // Normal header
                            <>
                                <CardTitle className="text-2xl font-semibold">Welcome Back</CardTitle>
                                <CardDescription>
                                    Enter your credentials to access your workspace
                                </CardDescription>
                            </>
                        )}
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {error && (
                            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}
                        {/* 2FA Step */}
                        {show2FAStep ? (
                            <div className="space-y-4 space-y-4">
                                <div className="flex flex-col gap-3">
                                    <input
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-center text-2xl tracking-[0.5em] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                                        placeholder="000000"
                                        maxLength={6}
                                        value={twoFACode}
                                        onChange={(e) => {
                                            setTwoFACode(e.target.value.replace(/\D/g, '')); // numbers only
                                            setTwoFAError(null);
                                        }}
                                        autoFocus
                                    />

                                    {twoFAError && (
                                        <p className="text-xs text-red-400 text-center">{twoFAError}</p>
                                    )}

                                    <Button
                                        onClick={handle2FASubmit}
                                        disabled={loading}
                                        className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors disabled:opacity-60"
                                    >
                                        {loading ? 'Verifying...' : 'Verify'}
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShow2FAStep(false);
                                            setTwoFACode('');
                                            setTwoFAError(null);
                                            setTempToken('');
                                        }}
                                        className="text-xs text-foreground-muted hover:text-foreground transition-colors text-center hover:cursor-pointer"
                                    >
                                        ← Back to login
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm font-medium text-foreground">
                                        Password
                                    </label>
                                    {/* <Link
                                        to="/auth/forgot-password"
                                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                                    >
                                        Forgot Password?
                                    </Link> */}
                                </div>
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
                                {validationErrors.password && (
                                    <p className="text-xs text-red-400">{validationErrors.password}</p>
                                )}
                            </div>

                            {/* Sign In Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors disabled:opacity-60"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>
                        
                        
                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border/50" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-2 bg-background-elevated text-foreground-muted">Or continue with</span>
                            </div>
                        </div>

                        {/* 42 OAuth Button */}
                        <Button
                            type="button"
                            onClick={handle42SignIn}
                            variant="outline"
                            disabled={loading}
                            className="w-full h-10 border-border hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 font-bold"
                        >
                            {/* 42 Logo / Placeholder */}
                            <span className="bg-foreground text-background px-1.5 py-0.5 rounded text-[10px]">42</span>
                            Continue with 42 Intra
                        </Button>

                        {/* Sign Up Link */}
                        <p className="text-sm text-center text-foreground-muted">
                            Don't have an account?{' '}
                            <Link
                                to="/auth/sign-up"
                                className="text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                                Sign Up
                            </Link>
                        </p>
                    </>
                    )}
                    </CardContent>
                    
                </Card> 
            </main>
            <Footer />
        </div>
    );
}
