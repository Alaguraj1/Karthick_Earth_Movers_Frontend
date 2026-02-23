'use client';
import React, { useState, useEffect } from 'react';
import IconPlus from '@/components/icon/icon-plus';
import IconSave from '@/components/icon/icon-save';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconArrowLeft from '@/components/icon/icon-arrow-left';

import axios from 'axios';

const MasterManagement = () => {
    const [activeTab, setActiveTab] = useState('expense-categories');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState({
        name: '',
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
        category: '',
        unit: 'Unit',
        defaultPrice: '',
        openingStock: ''
    });
    const [formView, setFormView] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);

    const tabs = [
        { id: 'expense-categories', label: 'Expense Categories (செலவு வகைகள்)' },
        { id: 'income-sources', label: 'Income Sources (வருமான வகைகள்)' },
        { id: 'customers', label: 'Customers (வாடிக்கையாளர்)' },
        { id: 'labours', label: 'Labour Registry (தொழிலாளர்)' },
        { id: 'stone-types', label: 'Stone Types (கல் வகைகள்)' },
        { id: 'explosive-materials', label: 'Explosive Materials (வெடிபொருட்கள்)' },
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: json } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/master/${activeTab}`);
            if (json.success) setData(json.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleAdd = async (e: any) => {
        e.preventDefault();
        try {
            const endpoint = editItem
                ? `${process.env.NEXT_PUBLIC_API_URL}/master/${activeTab}/${editItem._id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/master/${activeTab}`;

            const method = editItem ? 'put' : 'post';

            const { data: json } = await axios[method](endpoint, newItem);
            if (json.success) {
                alert(editItem ? 'Updated successfully!' : 'Added successfully!');
                setNewItem({
                    name: '', description: '', type: 'Vehicle', vehicleNumber: '', mobile: '',
                    modelNumber: '', registrationNumber: '', purchaseDate: '', purchaseCost: '',
                    currentCondition: '', operatorName: '', ownerName: '', driverName: '',
                    rcInsuranceDetails: '', permitExpiryDate: '', mileageDetails: '',
                    category: '',
                    unit: 'Unit', defaultPrice: '', openingStock: ''
                });
                setEditItem(null);
                setFormView(false);
                fetchData();
            }
        } catch (error) {
            console.error(error);
            alert('Error saving data');
        }
    };

    const handleEdit = (item: any) => {
        setEditItem(item);
        setNewItem({
            name: item.name,
            description: item.description || '',
            type: item.type || 'Vehicle',
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
            category: item.category || '',
            unit: item.unit || 'Unit',
            defaultPrice: item.defaultPrice || '',
            openingStock: item.openingStock || ''
        });
        setFormView(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this?')) return;
        try {
            const { data: json } = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/master/${activeTab}/${id}`);
            if (json.success) {
                fetchData();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li><a href="/" className="text-primary hover:underline font-bold">Dashboard</a></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 font-bold text-white-dark uppercase tracking-widest text-[10px]"><span>Masters</span></li>
            </ul>

            <div className="panel overflow-hidden border-0 p-0 mb-5 shadow-lg rounded-2xl">
                <div className="flex flex-wrap border-b border-white-light dark:border-[#191e3a] bg-white-light/10">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`${activeTab === tab.id ? '!border-primary text-primary font-black bg-white dark:bg-black/20 translate-y-[1px]' : 'text-white-dark font-bold'} -mb-[1px] block border-b-2 border-transparent p-5 hover:text-primary transition-all uppercase tracking-wider text-xs`}
                            onClick={() => { setActiveTab(tab.id); setFormView(false); }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {formView ? (
                <div className="panel shadow-2xl rounded-2xl border-none">
                    <div className="mb-8 flex items-center justify-between border-b border-[#ebedf2] dark:border-[#1b2e4b] pb-5">
                        <div className="flex items-center">
                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm ltr:mr-4 rtl:ml-4 flex items-center justify-center rounded-xl w-10 h-10 p-0 transform hover:scale-105 transition-all"
                                onClick={() => { setFormView(false); setEditItem(null); }}
                            >
                                <IconArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h5 className="text-xl font-black text-black dark:text-white-light uppercase tracking-tight">{editItem ? 'Edit master Record' : 'Create New master Entry'}</h5>
                                <p className="text-primary text-xs font-bold uppercase tracking-widest mt-1 opacity-70">Configuration Portal: {tabs.find(t => t.id === activeTab)?.label.split('(')[0]}</p>
                            </div>
                        </div>
                    </div>

                    <form className="max-w-5xl mx-auto space-y-10" onSubmit={handleAdd}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-3">
                                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 block">பெயர் (Title / Identification Name)</label>
                                <input
                                    type="text"
                                    className="form-input border-2 focus:border-primary transition-all text-lg font-bold rounded-xl h-12"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    required
                                    placeholder="Enter full name or machine ID..."
                                />
                            </div>

                            {activeTab === 'vehicles' && (
                                <>
                                    <div className="md:col-span-3 panel bg-primary/5 border-primary/10 rounded-2xl p-6">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="h-1 lg:flex-1 bg-primary/10 rounded-full"></div>
                                            <span className="text-xs font-black text-primary uppercase tracking-widest">Asset Classification</span>
                                            <div className="h-1 lg:flex-1 bg-primary/10 rounded-full"></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Category (பிரிவு)</label>
                                                <select
                                                    className="form-select border-2 font-bold rounded-xl h-12"
                                                    value={newItem.type}
                                                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                                                >
                                                    <option value="Vehicle">Vehicle (லாரி / வாகனம்)</option>
                                                    <option value="Machine">Machine (இயந்திரம்)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Model / Registration No (பதிவு எண்)</label>
                                                <input
                                                    type="text"
                                                    className="form-input border-2 font-bold rounded-xl h-12 uppercase"
                                                    value={newItem.registrationNumber}
                                                    onChange={(e) => setNewItem({ ...newItem, registrationNumber: e.target.value })}
                                                    placeholder="e.g., TN 99 XX 1234 / MODEL-X"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Machine / Vehicle Category (வகை)</label>
                                                <select
                                                    className="form-select border-2 font-bold rounded-xl h-12"
                                                    value={(newItem as any).category}
                                                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                                >
                                                    <option value="">Select Category</option>
                                                    <option value="JCB">JCB</option>
                                                    <option value="Hitachi">Hitachi</option>
                                                    <option value="Tipper Lorry">Tipper Lorry</option>
                                                    <option value="Loader">Loader</option>
                                                    <option value="Generator">Generator</option>
                                                    <option value="Compressor">Compressor</option>
                                                    <option value="Driller">Driller</option>
                                                    <option value="Tractor">Tractor</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Machine Specific Fields */}
                                    {newItem.type === 'Machine' && (
                                        <>
                                            <div className="md:col-span-3 border-l-4 border-warning pl-4 my-4">
                                                <h6 className="font-black text-warning uppercase text-sm tracking-widest">Machine Specifications (இயந்திர விவரங்கள்)</h6>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Model Number</label>
                                                <input type="text" className="form-input border-2 font-bold rounded-xl h-12" value={newItem.modelNumber} onChange={(e) => setNewItem({ ...newItem, modelNumber: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Operator Name</label>
                                                <input type="text" className="form-input border-2 font-bold rounded-xl h-12" value={newItem.operatorName} onChange={(e) => setNewItem({ ...newItem, operatorName: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Condition Status</label>
                                                <select className="form-select border-2 font-bold rounded-xl h-12" value={newItem.currentCondition} onChange={(e) => setNewItem({ ...newItem, currentCondition: e.target.value })}>
                                                    <option value="">Select Condition</option>
                                                    <option value="Excellent">Excellent (மிக நன்று)</option>
                                                    <option value="Good">Good (நன்று)</option>
                                                    <option value="Requires Service">Requires Service (பராமரிப்பு தேவை)</option>
                                                </select>
                                            </div>
                                        </>
                                    )}

                                    {/* Vehicle Specific Fields */}
                                    {newItem.type === 'Vehicle' && (
                                        <>
                                            <div className="md:col-span-3 border-l-4 border-info pl-4 my-4">
                                                <h6 className="font-black text-info uppercase text-sm tracking-widest">Lorry / Transport Details (வாகன விவரங்கள்)</h6>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Vehicle Number</label>
                                                <input type="text" className="form-input border-2 font-bold rounded-xl h-12 uppercase" value={newItem.vehicleNumber} onChange={(e) => setNewItem({ ...newItem, vehicleNumber: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Owner Name</label>
                                                <input type="text" className="form-input border-2 font-bold rounded-xl h-12" value={newItem.ownerName} onChange={(e) => setNewItem({ ...newItem, ownerName: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Driver Name</label>
                                                <input type="text" className="form-input border-2 font-bold rounded-xl h-12" value={newItem.driverName} onChange={(e) => setNewItem({ ...newItem, driverName: e.target.value })} />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">RC / Insurance Details</label>
                                                <input type="text" className="form-input border-2 font-bold rounded-xl h-12" value={newItem.rcInsuranceDetails} onChange={(e) => setNewItem({ ...newItem, rcInsuranceDetails: e.target.value })} placeholder="Policy No, Expiry date etc." />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Permit Expiry</label>
                                                <input type="date" className="form-input border-2 font-bold rounded-xl h-12" value={newItem.permitExpiryDate} onChange={(e) => setNewItem({ ...newItem, permitExpiryDate: e.target.value })} />
                                            </div>
                                        </>
                                    )}

                                    <div className="md:col-span-3 border-l-4 border-success pl-4 my-4">
                                        <h6 className="font-black text-success uppercase text-sm tracking-widest">Purchase & Finance (கொள்முதல் விவரங்கள்)</h6>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Purchase Date</label>
                                        <input type="date" className="form-input border-2 font-bold rounded-xl h-12" value={newItem.purchaseDate} onChange={(e) => setNewItem({ ...newItem, purchaseDate: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Purchase Cost (₹)</label>
                                        <input type="number" className="form-input border-2 font-bold rounded-xl h-12" value={newItem.purchaseCost} onChange={(e) => setNewItem({ ...newItem, purchaseCost: e.target.value })} placeholder="0.00" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Mileage / Stats</label>
                                        <input type="text" className="form-input border-2 font-bold rounded-xl h-12" value={newItem.mileageDetails} onChange={(e) => setNewItem({ ...newItem, mileageDetails: e.target.value })} placeholder="Average mileage info" />
                                    </div>
                                </>
                            )}

                            {activeTab === 'labours' && (
                                <div className="md:col-span-3">
                                    <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">தொலைபேசி எண் (Mobile - Optional)</label>
                                    <input
                                        type="text"
                                        className="form-input border-2 font-bold rounded-xl h-12"
                                        value={newItem.mobile}
                                        onChange={(e) => setNewItem({ ...newItem, mobile: e.target.value })}
                                        placeholder="Enter 10-digit mobile number..."
                                    />
                                </div>
                            )}

                            {(activeTab === 'stone-types' || activeTab === 'explosive-materials') && (
                                <>
                                    <div>
                                        <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Unit (அலகு)</label>
                                        <select
                                            className="form-select border-2 font-bold rounded-xl h-12"
                                            value={newItem.unit}
                                            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                                        >
                                            {activeTab === 'stone-types' ? (
                                                <>
                                                    <option value="Units">Units</option>
                                                    <option value="Tons">Tons</option>
                                                    <option value="Kg">Kg</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option value="Nos">Nos</option>
                                                    <option value="Box">Box</option>
                                                    <option value="Kg">Kg</option>
                                                    <option value="Meters">Meters</option>
                                                    <option value="Units">Units</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Default Price per Unit (₹)</label>
                                        <input
                                            type="number"
                                            className="form-input border-2 font-bold rounded-xl h-12"
                                            value={newItem.defaultPrice}
                                            onChange={(e) => setNewItem({ ...newItem, defaultPrice: e.target.value })}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">Opening Stock (தொடக்க இருப்பு)</label>
                                        <input
                                            type="number"
                                            className="form-input border-2 font-bold rounded-xl h-12"
                                            value={newItem.openingStock}
                                            onChange={(e) => setNewItem({ ...newItem, openingStock: e.target.value })}
                                            placeholder="0"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="md:col-span-3">
                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-2 block">விவரம் (Additional Remarks)</label>
                                <textarea
                                    className="form-textarea border-2 font-bold rounded-xl min-h-[100px]"
                                    value={newItem.description}
                                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    placeholder="Enter any additional notes..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-10 border-t-2 border-primary/5">
                            <button type="button" className="btn btn-outline-danger px-10 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]" onClick={() => { setFormView(false); setEditItem(null); }}>
                                Discard
                            </button>
                            <button type="submit" className="btn btn-primary px-14 h-12 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-[0_10px_20px_rgba(67,97,238,0.3)]">
                                <IconSave className="ltr:mr-2 rtl:ml-2 w-4 h-4" />
                                {editItem ? 'Update Database' : 'Finalize Entry'}
                            </button>
                        </div>
                    </form>
                </div >
            ) : (
                <div className="panel shadow-lg rounded-2xl border-none">
                    <div className="mb-5 flex items-center justify-between">
                        <h5 className="text-xl font-black text-black dark:text-white-light uppercase tracking-tight">
                            {tabs.find(t => t.id === activeTab)?.label.split('(')[0]} Database
                        </h5>
                        <button type="button" className="btn btn-primary shadow-[0_10px_20px_rgba(67,97,238,0.3)] rounded-xl py-2.5 px-6 font-black uppercase tracking-widest text-[10px]" onClick={() => {
                            setNewItem({
                                name: '', description: '', type: 'Vehicle', vehicleNumber: '', mobile: '',
                                modelNumber: '', registrationNumber: '', purchaseDate: '', purchaseCost: '',
                                currentCondition: '', operatorName: '', ownerName: '', driverName: '',
                                rcInsuranceDetails: '', permitExpiryDate: '', mileageDetails: '',
                                category: '',
                                unit: 'Unit', defaultPrice: '', openingStock: ''
                            });
                            setEditItem(null);
                            setFormView(true);
                        }}>
                            <IconPlus className="mr-2 w-4 h-4" /> Add Record
                        </button>
                    </div>
                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr className="!bg-primary/5">
                                    <th className="font-black uppercase tracking-widest text-[10px] py-4">Identification</th>
                                    {activeTab === 'vehicles' && <th className="font-black uppercase tracking-widest text-[10px] py-4">Reg No / Model</th>}
                                    {activeTab === 'vehicles' && <th className="font-black uppercase tracking-widest text-[10px] py-4">Category</th>}
                                    {activeTab === 'labours' && <th className="font-black uppercase tracking-widest text-[10px] py-4">Contact</th>}
                                    {(activeTab === 'stone-types' || activeTab === 'explosive-materials') && <th className="font-black uppercase tracking-widest text-[10px] py-4">Unit</th>}
                                    {(activeTab === 'stone-types' || activeTab === 'explosive-materials') && <th className="font-black uppercase tracking-widest text-[10px] py-4">Price</th>}
                                    {activeTab !== 'vehicles' && activeTab !== 'labours' && activeTab !== 'stone-types' && activeTab !== 'explosive-materials' && <th className="font-black uppercase tracking-widest text-[10px] py-4">Notes</th>}
                                    <th className="text-center font-black uppercase tracking-widest text-[10px] py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="font-bold">
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center py-20">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-xs uppercase tracking-[0.2em] text-primary">Synchronizing...</span>
                                        </div>
                                    </td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-20 text-white-dark uppercase font-black tracking-widest text-sm opacity-20">No data entries in this registry</td></tr>
                                ) : (
                                    data.map((item: any) => (
                                        <tr key={item._id} className="group hover:bg-primary/5 transition-all">
                                            <td className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-black dark:text-white-light text-base">{item.name}</span>
                                                    {item.type === 'Machine' && item.operatorName && <span className="text-[10px] text-primary uppercase mt-1">Op: {item.operatorName}</span>}
                                                </div>
                                            </td>
                                            {activeTab === 'vehicles' && (
                                                <td className="py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-black dark:text-white-light">{item.registrationNumber || item.vehicleNumber || '-'}</span>
                                                        <div className="flex gap-2 items-center">
                                                            <span className="text-[10px] text-white-dark uppercase">{item.modelNumber || 'Standard'}</span>
                                                            {item.category && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-black uppercase">{item.category}</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                            )}
                                            {activeTab === 'vehicles' && (
                                                <td className="py-4">
                                                    <span className={`badge ${item.type === 'Machine' ? 'badge-outline-warning' : 'badge-outline-info'} uppercase tracking-widest text-[9px] font-black px-3 py-1 rounded-lg`}>{item.type}</span>
                                                </td>
                                            )}
                                            {activeTab === 'labours' && <td className="py-4 text-primary">{item.mobile || '-'}</td>}
                                            {(activeTab === 'stone-types' || activeTab === 'explosive-materials') && <td className="py-4">{item.unit || '-'}</td>}
                                            {(activeTab === 'stone-types' || activeTab === 'explosive-materials') && <td className="py-4 font-black">₹{item.defaultPrice || '0'}</td>}
                                            {activeTab !== 'vehicles' && activeTab !== 'labours' && activeTab !== 'stone-types' && activeTab !== 'explosive-materials' && (
                                                <td className="py-4 text-white-dark font-medium italic">{item.description || '-'}</td>
                                            )}
                                            <td className="text-center py-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button type="button" className="p-2 rounded-lg text-primary hover:bg-primary hover:text-white transition-all transform group-hover:scale-110 shadow-lg shadow-transparent hover:shadow-primary/20" onClick={() => handleEdit(item)}>
                                                        <IconEdit className="h-4.5 w-4.5" />
                                                    </button>
                                                    <button type="button" className="p-2 rounded-lg text-danger hover:bg-danger hover:text-white transition-all transform group-hover:scale-110 shadow-lg shadow-transparent hover:shadow-danger/20" onClick={() => handleDelete(item._id)}>
                                                        <IconTrashLines className="h-4.5 w-4.5" />
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
        </div >
    );
};

export default MasterManagement;
