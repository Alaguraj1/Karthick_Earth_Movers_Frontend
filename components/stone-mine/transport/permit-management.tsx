'use client';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import axios from 'axios';
import { useToast } from '@/components/stone-mine/toast-notification';
import DeleteConfirmModal from '@/components/stone-mine/delete-confirm-modal';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconSearch from '@/components/icon/icon-search';
import IconX from '@/components/icon/icon-x';
import IconSave from '@/components/icon/icon-save';

const API = process.env.NEXT_PUBLIC_API_URL;

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
                axios.get(`${API}/permits`),
                axios.get(`${API}/master/vehicles`),
                axios.get(`${API}/trips`),
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
                await axios.put(`${API}/permits/${editId}`, payload);
                showToast('Permit updated successfully!', 'success');
            } else {
                await axios.post(`${API}/permits`, payload);
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
            await axios.delete(`${API}/permits/${deleteId}`);
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

        const matchesSearch = !search ||
            pNum.toLowerCase().includes(search.toLowerCase()) ||
            vNum.toLowerCase().includes(search.toLowerCase()) ||
            vName.toLowerCase().includes(search.toLowerCase());

        const matchesVehicle = !filterVehicle || (p.vehicleId?._id || p.vehicleId) === filterVehicle;

        return matchesSearch && matchesVehicle;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white-light">அனுமதிச் சீட்டு மேலாண்மை (Permit Management)</h2>
                    <p className="text-white-dark text-sm mt-1">Manage and track vehicle permits and transport passes</p>
                </div>
                {!showForm && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2" /> Add New Permit
                    </button>
                )}
            </div>

            {showForm && (
                <div className="panel animate__animated animate__fadeIn">
                    <div className="flex items-center justify-between mb-5 border-b pb-3 border-[#ebedf2] dark:border-[#1b2e4b]">
                        <h5 className="font-bold text-lg">{editId ? 'Edit Permit' : 'New Permit Registration'}</h5>
                        <button onClick={resetForm} className="text-white-dark hover:text-danger">
                            <IconX />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">Permit Number *</label>
                                <input
                                    type="text"
                                    name="permitNumber"
                                    className="form-input font-bold text-primary uppercase tracking-widest"
                                    placeholder="Enter Permit #"
                                    value={formData.permitNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">Vehicle (வாகனம்) *</label>
                                <select name="vehicleId" className="form-select border-primary" value={formData.vehicleId} onChange={handleChange} required>
                                    <option value="">Select Vehicle</option>
                                    {vehicles.map((v: any) => (
                                        <option key={v._id} value={v._id}>
                                            {v.vehicleNumber || v.registrationNumber} ({v.name})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block text-info">Total Trips Allowed (Auto)</label>
                                <input
                                    type="number"
                                    name="totalTripsAllowed"
                                    className="form-input border-info bg-[#f1f2f3] dark:bg-dark"
                                    value={formData.totalTripsAllowed}
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">Date (தேதி)</label>
                                <input type="date" name="date" className="form-input" value={formData.date} onChange={handleChange} required />
                            </div>
                        </div>

                        {/* Trips Selection List */}
                        {formData.date && formData.vehicleId && (
                            <div className="panel bg-[#fafafa] dark:bg-dark/20 border border-white-light dark:border-[#1b2e4b]">
                                <h6 className="font-bold mb-4 text-primary">Select Trips from {new Date(formData.date).toLocaleDateString('en-GB')}</h6>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
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
                                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${hasPermit
                                                        ? 'bg-gray-100 dark:bg-dark/40 border-gray-200 opacity-60 cursor-not-allowed'
                                                        : formData.selectedTripIds.includes(trip._id)
                                                            ? 'bg-primary/10 border-primary cursor-pointer'
                                                            : 'bg-white dark:bg-dark border-white-light dark:border-[#1b2e4b] hover:border-primary/50 cursor-pointer'
                                                        }`}
                                                    onClick={() => !hasPermit && handleTripToggle(trip._id)}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className={`form-checkbox w-5 h-5 ${hasPermit ? 'text-gray-400' : 'text-primary'}`}
                                                        checked={formData.selectedTripIds.includes(trip._id)}
                                                        disabled={hasPermit}
                                                        onChange={() => { }}
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-bold text-sm flex justify-between">
                                                            <span>Trip to: {trip.toLocation}</span>
                                                            {hasPermit && <span className="text-[10px] text-danger font-normal">Already has a permit</span>}
                                                        </div>
                                                        <div className="text-xs text-white-dark flex justify-between">
                                                            <span>{trip.loadQuantity} {trip.loadUnit}</span>
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
                                            <div className="col-span-2 text-center py-4 text-white-dark italic">No trips found for this vehicle on this date.</div>
                                        )}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-bold text-white-dark uppercase mb-2 block">Remarks / Notes</label>
                            <textarea
                                name="notes"
                                className="form-textarea min-h-[80px]"
                                placeholder="Additional details..."
                                value={formData.notes}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4">
                            <button type="button" className="btn btn-outline-danger" onClick={resetForm}>Cancel</button>
                            <button type="submit" className="btn btn-primary px-8">
                                <IconSave className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                {editId ? 'Update Permit' : 'Save Permit'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!showForm && (
                <div className="panel animate__animated animate__fadeIn">
                    <div className="flex flex-col gap-5 mb-5">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <h5 className="font-bold text-lg dark:text-white-light">Permit List (அனுமதி பட்டியல்)</h5>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search Permit, Vehicle..."
                                        className="form-input ltr:pr-10 rtl:pl-10 h-10 w-64"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    <IconSearch className="w-4 h-4 absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-white-dark" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select className="form-select h-10" value={filterVehicle} onChange={(e) => setFilterVehicle(e.target.value)}>
                                <option value="">All Vehicles</option>
                                {vehicles.map((v: any) => (
                                    <option key={v._id} value={v._id}>{v.vehicleNumber || v.registrationNumber}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Permit Number</th>
                                    <th>Vehicle Details</th>
                                    <th>Trip Usage</th>
                                    <th className="!text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
                                ) : filteredPermits.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-8">No permits found.</td></tr>
                                ) : filteredPermits.map((permit) => (
                                    <tr key={permit._id}>
                                        <td>
                                            <div className="font-bold">{new Date(permit.date).toLocaleDateString('en-GB')}</div>
                                        </td>
                                        <td className="font-black text-primary tracking-widest">{permit.permitNumber}</td>
                                        <td>
                                            <div className="font-bold">{permit.vehicleId?.vehicleNumber || permit.vehicleId?.registrationNumber || 'Unknown'}</div>
                                            <div className="text-xs text-secondary">{permit.vehicleId?.name}</div>
                                        </td>
                                        <td>
                                            <div className="flex flex-col gap-1">
                                                <div className="text-xs font-bold text-info">
                                                    {permit.usedTrips || 0} / {permit.totalTripsAllowed || 1} trips
                                                </div>
                                                <div className="w-24 h-1 bg-[#ebedf2] dark:bg-dark/40 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${permit.usedTrips >= permit.totalTripsAllowed ? 'bg-success' : 'bg-info'}`}
                                                        style={{ width: `${Math.min(((permit.usedTrips || 0) / (permit.totalTripsAllowed || 1)) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => handleEdit(permit)} className="btn btn-sm btn-outline-primary p-1">
                                                    <IconEdit className="w-4 h-4" />
                                                </button>
                                                {isOwner && (
                                                    <button onClick={() => setDeleteId(permit._id)} className="btn btn-sm btn-outline-danger p-1">
                                                        <IconTrashLines className="w-4 h-4" />
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
                message="Are you sure you want to delete this permit record?"
            />
        </div>
    );
};

export default PermitManagement;
