'use client';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconUser from '@/components/icon/icon-user';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials, setLoading } from '@/store/authSlice';
import api from '@/utils/api';
import Swal from 'sweetalert2';

const ComponentsAuthLoginForm = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const submitForm = async (e: any) => {
        e.preventDefault();
        dispatch(setLoading(true));
        try {
            const { data } = await api.post('/auth/login', { username, password });

            if (data.success) {
                dispatch(setCredentials({ user: data.user, token: data.token }));

                const toast = Swal.mixin({
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    timer: 2000,
                });
                toast.fire({
                    icon: 'success',
                    title: 'Signed in successfully',
                    padding: '10px 20px',
                });

                router.push('/');
            }
        } catch (error: any) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: error.response?.data?.message || 'Invalid username or password',
            });
        } finally {
            dispatch(setLoading(false));
        }
    };

    return (
        <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
            <div>
                <label htmlFor="Username">Username or Email</label>
                <div className="relative text-white-dark">
                    <input
                        id="Username"
                        type="text"
                        placeholder="Enter Username or Email"
                        className="form-input ps-10 placeholder:text-white-dark"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconUser fill={true} />
                    </span>
                </div>
            </div>
            <div>
                <label htmlFor="Password">Password</label>
                <div className="relative text-white-dark">
                    <input
                        id="Password"
                        type="password"
                        placeholder="Enter Password"
                        className="form-input ps-10 placeholder:text-white-dark"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconLockDots fill={true} />
                    </span>
                </div>
                <div className="flex justify-end pt-2">
                    <Link href="/auth/boxed-password-reset" className="text-primary text-sm hover:underline">Forgot Password?</Link>
                </div>
            </div>
            <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)] font-bold py-3">
                Sign in
            </button>
            <div className="text-center dark:text-white mt-10">
                Don't have an account?&nbsp;
                <Link href="/auth/boxed-signup" className="uppercase text-primary underline transition hover:text-black dark:hover:text-white">
                    SIGN UP
                </Link>
            </div>
        </form>
    );
};

export default ComponentsAuthLoginForm;

