'use client';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconEye from '@/components/icon/icon-eye';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import api from '@/utils/api';
import { useToast } from '@/components/stone-mine/toast-notification';

const ComponentsAuthResetNewPasswordForm = ({ token }: { token: string }) => {
    const router = useRouter();
    const { showToast } = useToast();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const submitForm = async (e: any) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.put(`/auth/resetpassword/${token}`, { password });
            if (data.success) {
                showToast('Your password has been successfully reset. You are now logged in.', 'success');
                router.push('/');
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Error resetting password', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-5" onSubmit={submitForm}>
            <div>
                <label htmlFor="Password" className="dark:text-white">New Password</label>
                <div className="relative text-white-dark group">
                    <input
                        id="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter New Password"
                        className="form-input ps-10 pe-12 placeholder:text-white-dark"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconLockDots fill={true} />
                    </span>
                    <button
                        type="button"
                        className="absolute end-4 top-1/2 -translate-y-1/2 text-primary hover:text-primary-dark transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? 'Hide Password' : 'Show Password'}
                    >
                        <IconEye fill={showPassword} className="h-5 w-5" />
                    </button>
                </div>
            </div>
            <div>
                <label htmlFor="ConfirmPassword" className="dark:text-white">Confirm Password</label>
                <div className="relative text-white-dark group">
                    <input
                        id="ConfirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm New Password"
                        className="form-input ps-10 pe-12 placeholder:text-white-dark"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconLockDots fill={true} />
                    </span>
                    <button
                        type="button"
                        className="absolute end-4 top-1/2 -translate-y-1/2 text-primary hover:text-primary-dark transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        title={showConfirmPassword ? 'Hide Password' : 'Show Password'}
                    >
                        <IconEye fill={showConfirmPassword} className="h-5 w-5" />
                    </button>
                </div>
            </div>
            <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]" disabled={loading}>
                {loading ? 'Saving...' : 'SAVE NEW PASSWORD'}
            </button>
        </form>
    );
};

export default ComponentsAuthResetNewPasswordForm;
