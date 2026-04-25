// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// import Navbar from '@/components/Navbar';
// import { Footer } from '@/components/Footer';
// import { Eye, EyeOff } from 'lucide-react';

// export default function login() {
//     const navigate = useNavigate();

//     // is the form currently sending to the server 
//     const [loading, setLoading] = useState(false);

//     // for error messages display
//     const [error, setError] = useState<string | null>(null);

//     // show plain text or dots for the password
//     const [showPassword, setShowPassword] = useState(false);

//     // get user's email and password
//     const [formData, setFormData] = useState<SignInPayload>({
//         email: '',
//         password: '',
//     });

//     // which fields have validation errors 
//     const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

//     // check errors in the form
//     const validateForm = (): boolean => {
//         const errors: Record<string, string> = {};

//         // validate email
//         if (!formData.email.trim()) {
//             errors.email = 'Email is required';
//         } 
//         else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//             errors.email = 'Please enter a valid email address';
//         }

//         // validate password with the same rules as the backend
//         if (!formData.password.trim()) {
//             errors.password = 'Password is required';
//         } else if (formData.password.length < 8) {
//             errors.password = 'Password must be at least 8 characters';
//         } else if (!/[A-Z]/.test(formData.password)) {
//             errors.password = 'Need at least one uppercase letter';
//         } else if (!/[0-9]/.test(formData.password)) {
//             errors.password = 'Need at least one number';
//         } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
//             errors.password = 'Need at least one special character';
//         }

//         setValidationErrors(errors);
//         return Object.keys(errors).length === 0;
//     };

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
        
//         // Clear error for this field when user starts typing
//         if (validationErrors[name]) {
//             setValidationErrors(prev => {
//                 const updated = { ...prev };
//                 delete updated[name];
//                 return updated;
//             });
//         }
//     };

//     const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault(); // stop page reload
//         setError(null); // clear previous erros

//         if (!validateForm()) {
//             return;
//         }

//         setLoading(true); // disable the button to prevent the user from spam clicking and creating multiple users at the same time for example 

//         try {
//             // send email and password to backend
//             const response = await authService.signIn(formData);

//             // backend will return token and user to front
//             // Store token in localStorage
//             localStorage.setItem('token', response.accessToken); // delete XSS !!!

//             // Optionally store user info
//             localStorage.setItem('user', JSON.stringify(response.user));

//             // Navigate to dashboard
//             navigate('/dashboard');

//         } catch (err: any) {
//             setError(err.message || 'Failed to sign in. Please try again.');
//         } finally {
//             setLoading(false); // stop showing loading state
//         }
//     };

//     const handleGoogleSignIn = () => {
//         // TODO: Implement Google OAuth flow
//         console.log('Google sign-in not yet implemented');
//     };

//     return (
//         <div className="flex flex-col min-h-screen bg-background">
//             <Navbar />
//             <main className="flex-1 flex items-center justify-center px-6 py-20">
//                 <Card className="w-full max-w-md border-border/50 bg-background-elevated">
//                     <CardHeader className="space-y-2 text-center">
//                         <CardTitle className="text-2xl font-semibold">Welcome Back</CardTitle>
//                         <CardDescription>
//                             Enter your credentials to access your workspace
//                         </CardDescription>
//                     </CardHeader>

//                     <CardContent className="space-y-6">
//                         {error && (
//                             <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
//                                 {error}
//                             </div>
//                         )}

//                         <form onSubmit={handleSubmit} className="space-y-4">
//                             {/* Email Field */}
//                             <div className="space-y-2">
//                                 <label htmlFor="email" className="block text-sm font-medium text-foreground">
//                                     Email Address
//                                 </label>
//                                 <input
//                                     id="email"
//                                     type="email"
//                                     name="email"
//                                     placeholder="name@company.com"
//                                     value={formData.email}
//                                     onChange={handleChange}
//                                     disabled={loading}
//                                     className={`w-full px-4 py-2.5 rounded-lg bg-background border ${validationErrors.email
//                                         ? 'border-red-500/50 focus:border-red-500'
//                                         : 'border-border focus:border-primary'
//                                         } text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 ${validationErrors.email
//                                             ? 'focus:ring-red-500/30'
//                                             : 'focus:ring-primary/30'
//                                         } transition-colors disabled:opacity-50`}
//                                 />
//                                 {validationErrors.email && (
//                                     <p className="text-xs text-red-400">{validationErrors.email}</p>
//                                 )}
//                             </div>

//                             {/* Password Field */}
//                             <div className="space-y-2">
//                                 <div className="flex items-center justify-between">
//                                     <label htmlFor="password" className="block text-sm font-medium text-foreground">
//                                         Password
//                                     </label>
//                                     <Link
//                                         to="/auth/forgot-password"
//                                         className="text-xs text-primary hover:text-primary/80 transition-colors"
//                                     >
//                                         Forgot Password?
//                                     </Link>
//                                 </div>
//                                 <div className="relative">
//                                     <input
//                                         id="password"
//                                         type={showPassword ? 'text' : 'password'}
//                                         name="password"
//                                         placeholder="••••••••"
//                                         value={formData.password}
//                                         onChange={handleChange}
//                                         disabled={loading}
//                                         className={`w-full px-4 py-2.5 rounded-lg bg-background border ${validationErrors.password
//                                             ? 'border-red-500/50 focus:border-red-500'
//                                             : 'border-border focus:border-primary'
//                                             } text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 ${validationErrors.password
//                                                 ? 'focus:ring-red-500/30'
//                                                 : 'focus:ring-primary/30'
//                                             } transition-colors disabled:opacity-50 pr-10`}
//                                     />
//                                     <button
//                                         type="button"
//                                         onClick={() => setShowPassword(!showPassword)}
//                                         disabled={loading}
//                                         className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors disabled:opacity-50"
//                                         aria-label={showPassword ? 'Hide password' : 'Show password'}
//                                     >
//                                         {showPassword ? (
//                                             <EyeOff className="w-4 h-4" />
//                                         ) : (
//                                             <Eye className="w-4 h-4" />
//                                         )}
//                                     </button>
//                                 </div>
//                                 {validationErrors.password && (
//                                     <p className="text-xs text-red-400">{validationErrors.password}</p>
//                                 )}
//                             </div>

//                             {/* Sign In Button */}
//                             <Button
//                                 type="submit"
//                                 disabled={loading}
//                                 className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors disabled:opacity-60"
//                             >
//                                 {loading ? 'Signing in...' : 'Sign In'}
//                             </Button>
//                         </form>

//                         {/* Divider */}
//                         <div className="relative">
//                             <div className="absolute inset-0 flex items-center">
//                                 <div className="w-full border-t border-border/50" />
//                             </div>
//                             <div className="relative flex justify-center text-xs">
//                                 <span className="px-2 bg-background-elevated text-foreground-muted">Or continue with</span>
//                             </div>
//                         </div>

//                         {/* Google OAuth Button */}
//                         <Button
//                             type="button"
//                             onClick={handleGoogleSignIn}
//                             variant="outline"
//                             disabled={loading}
//                             className="w-full h-10 border-border hover:bg-accent/50 transition-colors disabled:opacity-60"
//                         >
//                             <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
//                                 <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
//                                 <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
//                             </svg>
//                             Google
//                         </Button>

//                         {/* Sign Up Link */}
//                         <p className="text-sm text-center text-foreground-muted">
//                             Don't have an account?{' '}
//                             <Link
//                                 to="/auth/sign-up"
//                                 className="text-primary hover:text-primary/80 font-medium transition-colors"
//                             >
//                                 Sign Up
//                             </Link>
//                         </p>
//                     </CardContent>
//                 </Card>
//             </main>
//             <Footer />
//         </div>
//     );
// }
