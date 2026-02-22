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

            // Map balances by ID
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
                    <h2 className="text-2xl font-bold dark:text-white-light">Transport Vendor Management (போக்குவரத்து விற்பனையாளர்கள்)</h2>
                    <p className="text-white-dark text-sm mt-1">Manage outside lorry arrangements, multiple vehicles, and rate per trip.</p>
                </div>
                {!showForm && (
                    <button className="btn btn-info" onClick={() => setShowForm(true)}>
                        <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                        Add New Vendor
                    </button>
                )}
            </div>

            {showForm && (
                <div className="panel animate__animated animate__fadeIn">
                    <div className="flex items-center justify-between mb-5 border-b pb-4 dark:border-[#1b2e4b]">
                        <h5 className="font-bold text-lg">{editId ? 'Edit Transport Vendor' : 'Register New Transport Vendor'}</h5>
                        <button className="text-white-dark hover:text-danger" onClick={resetForm}>✕ Cancel</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Basic & Company Details */}
                        <div>
                            <h6 className="text-primary font-bold mb-4 flex items-center">
                                <span className="bg-primary text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs">1</span>
                                Basic & Company Details (அடிப்படை தகவல்)
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="text-sm font-bold">Vendor/Manager Name *</label>
                                    <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="text-sm font-bold">Company Name (If Any)</label>
                                    <input type="text" name="companyName" className="form-input" value={formData.companyName} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold">Mobile Number *</label>
                                    <input type="text" name="mobileNumber" className="form-input" value={formData.mobileNumber} onChange={handleChange} required />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="text-sm font-bold">Address</label>
                                    <input type="text" name="address" className="form-input" value={formData.address} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold">GST Number</label>
                                    <input type="text" name="gstNumber" className="form-input" value={formData.gstNumber} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold">PAN Number</label>
                                    <input type="text" name="panNumber" className="form-input" value={formData.panNumber} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Vehicle & Rate Details */}
                        <div className="pt-4 border-t dark:border-[#1b2e4b]">
                            <div className="flex flex-col sm:items-center sm:justify-between sm:flex-row gap-4 mb-4">
                                <h6 className="text-info font-bold flex items-center">
                                    <span className="bg-info text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs">2</span>
                                    Vehicle & Rate Details (வண்டி விவரம்)
                                </h6>
                                <button type="button" className="btn btn-sm btn-outline-info w-fit" onClick={addVehicleRow}>
                                    <IconWheel className="w-4 h-4 mr-1" /> Add New Vehicle
                                </button>
                            </div>

                            <div className="table-responsive">
                                <table className="table-hover custom-table min-w-[1100px]">
                                    <thead>
                                        <tr>
                                            <th className="w-32">Type</th>
                                            <th className="w-40">Vehicle Name & No.</th>
                                            <th>Driver Details</th>
                                            <th className="w-32">Capacity</th>
                                            <th className="w-32 text-right">Rate / Trip (₹)</th>
                                            <th className="w-32 text-right">Padi Kasu (₹)</th>
                                            <th className="w-32 text-right">Total / Trip (₹)</th>
                                            <th className="w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.vehicles.map((v: any, index: number) => (
                                            <tr key={index}>
                                                <td>
                                                    <select
                                                        className="form-select text-xs"
                                                        name="vehicleType"
                                                        value={v.vehicleType}
                                                        onChange={(e) => handleVehicleChange(index, e)}
                                                    >
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
                                                        <input
                                                            type="text"
                                                            className="form-input text-xs"
                                                            name="vehicleName"
                                                            value={v.vehicleName}
                                                            onChange={(e) => handleVehicleChange(index, e)}
                                                            placeholder="Model (e.g. Tata Prima)"
                                                        />
                                                        <input
                                                            type="text"
                                                            className="form-input text-xs font-bold uppercase"
                                                            name="vehicleNumber"
                                                            value={v.vehicleNumber}
                                                            onChange={(e) => handleVehicleChange(index, e)}
                                                            placeholder="TN-00-A-0000"
                                                            required
                                                        />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="grid grid-cols-1 gap-1">
                                                        <input
                                                            type="text"
                                                            className="form-input text-xs"
                                                            name="driverName"
                                                            value={v.driverName}
                                                            onChange={(e) => handleVehicleChange(index, e)}
                                                            placeholder="Driver Name"
                                                        />
                                                        <input
                                                            type="text"
                                                            className="form-input text-xs"
                                                            name="driverMobile"
                                                            value={v.driverMobile}
                                                            onChange={(e) => handleVehicleChange(index, e)}
                                                            placeholder="Mobile Number"
                                                        />
                                                    </div>
                                                </td>
                                                <td>
                                                    <select
                                                        className="form-select text-xs"
                                                        name="capacity"
                                                        value={v.capacity}
                                                        onChange={(e) => handleVehicleChange(index, e)}
                                                    >
                                                        <option value="10 Ton">10 Ton</option>
                                                        <option value="15 Ton">15 Ton</option>
                                                        <option value="20 Ton">20 Ton</option>
                                                        <option value="6 Wheeler">6 Wheeler</option>
                                                        <option value="10 Wheeler">10 Wheeler</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-input text-xs text-right font-bold text-info"
                                                        name="ratePerTrip"
                                                        value={v.ratePerTrip}
                                                        onChange={(e) => handleVehicleChange(index, e)}
                                                        required min="0"
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-input text-xs text-right"
                                                        name="padiKasu"
                                                        value={v.padiKasu}
                                                        onChange={(e) => handleVehicleChange(index, e)}
                                                        min="0"
                                                    />
                                                </td>
                                                <td>
                                                    <div className="form-input text-xs text-right bg-dark/5 font-black text-info">
                                                        ₹{(Number(v.ratePerTrip || 0) + Number(v.padiKasu || 0)).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <button type="button" onClick={() => removeVehicleRow(index)} className="text-danger hover:text-white dark:hover:text-danger hover:bg-danger/10 rounded p-1 transition-colors">
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
                        <div className="pt-4 border-t dark:border-[#1b2e4b]">
                            <h6 className="text-success font-bold mb-4 flex items-center">
                                <span className="bg-success text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs">3</span>
                                Payment & Balances (கட்டணம் தகவல்)
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="text-sm font-bold">Payment Mode</label>
                                    <select name="paymentMode" className="form-select" value={formData.paymentMode} onChange={handleChange}>
                                        <option value="Cash">Cash</option>
                                        <option value="Bank">Bank</option>
                                        <option value="UPI">UPI</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-bold">Credit Terms</label>
                                    <select name="creditTerms" className="form-select" value={formData.creditTerms} onChange={handleChange}>
                                        <option value="Per Trip">Per Trip</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="15 days">15 days</option>
                                        <option value="Monthly">Monthly</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-bold">Advance Paid (₹)</label>
                                    <input type="number" name="advancePaid" className="form-input" value={formData.advancePaid} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-success">Total Vehicles</label>
                                    <input type="text" className="form-input bg-success/5 font-black text-success" value={totalVehicles} readOnly />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-info">Potential Trip Cost (₹)</label>
                                    <input type="text" className="form-input bg-info/5 font-black text-info" value={totalTripCost.toLocaleString()} readOnly />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-danger">Opening/Direct Balance (₹)</label>
                                    <input type="number" name="outstandingBalance" className="form-input font-bold border-danger/20 text-danger" value={formData.outstandingBalance} onChange={handleChange} />
                                    <p className="text-[10px] text-white-dark mt-1 italic">This is the base balance. Real-time balance is calculated from payments.</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold">Special Notes / Instructions</label>
                            <textarea name="notes" className="form-textarea" rows={2} value={formData.notes} onChange={handleChange} placeholder="Any specific requirements..."></textarea>
                        </div>

                        <div className="flex justify-end pt-5 gap-3 border-t dark:border-[#1b2e4b]">
                            <button type="button" className="btn btn-outline-danger" onClick={resetForm}>Cancel</button>
                            <button type="submit" className="btn btn-info px-10">
                                <IconSave className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                {editId ? 'Update Vendor' : 'Save Transport Vendor'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!showForm && (
                <div className="panel border-t-4 border-info">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                        <h5 className="font-bold text-lg dark:text-white-light">Outside Lorry Vendors</h5>
                        <div className="relative w-full max-w-xs">
                            <input
                                type="text"
                                placeholder="Search by name, company, lorry number..."
                                className="form-input ltr:pr-11 rtl:pl-11"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <IconSearch className="w-5 h-5 absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-white-dark" />
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr>
                                    <th>Vendor Info</th>
                                    <th>Vehicles & Rates</th>
                                    <th>Payment Settings</th>
                                    <th className="!text-right text-danger">Outstanding (₹)</th>
                                    <th className="!text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="text-center py-8">Loading Vendors...</td></tr>
                                ) : filteredVendors.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-8">No matching transport vendors found.</td></tr>
                                ) : (
                                    filteredVendors.map((v) => (
                                        <tr key={v._id}>
                                            <td>
                                                <div className="font-bold text-info">{v.name}</div>
                                                <div className="text-xs text-white-dark">{v.mobileNumber}</div>
                                                {v.companyName && <div className="text-[10px] italic">{v.companyName}</div>}
                                            </td>
                                            <td>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {v.vehicles?.map((veh: any, idx: number) => (
                                                        <div key={idx} className="p-2 bg-dark-light/5 rounded border border-white-light/10">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="badge badge-outline-info text-[9px] uppercase">{veh.vehicleType || 'Lorry'}</span>
                                                                <span className="font-mono font-bold text-xs tracking-wider uppercase">{veh.vehicleNumber}</span>
                                                            </div>
                                                            <div className="text-[10px] font-bold text-white-dark mb-1">{veh.vehicleName || 'Standard'} ({veh.capacity})</div>
                                                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-white-light/10">
                                                                <span className="text-[10px] text-white-dark italic">{veh.driverName || 'N/A'}</span>
                                                                <div className="text-right">
                                                                    <div className="text-[10px] font-bold text-info">₹{veh.ratePerTrip?.toLocaleString()}</div>
                                                                    <div className="text-[8px] text-warning uppercase">Padi: ₹{veh.padiKasu || 0}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-xs font-semibold">{v.paymentMode} | {v.creditTerms}</div>
                                                <div className="text-[10px] text-success font-bold mt-1">Adv: ₹{v.advancePaid?.toLocaleString() || 0}</div>
                                            </td>
                                            <td className="!text-right font-black text-danger text-base whitespace-nowrap">
                                                ₹{(() => {
                                                    const tripPotential = v.vehicles?.reduce((acc: number, veh: any) => acc + (Number(veh.ratePerTrip || 0) + Number(veh.padiKasu || 0)), 0) || 0;
                                                    const balance = (tripPotential + (v.outstandingBalance || 0)) - (v.advancePaid || 0) + (balances[v._id] || 0);
                                                    return balance.toLocaleString();
                                                })()}
                                            </td>
                                            <td className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => handleEdit(v)} className="btn btn-sm btn-outline-primary p-1">
                                                        <IconEdit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setDeleteId(v._id)} className="btn btn-sm btn-outline-danger p-1">
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
                title="Delete Transport Vendor"
                message="Are you sure you want to delete this transport vendor? This will remove all their vehicle records."
            />
        </div>
    );
};

export default TransportVendorManagement;
