'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/components/stone-mine/toast-notification';
import DeleteConfirmModal from '@/components/stone-mine/delete-confirm-modal';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
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
    const [editId, setEditId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const initialForm = {
        date: new Date().toISOString().split('T')[0],
        tripId: '',
        vehicleType: '',
        driverName: '',
        paymentType: 'Per Trip',
        amount: '',
        padiKasu: '',
        paymentMode: 'Cash',
        notes: ''
    };

    const [formData, setFormData] = useState(initialForm);
    const [tripsByDate, setTripsByDate] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [payRes, driverRes, vehicleRes] = await Promise.all([
                axios.get(`${API}/driver-payments`),
                axios.get(`${API}/labour`),
                axios.get(`${API}/master/vehicles`)
            ]);

            if (payRes.data.success) setPayments(payRes.data.data);

            // Collect drivers from Labour Management
            let combinedDrivers: any[] = [];
            if (driverRes.data.success) {
                const laborDrivers = driverRes.data.data.filter((l: any) =>
                    l.workType?.toLowerCase().includes('driver')
                ).map((l: any) => ({ name: l.name, type: 'Labour' }));
                combinedDrivers = [...laborDrivers];
            }

            // Collect drivers from Vehicle Master
            if (vehicleRes.data.success) {
                const vehicleDrivers = vehicleRes.data.data
                    .filter((v: any) => v.driverName)
                    .map((v: any) => ({ name: v.driverName, type: 'Vehicle', vehicle: v.vehicleNumber || v.registrationNumber }));

                // Add unique names from vehicles
                vehicleDrivers.forEach((vd: any) => {
                    if (!combinedDrivers.find(d => d.name.toLowerCase() === vd.name.toLowerCase())) {
                        combinedDrivers.push(vd);
                    }
                });
            }

            setDrivers(combinedDrivers);
        } catch (error) {
            console.error(error);
            showToast('Error fetching data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchTripsForDate = async (date: string) => {
        try {
            const res = await axios.get(`${API}/trips?date=${date}`);
            if (res.data.success) {
                setTripsByDate(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching trips:', error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchTripsForDate(formData.date);
    }, []);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'date') {
            fetchTripsForDate(value);
            setFormData(prev => ({ ...prev, tripId: '', vehicleType: '', driverName: '' })); // Reset when date changes
        }

        if (name === 'tripId') {
            const selectedTrip = tripsByDate.find(t => t._id === value);
            if (selectedTrip) {
                setFormData(prev => ({
                    ...prev,
                    vehicleType: selectedTrip.vehicleType || 'Lorry',
                    driverName: selectedTrip.driverName,
                    notes: `Trip: ${selectedTrip.fromLocation} to ${selectedTrip.toLocation} (${selectedTrip.vehicleNumber})`
                }));
            }
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            if (editId) {
                await axios.put(`${API}/driver-payments/${editId}`, formData);
                showToast('Payment updated successfully!', 'success');
            } else {
                await axios.post(`${API}/driver-payments`, formData);
                showToast('Payment recorded successfully!', 'success');
            }
            resetForm();
            fetchData();
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.message || 'Error saving payment', 'error');
        }
    };

    const handleEdit = (payment: any) => {
        setFormData({
            date: payment.date.split('T')[0],
            tripId: payment.tripId || '',
            vehicleType: payment.vehicleType || '',
            driverName: payment.driverName,
            paymentType: payment.paymentType,
            amount: payment.amount.toString(),
            padiKasu: payment.padiKasu.toString(),
            paymentMode: payment.paymentMode,
            notes: payment.notes || ''
        });
        setEditId(payment._id);
        setShowForm(true);
        if (payment.date) {
            fetchTripsForDate(payment.date.split('T')[0]);
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
        setEditId(null);
        setTripsByDate([]);
        setShowForm(false);
        fetchTripsForDate(initialForm.date);
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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">Payment Date</label>
                                <input type="date" name="date" className="form-input font-bold" value={formData.date} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block text-primary font-black">Select Trip Record</label>
                                <select name="tripId" className="form-select border-primary font-bold bg-primary/5" value={formData.tripId} onChange={handleChange} required>
                                    <option value="">Choose Trip ID</option>
                                    {tripsByDate.map((t) => (
                                        <option key={t._id} value={t._id}>
                                            {t.vehicleNumber} | {t.fromLocation} → {t.toLocation}
                                        </option>
                                    ))}
                                    {tripsByDate.length === 0 && <option disabled>No trips found on this date</option>}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">Vehicle Type</label>
                                <select
                                    name="vehicleType"
                                    className={`form-select font-bold ${formData.tripId ? 'bg-[#eee] cursor-not-allowed text-black' : ''}`}
                                    value={formData.vehicleType}
                                    onChange={handleChange}
                                    required
                                    disabled={!!formData.tripId}
                                >
                                    <option value="">{formData.tripId ? formData.vehicleType : 'Select Type'}</option>
                                    {!formData.tripId && (
                                        <>
                                            <option value="Lorry">Lorry</option>
                                            <option value="Tipper">Tipper</option>
                                            <option value="Tractor">Tractor</option>
                                            <option value="JCB">JCB</option>
                                            <option value="Poclain">Poclain</option>
                                            <option value="Other">Other</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">Driver Name</label>
                                <select
                                    name="driverName"
                                    className={`form-select font-bold ${formData.tripId ? 'bg-[#eee] cursor-not-allowed text-black' : ''}`}
                                    value={formData.driverName}
                                    onChange={handleChange}
                                    required
                                    disabled={!!formData.tripId}
                                >
                                    <option value="">{formData.tripId ? formData.driverName : 'Select Driver'}</option>
                                    {!formData.tripId && drivers.map((d, index) => (
                                        <option key={index} value={d.name}>
                                            {d.name} {d.type === 'Vehicle' ? `(From: ${d.vehicle})` : '(Employee)'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {formData.tripId && (
                            <div className="bg-primary/5 p-2 rounded border border-primary/20 -mt-2">
                                <p className="text-[11px] text-primary font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    Vehicle Type and Driver Name automatically locked from Trip ID: {tripsByDate.find(t => t._id === formData.tripId)?.vehicleNumber}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block font-black">Payment Mode</label>
                                <select name="paymentMode" className="form-select font-bold text-info" value={formData.paymentMode} onChange={handleChange} required>
                                    <option value="Cash">Cash (ரொக்கம்)</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="UPI/G-Pay">UPI / G-Pay</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block text-primary font-black underline decoration-primary/20">Basic Amount / சம்பளம் (₹)</label>
                                <input type="number" name="amount" className="form-input border-primary text-primary font-bold text-lg" value={formData.amount} onChange={handleChange} required placeholder="0" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block text-warning font-black underline decoration-warning/20">Padi Kasu / படிக்காசு (₹)</label>
                                <input type="number" name="padiKasu" className="form-input border-warning text-warning font-bold text-lg" value={formData.padiKasu} onChange={handleChange} placeholder="0" />
                            </div>
                        </div>

                        <div className="bg-dark/5 p-3 rounded-xl border border-dashed border-dark/20 flex items-center justify-between">
                            <span className="text-white-dark font-bold uppercase text-xs">Total Payable Amount (சம்பளம் + படி):</span>
                            <span className="text-2xl font-black text-black dark:text-white-light font-mono">₹{(Number(formData.amount || 0) + Number(formData.padiKasu || 0)).toLocaleString()}</span>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-white-dark uppercase mb-2 block">Remarks / Notes</label>
                            <textarea name="notes" className="form-textarea" rows={2} value={formData.notes} onChange={handleChange} placeholder="Optional details..."></textarea>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button type="button" className="btn btn-outline-danger" onClick={resetForm}>Cancel</button>
                            <button type="submit" className="btn btn-primary px-10">
                                <IconSave className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                {editId ? 'Update Record' : 'Save Payment Record'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!showForm && (
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
                                    <th className="!text-right">Salary (₹)</th>
                                    <th className="!text-right text-warning">Padi (₹)</th>
                                    <th className="!text-right text-success bg-success/5 font-black">Total (₹)</th>
                                    <th className="!text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={8} className="text-center py-8">Loading...</td></tr>
                                ) : payments.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center py-8">No payments recorded.</td></tr>
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
                                            <td className="text-center text-xs">
                                                {pay.paymentMode}
                                            </td>
                                            <td className="!text-right font-bold text-lg font-mono">₹{pay.amount?.toLocaleString()}</td>
                                            <td className="!text-right font-bold text-lg font-mono text-warning">₹{pay.padiKasu?.toLocaleString() || '0'}</td>
                                            <td className="!text-right font-black text-lg font-mono text-success bg-success/5">₹{(Number(pay.amount || 0) + Number(pay.padiKasu || 0)).toLocaleString()}</td>
                                            <td className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => handleEdit(pay)} className="btn btn-sm btn-outline-primary p-1">
                                                        <IconEdit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setDeleteId(pay._id)} className="btn btn-sm btn-outline-danger p-1">
                                                        <IconTrashLines className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

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
