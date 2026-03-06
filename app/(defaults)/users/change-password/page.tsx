'use client';
import React, { useState } from 'react';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconSave from '@/components/icon/icon-save';
import api from '@/utils/api';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'New passwords do not match',
                toast: true,
                position: 'top',
                timer: 3000,
                showConfirmButton: false,
            });
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.put('/auth/updatepassword', {
                currentPassword,
                newPassword,
            });

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Password updated successfully',
                    toast: true,
                    position: 'top',
                    timer: 3000,
                    showConfirmButton: false,
                });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                router.push('/');
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to update password',
                toast: true,
                position: 'top',
                timer: 3000,
                showConfirmButton: false,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li><a href="/" className="text-primary hover:underline">Dashboard</a></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2"><span>Settings</span></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2"><span>Change Password</span></li>
            </ul>

            <div className="panel max-w-xl mx-auto">
                <div className="mb-5 flex items-center justify-between">
                    <h5 className="text-lg font-semibold dark:text-white-light">Change Password</h5>
                </div>
                <div className="mb-5 border-t border-[#ebedf2] pt-5 dark:border-[#1b2e4b]">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="currentPassword">Current Password</label>
                            <div className="relative text-white-dark mt-1">
                                <input
                                    id="currentPassword"
                                    type="password"
                                    placeholder="Enter Current Password"
                                    className="form-input ps-10"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                                <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                    <IconLockDots fill={true} />
                                </span>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="newPassword">New Password</label>
                            <div className="relative text-white-dark mt-1">
                                <input
                                    id="newPassword"
                                    type="password"
                                    placeholder="Enter New Password (min 6 characters)"
                                    className="form-input ps-10"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                                <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                    <IconLockDots fill={true} />
                                </span>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <div className="relative text-white-dark mt-1">
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm New Password"
                                    className="form-input ps-10"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                                <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                    <IconLockDots fill={true} />
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button type="submit" className="btn btn-primary shadow-lg" disabled={loading}>
                                <IconSave className="mr-2" />
                                {loading ? 'Saving...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
