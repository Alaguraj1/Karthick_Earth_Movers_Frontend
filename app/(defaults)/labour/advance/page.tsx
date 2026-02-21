'use client';
import React, { useState, useEffect } from 'react';
import IconPlus from '@/components/icon/icon-plus';
import IconSave from '@/components/icon/icon-save';
import axios from 'axios';

const AdvancePage = () => {
    const [labours, setLabours] = useState<any[]>([]);
    const [advances, setAdvances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        labour: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        paymentMode: 'Cash',
        remarks: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [labourRes, advanceRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/labour`),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/labour/advance`)
            ]);
            if (labourRes.data.success) setLabours(labourRes.data.data);
            if (advanceRes.data.success) setAdvances(advanceRes.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: any) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/labour/advance`, formData);
            if (data.success) {
                alert('Advance payment recorded!');
                setFormData({
                    labour: '',
                    date: new Date().toISOString().split('T')[0],
                    amount: '',
                    paymentMode: 'Cash',
                    remarks: ''
                });
                fetchData();
            }
        } catch (error) {
            console.error(error);
            alert('Error recording advance');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li><a href="/" className="text-primary hover:underline">Dashboard</a></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2"><span>Labour</span></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2"><span>Advance Payment Tracking</span></li>
            </ul>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="panel">
                        <h5 className="text-lg font-bold mb-5 border-b pb-3 uppercase text-primary">Record Advance (முன்பணம்)</h5>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-white-dark mb-1 block">Select Labour (தொழிலாளர்)</label>
                                <select name="labour" className="form-select" value={formData.labour} onChange={handleChange} required>
                                    <option value="">Select Worker</option>
                                    {labours.map(l => (
                                        <option key={l._id} value={l._id}>{l.name} ({l.workType})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-white-dark mb-1 block">Date (தேதி)</label>
                                <input type="date" name="date" className="form-input text-primary font-bold" value={formData.date} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-white-dark mb-1 block">Amount (தொகை)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold">₹</span>
                                    <input type="number" name="amount" className="form-input pl-8 font-bold text-lg border-primary" value={formData.amount} onChange={handleChange} required placeholder="0" min="1" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-white-dark mb-1 block">Payment Mode</label>
                                <select name="paymentMode" className="form-select" value={formData.paymentMode} onChange={handleChange}>
                                    <option value="Cash">Cash</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="UPI">UPI / G-Pay</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-white-dark mb-1 block">Remarks (குறிப்புகள்)</label>
                                <textarea name="remarks" className="form-textarea" value={formData.remarks} onChange={handleChange} placeholder="Optional..."></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary w-full shadow-lg h-11" disabled={saving}>
                                <IconSave className="mr-2" />
                                {saving ? 'Saving...' : 'Record Payment'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* History Section */}
                <div className="lg:col-span-2">
                    <div className="panel">
                        <h5 className="text-lg font-bold mb-5 border-b pb-3 uppercase">Recent Advance History</h5>
                        <div className="table-responsive">
                            <table className="table-hover">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Labour Name</th>
                                        <th>Amount</th>
                                        <th>Mode</th>
                                        <th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={5} className="text-center py-10">Loading history...</td></tr>
                                    ) : advances.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center py-10">No records found.</td></tr>
                                    ) : (
                                        advances.map((adv) => (
                                            <tr key={adv._id}>
                                                <td>{new Date(adv.date).toLocaleDateString()}</td>
                                                <td className="font-bold">{adv.labour?.name}</td>
                                                <td className="text-danger font-bold">₹{adv.amount.toLocaleString()}</td>
                                                <td><span className="badge badge-outline-info badge-sm">{adv.paymentMode}</span></td>
                                                <td className="text-xs pt-1 italic">{adv.remarks || '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancePage;
