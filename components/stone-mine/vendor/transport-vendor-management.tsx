'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/components/stone-mine/toast-notification';
import DeleteConfirmModal from '@/components/stone-mine/delete-confirm-modal';
import IconPlus from '@/components/icon/icon-plus';
import IconSave from '@/components/icon/icon-save';
import IconSearch from '@/components/icon/icon-search';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconEdit from '@/components/icon/icon-edit';
import IconTrash from '@/components/icon/icon-trash';
import IconWheel from '@/components/icon/icon-wheel';

const API = process.env.NEXT_PUBLIC_API_URL;

const TransportVendorManagement = () => {
    const { showToast } = useToast();
    const [vendors, setVendors] = useState<any[]>([]);
    const [balances, setBalances] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const initialVehicle = {
        vehicleType: 'Lorry',
        vehicleName: '',
        vehicleNumber: '',
        driverName: '',
        driverMobile: '',
        capacity: '10 Ton',
        ratePerTrip: '0',
        padiKasu: '0'
    };

    const initialFormState = {
        name: '',
        companyName: '',
        mobileNumber: '',
        address: '',
        gstNumber: '',
        panNumber: '',
        vehicles: [{ ...initialVehicle }],
        paymentMode: 'Bank',
        creditTerms: 'Per Trip',
        advancePaid: '0',
        outstandingBalance: '0',
        notes: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [transRes, balRes] = await Promise.all([
                axios.get(`${API}/vendors/transport`),
                axios.get(`${API}/vendors/outstanding`)
            ]);

            if (transRes.data.success) setVendors(transRes.data.data);

            const balMap: any = {};
            if (balRes.data.success) {
                balRes.data.data.forEach((b: any) => {
                    if (b.vendorType === 'TransportVendor') {
                        balMap[b.vendorId] = b.balance;
                    }
                });
            }
            setBalances(balMap);
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
    };

    const handleVehicleChange = (index: number, e: any) => {
        const { name, value } = e.target;
        const updatedVehicles = [...formData.vehicles];
        updatedVehicles[index] = { ...updatedVehicles[index], [name]: value };
        setFormData({ ...formData, vehicles: updatedVehicles });
    };

    const addVehicleRow = () => {
        setFormData({
            ...formData,
            vehicles: [...formData.vehicles, { ...initialVehicle }]
        });
    };

    const removeVehicleRow = (index: number) => {
        if (formData.vehicles.length === 1) {
            showToast('At least one vehicle detail is required', 'error');
            return;
        }
        const updatedVehicles = formData.vehicles.filter((_, i) => i !== index);
        setFormData({ ...formData, vehicles: updatedVehicles });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                vehicles: formData.vehicles.map(v => ({
                    ...v,
                    ratePerTrip: Number(v.ratePerTrip),
                    padiKasu: Number(v.padiKasu || 0)
                })),
                advancePaid: Number(formData.advancePaid),
                outstandingBalance: Number(formData.outstandingBalance)
            };

            if (editId) {
                await axios.put(`${API}/vendors/transport/${editId}`, payload);
                showToast('Transport vendor updated successfully!', 'success');
            } else {
                await axios.post(`${API}/vendors/transport`, payload);
                showToast('Transport vendor registered successfully!', 'success');
            }
            resetForm();
            fetchData();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Error saving transport vendor', 'error');
        }
    };

    const handleEdit = (vendor: any) => {
        setFormData({
            name: vendor.name,
            companyName: vendor.companyName || '',
            mobileNumber: vendor.mobileNumber,
            address: vendor.address || '',
            gstNumber: vendor.gstNumber || '',
            panNumber: vendor.panNumber || '',
            vehicles: vendor.vehicles && vendor.vehicles.length > 0 ? vendor.vehicles : [{ ...initialVehicle }],
            paymentMode: vendor.paymentMode || 'Bank',
            creditTerms: vendor.creditTerms || 'Per Trip',
            advancePaid: vendor.advancePaid?.toString() || '0',
            outstandingBalance: vendor.outstandingBalance?.toString() || '0',
            notes: vendor.notes || ''
        });
        setEditId(vendor._id);
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setEditId(null);
        setShowForm(false);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await axios.delete(`${API}/vendors/transport/${deleteId}`);
            showToast('Vendor deleted successfully!', 'success');
            setDeleteId(null);
            fetchData();
        } catch (error) {
            showToast('Error deleting vendor', 'error');
        }
    };

    const totalTripCost = formData.vehicles.reduce((acc: number, v: any) => acc + (Number(v.ratePerTrip || 0) + Number(v.padiKasu || 0)), 0);
    const totalVehicles = formData.vehicles.length;

    const filteredVendors = vendors.filter((v) =>
        v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.mobileNumber?.includes(searchQuery) ||
        v.vehicles?.some((veh: any) => veh.vehicleNumber?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-black dark:text-white-light uppercase tracking-tight">Transport Vendors</h2>
                    <p className="text-white-dark text-sm font-bold mt-1">Lorry & Transport Fleet Partners (போக்குவரத்து ஒப்பந்ததாரர்கள்)</p>
                </div>
                {!showForm && (
                    <button className="btn btn-primary shadow-[0_10px_20px_rgba(67,97,238,0.3)] rounded-xl py-3 px-8 font-black uppercase tracking-widest text-xs" onClick={() => setShowForm(true)}>
                        <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                        Add New Vendor
                    </button>
                )}
            </div>

            {showForm && (
                <div className="panel shadow-2xl rounded-2xl border-none animate__animated animate__fadeIn">
                    <div className="flex items-center justify-between mb-8 border-b pb-5 dark:border-[#1b2e4b]">
                        <div>
                            <h5 className="text-xl font-black text-black dark:text-white-light uppercase tracking-tight">{editId ? 'Edit Vendor Profile' : 'Register New Vendor'}</h5>
                            <p className="text-primary text-xs font-bold uppercase tracking-widest mt-1 opacity-70">Vendor Partnership Portal</p>
                        </div>
                        <button className="btn btn-outline-danger btn-sm rounded-xl px-5 py-2 font-bold uppercase tracking-widest text-[10px]" onClick={resetForm}>✕ Cancel</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Section 1: Basic & Company Details */}
                        <div className="space-y-6 bg-primary/5 p-6 rounded-2xl border border-primary/10">
                            <h6 className="text-primary flex items-center gap-2 font-black uppercase text-xs tracking-[0.2em] border-b border-primary/10 pb-3 mb-4">
                                <span className="bg-primary text-white w-6 h-6 rounded-lg inline-flex items-center justify-center text-[10px]">1</span>
                                Basic & Company Details (அடிப்படை தகவல்)
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Vendor/Manager Name *</label>
                                    <input type="text" name="name" className="form-input border-2 font-bold rounded-xl h-12 border-primary/20" value={formData.name} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Company Name (If Any)</label>
                                    <input type="text" name="companyName" className="form-input border-2 font-bold rounded-xl h-12" value={formData.companyName} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Mobile Number *</label>
                                    <input type="text" name="mobileNumber" className="form-input border-2 font-bold rounded-xl h-12 border-primary/20" value={formData.mobileNumber} onChange={handleChange} required />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Address</label>
                                    <input type="text" name="address" className="form-input border-2 font-bold rounded-xl h-12" value={formData.address} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">GST Number</label>
                                    <input type="text" name="gstNumber" className="form-input border-2 font-bold rounded-xl h-12 uppercase" value={formData.gstNumber} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">PAN Number</label>
                                    <input type="text" name="panNumber" className="form-input border-2 font-bold rounded-xl h-12 uppercase" value={formData.panNumber} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Vehicle & Rate Details */}
                        <div className="space-y-6 bg-info/5 p-6 rounded-2xl border border-info/10">
                            <div className="flex flex-col sm:items-center sm:justify-between sm:flex-row gap-4 border-b border-info/10 pb-3 mb-4">
                                <h6 className="text-info flex items-center gap-2 font-black uppercase text-xs tracking-[0.2em]">
                                    <span className="bg-info text-white w-6 h-6 rounded-lg inline-flex items-center justify-center text-[10px]">2</span>
                                    Vehicle & Rate Details (வண்டி விவரம்)
                                </h6>
                                <button type="button" className="btn btn-sm btn-info rounded-xl px-4 py-2 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-info/20" onClick={addVehicleRow}>
                                    <IconWheel className="w-4 h-4 mr-2" /> Add New Vehicle
                                </button>
                            </div>

                            <div className="table-responsive">
                                <table className="table-hover custom-table min-w-[1100px]">
                                    <thead>
                                        <tr className="border-b border-info/10">
                                            <th className="text-[10px] font-black uppercase tracking-widest text-white-dark">Type</th>
                                            <th className="text-[10px] font-black uppercase tracking-widest text-white-dark">Vehicle Name & No.</th>
                                            <th className="text-[10px] font-black uppercase tracking-widest text-white-dark">Driver Details</th>
                                            <th className="text-[10px] font-black uppercase tracking-widest text-white-dark">Capacity</th>
                                            <th className="text-[10px] font-black uppercase tracking-widest text-white-dark text-right">Rate / Trip (₹)</th>
                                            <th className="text-[10px] font-black uppercase tracking-widest text-white-dark text-right">Padi Kasu (₹)</th>
                                            <th className="text-[10px] font-black uppercase tracking-widest text-white-dark text-right">Total / Trip (₹)</th>
                                            <th className="w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-info/5">
                                        {formData.vehicles.map((v: any, index: number) => (
                                            <tr key={index}>
                                                <td>
                                                    <select className="form-select border-2 font-bold rounded-xl h-10 text-xs" name="vehicleType" value={v.vehicleType} onChange={(e) => handleVehicleChange(index, e)}>
                                                        <option value="Lorry">Lorry</option>
                                                        <option value="JCB">JCB</option>
                                                        <option value="Hitachi">Hitachi</option>
                                                        <option value="Tractor">Tractor</option>
                                                        <option value="Tipper">Tipper</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <div className="space-y-1">
                                                        <input type="text" className="form-input border-2 font-bold rounded-xl h-10 text-xs" name="vehicleName" value={v.vehicleName} onChange={(e) => handleVehicleChange(index, e)} placeholder="Model Name" />
                                                        <input type="text" className="form-input border-2 font-black rounded-xl h-10 text-xs uppercase text-info" name="vehicleNumber" value={v.vehicleNumber} onChange={(e) => handleVehicleChange(index, e)} placeholder="Plate No." required />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="space-y-1">
                                                        <input type="text" className="form-input border-2 font-bold rounded-xl h-10 text-xs" name="driverName" value={v.driverName} onChange={(e) => handleVehicleChange(index, e)} placeholder="Driver Name" />
                                                        <input type="text" className="form-input border-2 font-bold rounded-xl h-10 text-xs" name="driverMobile" value={v.driverMobile} onChange={(e) => handleVehicleChange(index, e)} placeholder="Mobile" />
                                                    </div>
                                                </td>
                                                <td>
                                                    <select className="form-select border-2 font-bold rounded-xl h-10 text-xs" name="capacity" value={v.capacity} onChange={(e) => handleVehicleChange(index, e)}>
                                                        <option value="10 Ton">10 Ton</option>
                                                        <option value="15 Ton">15 Ton</option>
                                                        <option value="20 Ton">20 Ton</option>
                                                        <option value="6 Wheeler">6 Wheeler</option>
                                                        <option value="10 Wheeler">10 Wheeler</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <input type="number" className="form-input border-2 font-black rounded-xl h-10 text-xs text-right text-info" name="ratePerTrip" value={v.ratePerTrip} onChange={(e) => handleVehicleChange(index, e)} required min="0" />
                                                </td>
                                                <td>
                                                    <input type="number" className="form-input border-2 font-bold rounded-xl h-10 text-xs text-right" name="padiKasu" value={v.padiKasu} onChange={(e) => handleVehicleChange(index, e)} min="0" />
                                                </td>
                                                <td>
                                                    <div className="form-input border-2 font-black rounded-xl h-10 text-xs text-right bg-info/5 text-info border-info/10">
                                                        ₹{(Number(v.ratePerTrip || 0) + Number(v.padiKasu || 0)).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <button type="button" onClick={() => removeVehicleRow(index)} className="p-2 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-xl transition-all">
                                                        <IconTrash className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Section 3: Payment & Balances */}
                        <div className="space-y-6 bg-success/5 p-6 rounded-2xl border border-success/10">
                            <h6 className="text-success flex items-center gap-2 font-black uppercase text-xs tracking-[0.2em] border-b border-success/10 pb-3 mb-4">
                                <span className="bg-success text-white w-6 h-6 rounded-lg inline-flex items-center justify-center text-[10px]">3</span>
                                Payment & Balances (கட்டணம் தகவல்)
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Payment Mode</label>
                                    <select name="paymentMode" className="form-select border-2 font-bold rounded-xl h-12" value={formData.paymentMode} onChange={handleChange}>
                                        <option value="Cash">Cash</option>
                                        <option value="Bank">Bank</option>
                                        <option value="UPI">UPI</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Credit Terms</label>
                                    <select name="creditTerms" className="form-select border-2 font-bold rounded-xl h-12" value={formData.creditTerms} onChange={handleChange}>
                                        <option value="Per Trip">Per Trip</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="15 days">15 days</option>
                                        <option value="Monthly">Monthly</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Advance Paid (₹)</label>
                                    <input type="number" name="advancePaid" className="form-input border-2 font-bold rounded-xl h-12" value={formData.advancePaid} onChange={handleChange} />
                                </div>
                                <div className="bg-success text-white p-4 rounded-xl shadow-lg shadow-success/20">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70 block mb-1">Total Active Fleet</label>
                                    <div className="text-2xl font-black">{totalVehicles} Vehicles</div>
                                </div>
                                <div className="bg-info text-white p-4 rounded-xl shadow-lg shadow-info/20">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70 block mb-1">Potential Trip Cost</label>
                                    <div className="text-2xl font-black">₹{totalTripCost.toLocaleString()}</div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block text-danger">Opening Balance (₹)</label>
                                    <input type="number" name="outstandingBalance" className="form-input border-2 font-bold rounded-xl h-12 border-danger/20 text-danger" value={formData.outstandingBalance} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-white-dark uppercase tracking-widest block">Special Notes / Instructions</label>
                            <textarea name="notes" className="form-textarea border-2 font-bold rounded-2xl min-h-[100px]" rows={2} value={formData.notes} onChange={handleChange} placeholder="Any specific requirements..."></textarea>
                        </div>

                        <div className="flex justify-end pt-5 gap-4 border-t-2 border-primary/5">
                            <button type="button" className="btn btn-outline-danger px-10 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]" onClick={resetForm}>Cancel</button>
                            <button type="submit" className="btn btn-primary px-14 h-12 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-[0_10px_20px_rgba(67,97,238,0.3)]">
                                <IconSave className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                {editId ? 'Update Vendor Profile' : 'Save Transport Vendor'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!showForm && (
                <div className="panel shadow-xl rounded-2xl border-none border-t-4 border-primary">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h5 className="text-xl font-black text-black dark:text-white-light uppercase tracking-tight">Active Partners</h5>
                            <p className="text-white-dark text-xs font-bold uppercase tracking-widest mt-1">Fleet Vendor Directory</p>
                        </div>
                        <div className="relative w-full max-w-md">
                            <input type="text" placeholder="Search by name, company, plate number..." className="form-input border-2 border-primary/10 font-bold rounded-xl h-12 ltr:pr-11 rtl:pl-11 focus:border-primary transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            <IconSearch className="w-5 h-5 absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-primary/40" />
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table-hover w-full whitespace-nowrap">
                            <thead>
                                <tr className="border-b-2 border-primary/5">
                                    <th className="text-[11px] font-black uppercase tracking-widest text-white-dark pb-4">Vendor Info</th>
                                    <th className="text-[11px] font-black uppercase tracking-widest text-white-dark pb-4">Fleet & Rates</th>
                                    <th className="text-[11px] font-black uppercase tracking-widest text-white-dark pb-4">Payment Setup</th>
                                    <th className="text-[11px] font-black uppercase tracking-widest text-danger pb-4 text-right">Outstanding (₹)</th>
                                    <th className="text-[11px] font-black uppercase tracking-widest text-white-dark pb-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white-light/5">
                                {loading ? (
                                    <tr><td colSpan={5} className="text-center py-20 uppercase font-black tracking-widest opacity-20">Loading Vendors...</td></tr>
                                ) : filteredVendors.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-20 uppercase font-black tracking-widest opacity-20 text-xl">No Partners Found</td></tr>
                                ) : (
                                    filteredVendors.map((v) => (
                                        <tr key={v._id} className="group hover:bg-primary/5 transition-colors">
                                            <td className="py-5">
                                                <div className="font-black text-primary uppercase text-sm tracking-tight">{v.name}</div>
                                                <div className="text-xs font-bold text-white-dark flex items-center mt-1">
                                                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] mr-2 tracking-widest">MOBILE</span>
                                                    {v.mobileNumber}
                                                </div>
                                                {v.companyName && <div className="text-[10px] font-black text-info uppercase mt-1 tracking-widest opacity-70 italic">{v.companyName}</div>}
                                            </td>
                                            <td className="py-5">
                                                <div className="grid grid-cols-1 gap-3 max-w-xs">
                                                    {v.vehicles?.slice(0, 2).map((veh: any, idx: number) => (
                                                        <div key={idx} className="p-3 bg-white dark:bg-black/20 rounded-xl border border-primary/5 shadow-sm">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-[9px] font-black bg-info/10 text-info px-2 py-0.5 rounded uppercase">{veh.vehicleType || 'Lorry'}</span>
                                                                <span className="font-black text-xs text-black dark:text-white uppercase">{veh.vehicleNumber}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between mt-2">
                                                                <span className="text-[10px] font-bold text-white-dark">{veh.driverName || 'No Driver'}</span>
                                                                <span className="text-[11px] font-black text-info">₹{veh.ratePerTrip?.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {v.vehicles?.length > 2 && (
                                                        <div className="text-center text-[10px] font-black text-primary/40 uppercase tracking-widest">+{v.vehicles.length - 2} More Vehicles</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-5">
                                                <div className="space-y-1">
                                                    <div className="text-xs font-black text-black dark:text-white uppercase tracking-tight">{v.paymentMode}</div>
                                                    <div className="text-[10px] font-bold text-white-dark uppercase tracking-widest">Terms: {v.creditTerms}</div>
                                                    <div className="text-[10px] font-black text-success uppercase tracking-widest mt-1">Adv: ₹{v.advancePaid?.toLocaleString() || 0}</div>
                                                </div>
                                            </td>
                                            <td className="py-5 text-right font-black text-danger text-lg">
                                                ₹{(() => {
                                                    const tripPotential = v.vehicles?.reduce((acc: number, veh: any) => acc + (Number(veh.ratePerTrip || 0) + Number(veh.padiKasu || 0)), 0) || 0;
                                                    const balance = (tripPotential + (v.outstandingBalance || 0)) - (v.advancePaid || 0) + (balances[v._id] || 0);
                                                    return balance.toLocaleString();
                                                })()}
                                            </td>
                                            <td className="py-5 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button onClick={() => handleEdit(v)} className="p-2 bg-info/10 text-info hover:bg-info hover:text-white rounded-xl transition-all shadow-sm shadow-info/10">
                                                        <IconEdit className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => setDeleteId(v._id)} className="p-2 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-xl transition-all shadow-sm shadow-danger/10">
                                                        <IconTrashLines className="w-5 h-5" />
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
                title="Delete Transport Vendor"
                message="Are you sure you want to delete this transport vendor? This will remove all their vehicle records and partner history."
            />
        </div>
    );
};

export default TransportVendorManagement;
