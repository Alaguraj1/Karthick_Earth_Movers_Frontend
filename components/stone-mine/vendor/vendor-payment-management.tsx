'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/components/stone-mine/toast-notification';
import DeleteConfirmModal from '@/components/stone-mine/delete-confirm-modal';
import IconPlus from '@/components/icon/icon-plus';
import IconSave from '@/components/icon/icon-save';
import IconSearch from '@/components/icon/icon-search';
import IconTrashLines from '@/components/icon/icon-trash-lines';

const API = process.env.NEXT_PUBLIC_API_URL;

const VendorPaymentManagement = () => {
    const { showToast } = useToast();
    const [payments, setPayments] = useState<any[]>([]);
    const [allVendors, setAllVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [balances, setBalances] = useState<any>({});
    const [selectedVendorStats, setSelectedVendorStats] = useState<any>(null);
    const [historySearch, setHistorySearch] = useState('');

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        vendorSelected: '', // Value format: "id|type|name"
        invoiceAmount: '',
        paidAmount: '',
        paymentMode: 'Cash',
        referenceNumber: '',
        notes: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [payRes, balRes, expRes, labRes, transRes] = await Promise.all([
                axios.get(`${API}/vendors/payments`),
                axios.get(`${API}/vendors/outstanding`),
                axios.get(`${API}/vendors/explosive`),
                axios.get(`${API}/vendors/labour`),
                axios.get(`${API}/vendors/transport`)
            ]);

            if (payRes.data.success) setPayments(payRes.data.data);

            const balMap: any = {};
            if (balRes.data.success) {
                balRes.data.data.forEach((b: any) => {
                    balMap[`${b.vendorId}|${b.vendorType}`] = b.balance;
                });
            }
            setBalances(balMap);

            const vendors: any[] = [];
            if (expRes.data.success) vendors.push(...expRes.data.data.map((v: any) => ({ ...v, type: 'ExplosiveSupplier', label: `[Explosive] ${v.name}` })));
            if (labRes.data.success) vendors.push(...labRes.data.data.map((v: any) => ({ ...v, type: 'LabourContractor', label: `[Labour] ${v.name}` })));
            if (transRes.data.success) {
                vendors.push(...transRes.data.data.map((v: any) => ({
                    ...v,
                    type: 'TransportVendor',
                    label: `[Transport] ${v.name} ${v.vehicles?.[0]?.vehicleNumber ? `(${v.vehicles[0].vehicleNumber})` : ''}`
                })));
            }
            setAllVendors(vendors);

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
        setFormData({ ...formData, [name]: value });

        if (name === 'vendorSelected') {
            if (!value) {
                setSelectedVendorStats(null);
                return;
            }
            const [vId, vType] = value.split('|');
            const vendor = allVendors.find((v) => v._id === vId && v.type === vType);
            if (vendor) {
                const ledgerBal = balances[`${vId}|${vType}`] || 0;
                let potentialCost = 0;
                if (vType === 'TransportVendor') {
                    potentialCost = vendor.vehicles?.reduce((acc: number, veh: any) => acc + (Number(veh.ratePerTrip || 0) + Number(veh.padiKasu || 0)), 0) || 0;
                } else if (vType === 'LabourContractor') {
                    potentialCost = vendor.contracts?.reduce((acc: number, c: any) => acc + (Number(c.agreedRate || 0) * Number(c.labourCount || 0)), 0) || 0;
                }

                const outstanding = (potentialCost + (vendor.outstandingBalance || 0)) - (vendor.advancePaid || 0) + ledgerBal;

                setSelectedVendorStats({
                    advance: vendor.advancePaid || 0,
                    potential: potentialCost,
                    outstanding: outstanding
                });
            }
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!formData.vendorSelected) return showToast('Please select a vendor', 'error');

        try {
            const [vId, vType, vName] = formData.vendorSelected.split('|');
            const data = {
                ...formData,
                vendorId: vId,
                vendorType: vType,
                vendorName: vName,
                invoiceAmount: Number(formData.invoiceAmount || 0),
                paidAmount: Number(formData.paidAmount || 0)
            };

            await axios.post(`${API}/vendors/payments`, data);
            showToast('Payment recorded successfully!', 'success');

            resetForm();
            fetchData();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Error saving payment', 'error');
        }
    };

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            vendorSelected: '',
            invoiceAmount: '',
            paidAmount: '',
            paymentMode: 'Cash',
            referenceNumber: '',
            notes: ''
        });
        setSelectedVendorStats(null);
        setShowForm(false);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await axios.delete(`${API}/vendors/payments/${deleteId}`);
            showToast('Payment history deleted!', 'success');
            setDeleteId(null);
            fetchData();
        } catch (error) {
            showToast('Error deleting record', 'error');
        }
    };

    const filteredPayments = payments.filter((p) =>
        p.vendorName?.toLowerCase().includes(historySearch.toLowerCase()) ||
        p.vendorType?.toLowerCase().includes(historySearch.toLowerCase()) ||
        p.referenceNumber?.toLowerCase().includes(historySearch.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white-light">Payment History (கட்டணம் வரலாறு)</h2>
                    <p className="text-white-dark text-sm">Track all invoices and payments made to suppliers and contractors.</p>
                </div>
                {!showForm && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                        Record New Payment
                    </button>
                )}
            </div>

            {showForm && (
                <div className="panel animate__animated animate__fadeInDown">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-bold text-lg">New Payment / Bill Entry</h5>
                        <button className="text-white-dark hover:text-danger" onClick={resetForm}>✕ Cancel</button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                            <div>
                                <label className="text-sm font-bold">Date *</label>
                                <input type="date" name="date" className="form-input" value={formData.date} onChange={handleChange} required />
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-sm font-bold">Select Vendor / Contractor *</label>
                                <select name="vendorSelected" className="form-select" value={formData.vendorSelected} onChange={handleChange} required>
                                    <option value="">Select a vendor...</option>
                                    {allVendors.map(v => (
                                        <option key={`${v._id}|${v.type}`} value={`${v._id}|${v.type}|${v.name}`}>
                                            {v.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {selectedVendorStats && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 bg-dark/5 rounded-lg border border-white-light/10">
                                <div>
                                    <label className="text-[11px] font-extrabold uppercase text-success">Advance Paid (₹)</label>
                                    <div className="form-input bg-success/5 font-black text-success border-success/20">
                                        ₹{selectedVendorStats.advance.toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-extrabold uppercase text-info">Total Agreement Cost (₹)</label>
                                    <div className="form-input bg-info/5 font-black text-info border-info/20">
                                        ₹{selectedVendorStats.potential.toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-extrabold uppercase text-danger">Current Pending / Bal (₹)</label>
                                    <div className="form-input bg-danger/5 font-black text-danger border-danger/20">
                                        ₹{selectedVendorStats.outstanding.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                            <div>
                                <label className="text-sm font-bold">Invoice/Bill Amount (A)</label>
                                <input type="number" name="invoiceAmount" className="form-input" value={formData.invoiceAmount} onChange={handleChange} placeholder="0" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-primary">Paid Amount (B)</label>
                                <input type="number" name="paidAmount" className="form-input border-primary/30" value={formData.paidAmount} onChange={handleChange} placeholder="0" />
                            </div>
                            <div>
                                <label className="text-sm font-bold">Payment Mode</label>
                                <select name="paymentMode" className="form-select" value={formData.paymentMode} onChange={handleChange}>
                                    <option value="Cash">Cash</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="UPI">UPI / G-Pay</option>
                                    <option value="Cheque">Cheque</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold">Reference #</label>
                                <input type="text" name="referenceNumber" className="form-input" value={formData.referenceNumber} onChange={handleChange} placeholder="UTR / Check No" />
                            </div>
                        </div>

                        <div className="bg-primary/5 p-3 rounded-lg border border-dashed border-primary/20 flex items-center justify-between">
                            <span className="text-xs font-bold uppercase text-white-dark">Record Summary:</span>
                            <span className="font-bold text-primary">
                                Invoice: ₹{Number(formData.invoiceAmount || 0).toLocaleString()} | Paid: ₹{Number(formData.paidAmount || 0).toLocaleString()}
                            </span>
                        </div>

                        <div>
                            <label className="text-sm font-bold">Remarks</label>
                            <textarea name="notes" className="form-textarea" rows={2} value={formData.notes} onChange={handleChange} placeholder="Purchase details or reason for payment..."></textarea>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button type="submit" className="btn btn-primary px-10">
                                <IconSave className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                Save Payment Record
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="panel animate__animated animate__fadeIn">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-bold text-lg dark:text-white-light">Payment & Invoice History</h5>
                    <div className="relative w-full max-w-xs">
                        <input
                            type="text"
                            placeholder="Search history..."
                            className="form-input ltr:pr-11 rtl:pl-11"
                            value={historySearch}
                            onChange={(e) => setHistorySearch(e.target.value)}
                        />
                        <IconSearch className="w-5 h-5 absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-white-dark" />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Vendor Name</th>
                                <th>Category</th>
                                <th className="!text-right">Invoice (₹)</th>
                                <th className="!text-right text-primary">Paid (₹)</th>
                                <th className="!text-center">Mode</th>
                                <th>Ref #</th>
                                <th className="!text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="text-center py-8">Loading history...</td></tr>
                            ) : filteredPayments.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-8">No payment records found.</td></tr>
                            ) : (
                                filteredPayments.map((p) => (
                                    <tr key={p._id}>
                                        <td className="whitespace-nowrap">{new Date(p.date).toLocaleDateString('en-GB')}</td>
                                        <td className="font-bold">{p.vendorName}</td>
                                        <td>
                                            <span className={`badge ${p.vendorType === 'ExplosiveSupplier' ? 'badge-outline-danger' :
                                                p.vendorType === 'LabourContractor' ? 'badge-outline-warning' : 'badge-outline-info'}`}>
                                                {p.vendorType.replace('Supplier', '').replace('Contractor', '').replace('Vendor', '')}
                                            </span>
                                        </td>
                                        <td className="!text-right font-bold">₹{p.invoiceAmount?.toLocaleString()}</td>
                                        <td className="!text-right font-black text-primary">₹{p.paidAmount?.toLocaleString()}</td>
                                        <td className="!text-center text-xs opacity-70">{p.paymentMode}</td>
                                        <td className="text-xs truncate max-w-[100px]">{p.referenceNumber || '-'}</td>
                                        <td className="text-center">
                                            <button onClick={() => setDeleteId(p._id)} className="btn btn-sm btn-outline-danger p-1">
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
                message="Are you sure you want to delete this payment record from history?"
            />
        </div>
    );
};

export default VendorPaymentManagement;
