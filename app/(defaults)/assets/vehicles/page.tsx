'use client';
import React, { useState, useEffect } from 'react';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import IconSave from '@/components/icon/icon-save';
import IconArrowLeft from '@/components/icon/icon-arrow-left';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import axios from 'axios';
import Link from 'next/link';
import IconMenuWidgets from '@/components/icon/menu/icon-menu-widgets';

const VehicleDetails = () => {
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [formView, setFormView] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [newItem, setNewItem] = useState({
        name: '',
        category: '',
        description: '',
        type: 'Vehicle',
        vehicleNumber: '',
        mobile: '',
        modelNumber: '',
        registrationNumber: '',
        purchaseDate: '',
        purchaseCost: '',
        currentCondition: '',
        operatorName: '',
        ownerName: '',
        driverName: '',
        rcInsuranceDetails: '',
        permitExpiryDate: '',
        mileageDetails: '',
        ownershipType: 'Own',
        contractName: ''
    });

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/master/vehicles`);
            if (data.success) {
                setAssets(data.data.filter((asset: any) => asset.type === 'Vehicle'));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const handleAdd = async (e: any) => {
        e.preventDefault();
        try {
            const endpoint = editItem
                ? `${process.env.NEXT_PUBLIC_API_URL}/master/vehicles/${editItem._id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/master/vehicles`;

            const method = editItem ? 'put' : 'post';

            const { data: json } = await axios[method](endpoint, { ...newItem, type: 'Vehicle' });
            if (json.success) {
                setNewItem({
                    name: '', category: '', description: '', type: 'Vehicle', vehicleNumber: '', mobile: '',
                    modelNumber: '', registrationNumber: '', purchaseDate: '', purchaseCost: '',
                    currentCondition: '', operatorName: '', ownerName: '', driverName: '',
                    rcInsuranceDetails: '', permitExpiryDate: '', mileageDetails: '',
                    ownershipType: 'Own', contractName: ''
                });
                setEditItem(null);
                setFormView(false);
                fetchAssets();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (item: any) => {
        setEditItem(item);
        setNewItem({
            name: item.name,
            category: item.category || '',
            description: item.description || '',
            type: 'Vehicle',
            vehicleNumber: item.vehicleNumber || '',
            mobile: item.mobile || '',
            modelNumber: item.modelNumber || '',
            registrationNumber: item.registrationNumber || '',
            purchaseDate: item.purchaseDate ? new Date(item.purchaseDate).toISOString().split('T')[0] : '',
            purchaseCost: item.purchaseCost || '',
            currentCondition: item.currentCondition || '',
            operatorName: item.operatorName || '',
            ownerName: item.ownerName || '',
            driverName: item.driverName || '',
            rcInsuranceDetails: item.rcInsuranceDetails || '',
            permitExpiryDate: item.permitExpiryDate ? new Date(item.permitExpiryDate).toISOString().split('T')[0] : '',
            mileageDetails: item.mileageDetails || '',
            ownershipType: item.ownershipType || 'Own',
            contractName: item.contractName || ''
        });
        setFormView(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this vehicle?')) return;
        try {
            const { data } = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/master/vehicles/${id}`);
            if (data.success) {
                fetchAssets();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li><Link href="/" className="text-primary hover:underline font-bold">Dashboard</Link></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 font-bold text-white-dark uppercase tracking-widest text-[10px]"><span>Machine & Vehicle</span></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 font-bold text-white-dark uppercase tracking-widest text-[10px]"><span>Vehicle Details</span></li>
            </ul>

            {formView ? (
                <div className="panel shadow-2xl rounded-2xl border-none">
                    <div className="mb-8 flex items-center justify-between border-b border-[#ebedf2] dark:border-[#1b2e4b] pb-5">
                        <div className="flex items-center">
                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm ltr:mr-4 rtl:ml-4 flex items-center justify-center rounded-xl w-10 h-10 p-0 shadow-lg shadow-primary/20"
                                onClick={() => { setFormView(false); setEditItem(null); }}
                            >
                                <IconArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h5 className="text-xl font-black text-black dark:text-white-light uppercase tracking-tight">{editItem ? 'Edit Vehicle Profile' : 'Register New Fleet Vehicle'}</h5>
                                <p className="text-primary text-xs font-bold uppercase tracking-widest mt-1 opacity-70">Fleet Asset Management Portal</p>
                            </div>
                        </div>
                    </div>

                    <form className="max-w-5xl mx-auto space-y-10" onSubmit={handleAdd}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-1">
                                <label className="text-[10px] font-black text-info uppercase tracking-[0.2em] mb-3 block">Vehicle Category</label>
                                <select
                                    className="form-select border-2 font-bold rounded-xl h-12"
                                    value={newItem.category}
                                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="Lorry">Lorry</option>
                                    <option value="Tipper">Tipper</option>
                                    <option value="Tractor">Tractor</option>
                                    <option value="Trailer">Trailer</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="md:col-span-1">
                                <label className="text-[10px] font-black text-info uppercase tracking-[0.2em] mb-3 block">Vehicle Name / Model</label>
                                <input
                                    type="text"
                                    className="form-input border-2 focus:border-info transition-all font-bold rounded-xl h-12"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    required
                                    placeholder="e.g. Ashok Leyland"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-3 block">Vehicle No (Plate No)</label>
                                <input
                                    type="text"
                                    className="form-input border-2 font-bold rounded-xl h-12 uppercase"
                                    value={newItem.vehicleNumber}
                                    onChange={(e) => setNewItem({ ...newItem, vehicleNumber: e.target.value })}
                                    placeholder="TN 99 XX 1234"
                                    required
                                />
                            </div>

                            <div className="md:col-span-3 panel bg-info/5 border-info/10 rounded-2xl p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black text-info uppercase tracking-widest mb-2 block">Ownership Type</label>
                                        <select
                                            className="form-select border-2 font-bold rounded-xl h-12"
                                            value={newItem.ownershipType}
                                            onChange={(e) => setNewItem({ ...newItem, ownershipType: e.target.value })}
                                        >
                                            <option value="Own">Own (சொந்தம்)</option>
                                            <option value="Contract">Contract (ஒப்பந்தம்)</option>
                                        </select>
                                    </div>
                                    {newItem.ownershipType === 'Contract' && (
                                        <div>
                                            <label className="text-[10px] font-black text-info uppercase tracking-widest mb-2 block">Contractor Name</label>
                                            <input
                                                type="text"
                                                className="form-input border-2 font-bold rounded-xl h-12"
                                                value={newItem.contractName}
                                                onChange={(e) => setNewItem({ ...newItem, contractName: e.target.value })}
                                                placeholder="Enter contractor name..."
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-3 border-l-4 border-info pl-4 my-4 bg-info/5 py-4 rounded-r-xl">
                                <h6 className="font-black text-info uppercase text-sm tracking-widest">Ownership & Operations</h6>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Owner Name</label>
                                <input type="text" className="form-input border-2 font-bold rounded-xl h-12" value={newItem.ownerName} onChange={(e) => setNewItem({ ...newItem, ownerName: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Driver Name</label>
                                <input type="text" className="form-input border-2 font-bold rounded-xl h-12" value={newItem.driverName} onChange={(e) => setNewItem({ ...newItem, driverName: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Permit Expiry Date</label>
                                <input type="date" className="form-input border-2 font-bold rounded-xl h-12" value={newItem.permitExpiryDate} onChange={(e) => setNewItem({ ...newItem, permitExpiryDate: e.target.value })} />
                            </div>

                            <div className="md:col-span-3">
                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">RC / Insurance Details</label>
                                <input type="text" className="form-input border-2 font-bold rounded-xl h-12" value={newItem.rcInsuranceDetails} onChange={(e) => setNewItem({ ...newItem, rcInsuranceDetails: e.target.value })} placeholder="Policy Number, Expiry, etc." />
                            </div>

                            <div className="md:col-span-3 border-l-4 border-success pl-4 my-4 bg-success/5 py-4 rounded-r-xl">
                                <h6 className="font-black text-success uppercase text-sm tracking-widest">Financials & Efficiency</h6>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Purchase Cost (₹)</label>
                                <input type="number" className="form-input border-2 font-bold rounded-xl h-12" value={newItem.purchaseCost} onChange={(e) => setNewItem({ ...newItem, purchaseCost: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Mileage / Stats</label>
                                <input type="text" className="form-input border-2 font-bold rounded-xl h-12" value={newItem.mileageDetails} onChange={(e) => setNewItem({ ...newItem, mileageDetails: e.target.value })} placeholder="Kmpl information" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Purchase Date</label>
                                <input type="date" className="form-input border-2 font-bold rounded-xl h-12" value={newItem.purchaseDate} onChange={(e) => setNewItem({ ...newItem, purchaseDate: e.target.value })} />
                            </div>

                            <div className="md:col-span-3">
                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Notes</label>
                                <textarea
                                    className="form-textarea border-2 font-bold rounded-xl min-h-[100px]"
                                    value={newItem.description}
                                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-10 border-t-2 border-primary/5">
                            <button type="button" className="btn btn-outline-danger px-10 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]" onClick={() => { setFormView(false); setEditItem(null); }}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary px-14 h-12 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-[0_10px_20px_rgba(67,97,238,0.3)]">
                                <IconSave className="ltr:mr-2 rtl:ml-2 w-4 h-4" />
                                {editItem ? 'Update Vehicle' : 'Save Vehicle'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h5 className="text-2xl font-black text-black dark:text-white-light uppercase tracking-tight">Vehicle Details</h5>
                            <p className="text-white-dark text-sm font-bold mt-1">Manage Lorries, Tippers, and Transport Fleet</p>
                        </div>
                        <button
                            onClick={() => {
                                setNewItem({
                                    name: '', category: '', description: '', type: 'Vehicle', vehicleNumber: '', mobile: '',
                                    modelNumber: '', registrationNumber: '', purchaseDate: '', purchaseCost: '',
                                    currentCondition: '', operatorName: '', ownerName: '', driverName: '',
                                    rcInsuranceDetails: '', permitExpiryDate: '', mileageDetails: '',
                                    ownershipType: 'Own', contractName: ''
                                });
                                setEditItem(null);
                                setFormView(true);
                            }}
                            className="btn btn-primary shadow-[0_10px_20px_rgba(67,97,238,0.3)] rounded-xl py-3 px-8 font-black uppercase tracking-widest text-xs"
                        >
                            <IconPlus className="mr-2" /> Add Vehicle
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="panel h-72 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl"></div>
                            ))
                        ) : assets.length === 0 ? (
                            <div className="col-span-full panel py-20 text-center uppercase font-black tracking-[0.2em] opacity-20 text-xl">No Vehicles Registered</div>
                        ) : (
                            assets.map((asset) => (
                                <div key={asset._id} className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-info to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-100 transition duration-500"></div>
                                    <div className="relative panel p-0 rounded-3xl bg-white dark:bg-black border-none shadow-xl transform group-hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                                        <div className="bg-info/10 p-5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-info rounded-xl text-white shadow-lg shadow-info/20">
                                                    <IconMenuWidgets className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <span className="font-black text-[10px] uppercase tracking-[0.2em] text-info block leading-none">{asset.category || 'Transport Vehicle'}</span>
                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${asset.ownershipType === 'Contract' ? 'bg-danger text-white' : 'bg-success text-white'} mt-1 inline-block`}>
                                                        {asset.ownershipType === 'Contract' ? `Contract: ${asset.contractName}` : 'Own Vehicle'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit(asset)} className="p-2 bg-white/50 dark:bg-white/10 rounded-lg hover:text-info transition-colors shadow-sm">
                                                    <IconEdit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(asset._id)} className="p-2 bg-white/50 dark:bg-white/10 rounded-lg hover:text-danger transition-colors shadow-sm">
                                                    <IconTrashLines className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-1">
                                                <h6 className="text-xl font-black text-black dark:text-white-light line-clamp-1">{asset.name}</h6>
                                                <span className="text-[10px] font-black italic text-info uppercase">{asset.mileageDetails || '- MPG'}</span>
                                            </div>
                                            <span className="text-xs font-black bg-primary/10 text-primary px-3 py-1 rounded-lg uppercase tracking-widest mb-4 inline-block">
                                                {asset.vehicleNumber || 'No Plate'}
                                            </span>

                                            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white-light/5">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="text-[9px] font-black uppercase text-white-dark block tracking-widest mb-1">Driver</span>
                                                        <span className="text-sm font-bold text-black dark:text-white-light">{asset.driverName || 'Not Assigned'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] font-black uppercase text-white-dark block tracking-widest mb-1">Owner</span>
                                                        <span className="text-sm font-bold text-black dark:text-white-light">{asset.ownerName || '-'}</span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className="bg-gray-50 dark:bg-white-light/5 p-3 rounded-xl border border-gray-100 dark:border-white-light/5">
                                                        <span className="text-[9px] font-black uppercase text-white-dark block tracking-widest mb-1">Permit Expiry</span>
                                                        <span className={`text-sm font-black ${asset.permitExpiryDate && new Date(asset.permitExpiryDate) < new Date() ? 'text-danger animate-pulse' : 'text-success'}`}>
                                                            {asset.permitExpiryDate ? new Date(asset.permitExpiryDate).toLocaleDateString() : 'No Data'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] text-white-dark font-bold truncate">
                                                    RC/Ins: {asset.rcInsuranceDetails || 'Not Provided'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default VehicleDetails;
