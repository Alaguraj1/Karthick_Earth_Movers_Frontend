'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useToast } from '@/components/stone-mine/toast-notification';
import DeleteConfirmModal from '@/components/stone-mine/delete-confirm-modal';
import IconPlus from '@/components/icon/icon-plus';
import IconSave from '@/components/icon/icon-save';
import IconSearch from '@/components/icon/icon-search';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconEdit from '@/components/icon/icon-edit';

const API = process.env.NEXT_PUBLIC_API_URL;

const ExplosiveSupplierManagement = () => {
    const { showToast } = useToast();
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [masterMaterials, setMasterMaterials] = useState<any[]>([]);
    const [balances, setBalances] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const initialFormState = {
        name: '',
        companyName: '',
        contactPerson: '',
        contactNumber: '',
        email: '',
        address: '',
        explosiveLicenseNumber: '',
        licenseValidityDate: '',
        gstNumber: '',
        panNumber: '',
        authorizedDealerId: '',
        supplyItems: [] as { material: string, rate: number }[],
        paymentTerms: '',
        openingBalance: '0'
    };

    const [formData, setFormData] = useState(initialFormState);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [supRes, matRes, balRes] = await Promise.all([
                axios.get(`${API}/vendors/explosive`),
                axios.get(`${API}/master/explosive-materials`),
                axios.get(`${API}/vendors/outstanding`)
            ]);

            if (supRes.data.success) setSuppliers(supRes.data.data);
            if (matRes.data.success) setMasterMaterials(matRes.data.data);

            const balMap: any = {};
            if (balRes.data.success) {
                balRes.data.data.forEach((b: any) => {
                    if (b.vendorType === 'ExplosiveSupplier') {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleItemChange = (materialName: string) => {
        let updatedItems = [...formData.supplyItems];
        const exists = updatedItems.find(i => i.material === materialName);
        if (exists) {
            updatedItems = updatedItems.filter(item => item.material !== materialName);
        } else {
            updatedItems.push({ material: materialName, rate: 0 });
        }
        setFormData({ ...formData, supplyItems: updatedItems });
    };

    const handleRateUpdate = (materialName: string, rate: number) => {
        const updatedItems = formData.supplyItems.map(item =>
            item.material === materialName ? { ...item, rate } : item
        );
        setFormData({ ...formData, supplyItems: updatedItems });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                supplyItems: formData.supplyItems.map(item => ({ ...item, rate: Number(item.rate) })),
                openingBalance: Number(formData.openingBalance)
            };
            if (editId) {
                await axios.put(`${API}/vendors/explosive/${editId}`, data);
                showToast('Supplier updated successfully!', 'success');
            } else {
                await axios.post(`${API}/vendors/explosive`, data);
                showToast('Supplier registered successfully!', 'success');
            }
            resetForm();
            fetchData();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Error saving supplier', 'error');
        }
    };

    const handleEdit = (supplier: any) => {
        setFormData({
            ...initialFormState,
            name: supplier.name,
            companyName: supplier.companyName || '',
            contactNumber: supplier.contactNumber || '',
            email: supplier.email || '',
            address: supplier.address || '',
            explosiveLicenseNumber: supplier.explosiveLicenseNumber || '',
            licenseValidityDate: supplier.licenseValidityDate ? new Date(supplier.licenseValidityDate).toISOString().split('T')[0] : '',
            supplyItems: supplier.supplyItems || [],
            paymentTerms: supplier.paymentTerms || '',
            openingBalance: supplier.openingBalance?.toString() || '0'
        });
        setEditId(supplier._id);
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
            await axios.delete(`${API}/vendors/explosive/${deleteId}`);
            showToast('Supplier deleted successfully!', 'success');
            setDeleteId(null);
            fetchData();
        } catch (error) {
            showToast('Error deleting supplier', 'error');
        }
    };

    const filteredSuppliers = suppliers.filter((s) =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.explosiveLicenseNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.contactNumber?.includes(searchQuery)
    );

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li><Link href="/" className="text-primary hover:underline font-bold">Dashboard</Link></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 font-bold text-white-dark uppercase tracking-widest text-[10px]"><span>Vendor Management</span></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 font-bold text-white-dark uppercase tracking-widest text-[10px]"><span>Explosives</span></li>
            </ul>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-black dark:text-white-light uppercase tracking-tight">Explosive Suppliers</h2>
                    <p className="text-white-dark text-sm font-bold mt-1">Manage Material Vendors, Licenses, and Pricing</p>
                </div>
                {!showForm && (
                    <button
                        className="btn btn-primary shadow-[0_10px_20px_rgba(67,97,238,0.3)] rounded-xl py-3 px-8 font-black uppercase tracking-widest text-xs"
                        onClick={() => setShowForm(true)}
                    >
                        <IconPlus className="mr-2" /> Add New Supplier
                    </button>
                )}
            </div>

            {showForm ? (
                <div className="panel shadow-2xl rounded-2xl border-none animate__animated animate__fadeIn">
                    <div className="mb-8 flex items-center justify-between border-b border-[#ebedf2] dark:border-[#1b2e4b] pb-5">
                        <div className="flex items-center">
                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm ltr:mr-4 rtl:ml-4 flex items-center justify-center rounded-xl w-10 h-10 p-0 shadow-lg shadow-primary/20"
                                onClick={resetForm}
                            >
                                <IconSearch className="h-5 w-5 rotate-180" />
                            </button>
                            <div>
                                <h5 className="text-xl font-black text-black dark:text-white-light uppercase tracking-tight">{editId ? 'Edit Supplier Profile' : 'Register New Vendor'}</h5>
                                <p className="text-primary text-xs font-bold uppercase tracking-widest mt-1 opacity-70">Secured Material Procurement Portal</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-10">
                        {/* Section 1: Identity */}
                        <div className="space-y-6 bg-primary/5 p-6 rounded-2xl border border-primary/10">
                            <div className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-[0.2em] border-b border-primary/10 pb-3 mb-4">
                                <span className="bg-primary text-white w-6 h-6 rounded-lg inline-flex items-center justify-center text-[10px]">1</span>
                                Identity & Contact (அடையாளம் மற்றும் தொடர்பு)
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Supplier / Company Name *</label>
                                    <input type="text" name="name" className="form-input border-2 font-bold rounded-xl h-12" value={formData.name} onChange={handleChange} required placeholder="e.g. Acme Explosives Ltd" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Contact Number *</label>
                                    <input type="text" name="contactNumber" className="form-input border-2 font-bold rounded-xl h-12" value={formData.contactNumber} onChange={handleChange} required placeholder="+91 99XXX XXXXX" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Email Address</label>
                                    <input type="email" name="email" className="form-input border-2 font-bold rounded-xl h-12" value={formData.email} onChange={handleChange} placeholder="vendor@email.com" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Registered Address</label>
                                    <input type="text" name="address" className="form-input border-2 font-bold rounded-xl h-12" value={formData.address} onChange={handleChange} placeholder="Complete business address..." />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Compliance */}
                        <div className="space-y-6 bg-danger/5 p-6 rounded-2xl border border-danger/10">
                            <div className="flex items-center gap-2 text-danger font-black uppercase text-xs tracking-[0.2em] border-b border-danger/10 pb-3 mb-4">
                                <span className="bg-danger text-white w-6 h-6 rounded-lg inline-flex items-center justify-center text-[10px]">2</span>
                                Compliance & Licensing (சட்ட விபரங்கள்)
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Explosive License Number *</label>
                                    <input type="text" name="explosiveLicenseNumber" className="form-input border-2 font-bold rounded-xl h-12 border-danger/20" value={formData.explosiveLicenseNumber} onChange={handleChange} required placeholder="EXP-XXXX-2024" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">License Expiry Date *</label>
                                    <input type="date" name="licenseValidityDate" className="form-input border-2 font-bold rounded-xl h-12 border-danger/20" value={formData.licenseValidityDate} onChange={handleChange} required />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Material Catalog */}
                        <div className="space-y-6 bg-warning/5 p-6 rounded-2xl border border-warning/10">
                            <div className="flex items-center gap-2 text-warning font-black uppercase text-xs tracking-[0.2em] border-b border-warning/10 pb-3 mb-4">
                                <span className="bg-warning text-white w-6 h-6 rounded-lg inline-flex items-center justify-center text-[10px]">3</span>
                                Material Catalog / Tab List (பொருட்கள் பட்டியல்)
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-3 block text-warning">Available Materials</label>
                                    <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                        {masterMaterials.map((mat) => (
                                            <button
                                                key={mat._id}
                                                type="button"
                                                onClick={() => handleItemChange(mat.name)}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all border text-left ${formData.supplyItems.find(i => i.material === mat.name) ? 'bg-warning text-white border-warning shadow-md' : 'bg-white text-gray-600 border-gray-100 hover:bg-warning/5'}`}
                                            >
                                                <span>{mat.name}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-md ${formData.supplyItems.find(i => i.material === mat.name) ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>{mat.unit}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white/50 dark:bg-black/20 p-5 rounded-2xl border border-dashed border-warning/20">
                                    <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-4 block">Selected for Supply</label>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.supplyItems.length === 0 ? (
                                            <p className="text-[11px] font-bold text-gray-400 italic">No materials selected yet...</p>
                                        ) : (
                                            formData.supplyItems.map((item, idx) => (
                                                <span key={idx} className="bg-warning/10 text-warning px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border border-warning/20">
                                                    {item.material}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Pricing & Commercials */}
                        <div className="space-y-6 bg-info/5 p-6 rounded-2xl border border-info/10">
                            <div className="flex items-center gap-2 text-info font-black uppercase text-xs tracking-[0.2em] border-b border-info/10 pb-3 mb-4">
                                <span className="bg-info text-white w-6 h-6 rounded-lg inline-flex items-center justify-center text-[10px]">4</span>
                                Material-Wise Pricing (பொருட்களின் விலை பட்டியல்)
                            </div>
                            <div className="max-w-4xl">
                                {formData.supplyItems.length === 0 ? (
                                    <div className="p-10 text-center border-2 border-dashed border-info/20 rounded-2xl">
                                        <p className="text-info font-bold text-sm">Please select materials in Section 3 to set their rates.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {formData.supplyItems.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 bg-white dark:bg-black p-3 rounded-xl border border-info/10 shadow-sm">
                                                <div className="flex-1">
                                                    <span className="text-[10px] font-black text-white-dark uppercase tracking-widest block mb-1">{item.material}</span>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-info text-xs">₹</span>
                                                        <input
                                                            type="number"
                                                            className="form-input border-2 font-black rounded-lg h-10 pl-7 border-info/20 focus:border-info"
                                                            value={item.rate}
                                                            onChange={(e) => handleRateUpdate(item.material, Number(e.target.value))}
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="text-[10px] font-bold text-info bg-info/10 px-2 py-1 rounded-md uppercase">
                                                    Rate / Unit
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 mt-6 border-t border-info/10">
                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block text-info">Payment Terms / Credit Limit</label>
                                <input type="text" name="paymentTerms" className="form-input border-2 font-bold rounded-xl h-12 border-info/20 max-w-2xl" value={formData.paymentTerms} onChange={handleChange} placeholder="e.g. 30 Days Credit / ₹5,00,000 Limit" />
                            </div>
                        </div>

                        {/* Section 5: Finance */}
                        <div className="space-y-6 bg-success/5 p-6 rounded-2xl border border-success/10">
                            <div className="flex items-center gap-2 text-success font-black uppercase text-xs tracking-[0.2em] border-b border-success/10 pb-3 mb-4">
                                <span className="bg-success text-white w-6 h-6 rounded-lg inline-flex items-center justify-center text-[10px]">5</span>
                                Opening Balance (தொடக்க இருப்பு)
                            </div>
                            <div className="max-w-xs">
                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Current Owed Amount (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-success text-sm">₹</span>
                                    <input type="number" name="openingBalance" className="form-input border-2 font-black rounded-xl h-12 pl-10 border-success/30 focus:border-success text-lg" value={formData.openingBalance} onChange={handleChange} />
                                </div>
                                <p className="text-[9px] text-white-dark mt-2 font-bold italic opacity-70">Outstanding amount as of registration.</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-10 border-t-2 border-primary/5">
                            <button type="button" className="btn btn-outline-danger px-10 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]" onClick={resetForm}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary px-14 h-12 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-[0_10px_20px_rgba(67,97,238,0.3)]">
                                <IconSave className="ltr:mr-2 rtl:ml-2 w-4 h-4" />
                                {editId ? 'Update Supplier' : 'Complete Registration'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="panel shadow-xl rounded-2xl border-none p-0 overflow-hidden">
                    <div className="p-6 bg-white dark:bg-black flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-white-light/5">
                        <h5 className="font-black text-black dark:text-white-light uppercase tracking-widest text-sm">Active Suppliers List</h5>
                        <div className="relative w-full max-w-sm">
                            <input
                                type="text"
                                placeholder="Search by name, license, contact..."
                                className="form-input border-2 focus:border-primary font-bold rounded-xl h-11 ltr:pr-11 rtl:pl-11"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <IconSearch className="w-5 h-5 absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-white-dark" />
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-black/20 border-b border-gray-100 dark:border-white-light/5">
                                    <th className="font-black uppercase tracking-widest text-[10px] py-4">Supplier & Detail</th>
                                    <th className="font-black uppercase tracking-widest text-[10px] py-4">Security License</th>
                                    <th className="font-black uppercase tracking-widest text-[10px] py-4 whitespace-nowrap">Material Rates</th>
                                    <th className="font-black uppercase tracking-widest text-[10px] py-4 text-right">Outstanding (₹)</th>
                                    <th className="font-black uppercase tracking-widest text-[10px] py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="text-center py-20 uppercase font-black tracking-widest opacity-20 text-xl">Loading Database...</td></tr>
                                ) : filteredSuppliers.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-20 uppercase font-black tracking-widest opacity-20 text-xl">No Suppliers Found</td></tr>
                                ) : (
                                    filteredSuppliers.map((s) => (
                                        <tr key={s._id} className="group border-b border-gray-50 dark:border-white-light/5 last:border-0">
                                            <td className="py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase">
                                                        {s.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-black dark:text-white-light text-sm">{s.name}</div>
                                                        <div className="text-[10px] font-bold text-white-dark uppercase tracking-widest mb-1 flex items-center gap-2">
                                                            {s.contactNumber}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <div className="text-xs font-black text-black dark:text-white-light mb-1">{s.explosiveLicenseNumber}</div>
                                                <div className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-block ${new Date(s.licenseValidityDate) < new Date() ? 'bg-danger text-white animate-pulse' : 'bg-success/10 text-success'}`}>
                                                    Exp: {s.licenseValidityDate ? new Date(s.licenseValidityDate).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="py-4 font-black">
                                                <div className="flex flex-col gap-1.5 min-w-[150px]">
                                                    {(s.supplyItems || []).map((item: any, idx: number) => (
                                                        <div key={idx} className="flex items-center justify-between text-[11px] border-b border-gray-50 pb-1 last:border-0 last:pb-0">
                                                            <span className="text-white-dark uppercase font-bold">{item.material}:</span>
                                                            <span className="text-info">₹{item.rate.toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-4 text-right">
                                                <div className={`font-black text-lg ${balances[s._id] > 0 ? 'text-danger' : 'text-success'}`}>
                                                    ₹{(balances[s._id] || 0).toLocaleString()}
                                                </div>
                                                <div className="text-[9px] font-bold text-white-dark uppercase tracking-widest">Balance Dues</div>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => handleEdit(s)} className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                                                        <IconEdit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setDeleteId(s._id)} className="p-2.5 rounded-xl bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all shadow-sm">
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
                title="Delete Supplier"
                message="Are you sure you want to delete this explosive supplier? This action cannot be undone."
            />
        </div>
    );
};

export default ExplosiveSupplierManagement;
