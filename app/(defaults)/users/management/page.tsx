import UserManagement from '@/components/stone-mine/user-management';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'User Management',
};

export default function UserManagementPage() {
    return <UserManagement />;
}
