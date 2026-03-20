'use client';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import api from '@/utils/api';
import { canEditRecord } from '@/utils/permissions';
import { useToast } from '@/components/stone-mine/toast-notification';
import DeleteConfirmModal from '@/components/stone-mine/delete-confirm-modal';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconSearch from '@/components/icon/icon-search';
import IconX from '@/components/icon/icon-x';
import IconSave from '@/components/icon/icon-save';
import IconLayoutGrid from '@/components/icon/icon-layout-grid';



const PermitManagement = () => {
    const currentUser = useSelector((state: IRootState) => state.auth.user);
    const isOwner = currentUser?.role?.toLowerCase() === 'owner';

    const { showToast } = useToast();
    const [permits, setPermits] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Filter states
    const [search, setSearch] = useState('');
    const [filterVehicle, setFilterVehicle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const initialForm = {
        permitNumber: '',
        vehicleId: '',
        date: new Date().toISOString().split('T')[0],
        totalTripsAllowed: 0,
        selectedTripIds: [] as string[],
        notes: ''
    };

    const [formData, setFormData] = useState(initialForm);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [permitRes, vehicleRes, tripRes] = await Promise.all([
                api.get('/permits'),
                api.get('/master/vehicles'),
                api.get('/trips'),
            ]);

            if (permitRes.data.success) setPermits(permitRes.data.data);
            if (vehicleRes.data.success) setVehicles(vehicleRes.data.data);
            if (tripRes.data.success) setTrips(tripRes.data.data);
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
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Reset selected trips if date or vehicle changes
            selectedTripIds: (name === 'date' || name === 'vehicleId') ? [] : prev.selectedTripIds,
            totalTripsAllowed: (name === 'date' || name === 'vehicleId') ? 0 : prev.totalTripsAllowed
        }));
    };

    const handleTripToggle = (tripId: string) => {
        setFormData(prev => {
            const isSelected = prev.selectedTripIds.includes(tripId);
            const newSelected = isSelected
                ? prev.selectedTripIds.filter(id => id !== tripId)
                : [...prev.selectedTripIds, tripId];
            return {
                ...prev,
                selectedTripIds: newSelected,
                totalTripsAllowed: newSelected.length
            };
        });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (editId) {
                await api.put(`/permits/${editId}`, payload);
                showToast('Permit updated successfully!', 'success');
            } else {
                await api.post('/permits', payload);
                showToast('Permit added successfully!', 'success');
            }
            resetForm();
            fetchData();
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.message || 'Error saving permit', 'error');
        }
    };

    const handleEdit = (permit: any) => {
        // Find trips that belong to this permit
        const linkedTrips = trips
            .filter(t => (t.permitId?._id || t.permitId) === permit._id)
            .map(t => t._id);

        setFormData({
            permitNumber: permit.permitNumber || '',
            vehicleId: permit.vehicleId?._id || permit.vehicleId || '',
            date: permit.date ? new Date(permit.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            totalTripsAllowed: permit.totalTripsAllowed || 0,
            selectedTripIds: linkedTrips,
            notes: permit.notes || ''
        });
        setEditId(permit._id);
        setShowForm(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/permits/${deleteId}`);
            showToast('Permit deleted successfully!', 'success');
            fetchData();
        } catch (error) {
            console.error(error);
            showToast('Error deleting permit', 'error');
        } finally {
            setDeleteId(null);
        }
    };

    const resetForm = () => {
        setFormData(initialForm);
        setEditId(null);
        setShowForm(false);
    };

    const filteredPermits = permits.filter((p: any) => {
        const pNum = p.permitNumber || '';
        const vNum = p.vehicleId?.vehicleNumber || p.vehicleId?.registrationNumber || '';
        const vName = p.vehicleId?.name || '';
        const pDate = p.date ? new Date(p.date).toISOString().split('T')[0] : '';

        const matchesSearch = !search ||
            pNum.toLowerCase().includes(search.toLowerCase()) ||
            vNum.toLowerCase().includes(search.toLowerCase()) ||
            vName.toLowerCase().includes(search.toLowerCase());

        const matchesVehicle = !filterVehicle || (p.vehicleId?._id || p.vehicleId) === filterVehicle;

        const matchesStartDate = !startDate || pDate >= startDate;
        const matchesEndDate = !endDate || pDate <= endDate;

        const used = p.usedTrips || 0;
        const total = p.totalTripsAllowed || 1;
        const isExhausted = used >= total;

        let matchesStatus = true;
        if (filterStatus === 'active') matchesStatus = !isExhausted;
        if (filterStatus === 'exhausted') matchesStatus = isExhausted;

        return matchesSearch && matchesVehicle && matchesStartDate && matchesEndDate && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-black dark:text-white-light uppercase tracking-tight">அனுமதிச் சீட்டு மேலாண்மை</h2>
                    <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-70">Permit & Pass Management Portal</p>
                </div>
                {!showForm && (
                    <button className="btn btn-primary shadow-[0_10px_20px_rgba(67,97,238,0.3)] rounded-xl py-2.5 px-6 font-black uppercase tracking-widest text-[10px]" onClick={() => setShowForm(true)}>
                        <IconPlus className="w-4 h-4 ltr:mr-2 rtl:ml-2" /> Add New Permit
                    </button>
                )}
            </div>

            {showForm && (
                <div className="panel shadow-2xl rounded-3xl border-none animate__animated animate__fadeIn">
                    <div className="flex items-center justify-between mb-8 border-b pb-5 border-[#ebedf2] dark:border-[#1b2e4b]">
                        <div>
                            <h5 className="font-black text-xl uppercase tracking-tight">{editId ? 'Edit Permit Record' : 'Create New Permit'}</h5>
                            <p className="text-xs font-bold text-white-dark uppercase tracking-widest mt-1">Vehicle Authorization System</p>
                        </div>
                        <button onClick={resetForm} className="btn btn-outline-danger btn-sm rounded-full w-10 h-10 p-0 flex items-center justify-center transform hover:rotate-90 transition-all">
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 block">Permit Number (அனுமதி எண்) *</label>
                                <input
                                    type="text"
                                    name="permitNumber"
                                    className="form-input border-2 focus:border-primary transition-all text-lg font-bold rounded-xl h-12 uppercase tracking-widest"
                                    placeholder="Enter Permit #"
                                    value={formData.permitNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-3 block">Vehicle (வாகனம்) *</label>
                                <select name="vehicleId" className="form-select border-2 font-bold rounded-xl h-12" value={formData.vehicleId} onChange={handleChange} required>
                                    <option value="">Select Vehicle</option>
                                    {vehicles.map((v: any) => (
                                        <option key={v._id} value={v._id}>
                                            {v.vehicleNumber || v.registrationNumber} ({v.name})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-info uppercase tracking-widest mb-3 block">Trips Authorized</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="totalTripsAllowed"
                                        className="form-input border-2 border-info/30 bg-info/5 text-info font-black text-xl rounded-xl h-12 pl-4 cursor-default"
                                        value={formData.totalTripsAllowed}
                                        readOnly
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-info tracking-wider">AUTO-CALC</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
                            <div>
                                <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-3 block">Issue Date (தேதி)</label>
                                <input type="date" name="date" className="form-input border-2 font-bold rounded-xl h-12" value={formData.date} onChange={handleChange} required />
                            </div>
                        </div>

                        {/* Trips Selection List */}
                        {formData.date && formData.vehicleId && (
                            <div className="panel bg-primary/5 dark:bg-dark/20 border-2 border-primary/20 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h6 className="font-black text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                                        <IconLayoutGrid className="w-4 h-4" />
                                        Select Trips from {new Date(formData.date).toLocaleDateString('en-GB')}
                                    </h6>
                                    <span className="badge badge-outline-primary font-black py-1 px-3 rounded-lg text-xs">
                                        {formData.selectedTripIds.length} TRIPS SELECTED
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar">
                                    {trips
                                        .filter(t => {
                                            const tDate = new Date(t.date).toISOString().split('T')[0];
                                            const tVehicle = t.vehicleId?._id || t.vehicleId;
                                            return tDate === formData.date && tVehicle === formData.vehicleId;
                                        })
                                        .map((trip) => {
                                            const hasPermit = trip.permitId && !formData.selectedTripIds.includes(trip._id);
                                            return (
                                                <div
                                                    key={trip._id}
                                                    className={`group relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${hasPermit
                                                        ? 'bg-gray-100 dark:bg-dark/40 border-gray-200 opacity-60 cursor-not-allowed'
                                                        : formData.selectedTripIds.includes(trip._id)
                                                            ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5'
                                                            : 'bg-white dark:bg-dark border-white-light dark:border-[#1b2e4b] hover:border-primary/50 cursor-pointer shadow-sm'
                                                        }`}
                                                    onClick={() => !hasPermit && handleTripToggle(trip._id)}
                                                >
                                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all ${formData.selectedTripIds.includes(trip._id) ? 'bg-primary border-primary' : 'border-white-dark/30'}`}>
                                                        {formData.selectedTripIds.includes(trip._id) && <IconX className="w-3 h-3 text-white transform rotate-45" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-black text-sm uppercase tracking-tight flex justify-between items-center">
                                                            <span>To: {trip.toLocation}</span>
                                                            {hasPermit && <span className="text-[10px] text-danger bg-danger/10 px-2 py-0.5 rounded uppercase font-black">Used Elsewhere</span>}
                                                        </div>
                                                        <div className="text-[11px] font-bold text-white-dark flex items-center gap-3 mt-1 uppercase tracking-widest">
                                                            <span className="text-secondary">{trip.loadQuantity} {trip.loadUnit}</span>
                                                            <span className="w-1 h-1 rounded-full bg-white-dark/30" />
                                                            <span>{trip.stoneTypeId?.name}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    }
                                    {trips.filter(t => {
                                        const tDate = new Date(t.date).toISOString().split('T')[0];
                                        const tVehicle = t.vehicleId?._id || t.vehicleId;
                                        return tDate === formData.date && tVehicle === formData.vehicleId;
                                    }).length === 0 && (
                                            <div className="col-span-2 text-center py-10">
                                                <div className="text-white-dark/30 uppercase font-black tracking-[0.2em] text-sm italic">No journey logs found for this vehicle on {new Date(formData.date).toLocaleDateString('en-GB')}</div>
                                            </div>
                                        )}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-[10px] font-black text-white-dark uppercase tracking-widest mb-3 block">Remarks / Notes</label>
                            <textarea
                                name="notes"
                                className="form-textarea min-h-[100px] border-2 rounded-2xl font-bold"
                                placeholder="Additional authorization details..."
                                value={formData.notes}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-6">
                            <button type="button" className="btn btn-outline-danger px-10 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]" onClick={resetForm}>Discard</button>
                            <button type="submit" className="btn btn-primary px-14 h-12 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-[0_10px_20px_rgba(67,97,238,0.3)] transition-all transform hover:scale-[1.02]">
                                <IconSave className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                                {editId ? 'Update Database' : 'Finalize Permit'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!showForm && (
                <div className="panel shadow-lg rounded-3xl border-none animate__animated animate__fadeIn">
                    <div className="flex flex-col gap-8 mb-8">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <h5 className="font-black text-xl uppercase tracking-tight dark:text-white-light">Permit Database (அனுமதி பட்டியல்)</h5>
                            <div className="flex items-center gap-4">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="Search Permit, Vehicle..."
                                        className="form-input ltr:pr-12 rtl:pl-12 h-11 w-72 rounded-xl border-2 font-bold focus:border-primary transition-all shadow-sm"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    <IconSearch className="w-5 h-5 absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 text-white-dark group-focus-within:text-primary transition-colors" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <select className="form-select h-11 rounded-xl border-2 font-bold shadow-sm" value={filterVehicle} onChange={(e) => setFilterVehicle(e.target.value)}>
                                <option value="">Vehicle: All</option>
                                {vehicles.map((v: any) => (
                                    <option key={v._id} value={v._id}>{v.vehicleNumber || v.registrationNumber}</option>
                                ))}
                            </select>

                            <div className="flex items-center gap-2">
                                <label className="text-[9px] font-black uppercase text-white-dark whitespace-nowrap">From:</label>
                                <input type="date" className="form-input h-11 rounded-xl border-2 font-bold shadow-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-[9px] font-black uppercase text-white-dark whitespace-nowrap">To:</label>
                                <input type="date" className="form-input h-11 rounded-xl border-2 font-bold shadow-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>

                            <select className="form-select h-11 rounded-xl border-2 font-bold shadow-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="all">Status: All</option>
                                <option value="active">Active (Available)</option>
                                <option value="exhausted">Exhausted (Completed)</option>
                            </select>
                        </div>
                        <div className="flex justify-end">
                            <button
                                className="text-[10px] font-black uppercase text-primary hover:underline"
                                onClick={() => {
                                    setSearch('');
                                    setFilterVehicle('');
                                    setStartDate('');
                                    setEndDate('');
                                    setFilterStatus('all');
                                }}
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr className="!bg-primary/5">
                                    <th className="font-black uppercase tracking-widest text-[10px] py-4">Date</th>
                                    <th className="font-black uppercase tracking-widest text-[10px] py-4">Permit #</th>
                                    <th className="font-black uppercase tracking-widest text-[10px] py-4">Vehicle Identity</th>
                                    <th className="font-black uppercase tracking-widest text-[10px] py-4">Utility Status</th>
                                    <th className="!text-center font-black uppercase tracking-widest text-[10px] py-4 text-warning">Management</th>
                                </tr>
                            </thead>
                            <tbody className="font-bold">
                                {loading ? (
                                    <tr><td colSpan={5} className="text-center py-20">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-xs uppercase tracking-[0.2em] text-primary">Synchronizing...</span>
                                        </div>
                                    </td></tr>
                                ) : filteredPermits.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-20 text-white-dark uppercase font-black tracking-widest text-sm opacity-20">No permits found</td></tr>
                                ) : filteredPermits.map((permit) => (
                                    <tr key={permit._id} className="group hover:bg-primary/5 transition-all">
                                        <td className="py-4">
                                            <div className="text-black dark:text-white-light">{new Date(permit.date).toLocaleDateString('en-GB')}</div>
                                        </td>
                                        <td className="py-4">
                                            <span className="badge badge-outline-primary font-black py-1 px-3 rounded-lg text-xs tracking-[0.15em] uppercase border-dashed">
                                                {permit.permitNumber}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <div className="font-black text-black dark:text-white-light uppercase tracking-tight">{permit.vehicleId?.vehicleNumber || permit.vehicleId?.registrationNumber || 'Unknown'}</div>
                                            <div className="text-[10px] text-white-dark font-bold uppercase tracking-widest mt-0.5">{permit.vehicleId?.name}</div>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex flex-col gap-2 max-w-[120px]">
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                                                    <span className="text-primary">{permit.usedTrips || 0} TRIPS USED</span>
                                                    <span className="text-white-dark">/ {permit.totalTripsAllowed || 1}</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-100 dark:bg-dark/40 rounded-full overflow-hidden p-[1px]">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${permit.usedTrips >= permit.totalTripsAllowed ? 'bg-success' : 'bg-primary shadow-[0_0_8px_rgba(67,97,238,0.5)]'}`}
                                                        style={{ width: `${Math.min(((permit.usedTrips || 0) / (permit.totalTripsAllowed || 1)) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="text-center py-4">
                                            <div className="flex items-center justify-center gap-3">
                                                {canEditRecord(currentUser, permit.createdAt || permit.date) ? (
                                                    <button onClick={() => handleEdit(permit)} className="p-2.5 rounded-xl text-primary hover:bg-primary hover:text-white transition-all transform group-hover:scale-110 shadow-lg shadow-transparent hover:shadow-primary/20">
                                                        <IconEdit className="w-4.5 h-4.5" />
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] text-white-dark italic">Locked</span>
                                                )}
                                                {isOwner && (
                                                    <button onClick={() => setDeleteId(permit._id)} className="p-2.5 rounded-xl text-danger hover:bg-danger hover:text-white transition-all transform group-hover:scale-110 shadow-lg shadow-transparent hover:shadow-danger/20">
                                                        <IconTrashLines className="w-4.5 h-4.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <DeleteConfirmModal
                show={!!deleteId}
                onCancel={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Permit"
                message="Are you sure you want to delete this permit record? This action cannot be undone."
            />
        </div>
    );
};

export default PermitManagement;
