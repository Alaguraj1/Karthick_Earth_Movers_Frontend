'use client';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconUser from '@/components/icon/icon-user';
import IconEye from '@/components/icon/icon-eye';
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
    const [showPassword, setShowPassword] = useState(false);
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
        <form className="space-y-6 text-white" onSubmit={submitForm}>
            <div>
                <label htmlFor="Username" className="text-[10px] font-black uppercase text-white/60 mb-2 block tracking-[0.2em] ml-1">Username or Email</label>
                <div className="relative group text-white-dark">
                    <input
                        id="Username"
                        type="text"
                        placeholder="Enter Username or Email"
                        className="form-input ps-12 rounded-xl h-14 font-bold border-2 border-white/10 bg-white/5 focus:bg-white/10 focus:border-primary focus:text-white text-white transition-all placeholder:text-white/30"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:text-white transition-colors">
                        <IconUser fill={true} />
                    </span>
                </div>
            </div>
            <div>
                <label htmlFor="Password" className="text-[10px] font-black uppercase text-white/60 mb-2 block tracking-[0.2em] ml-1">Password</label>
                <div className="relative group text-white-dark">
                    <input
                        id="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter Password"
                        className="form-input ps-12 pe-12 rounded-xl h-14 font-bold border-2 border-white/10 bg-white/5 focus:bg-white/10 focus:border-primary focus:text-white text-white transition-all placeholder:text-white/30"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:text-white transition-colors">
                        <IconLockDots fill={true} />
                    </span>
                    <button
                        type="button"
                        className="absolute end-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? 'Hide Password' : 'Show Password'}
                    >
                        <IconEye fill={showPassword} className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex justify-end pt-4">
                    <Link href="/auth/boxed-password-reset" className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] hover:text-primary hover:underline transition-all">Forgot Password?</Link>
                </div>
            </div>
            <button type="submit" className="btn btn-primary h-14 w-full rounded-xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl transition-all transform hover:scale-[1.01] active:scale-[0.98]">
                Secure Sign in
            </button>
        </form>
    );
};

export default ComponentsAuthLoginForm;
