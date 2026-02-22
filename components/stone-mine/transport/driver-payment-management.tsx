'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/components/stone-mine/toast-notification';
import DeleteConfirmModal from '@/components/stone-mine/delete-confirm-modal';
import IconPlus from '@/components/icon/icon-plus';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconSearch from '@/components/icon/icon-search';
import IconX from '@/components/icon/icon-x';
import IconSave from '@/components/icon/icon-save';
import IconCashBanknotes from '@/components/icon/icon-cash-banknotes';

const API = process.env.NEXT_PUBLIC_API_URL;

const DriverPaymentManagement = () => {
    const { showToast } = useToast();
    const [payments, setPayments] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const initialForm = {
        date: new Date().toISOString().split('T')[0],
        driverName: '',
        paymentType: 'Per Trip',
        amount: '',
        paymentMode: 'Cash',
        notes: ''
    };

    const [formData, setFormData] = useState(initialForm);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [payRes, driverRes] = await Promise.all([
                axios.get(`${API}/driver-payments`),
                axios.get(`${API}/labour`) // Assuming labour has drivers
            ]);

            if (payRes.data.success) setPayments(payRes.data.data);
            if (driverRes.data.success) {
                const driverList = driverRes.data.data.filter((l: any) =>
                    l.workType?.toLowerCase().includes('driver') || l.jobTitle?.toLowerCase().includes('driver')
                );
                setDrivers(driverList);
            }
        } catch (error) {
            console.error(error);
            showToast('Error fetching data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/driver-payments`, formData);
            showToast('Payment recorded successfully!', 'success');
            resetForm();
            fetchData();
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.message || 'Error saving payment', 'error');
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await axios.delete(`${API}/driver-payments/${deleteId}`);
            showToast('Payment record deleted', 'success');
            fetchData();
        } catch (error) {
            console.error(error);
            showToast('Error deleting record', 'error');
        } finally {
            setDeleteId(null);
        }
    };

    const resetForm = () => {
        setFormData(initialForm);
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white-light">ஓட்டுநர் சம்பளம் (Driver Payment)</h2>
                    <p className="text-white-dark text-sm mt-1">Manage trip payments, monthly salary and allowances</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2" /> Record New Payment
                </button>
            </div>

            {showForm && (
                <div className="panel animate__animated animate__fadeIn max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-5 border-b pb-3 border-[#ebedf2] dark:border-[#1b2e4b]">
                        <h5 className="font-bold text-lg">Record Payment</h5>
                        <button onClick={resetForm} className="text-white-dark hover:text-danger">
                            <IconX />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">Payment Date</label>
                                <input type="date" name="date" className="form-input" value={formData.date} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">Driver Name</label>
                                <select name="driverName" className="form-select" value={formData.driverName} onChange={handleChange} required>
                                    <option value="">Select Driver</option>
                                    {drivers.map(d => (
                                        <option key={d._id} value={d.name}>{d.name}</option>
                                    ))}
                                    {drivers.length === 0 && <option value="Generic Driver">Manual Entry (Generic)</option>}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">Payment Type</label>
                                <select name="paymentType" className="form-select" value={formData.paymentType} onChange={handleChange} required>
                                    <option value="Per Trip">Per Trip Payment (ஒரு trip-க்கு)</option>
                                    <option value="Monthly Salary">Monthly Salary (மாத சம்பளம்)</option>
                                    <option value="Bata">Bata / Allowance (படா)</option>
                                    <option value="Advance">Advance (முன்பணம்)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block text-primary">Amount (₹)</label>
                                <input type="number" name="amount" className="form-input border-primary text-primary font-bold" value={formData.amount} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">Payment Mode</label>
                                <select name="paymentMode" className="form-select" value={formData.paymentMode} onChange={handleChange} required>
                                    <option value="Cash">Cash (ரொக்கம்)</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="UPI/G-Pay">UPI / G-Pay</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-white-dark uppercase mb-2 block">Remarks / Notes</label>
                            <textarea name="notes" className="form-textarea" value={formData.notes} onChange={handleChange} placeholder="Optional details..."></textarea>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4">
                            <button type="button" className="btn btn-outline-danger" onClick={resetForm}>Cancel</button>
                            <button type="submit" className="btn btn-primary px-10">
                                <IconSave className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                Record Payment
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-bold text-lg dark:text-white-light">Payment Records</h5>
                    <div className="relative w-full max-w-xs">
                        <input type="text" placeholder="Search payments..." className="form-input ltr:pr-11 rtl:pl-11" />
                        <IconSearch className="w-5 h-5 absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-white-dark" />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Driver Name</th>
                                <th>Payment Type</th>
                                <th className="!text-center">Mode</th>
                                <th className="!text-right">Amount</th>
                                <th className="!text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
                            ) : payments.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8">No payments recorded.</td></tr>
                            ) : (
                                payments.map((pay) => (
                                    <tr key={pay._id}>
                                        <td>{new Date(pay.date).toLocaleDateString('en-GB')}</td>
                                        <td className="font-bold text-primary">{pay.driverName}</td>
                                        <td>
                                            <span className={`badge ${pay.paymentType === 'Monthly Salary' ? 'badge-outline-primary' :
                                                    pay.paymentType === 'Per Trip' ? 'badge-outline-success' :
                                                        pay.paymentType === 'Advance' ? 'badge-outline-danger' : 'badge-outline-dark'
                                                }`}>
                                                {pay.paymentType}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-xs">
                                                <IconCashBanknotes className="w-3 h-3 text-success" />
                                                {pay.paymentMode}
                                            </div>
                                        </td>
                                        <td className="!text-right font-bold text-lg font-mono">₹{pay.amount?.toLocaleString()}</td>
                                        <td className="text-center">
                                            <button onClick={() => setDeleteId(pay._id)} className="btn btn-sm btn-outline-danger p-1">
                                                <IconTrashLines className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <DeleteConfirmModal
                show={!!deleteId}
                onCancel={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Payment Record"
                message="Are you sure you want to delete this payment record?"
            />
        </div>
    );
};

export default DriverPaymentManagement;
