'use client';
import IconMail from '@/components/icon/icon-mail';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import api from '@/utils/api';
import Swal from 'sweetalert2';

const ComponentsAuthResetPasswordForm = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const submitForm = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/forgotpassword', { email });
            if (data.success) {
                // In this dummy app, show the reset token in the alert to allow actually resetting. 
                // Normally we just say "Email sent".
                Swal.fire({
                    icon: 'success',
                    title: 'Email Sent',
                    text: 'Please check your email for the password reset link.',
                    footer: `<div class="text-xs text-center">Since emailing is disabled for demo, here is your link:<br/><a href="/auth/boxed-reset-password/${data.resetToken}" class="text-primary font-bold">Reset Password Now</a></div>`
                });
                setEmail('');
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Error processing request'
            });
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
            <div className="text-center mt-4">
                <Link href="/auth/boxed-signin" className="text-primary hover:underline font-semibold">Back to Login</Link>
            </div>
        </form>
    );
};

export default ComponentsAuthResetPasswordForm;
