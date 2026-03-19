'use client';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconEye from '@/components/icon/icon-eye';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const ComponentsAuthUnlockForm = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const submitForm = (e: any) => {
        e.preventDefault();
        router.push('/');
    };
    return (
        <form className="space-y-5" onSubmit={submitForm}>
            <div>
                <label htmlFor="Password" className="dark:text-white">
                    Password
                </label>
                <div className="relative text-white-dark group">
                    <input
                        id="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter Password"
                        className="form-input ps-10 pe-12 placeholder:text-white-dark"
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
            <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                UNLOCK
            </button>
        </form>
    );
};

export default ComponentsAuthUnlockForm;
