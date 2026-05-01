import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi } from '@/lib/api';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '@/context/userContext';
import { useNavigate } from "react-router-dom";
import DOMPurify from 'dompurify';

export default function ProfileSettings() {
    const { user, setUser, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Profile form state
    const [profileForm, setProfileForm] = useState({
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        bio: '',
        location: '',
        website: '',
        title: '',
        avatar: '',
    });


    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });


    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });


    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Store initial state for comparison for changed data
    const [initialForm, setInitialForm] = useState(profileForm);


    // Load user data
    useEffect(() => {
        if (authLoading) return;

        if (user) {
            // Fill the form using the data already in the Context Cloud!
            setProfileForm({
                firstname: user.firstname || '',
                lastname: user.lastname || '',
                username: user.username || '',
                email: user.email || '',
                bio: user.bio || '',
                location: user.location || '',
                website: user.website || '',
                title: user.title || '',
                avatar: user.avatar || '',
            });
            setInitialForm(
                {
                    firstname: user.firstname || '',
                    lastname: user.lastname || '',
                    username: user.username || '',
                    email: user.email || '',
                    bio: user.bio || '',
                    location: user.location || '',
                    website: user.website || '',
                    title: user.title || '',
                    avatar: user.avatar || '',
                });
            setLoading(false);
        } else {
            // If user is null after loading finishes, the ProtectedRoute 
            // will kick them to /login anyway.
            setLoading(false);
        }
    }, [user, authLoading]);

    // Track which fields have changed
    const getChangedFields = () => {
        const changed: Record<string, any> = {};

        Object.keys(profileForm).forEach(key => {
            if (profileForm[key as keyof typeof profileForm] !== initialForm[key as keyof typeof initialForm]) {
                changed[key] = profileForm[key as keyof typeof profileForm];
            }
        });

        return changed;
    };

    // Clear success message after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);


    const validateProfileForm = (): boolean => {
        const errors: Record<string, string> = {};


        if (!profileForm.firstname.trim()) {
            errors.firstname = 'First name is required';
        } else if (profileForm.firstname.trim().length < 3) {
            errors.firstname = 'First name must be at least 3 characters';
        }

        if (!profileForm.lastname.trim()) {
            errors.lastname = 'Last name is required';
        } else if (profileForm.lastname.trim().length < 3) {
            errors.lastname = 'Last name must be at least 3 characters';
        }

        if (profileForm.username.trim().length < 3) {
            errors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9._-]+$/.test(profileForm.username.trim())) {
            errors.username = 'Username cannot contain spaces';
        }

        // email
        if (!profileForm.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // bio
        if (profileForm.bio.trim().length > 300) {
            errors.bio = 'Bio must be 300 characters or less';
        } else { // protect
            const sanitized = DOMPurify.sanitize(profileForm.bio.trim(), { ALLOWED_TAGS: [] });
            if (sanitized !== profileForm.bio.trim()) {
                errors.bio = 'Bio contains invalid characters';
            }
        }

        // Location
        if (profileForm.location.trim().length > 100) {
            errors.location = 'Location must be 100 characters or less';
        } else  {
            const sanitized = DOMPurify.sanitize(profileForm.location.trim(), { ALLOWED_TAGS: [] });
            if (sanitized !== profileForm.location.trim()) {
                errors.location = 'Location contains invalid characters';
            }
        }

        // Website
        if (profileForm.website.trim()) {
            try {
                if (profileForm.website.length > 200) {
                    errors.website = 'Website URL must be 200 characters or less';
                } else {
                    const sanitized = DOMPurify.sanitize(profileForm.website.trim(), { ALLOWED_TAGS: [] });
                    if (sanitized !== profileForm.website.trim()) {
                        errors.website = 'Website contains invalid characters';
                    }
                    const url = new URL(profileForm.website);
                    if (!['http:', 'https:'].includes(url.protocol)) {
                        errors.website = 'Website must start with http:// or https://';
                    }   
                }
            } catch {
                errors.website = 'Please enter a valid URL (e.g. https://example.com)';
            }
        }

        // Professional Title
        if (profileForm.title.trim().length > 100) {
            errors.title = 'Title must be 100 characters or less';
        } else {
            const sanitized = DOMPurify.sanitize(profileForm.title.trim(), { ALLOWED_TAGS: [] });
            if (sanitized !== profileForm.title.trim()) {
                errors.title = 'Title contains invalid characters';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };


    const validatePasswordForm = (): boolean => {
        const errors: Record<string, string> = {};


        if (!passwordForm.currentPassword.trim()) {
            errors.currentPassword = 'Current password is required';
        }

        // added the same rules for pw as in register
        if (!passwordForm.newPassword.trim()) {
            errors.newPassword = 'New Password is required';
        } else if (passwordForm.newPassword === passwordForm.currentPassword) {
            errors.newPassword = 'New password must be different from your current password';
        } else if (passwordForm.newPassword.length < 8) {
            errors.newPassword = 'Password must be at least 8 characters';
        } else if (!/[A-Z]/.test(passwordForm.newPassword)) {
            errors.newPassword = 'Password must contain at least one uppercase letter';
        } else if (!/[a-z]/.test(passwordForm.newPassword)) {
            errors.newPassword = 'Password must contain at least one lowercase letter';
        } else if (!/[0-9]/.test(passwordForm.newPassword)) {
            errors.newPassword = 'Password must contain at least one number';
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword)) {
            errors.newPassword = 'Password must contain at least one special character';
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };


    const handleProfileChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setProfileForm(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };


    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    // Check if form has any changes
    const hasChanges = Object.keys(getChangedFields()).length > 0;

    const handleSaveProfile = async () => {
        setError(null);
        if (!validateProfileForm() || !hasChanges) { // check if there is error in form or it didnt change
            return;
        }

        setSaving(true);
        try {
            const changedFields = getChangedFields();

            // Only send changes!
            const response = await authApi.updateProfile(changedFields);

            const updatedUser = response.user;
            if (!updatedUser) throw new Error('No user in response');
            
            // Update the Context immediately using the response
            setUser(updatedUser);
            setInitialForm(profileForm);
            setSuccessMessage('Profile updated successfully!');

        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    // logout 
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/auth/sign-in');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // cancel button function
    const handleCancel = () => {
        const changedFields = getChangedFields();

        // If no changes do nothing
        if (Object.keys(changedFields).length === 0) return;

        // Reset only the fields that were changed
        const resetForm = { ...profileForm };
        Object.keys(changedFields).forEach(field => {
            resetForm[field as keyof typeof resetForm] = initialForm[field as keyof typeof initialForm];
        });

        setProfileForm(resetForm);
        setFormErrors({});
        setError(null);
    };

    const handleSavePassword = async () => {
        setError(null);
        setSuccessMessage(null);

        if (!validatePasswordForm()) {
            return;
        }


        setSaving(true);
        try {
            await authApi.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword, });
            setSuccessMessage('Password updated successfully! Redirecting to login...');

            // reset the form 
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });

            handleLogout();

        }
        catch (err: any) {
            if (err.message === 'Current password is incorrect')
                setFormErrors(prev => ({ ...prev, currentPassword: 'Current password is incorrect' }));
            else
                setError(err.message || 'Failed to change password');

        } finally {
            setSaving(false);
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-foreground-muted">Loading profile...</p>
            </div>
        );
    }


    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
                <p className="text-foreground-muted">
                    Manage your public profile, account details, and security preferences.
                </p>
            </div>


            {/* Messages */}
            {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}
            {successMessage && (
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400">
                    {successMessage}
                </div>
            )}


            {/* Profile Section */}
            <Card className="border-border/50 bg-background-elevated">
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex gap-6">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-24 h-24 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden">
                                {profileForm.avatar ? (
                                    <img
                                        src={profileForm.avatar}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center">
                                        <span className="text-sm text-primary/60">
                                            {profileForm.firstname[0]}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <button
                                className="text-sm text-primary hover:text-primary/80 transition-colors hover:cursor-pointer"
                            // onClick={ChangeAvatar}
                            >
                                Change Avatar
                            </button>
                        </div>


                        {/* Main Profile Fields */}
                        <div className="flex-1 space-y-6">
                            {/* First Name & Last Name */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="firstname"
                                        value={profileForm.firstname}
                                        onChange={handleProfileChange}
                                        disabled={saving}
                                        className={`w-full px-4 py-2.5 rounded-lg bg-background border ${formErrors.firstname
                                            ? 'border-red-500/50 focus:border-red-500'
                                            : 'border-border focus:border-primary'
                                            } text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 ${formErrors.firstname
                                                ? 'focus:ring-red-500/30'
                                                : 'focus:ring-primary/30'
                                            } transition-colors disabled:opacity-50`}
                                    />
                                    {formErrors.firstname && (
                                        <p className="text-xs text-red-400">{formErrors.firstname}</p>
                                    )}
                                </div>


                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="lastname"
                                        value={profileForm.lastname}
                                        onChange={handleProfileChange}
                                        disabled={saving}
                                        className={`w-full px-4 py-2.5 rounded-lg bg-background border ${formErrors.lastname
                                            ? 'border-red-500/50 focus:border-red-500'
                                            : 'border-border focus:border-primary'
                                            } text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 ${formErrors.lastname
                                                ? 'focus:ring-red-500/30'
                                                : 'focus:ring-primary/30'
                                            } transition-colors disabled:opacity-50`}
                                    />
                                    {formErrors.lastname && (
                                        <p className="text-xs text-red-400">{formErrors.lastname}</p>
                                    )}
                                </div>
                            </div>


                            {/* Username */}
                            <div className="space-y-2">
                                <label htmlFor="username" className="block text-sm font-medium text-foreground">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    name="username"
                                    value={profileForm.username}
                                    onChange={handleProfileChange}
                                    disabled={saving}
                                    className={`w-full px-4 py-2.5 rounded-lg bg-background border ${formErrors.username
                                        ? 'border-red-500/50 focus:border-red-500'
                                        : 'border-border focus:border-primary'
                                        } text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 ${formErrors.username
                                            ? 'focus:ring-red-500/30'
                                            : 'focus:ring-primary/30'
                                        } transition-colors disabled:opacity-50`}
                                />
                                {formErrors.username && (
                                    <p className="text-xs text-red-400">{formErrors.username}</p>
                                )}
                            </div>


                            {/* Bio */}
                            <div className="space-y-2">
                                <label htmlFor="bio" className="block text-sm font-medium text-foreground">
                                    Bio
                                </label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    value={profileForm.bio}
                                    onChange={handleProfileChange}
                                    disabled={saving}
                                    placeholder="Tell us about yourself..."
                                    rows={3}
                                    className={`w-full px-4 py-2.5 rounded-lg bg-background border ${formErrors.bio
                                        ? 'border-red-500/50 focus:border-red-500'
                                        : 'border-border focus:border-primary'
                                        } text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 ${formErrors.bio
                                            ? 'focus:ring-red-500/30'
                                            : 'focus:ring-primary/30'
                                        } transition-colors disabled:opacity-50 resize-none`}
                                />
                                {formErrors.bio && (
                                    <p className="text-xs text-red-400">{formErrors.bio}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>


            {/* Account Details Section */}
            <Card className="border-border/50 bg-background-elevated">
                <CardHeader>
                    <CardTitle>Account Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Email & Location */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-foreground">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={profileForm.email}
                                onChange={handleProfileChange}
                                disabled={saving}
                                className={`w-full px-4 py-2.5 rounded-lg bg-background border ${formErrors.email
                                    ? 'border-red-500/50 focus:border-red-500'
                                    : 'border-border focus:border-primary'
                                    } text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 ${formErrors.email ? 'focus:ring-red-500/30' : 'focus:ring-primary/30'
                                    } transition-colors disabled:opacity-50`}
                            />
                            {formErrors.email && (
                                <p className="text-xs text-red-400">{formErrors.email}</p>
                            )}
                        </div>


                        <div className="space-y-2">
                            <label htmlFor="location" className="block text-sm font-medium text-foreground">
                                Location
                            </label>
                            <input
                                id="location"
                                type="text"
                                name="location"
                                value={profileForm.location}
                                onChange={handleProfileChange}
                                disabled={saving}
                                placeholder="e.g., Tetouan, Morocco"
                                className={`w-full px-4 py-2.5 rounded-lg bg-background border ${formErrors.location
                                    ? 'border-red-500/50 focus:border-red-500'
                                    : 'border-border focus:border-primary'
                                    } text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 ${formErrors.location ? 'focus:ring-red-500/30' : 'focus:ring-primary/30'
                                    } transition-colors disabled:opacity-50`}
                            />
                            {formErrors.location && (
                                <p className="text-xs text-red-400">{formErrors.location}</p>
                            )}
                        </div>
                    </div>


                    {/* Website & Title */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="website" className="block text-sm font-medium text-foreground">
                                Personal Website
                            </label>
                            <input
                                id="website"
                                type="url"
                                name="website"
                                value={profileForm.website}
                                onChange={handleProfileChange}
                                disabled={saving}
                                placeholder="https://example.com"
                                className={`w-full px-4 py-2.5 rounded-lg bg-background border ${formErrors.website
                                    ? 'border-red-500/50 focus:border-red-500'
                                    : 'border-border focus:border-primary'
                                    } text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 ${formErrors.website ? 'focus:ring-red-500/30' : 'focus:ring-primary/30'
                                    } transition-colors disabled:opacity-50`}
                            />
                            {formErrors.website && (
                                <p className="text-xs text-red-400">{formErrors.website}</p>
                            )}
                        </div>


                        <div className="space-y-2">
                            <label htmlFor="title" className="block text-sm font-medium text-foreground">
                                Professional Title
                            </label>
                            <input
                                id="title"
                                type="text"
                                name="title"
                                value={profileForm.title}
                                onChange={handleProfileChange}
                                disabled={saving}
                                placeholder="e.g., Senior Software Engineer"
                                className={`w-full px-4 py-2.5 rounded-lg bg-background border ${formErrors.title
                                    ? 'border-red-500/50 focus:border-red-500'
                                    : 'border-border focus:border-primary'
                                    } text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 ${formErrors.title ? 'focus:ring-red-500/30' : 'focus:ring-primary/30'
                                    } transition-colors disabled:opacity-50`}
                            />
                            {formErrors.title && (
                                <p className="text-xs text-red-400">{formErrors.title}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>


            {/* Security Section */}
            <Card className="border-border/50 bg-background-elevated">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">

                        Security
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                        {/* Change Password */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Change Password
                            </h3>


                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="currentPassword"
                                        className="block text-sm font-medium text-foreground"
                                    >
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="currentPassword"
                                            type={showPasswords.current ? 'text' : 'password'}
                                            name="currentPassword"
                                            value={passwordForm.currentPassword}
                                            onChange={handlePasswordChange}
                                            disabled={saving}
                                            className={`w-full px-4 py-2.5 rounded-lg bg-background border ${formErrors.currentPassword
                                                ? 'border-red-500/50 focus:border-red-500'
                                                : 'border-border focus:border-primary'
                                                } text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 ${formErrors.currentPassword
                                                    ? 'focus:ring-red-500/30'
                                                    : 'focus:ring-primary/30'
                                                } transition-colors disabled:opacity-50 pr-10`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPasswords(prev => ({
                                                    ...prev,
                                                    current: !prev.current,
                                                }))
                                            }
                                            disabled={saving}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors disabled:opacity-50"
                                        >
                                            {showPasswords.current ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    {formErrors.currentPassword && (
                                        <p className="text-xs text-red-400">
                                            {formErrors.currentPassword}
                                        </p>
                                    )}
                                </div>


                                <div className="space-y-2">
                                    <label
                                        htmlFor="newPassword"
                                        className="block text-sm font-medium text-foreground"
                                    >
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="newPassword"
                                            type={showPasswords.new ? 'text' : 'password'}
                                            name="newPassword"
                                            value={passwordForm.newPassword}
                                            onChange={handlePasswordChange}
                                            disabled={saving}
                                            className={`w-full px-4 py-2.5 rounded-lg bg-background border ${formErrors.newPassword
                                                ? 'border-red-500/50 focus:border-red-500'
                                                : 'border-border focus:border-primary'
                                                } text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 ${formErrors.newPassword
                                                    ? 'focus:ring-red-500/30'
                                                    : 'focus:ring-primary/30'
                                                } transition-colors disabled:opacity-50 pr-10`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPasswords(prev => ({ ...prev, new: !prev.new }))
                                            }
                                            disabled={saving}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors disabled:opacity-50"
                                        >
                                            {showPasswords.new ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    {formErrors.newPassword && (
                                        <p className="text-xs text-red-400">{formErrors.newPassword}</p>
                                    )}
                                </div>


                                <div className="space-y-2">
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium text-foreground"
                                    >
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={passwordForm.confirmPassword}
                                            onChange={handlePasswordChange}
                                            disabled={saving}
                                            className={`w-full px-4 py-2.5 rounded-lg bg-background border ${formErrors.confirmPassword
                                                ? 'border-red-500/50 focus:border-red-500'
                                                : 'border-border focus:border-primary'
                                                } text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 ${formErrors.confirmPassword
                                                    ? 'focus:ring-red-500/30'
                                                    : 'focus:ring-primary/30'
                                                } transition-colors disabled:opacity-50 pr-10`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPasswords(prev => ({
                                                    ...prev,
                                                    confirm: !prev.confirm,
                                                }))
                                            }
                                            disabled={saving}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors disabled:opacity-50"
                                        >
                                            {showPasswords.confirm ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    {formErrors.confirmPassword && (
                                        <p className="text-xs text-red-400">
                                            {formErrors.confirmPassword}
                                        </p>
                                    )}
                                </div>


                                <Button
                                    onClick={handleSavePassword}
                                    disabled={saving}
                                    className="w-full bg-primary hover:bg-primary/90 text-white transition-colors disabled:opacity-60 mt-4"
                                >
                                    {saving ? 'Updating...' : 'Change Password'}
                                </Button>
                            </div>
                        </div>


                        {/* Two-Factor Authentication */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-foreground">Two-Factor Authentication</h3>
                            <p className="text-sm text-foreground-muted">
                                Add an extra layer of security to your account. We'll ask for a code when you log in on a new device.
                            </p>
                            <Button className="w-full bg-primary hover:bg-primary/90 text-white transition-colors">
                                Enable 2FA
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>


            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6">
                <Button
                    variant="outline"
                    className="px-6 border-border hover:bg-accent/50 transition-colors"
                    onClick={handleCancel}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSaveProfile}
                    disabled={!hasChanges || saving}
                    className="px-8 bg-primary hover:bg-primary/90 text-white transition-colors disabled:opacity-60"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
}