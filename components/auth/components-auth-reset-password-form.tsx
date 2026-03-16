'use client';
import IconMail from '@/components/icon/icon-mail';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import api from '@/utils/api';
import { useToast } from '@/components/stone-mine/toast-notification';

const ComponentsAuthResetPasswordForm = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [demoLink, setDemoLink] = useState('');
    const { showToast } = useToast();

    const submitForm = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/forgotpassword', { email });
            if (data.success) {
                showToast('Please check your email for the password reset link.', 'success');
                setDemoLink(`/auth/boxed-reset-password/${data.resetToken}`);
                setEmail('');
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Error processing request', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-5" onSubmit={submitForm}>
            <div>
                <label htmlFor="Email" className="dark:text-white">
                    Email
                </label>
                <div className="relative text-white-dark">
                    <input
                        id="Email"
                        type="email"
                        placeholder="Enter Email"
                        className="form-input ps-10 placeholder:text-white-dark"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconMail fill={true} />
                    </span>
                </div>
            </div>
            <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]" disabled={loading}>
                {loading ? 'Sending...' : 'RECOVER'}
            </button>
            {demoLink && (
                <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 text-center animate-fade-in-down mt-5">
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-2 opacity-70">Demo Environment Override</p>
                    <Link href={demoLink} className="text-sm font-bold text-primary hover:underline">
                        RE-SET PASSWORD NOW (DEMO LINK)
                    </Link>
                </div>
            )}
            <div className="text-center mt-4">
                <Link href="/auth/boxed-signin" className="text-primary hover:underline font-semibold">Back to Login</Link>
            </div>
        </form>
    );
};

export default ComponentsAuthResetPasswordForm;
