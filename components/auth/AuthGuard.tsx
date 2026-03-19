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
    const { isAuthenticated, user } = useSelector((state: IRootState) => state.auth);
    const [isChecking, setIsChecking] = useState(true);

    const isAuthRoute = pathname.startsWith('/auth') || pathname === '/login';

    useEffect(() => {
        // If Redux says authenticated but no token in storage, clear it
        const token = localStorage.getItem('token');
        if (!token && isAuthenticated) {
            dispatch(logout());
            router.replace('/login');
            setIsChecking(false);
            return;
        }

        if (!isAuthenticated && !isAuthRoute) {
            // Not logged in — send to login page
            router.replace('/login');
            // Don't show children while redirecting
            setIsChecking(false);
            return;
        }

        if (isAuthenticated) {
            const userRole = user?.role?.toLowerCase();
            const isAdmin = userRole === 'admin' || userRole === 'owner';
            const isOwner = userRole === 'owner';

            if (isAuthRoute) {
                // Already logged in — send to their default page
                if (isOwner) {
                    router.replace('/');
                } else {
                    router.replace('/expenses/diesel');
                }
                setIsChecking(false);
                return;
            }

            // If a non-owner tries to go to the dashboard (/), redirect them
            if (pathname === '/' && !isOwner) {
                router.replace('/expenses/diesel');
                setIsChecking(false);
                return;
            }
        }

        // Everything is fine — show the page
        setIsChecking(false);
    }, [isAuthenticated, user, pathname]); // eslint-disable-line react-hooks/exhaustive-deps

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
