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
        supplyItems: [] as string[],
        ratePerUnit: 0,
        paymentTerms: '',
        openingBalance: '0'
    };

    const [formData, setFormData] = useState(initialFormState);

    const [searchQuery, setSearchQuery] = useState('');

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

            // Map balances by ID
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

    const filteredSuppliers = suppliers.filter((s) =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.explosiveLicenseNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.contactNumber?.includes(searchQuery)
    );

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleItemChange = (materialName: string) => {
        let updatedItems = [...formData.supplyItems];
        if (updatedItems.includes(materialName)) {
            updatedItems = updatedItems.filter(item => item !== materialName);
        } else {
            updatedItems.push(materialName);
        }
        setFormData({ ...formData, supplyItems: updatedItems });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                ratePerUnit: Number(formData.ratePerUnit),
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
            explosiveLicenseNumber: supplier.explosiveLicenseNumber,
            licenseValidityDate: supplier.licenseValidityDate ? new Date(supplier.licenseValidityDate).toISOString().split('T')[0] : '',
            contactNumber: supplier.contactNumber,
            email: supplier.email || '',
            address: supplier.address || '',
            supplyItems: supplier.supplyItems || [],
            ratePerUnit: supplier.ratePerUnit?.toString() || '0',
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white-light">Explosive Suppliers (வெடிகுண்டு வழங்குநர்கள்)</h2>
                    <p className="text-white-dark text-sm mt-1">Manage explosive material vendors, licenses, and material rates.</p>
                </div>
                {!showForm && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                        Add New Supplier
                    </button>
                )}
            </div>

            {showForm && (
                <div className="panel animate__animated animate__fadeIn">
                    <div className="flex items-center justify-between mb-5 border-b pb-4 dark:border-[#1b2e4b]">
                        <h5 className="font-bold text-lg">{editId ? 'Edit Supplier' : 'Register New Supplier'}</h5>
                        <button className="text-white-dark hover:text-danger" onClick={resetForm}>✕ Cancel</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Basic Details */}
                        <div>
                            <h6 className="text-primary font-bold mb-4 flex items-center">
                                <span className="bg-primary text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs">1</span>
                                Basic Details (அடிப்படை தகவல்கள்)
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="text-sm font-bold">Supplier Name (வழங்குநர் பெயர்) *</label>
                                    <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="text-sm font-bold">Company Name</label>
                                    <input type="text" name="companyName" className="form-input" value={formData.companyName} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold">Contact Number *</label>
                                    <input type="text" name="contactNumber" className="form-input" value={formData.contactNumber} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="text-sm font-bold">Email</label>
                                    <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-bold">Address</label>
                                    <input type="text" name="address" className="form-input" value={formData.address} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: License & Legal Details */}
                        <div className="pt-4 border-t dark:border-[#1b2e4b]">
                            <h6 className="text-danger font-bold mb-4 flex items-center">
                                <span className="bg-danger text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs">2</span>
                                License & Legal Details (சட்ட விபரங்கள்)
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-sm font-bold">Explosive License Number *</label>
                                    <input type="text" name="explosiveLicenseNumber" className="form-input" value={formData.explosiveLicenseNumber} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="text-sm font-bold">License Validity Date *</label>
                                    <input type="date" name="licenseValidityDate" className="form-input" value={formData.licenseValidityDate} onChange={handleChange} required />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Material Details (Master Data Integrated) */}
                        <div className="pt-4 border-t dark:border-[#1b2e4b]">
                            <h6 className="text-warning font-bold mb-4 flex items-center">
                                <span className="bg-warning text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs">3</span>
                                Material Supply Items (வழங்கும் பொருட்கள் - Master Data)
                            </h6>
                            {masterMaterials.length === 0 ? (
                                <p className="text-xs text-white-dark italic">No materials found in Master Data. Please add them in Masters &gt; Explosive Materials.</p>
                            ) : (
                                <div className="flex flex-wrap gap-3">
                                    {masterMaterials.map((mat) => (
                                        <label key={mat._id} className="flex items-center cursor-pointer bg-dark/5 p-2 rounded border border-transparent hover:border-primary transition-all">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox text-warning"
                                                checked={formData.supplyItems.includes(mat.name)}
                                                onChange={() => handleItemChange(mat.name)}
                                            />
                                            <span className="ml-2 text-sm">{mat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Section 4: Purchase & Payment Details */}
                        <div className="pt-4 border-t dark:border-[#1b2e4b]">
                            <h6 className="text-info font-bold mb-4 flex items-center">
                                <span className="bg-info text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs">4</span>
                                Purchase & Payment Details
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="text-sm font-bold">Rate per Box / Unit (₹)</label>
                                    <input type="number" name="ratePerUnit" className="form-input" value={formData.ratePerUnit} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold">Payment Terms</label>
                                    <input type="text" name="paymentTerms" className="form-input" value={formData.paymentTerms} onChange={handleChange} placeholder="e.g. 15 Days Credit" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold">Opening Balance (₹)</label>
                                    <input type="number" name="openingBalance" className="form-input" value={formData.openingBalance} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-5 gap-3 border-t dark:border-[#1b2e4b]">
                            <button type="button" className="btn btn-outline-danger" onClick={resetForm}>Cancel</button>
                            <button type="submit" className="btn btn-primary px-10">
                                <IconSave className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                {editId ? 'Update Supplier' : 'Save Supplier'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!showForm && (
                <div className="panel">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                        <h5 className="font-bold text-lg dark:text-white-light">Registered Suppliers</h5>
                        <div className="relative w-full max-w-xs">
                            <input
                                type="text"
                                placeholder="Search by name, license or company..."
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
                                    <th>Supplier Info</th>
                                    <th>License & ID</th>
                                    <th>Contact</th>
                                    <th className="!text-right">Material Rate</th>
                                    <th className="!text-right">Outstanding (₹)</th>
                                    <th className="!text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center py-8 text-primary">Loading suppliers...</td></tr>
                                ) : filteredSuppliers.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-8">No matching suppliers found.</td></tr>
                                ) : (
                                    filteredSuppliers.map((s) => (
                                        <tr key={s._id}>
                                            <td>
                                                <div className="font-bold text-primary">{s.name}</div>
                                                <div className="text-xs text-white-dark mb-1">{s.companyName}</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {(s.supplyItems || []).map((item: string, idx: number) => (
                                                        <span key={idx} className="badge bg-warning/10 text-warning border-none text-[10px]">
                                                            {item}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-sm font-semibold">{s.explosiveLicenseNumber}</div>
                                                <div className="text-xs text-danger">Valid: {s.licenseValidityDate ? new Date(s.licenseValidityDate).toLocaleDateString() : 'N/A'}</div>
                                            </td>
                                            <td>
                                                <div>{s.contactNumber}</div>
                                                <div className="text-xs opacity-60">{s.email}</div>
                                            </td>
                                            <td className="!text-right font-bold">₹{s.ratePerUnit?.toLocaleString()}</td>
                                            <td className={`!text-right font-black ${balances[s._id] > 0 ? 'text-danger' : 'text-success'}`}>
                                                ₹{(balances[s._id] || 0).toLocaleString()}
                                            </td>
                                            <td className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => handleEdit(s)} className="btn btn-sm btn-outline-primary p-1">
                                                        <IconEdit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setDeleteId(s._id)} className="btn btn-sm btn-outline-danger p-1">
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
