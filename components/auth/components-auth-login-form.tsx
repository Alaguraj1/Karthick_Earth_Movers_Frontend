'use client';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconUser from '@/components/icon/icon-user';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials, setLoading } from '@/store/authSlice';
import api from '@/utils/api';
import { useToast } from '@/components/stone-mine/toast-notification';

const ComponentsAuthLoginForm = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { showToast } = useToast();

    const submitForm = async (e: any) => {
        e.preventDefault();
        dispatch(setLoading(true));
        try {
            const { data } = await api.post('/auth/login', { username, password });

            if (data.success) {
                dispatch(setCredentials({ user: data.user, token: data.token }));
                showToast('Signed in successfully', 'success');

                // Redirect based on role: Admin/Owner to Dashboard, others to Diesel Expenses
                const userRole = data.user?.role?.toLowerCase();
                if (userRole === 'admin' || userRole === 'owner') {
                    router.push('/');
                } else {
                    router.push('/expenses/diesel');
                }
            }
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.message || 'Invalid username or password', 'error');
        } finally {
            dispatch(setLoading(false));
        }
    };

    return (
        <form className="space-y-6 dark:text-white" onSubmit={submitForm}>
            <div>
                <label htmlFor="Username" className="text-[10px] font-black uppercase text-white-dark mb-1 block tracking-widest">Username or Email</label>
                <div className="relative text-white-dark">
                    <input
                        id="Username"
                        type="text"
                        placeholder="Enter Username or Email"
                        className="form-input ps-12 rounded-xl h-12 font-bold border-2 focus:border-primary transition-all placeholder:text-white-dark/50"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-primary">
                        <IconUser fill={true} />
                    </span>
                </div>
            </div>
            <div>
                <label htmlFor="Password" className="text-[10px] font-black uppercase text-white-dark mb-1 block tracking-widest">Password</label>
                <div className="relative text-white-dark">
                    <input
                        id="Password"
                        type="password"
                        placeholder="Enter Password"
                        className="form-input ps-12 rounded-xl h-12 font-bold border-2 focus:border-primary transition-all placeholder:text-white-dark/50"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-primary">
                        <IconLockDots fill={true} />
                    </span>
                </div>
                <div className="flex justify-end pt-3">
                    <Link href="/auth/boxed-password-reset" className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline opacity-70 hover:opacity-100 transition-all">Forgot Password?</Link>
                </div>
            </div>
            <button type="submit" className="btn btn-primary h-12 w-full rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-[0_10px_20px_rgba(67,97,238,0.3)] transition-all transform hover:scale-[1.02]">
                Sign in
            </button>
            <div className="text-center dark:text-white mt-10 text-xs font-bold text-white-dark uppercase tracking-widest">
                Don't have an account?&nbsp;
                <Link href="/auth/boxed-signup" className="text-primary font-black underline transition-all hover:text-primary/70">
                    SIGN UP
                </Link>
            </div>
        </form>
    );
};

export default ComponentsAuthLoginForm;
