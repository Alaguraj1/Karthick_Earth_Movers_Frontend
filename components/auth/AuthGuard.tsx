'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { IRootState } from '@/store';
import Loading from '@/components/layouts/loading';
import { logout } from '@/store/authSlice';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state: IRootState) => state.auth);
    const [isChecking, setIsChecking] = useState(true);

    const isAuthRoute = pathname.startsWith('/auth');

    useEffect(() => {
        // If Redux says authenticated but no token in storage, clear it
        const token = localStorage.getItem('token');
        if (!token && isAuthenticated) {
            dispatch(logout());
            router.replace('/auth/boxed-signin');
            setIsChecking(false);
            return;
        }

        if (!isAuthenticated && !isAuthRoute) {
            // Not logged in — send to login page
            router.replace('/auth/boxed-signin');
            // Don't show children while redirecting
            setIsChecking(false);
            return;
        }

        if (isAuthenticated && isAuthRoute) {
            // Already logged in — send to dashboard
            router.replace('/');
            setIsChecking(false);
            return;
        }

        // Everything is fine — show the page
        setIsChecking(false);
    }, [isAuthenticated, pathname]); // eslint-disable-line react-hooks/exhaustive-deps

    // Show loading spinner only on first check
    if (isChecking) {
        return <Loading />;
    }

    // Unauthenticated trying to access protected page — render nothing (redirect already fired)
    if (!isAuthenticated && !isAuthRoute) {
        return null;
    }

    return <>{children}</>;
}
