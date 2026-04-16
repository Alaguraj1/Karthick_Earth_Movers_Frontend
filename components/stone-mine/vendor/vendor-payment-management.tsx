'use client';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import api from '@/utils/api';
import { useToast } from '@/components/stone-mine/toast-notification';
import DeleteConfirmModal from '@/components/stone-mine/delete-confirm-modal';
import IconPlus from '@/components/icon/icon-plus';
import IconSave from '@/components/icon/icon-save';
import IconSearch from '@/components/icon/icon-search';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import Link from 'next/link';

const VendorPaymentManagement = () => {
    const currentUser = useSelector((state: IRootState) => state.auth.user);
    const isOwner = currentUser?.role?.toLowerCase() === 'owner';

    const { showToast } = useToast();
    const [payments, setPayments] = useState<any[]>([]);
    const [allVendors, setAllVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [balances, setBalances] = useState<any>({});
    const [selectedVendorStats, setSelectedVendorStats] = useState<any>(null);
    const [historySearch, setHistorySearch] = useState('');
    const [vendorTrips, setVendorTrips] = useState<any[]>([]);
    const [isFetchingTrips, setIsFetchingTrips] = useState(false);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        vendorSelected: '', // Value format: "id|type|name"
        paymentType: 'Payment', // Bill, Payment, Advance
        invoiceAmount: '',
        paidAmount: '',
        paymentMode: 'Cash',
        referenceNumber: '',
        notes: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [payRes, balRes, expRes, transRes] = await Promise.all([
                api.get('/vendors/payments'),
                api.get('/vendors/outstanding'),
                api.get('/vendors/explosive'),
                api.get('/vendors/transport')
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchVendorTrips = async (date: string, vendorId: string, vendorVehicles: any[]) => {
        if (!date || !vendorId || !vendorVehicles.length) {
            setVendorTrips([]);
            return;
        }

        try {
            setIsFetchingTrips(true);
            const { data } = await api.get(`/trips?date=${date}`);
            if (data.success) {
                const vehicleNumbers = vendorVehicles.map(v => (v.vehicleNumber || '').toLowerCase());
                const filtered = data.data.filter((t: any) => {
                    const vNum = (t.vehicleId?.vehicleNumber || t.vehicleId?.registrationNumber || '').toLowerCase();
                    return vehicleNumbers.includes(vNum);
                });

                setVendorTrips(filtered);

                // Calculate total based on vendor's agreement rates for these vehicles
                const total = filtered.reduce((sum: number, trip: any) => {
                    const vName = (trip.vehicleId?.vehicleNumber || trip.vehicleId?.registrationNumber || '').toLowerCase();
                    const vAgreement = vendorVehicles.find(v => (v.vehicleNumber || '').toLowerCase() === vName);
                    const tripRate = Number(vAgreement?.ratePerTrip || 0);
                    const tripPadi = Number(vAgreement?.padiKasu || 0);
                    return sum + tripRate + tripPadi;
                }, 0);

                if (total > 0 && formData.paymentType === 'Bill') {
                    setFormData(prev => ({ ...prev, invoiceAmount: total.toString() }));
                }
            }
        } catch (error) {
            console.error('Error fetching trips:', error);
            showToast('Could not load trips for calculation', 'error');
        } finally {
            setIsFetchingTrips(false);
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'date') {
            const [vId, vType] = formData.vendorSelected.split('|');
            if (vType === 'TransportVendor') {
                const vendor = allVendors.find(v => v._id === vId && v.type === vType);
                if (vendor) fetchVendorTrips(value, vId, vendor.vehicles || []);
            }
        }

        if (name === 'vendorSelected') {
            if (!value) {
                setSelectedVendorStats(null);
                setVendorTrips([]);
                return;
            }
            const [vId, vType] = value.split('|');
            const vendor = allVendors.find((v) => v._id === vId && v.type === vType);
            if (vendor) {
                if (vType === 'TransportVendor') {
                    fetchVendorTrips(formData.date, vId, vendor.vehicles || []);
                } else {
                    setVendorTrips([]);
                }

                const ledgerBal = balances[`${vId}|${vType}`] || 0;
                let potentialCost = 0;
                if (vType === 'TransportVendor') {
                    potentialCost = vendor.vehicles?.reduce((acc: number, veh: any) => acc + (Number(veh.ratePerTrip || 0) + Number(veh.padiKasu || 0)), 0) || 0;
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

            await api.post('/vendors/payments', data);
            showToast(`${formData.paymentType === 'Bill' ? 'Bill recorded' : 'Payment recorded'} successfully!`, 'success');

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
            paymentType: 'Payment',
            invoiceAmount: '',
            paidAmount: '',
            paymentMode: 'Cash',
            referenceNumber: '',
            notes: ''
        });
        setSelectedVendorStats(null);
        setVendorTrips([]);
        setShowForm(false);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/vendors/payments/${deleteId}`);
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
                    <div className="flex items-center gap-2">
                        <Link href="/vendors/advance" className="btn btn-outline-warning shadow-sm">
                            <span>💸</span> View Advances
                        </Link>
                        <Link href="/vendors/outstanding" className="btn btn-outline-info shadow-sm">
                            <span>📊</span> View Outstanding
                        </Link>
                        <button className="btn btn-primary shadow-lg" onClick={() => setShowForm(true)}>
                            <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                            Record New Bill / Pay
                        </button>
                    </div>
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
                                <label className="text-sm font-bold text-gray-400">Date *</label>
                                <input type="date" name="date" className="form-input" value={formData.date} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="text-sm font-black text-primary uppercase text-[10px]">Entry Type</label>
                                <select name="paymentType" className="form-select border-primary font-black" value={formData.paymentType} onChange={handleChange}>
                                    <option value="Bill">📝 New Bill (Debit To Us)</option>
                                    <option value="Payment">💳 Payment (Credit From Us)</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
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

                        {vendorTrips.length > 0 && (
                            <div className="panel bg-info/5 border-dashed border-info/30 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h6 className="font-black text-xs uppercase text-info">Trips Log for {formData.date}</h6>
                                    <span className="badge badge-outline-info">{vendorTrips.length} Trips Found</span>
                                </div>
                                <div className="table-responsive">
                                    <table className="table-sm">
                                        <thead>
                                            <tr>
                                                <th className="text-[10px] uppercase">Vehicle</th>
                                                <th className="text-[10px] uppercase">Route</th>
                                                <th className="text-[10px] uppercase !text-right">Rate</th>
                                                <th className="text-[10px] uppercase !text-right">Padi</th>
                                                <th className="text-[10px] uppercase !text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vendorTrips.map((t, idx) => {
                                                const [vId, vType] = formData.vendorSelected.split('|');
                                                const vendor = allVendors.find(v => v._id === vId && v.type === vType);
                                                const vName = (t.vehicleId?.vehicleNumber || t.vehicleId?.registrationNumber || '').toLowerCase();
                                                const vAgreement = vendor?.vehicles?.find((v: any) => (v.vehicleNumber || '').toLowerCase() === vName);
                                                const tripRate = Number(vAgreement?.ratePerTrip || 0);
                                                const tripPadi = Number(vAgreement?.padiKasu || 0);
                                                return (
                                                    <tr key={idx} className="border-b border-info/10">
                                                        <td className="text-xs font-bold">{vName.toUpperCase()}</td>
                                                        <td className="text-[10px]">{t.fromLocation} → {t.toLocation}</td>
                                                        <td className="text-xs !text-right">₹{tripRate.toLocaleString()}</td>
                                                        <td className="text-xs !text-right text-warning font-bold">₹{tripPadi.toLocaleString()}</td>
                                                        <td className="text-xs !text-right font-black text-info">₹{(tripRate + tripPadi).toLocaleString()}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-info/10">
                                                <td colSpan={4} className="text-right text-[10px] font-black uppercase">Grand Total (Bill Amount):</td>
                                                <td className="!text-right text-sm font-black text-info">
                                                    ₹{vendorTrips.reduce((sum, t) => {
                                                        const [vId, vType] = formData.vendorSelected.split('|');
                                                        const vendor = allVendors.find(v => v._id === vId && v.type === vType);
                                                        const vName = (t.vehicleId?.vehicleNumber || t.vehicleId?.registrationNumber || '').toLowerCase();
                                                        const vAgreement = vendor?.vehicles?.find((v: any) => (v.vehicleNumber || '').toLowerCase() === vName);
                                                        return sum + Number(vAgreement?.ratePerTrip || 0) + Number(vAgreement?.padiKasu || 0);
                                                    }, 0).toLocaleString()}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        )}

                        {isFetchingTrips && (
                            <div className="flex items-center justify-center p-4 bg-info/5 rounded animate-pulse">
                                <span className="animate-spin border-2 border-info border-l-transparent rounded-full w-4 h-4 mr-2"></span>
                                <span className="text-xs font-bold text-info uppercase">Calculating Trips...</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                            {formData.paymentType === 'Bill' && (
                                <div>
                                    <label className="text-sm font-bold text-danger">Bill Amount (Increase Bal)</label>
                                    <input type="number" name="invoiceAmount" className="form-input border-danger/40" value={formData.invoiceAmount} onChange={handleChange} placeholder="0" required={formData.paymentType === 'Bill'} />
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-bold text-success">Paid Amount (Decrease Bal)</label>
                                <input type="number" name="paidAmount" className="form-input border-success/40 font-black text-success" value={formData.paidAmount} onChange={handleChange} placeholder="0" required={formData.paymentType === 'Payment'} />
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
                            <div className={formData.paymentType === 'Bill' ? 'md:col-span-1' : 'md:col-span-2'}>
                                <label className="text-sm font-bold">Ref # / Check No</label>
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
                                <th>Category</th>
                                <th>Type</th>
                                <th>Vendor Name</th>
                                <th className="!text-right">Invoice (₹)</th>
                                <th className="!text-right text-primary">Payment (₹)</th>
                                <th className="!text-center">Mode</th>
                                <th>Ref #</th>
                                <th className="!text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9} className="text-center py-8">Loading history...</td></tr>
                            ) : filteredPayments.length === 0 ? (
                                <tr><td colSpan={9} className="text-center py-8">No payment records found.</td></tr>
                            ) : (
                                filteredPayments.map((p) => (
                                    <tr key={p._id}>
                                        <td className="whitespace-nowrap">{new Date(p.date).toLocaleDateString('en-GB')}</td>
                                        <td>
                                            <span className={`badge ${p.vendorType === 'ExplosiveSupplier' ? 'badge-outline-danger' : 'badge-outline-info'} py-0.5 px-1.5 text-[10px]`}>
                                                {p.vendorType.replace('Supplier', '').replace('Vendor', '')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`text-[10px] font-black uppercase ${p.paymentType === 'Bill' ? 'text-danger' : p.paymentType === 'Advance' ? 'text-warning' : 'text-success'}`}>
                                                {p.paymentType || 'Payment'}
                                            </span>
                                        </td>
                                        <td className="font-bold">{p.vendorName}</td>
                                        <td className="!text-right font-bold text-danger">₹{p.invoiceAmount > 0 ? p.invoiceAmount.toLocaleString() : '-'}</td>
                                        <td className="!text-right font-black text-success">₹{p.paidAmount > 0 ? p.paidAmount.toLocaleString() : '-'}</td>
                                        <td className="!text-center text-xs opacity-70">{p.paymentMode}</td>
                                        <td className="text-xs truncate max-w-[100px]">{p.referenceNumber || '-'}</td>
                                        <td className="text-center">
                                            {isOwner && (<button onClick={() => setDeleteId(p._id)} className="btn btn-sm btn-outline-danger p-1">
                                                <IconTrashLines className="w-4 h-4" />
                                            </button>)}
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
