'use client';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import api from '@/utils/api';
import { useToast } from '@/components/stone-mine/toast-notification';
import DeleteConfirmModal from '@/components/stone-mine/delete-confirm-modal';
import { canEditRecord } from '@/utils/permissions';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconSearch from '@/components/icon/icon-search';
import IconX from '@/components/icon/icon-x';
import IconSave from '@/components/icon/icon-save';

const TripManagement = () => {
    const currentUser = useSelector((state: IRootState) => state.auth.user);
    const isOwner = currentUser?.role?.toLowerCase() === 'owner';

    const { showToast } = useToast();
    const [trips, setTrips] = useState<any[]>([]);
    const [sales, setSales] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Filter states
    const [search, setSearch] = useState('');
    const [filterVehicle, setFilterVehicle] = useState('');
    const [filterCustomer, setFilterCustomer] = useState('');
    const [filterSaleLink, setFilterSaleLink] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    const initialForm = {
        date: new Date().toISOString().split('T')[0],
        vehicleId: '',
        vehicleType: 'All',
        driverId: '',
        driverName: '',
        fromLocation: 'Quarry',
        toLocation: '',
        stoneTypeId: '',
        customerId: '',
        saleId: '',
        permitId: '',
        loadQuantity: '',
        loadUnit: 'Tons',
        notes: ''
    };

    const [formData, setFormData] = useState(initialForm);
    // Selected sale object (for derived fields)
    const [selectedSale, setSelectedSale] = useState<any>(null);
    // Calculated remaining qty for the selected sale
    const [remainingQty, setRemainingQty] = useState<number | null>(null);

    const [labours, setLabours] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [stoneTypes, setStoneTypes] = useState<any[]>([]);
    const [vehicleCategories, setVehicleCategories] = useState<any[]>([]);
    const [permits, setPermits] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tripRes, vehicleRes, labourRes, customerRes, stoneRes, categoryRes, salesRes, permitRes] = await Promise.all([
                api.get('/trips'),
                api.get('/master/vehicles'),
                api.get('/labour'),
                api.get('/master/customers'),
                api.get('/master/stone-types'),
                api.get('/master/vehicle-categories'),
                api.get('/sales'),
                api.get('/permits'),
            ]);

            if (tripRes.data.success) {
                const sortedTrips = tripRes.data.data.sort((a: any, b: any) => {
                    const dateA = new Date(a.date).getTime();
                    const dateB = new Date(b.date).getTime();
                    if (dateB !== dateA) return dateB - dateA;
                    return (b._id || '').localeCompare(a._id || '');
                });
                setTrips(sortedTrips);
            }
            if (vehicleRes.data.success) {
                // Filter out MACHINES (JCBs, etc.) from Transport Trip Management
                const transportOnly = vehicleRes.data.data.filter((v: any) => v.type === 'Vehicle');
                setVehicles(transportOnly);
                setFilteredVehicles(transportOnly); // Show all transport by default
            }
            if (labourRes.data.success) setLabours(labourRes.data.data);
            if (customerRes.data.success) setCustomers(customerRes.data.data);
            if (stoneRes.data.success) setStoneTypes(stoneRes.data.data);
            if (categoryRes.data.success) setVehicleCategories(categoryRes.data.data);
            if (salesRes && salesRes.data.success) {
                const sortedSales = salesRes.data.data.sort((a: any, b: any) => {
                    const dateA = new Date(a.invoiceDate).getTime();
                    const dateB = new Date(b.invoiceDate).getTime();
                    if (dateB !== dateA) return dateB - dateA;
                    return (b._id || '').localeCompare(a._id || '');
                });
                setSales(sortedSales);
            }
            if (permitRes.data.success) setPermits(permitRes.data.data);
        } catch (error) {
            console.error(error);
            showToast('Error fetching data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filterVehiclesBy = (allVehicles: any[], type: string) => {
        if (!type || type === 'All') {
            setFilteredVehicles(allVehicles);
            return;
        }
        const filtered = allVehicles.filter((v: any) =>
            v.category?.toLowerCase() === type.toLowerCase() ||
            (type === 'Lorry' && !v.category) // Fallback for old data
        );
        setFilteredVehicles(filtered);
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reactive Remaining Qty Logic (Per material in Sale)
    useEffect(() => {
        if (!formData.saleId || !selectedSale || !formData.stoneTypeId) {
            setRemainingQty(null);
            return;
        }

        // Calc trips already done for this specific sale AND this specific material
        // We exclude the current editId trip to get the other delivered quantities
        const linkedTrips = trips.filter((t: any) => {
            const tSaleId = t.saleId?._id || t.saleId;
            const tStoneId = t.stoneTypeId?._id || t.stoneTypeId;
            return tSaleId === formData.saleId && tStoneId === formData.stoneTypeId && t._id !== editId;
        });

        const deliveredQty = linkedTrips.reduce((sum: number, t: any) => sum + (parseFloat(t.loadQuantity) || 0), 0);

        // Find the specific item in the sale order that matches the selected material
        const saleItem = (selectedSale.items || []).find((it: any) => {
            const itStoneId = it.stoneType?._id || it.stoneType;
            return itStoneId === formData.stoneTypeId;
        });

        if (saleItem) {
            const remaining = (saleItem.quantity || 0) - deliveredQty;
            setRemainingQty(remaining);
        } else {
            setRemainingQty(0);
        }
    }, [formData.saleId, formData.stoneTypeId, selectedSale, trips, editId]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'vehicleType') {
            filterVehiclesBy(vehicles, value);
        }

        if (name === 'vehicleId') {
            const selectedVehicle = vehicles.find((v: any) => v._id === value);
            if (selectedVehicle) {
                if (selectedVehicle.category) {
                    setFormData(prev => ({ ...prev, vehicleType: selectedVehicle.category, vehicleId: value }));
                    filterVehiclesBy(vehicles, selectedVehicle.category);
                }
                if (selectedVehicle.driverName) {
                    const vName = selectedVehicle.driverName;
                    const worker = labours.find((l: any) => l.name?.trim().toLowerCase() === vName.trim().toLowerCase());
                    setFormData(prev => ({ ...prev, driverName: vName, driverId: worker ? worker._id : '' }));
                } else if (selectedVehicle.operatorName) {
                    const vName = selectedVehicle.operatorName;
                    const worker = labours.find((l: any) => l.name?.trim().toLowerCase() === vName.trim().toLowerCase());
                    setFormData(prev => ({ ...prev, driverName: vName, driverId: worker ? worker._id : '' }));
                }
            }
        }

        // When customer changes → reset sale selection
        if (name === 'customerId') {
            setFormData(prev => ({ ...prev, customerId: value, saleId: '', stoneTypeId: '', fromLocation: 'Quarry', toLocation: '' }));
            setSelectedSale(null);
            setRemainingQty(null);
            return;
        }

        // When sale is selected → auto-fill location & filter materials
        if (name === 'saleId') {
            if (!value) {
                setSelectedSale(null);
                setRemainingQty(null);
                setFormData(prev => ({ ...prev, saleId: '', fromLocation: 'Quarry', toLocation: '', stoneTypeId: '' }));
                return;
            }
            const sale = sales.find((s: any) => s._id === value);
            if (sale) {
                setSelectedSale(sale);
                setFormData(prev => ({
                    ...prev,
                    saleId: value,
                    customerId: sale.customer?._id || sale.customer || prev.customerId,
                    fromLocation: sale.fromLocation || 'Quarry',
                    toLocation: sale.toLocation || '',
                    stoneTypeId: '', // reset material so user picks filtered one
                }));
            }
            return;
        }

        if (name === 'driverName') {
            const worker = labours.find((l: any) => l.name?.trim().toLowerCase() === value.trim().toLowerCase());
            setFormData(prev => ({ ...prev, driverId: worker ? worker._id : '' }));
        }

        // When permit is selected → auto-fill vehicle & driver IF unique
        if (name === 'permitId') {
            if (!value) return;
            const permit = permits.find(p => p._id === value);
            if (permit) {
                // Only auto-fill vehicle if it's a single-vehicle permit and currently unselected
                if (permit.vehicleIds?.length === 1 && !formData.vehicleId) {
                    const vObj = permit.vehicleIds[0];
                    const vId = vObj._id || vObj;
                    const vType = vObj.category || 'Lorry';
                    const dName = vObj.driverName || vObj.operatorName || '';

                    setFormData(prev => ({
                        ...prev,
                        vehicleId: vId,
                        vehicleType: vType,
                        driverName: dName
                    }));

                    if (dName) {
                        const worker = labours.find((l: any) => l.name?.trim().toLowerCase() === dName.trim().toLowerCase());
                        setFormData(prev => ({ ...prev, driverId: worker ? worker._id : '' }));
                    }
                    filterVehiclesBy(vehicles, vType);
                }
            }
        }
    };

    const handleConvertToSale = async (tripId: string) => {
        if (isSaving) return;
        try {
            setIsSaving(true);
            const { data } = await api.post(`/trips/${tripId}/convert-to-sale`);
            if (data.success) {
                showToast('Trip converted to Sale successfully!', 'success');
                fetchData();
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Error converting trip', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (isSaving) return;

        // Quantity validation: check against remaining sale qty
        if (formData.saleId && remainingQty !== null) {
            const thisQty = parseFloat(formData.loadQuantity) || 0;
            if (thisQty > remainingQty) {
                showToast(`❌ Quantity exceeded! Only ${remainingQty.toFixed(2)} ${formData.loadUnit} remaining for this sale.`, 'error');
                return;
            }
            if (remainingQty <= 0) {
                showToast('❌ This sale has already reached its total quantity. No more trips can be added.', 'error');
                return;
            }
        }

        try {
            setIsSaving(true);
            const payload = { ...formData };
            if (editId) {
                await api.put(`/trips/${editId}`, payload);
                showToast('Record updated successfully!', 'success');
            } else {
                await api.post('/trips', payload);
                showToast('Record recorded successfully!', 'success');
            }
            resetForm();
            fetchData();
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.message || 'Error saving record', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (trip: any) => {
        const vType = trip.vehicleType || 'Lorry';
        filterVehiclesBy(vehicles, vType);
        const saleObj = sales.find((s: any) => s._id === (trip.saleId?._id || trip.saleId));
        setSelectedSale(saleObj || null);
        setFormData({
            date: trip.date ? new Date(trip.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            vehicleId: trip.vehicleId?._id || trip.vehicleId || '',
            vehicleType: trip.vehicleType || trip.vehicleId?.category || 'All',
            driverId: trip.driverId?._id || trip.driverId || '',
            driverName: trip.driverName || trip.driverId?.name || '',
            fromLocation: trip.fromLocation || 'Quarry',
            toLocation: trip.toLocation || '',
            stoneTypeId: trip.stoneTypeId?._id || trip.stoneTypeId || '',
            customerId: trip.customerId?._id || trip.customerId || '',
            saleId: trip.saleId?._id || trip.saleId || '',
            permitId: trip.permitId?._id || trip.permitId || '',
            loadQuantity: trip.loadQuantity || '',
            loadUnit: trip.loadUnit || 'Tons',
            notes: trip.notes || ''
        });
        setEditId(trip._id);
        setShowForm(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/trips/${deleteId}`);
            showToast('Record deleted successfully!', 'success');
            fetchData();
        } catch (error) {
            console.error(error);
            showToast('Error deleting record', 'error');
        } finally {
            setDeleteId(null);
        }
    };

    const resetForm = () => {
        setFormData(initialForm);
        setSelectedSale(null);
        setRemainingQty(null);
        setEditId(null);
        setShowForm(false);
        setFilteredVehicles(vehicles);
    };

    // Sales for the selected customer that have remaining quantity
    const customerSales = formData.customerId
        ? sales.filter((s: any) => {
            const cId = s.customer?._id || s.customer;
            return cId === formData.customerId && s.status !== 'cancelled';
        })
        : [];

    // Materials available in selected sale
    const saleMaterials: any[] = selectedSale
        ? (selectedSale.items || []).reduce((acc: any[], item: any) => {
            const stId = item.stoneType?._id || item.stoneType;
            if (stId && !acc.find((a: any) => a._id === stId)) {
                const stObj = stoneTypes.find((s: any) => s._id === stId);
                if (stObj) acc.push(stObj);
            }
            return acc;
        }, [])
        : stoneTypes;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white-light">வாகன பயண மேலாண்மை (Vehicle Trip Management)</h2>
                    <p className="text-white-dark text-sm mt-1">Record and manage vehicle trips, loads and income</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2" /> Add New Trip
                </button>
            </div>

            {showForm && (
                <div className="panel animate__animated animate__fadeIn">
                    <div className="flex items-center justify-between mb-5 border-b pb-3 border-[#ebedf2] dark:border-[#1b2e4b]">
                        <h5 className="font-bold text-lg">{editId ? 'Edit Record' : 'New Trip Registration'}</h5>
                        <button onClick={resetForm} className="text-white-dark hover:text-danger">
                            <IconX />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">Trip Date</label>
                                <input type="date" name="date" className="form-input" value={formData.date} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">Vehicle Type</label>
                                <select name="vehicleType" className="form-select" value={formData.vehicleType} onChange={handleChange} required>
                                    <option value="All">All Vehicles</option>
                                    {vehicleCategories.map((cat: any) => (
                                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">Vehicle Number</label>
                                <select name="vehicleId" className="form-select border-primary" value={formData.vehicleId} onChange={handleChange} required>
                                    <option value="">Select Vehicle</option>
                                    {filteredVehicles.map((v: any) => (
                                        <option key={v._id} value={v._id}>
                                            {v.vehicleNumber || v.registrationNumber} ({v.name})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block font-primary">Driver Name (சாரதி பெயர்)</label>
                                <div className="relative">
                                    <input
                                        name="driverName"
                                        list="trip-labor-list"
                                        className="form-input font-bold"
                                        value={formData.driverName}
                                        onChange={handleChange}
                                        placeholder="Enter Driver Name..."
                                        required
                                    />
                                    <datalist id="trip-labor-list">
                                        {labours.map(l => (
                                            <option key={l._id} value={l.name}>{l.workType || 'Worker'}</option>
                                        ))}
                                    </datalist>
                                </div>
                            </div>
                        </div>

                        {/* Customer → Sale → Permit */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block text-primary">Customer (வாடிக்கையாளர்) *</label>
                                <select name="customerId" className="form-select border-primary" value={formData.customerId} onChange={handleChange}>
                                    <option value="">-- Select Customer --</option>
                                    {customers.map((c: any) => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block text-info">
                                    Sale Invoice (விற்பனை பட்டியல்)
                                    {formData.customerId && customerSales.length === 0 && (
                                        <span className="ml-2 text-danger font-normal text-[10px] normal-case">No open sales for this customer</span>
                                    )}
                                </label>
                                <select
                                    name="saleId"
                                    className="form-select border-info"
                                    value={formData.saleId}
                                    onChange={handleChange}
                                    disabled={!formData.customerId}
                                >
                                    <option value="">-- None (Internal Trip) --</option>
                                    {customerSales.map((s: any) => {
                                        const totalQty = (s.items || []).reduce((sum: number, it: any) => sum + (it.quantity || 0), 0);
                                        const linked = trips.filter((t: any) => (t.saleId?._id || t.saleId) === s._id);
                                        const delivered = linked.reduce((sum: number, t: any) => sum + (parseFloat(t.loadQuantity) || 0), 0);
                                        const rem = totalQty - delivered;
                                        return (
                                            <option key={s._id} value={s._id} disabled={rem <= 0}>
                                                {s.invoiceNumber} — {rem <= 0 ? '✅ Completed' : `${rem.toFixed(1)} remaining`}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block text-warning">Link Transport Permit</label>
                                <select
                                    name="permitId"
                                    className="form-select border-warning"
                                    value={formData.permitId}
                                    onChange={handleChange}
                                >
                                    <option value="">-- No Permit --</option>
                                    {permits
                                        .filter(p => {
                                            const isActive = p.status === 'Active' || p._id === formData.permitId;
                                            if (!isActive) return false;
                                            // Handle multi-vehicle check
                                            if (!p.vehicleIds || p.vehicleIds.length === 0) return true; // Global
                                            if (!formData.vehicleId) return true; // Show all if vehicle not picked yet
                                            return p.vehicleIds.some((v: any) => (v._id || v) === formData.vehicleId);
                                        })
                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                        .map((p: any) => {
                                            const isToday = new Date(p.date).toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                                            const rem = p.remainingTrips ?? (p.totalTripsAllowed - (p.usedTrips || 0));
                                            const vInfo = (p.vehicleIds || []).map((v: any) => v.vehicleNumber || v.registrationNumber).join(', ');
                                            return (
                                                <option key={p._id} value={p._id}>
                                                    {isToday ? '🆕 ' : ''}{p.permitNumber} — {vInfo || 'GLOBAL'} ({rem} left) {isToday ? '[TODAY]' : ''}
                                                </option>
                                            );
                                        })}
                                </select>
                            </div>
                        </div>

                        {/* Auto-filled Location (read-only when sale selected) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">
                                    From Location
                                    {selectedSale && <span className="ml-2 text-[10px] text-success normal-case font-normal">Auto-filled from sale</span>}
                                </label>
                                <input
                                    type="text" name="fromLocation"
                                    className={`form-input font-bold ${selectedSale ? 'bg-success/5 text-success cursor-not-allowed' : 'text-primary'}`}
                                    value={formData.fromLocation}
                                    onChange={handleChange}
                                    readOnly={!!selectedSale}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">
                                    To Location
                                    {selectedSale && <span className="ml-2 text-[10px] text-success normal-case font-normal">Auto-filled from sale</span>}
                                </label>
                                <input
                                    type="text" name="toLocation"
                                    className={`form-input ${selectedSale ? 'bg-success/5 text-success cursor-not-allowed' : ''}`}
                                    value={formData.toLocation}
                                    onChange={handleChange}
                                    readOnly={!!selectedSale}
                                    placeholder="Destination address"
                                    required
                                />
                            </div>
                        </div>

                        {/* Material / Quantity / Unit */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">
                                    Material Type
                                    {selectedSale && <span className="ml-2 text-[10px] text-info normal-case font-normal">Filtered by sale</span>}
                                </label>
                                <select name="stoneTypeId" className="form-select" value={formData.stoneTypeId} onChange={handleChange} required>
                                    <option value="">Select Material</option>
                                    {saleMaterials.map((s: any) => (
                                        <option key={s._id} value={s._id}>{s.name} ({s.unit})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">
                                    Quantity (This Trip)
                                    {remainingQty !== null && (
                                        <span className={`ml-2 text-[10px] normal-case font-normal ${remainingQty <= 0 ? 'text-danger' : remainingQty < 5 ? 'text-warning' : 'text-success'
                                            }`}>
                                            Remaining: {remainingQty.toFixed(2)} {formData.loadUnit}
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="number" name="loadQuantity"
                                    className={`form-input ${remainingQty !== null && parseFloat(formData.loadQuantity) > remainingQty
                                        ? 'border-danger text-danger'
                                        : ''
                                        }`}
                                    value={formData.loadQuantity}
                                    onChange={handleChange}
                                    required step="0.01"
                                    max={remainingQty !== null ? remainingQty : undefined}
                                    placeholder="Enter qty for this trip"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white-dark uppercase mb-2 block">Unit</label>
                                <select name="loadUnit" className="form-select" value={formData.loadUnit} onChange={handleChange} required>
                                    <option value="Tons">Tons</option>
                                    <option value="Units">Units</option>
                                    <option value="Loads">Loads</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-info/5 p-4 rounded-lg">
                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Remarks / Notes</label>
                            <textarea name="notes" className="form-textarea min-h-[80px]" value={formData.notes || ''} onChange={handleChange}></textarea>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4">
                            <button type="button" className="btn btn-outline-danger" onClick={resetForm} disabled={isSaving}>Cancel</button>
                            <button type="submit" className="btn btn-primary px-8" disabled={isSaving}>
                                {isSaving ? (
                                    <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-4 h-4 ltr:mr-2 rtl:ml-2 inline-block"></span>
                                ) : (
                                    <IconSave className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                )}
                                {isSaving ? 'Saving...' : editId ? 'Update Record' : 'Save Record'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!showForm && (
                <div className="panel">
                    <div className="flex flex-col gap-5 mb-5">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <h5 className="font-bold text-lg dark:text-white-light">Journey Logs (பயணப் பதிவுகள்)</h5>
                        </div>

                        {/* Filter Panel */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-end bg-primary/5 p-4 rounded-xl">
                            {/* Search */}
                            <div className="col-span-2 sm:col-span-1">
                                <label className="text-[10px] font-bold uppercase mb-1 block">Search</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Vehicle, driver, route..."
                                        className="form-input ltr:pr-10 rtl:pl-10 h-10"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    <IconSearch className="w-4 h-4 absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-white-dark" />
                                </div>
                            </div>
                            {/* Vehicle */}
                            <div>
                                <label className="text-[10px] font-bold uppercase mb-1 block">Vehicle</label>
                                <select className="form-select h-10" value={filterVehicle} onChange={(e) => setFilterVehicle(e.target.value)}>
                                    <option value="">All Vehicles</option>
                                    {Array.from(new Set(vehicles.map((v: any) => v.vehicleNumber || v.registrationNumber))).map(num => (
                                        <option key={num as string} value={num as string}>{num as string}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Customer */}
                            <div>
                                <label className="text-[10px] font-bold uppercase mb-1 block">Customer</label>
                                <select className="form-select h-10" value={filterCustomer} onChange={(e) => setFilterCustomer(e.target.value)}>
                                    <option value="">All Customers</option>
                                    {customers.map((c: any) => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Sale Link */}
                            <div>
                                <label className="text-[10px] font-bold uppercase mb-1 block">Sale Link</label>
                                <select className="form-select h-10" value={filterSaleLink} onChange={(e) => setFilterSaleLink(e.target.value)}>
                                    <option value="">All Trips</option>
                                    <option value="linked">🔗 Linked to Sale</option>
                                    <option value="internal">🚧 Internal Trip</option>
                                </select>
                            </div>
                            {/* From Date */}
                            <div>
                                <label className="text-[10px] font-bold uppercase mb-1 block">From Date</label>
                                <input type="date" className="form-input h-10" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
                            </div>
                            {/* To Date */}
                            <div>
                                <label className="text-[10px] font-bold uppercase mb-1 block">To Date</label>
                                <input type="date" className="form-input h-10" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Vehicle / Driver</th>
                                    <th>Route & Customer</th>
                                    <th>Material</th>
                                    <th className="!text-right text-danger">Expenses</th>
                                    <th className="!text-center text-info">Linked Sale</th>
                                    <th className="!text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const filtered = trips.filter((t: any) => {
                                        const vNum = t.vehicleId?.vehicleNumber || t.vehicleId?.registrationNumber || '';
                                        const dName = t.driverName || t.driverId?.name || '';
                                        const cName = t.customerId?.name || '';
                                        const invoiceNum = t.saleId?.invoiceNumber || '';
                                        const material = t.stoneTypeId?.name || '';

                                        const matchesSearch = !search ||
                                            vNum.toLowerCase().includes(search.toLowerCase()) ||
                                            dName.toLowerCase().includes(search.toLowerCase()) ||
                                            cName.toLowerCase().includes(search.toLowerCase()) ||
                                            invoiceNum.toLowerCase().includes(search.toLowerCase()) ||
                                            material.toLowerCase().includes(search.toLowerCase()) ||
                                            t.fromLocation?.toLowerCase().includes(search.toLowerCase()) ||
                                            t.toLocation?.toLowerCase().includes(search.toLowerCase());

                                        const matchesVehicle = !filterVehicle || vNum === filterVehicle;
                                        const matchesCustomer = !filterCustomer || cName === filterCustomer;
                                        const matchesSaleLink = !filterSaleLink ||
                                            (filterSaleLink === 'linked' && !!t.saleId) ||
                                            (filterSaleLink === 'internal' && !t.saleId);

                                        const tripDate = t.date ? new Date(t.date).toISOString().split('T')[0] : '';
                                        const matchesStart = !filterStartDate || tripDate >= filterStartDate;
                                        const matchesEnd = !filterEndDate || tripDate <= filterEndDate;

                                        return matchesSearch && matchesVehicle && matchesCustomer && matchesSaleLink && matchesStart && matchesEnd;
                                    });

                                    if (loading) {
                                        return <tr><td colSpan={7} className="text-center py-8">Loading...</td></tr>;
                                    }
                                    if (filtered.length === 0) {
                                        return <tr><td colSpan={7} className="text-center py-8">No records found matching your filters.</td></tr>;
                                    }

                                    return filtered.map((trip) => (
                                        <tr key={trip._id}>
                                            <td>{new Date(trip.date).toLocaleDateString('en-GB')}</td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <span className={`badge badge-outline-primary text-[10px] py-0.5 px-1.5`}>{trip.vehicleId?.category || trip.vehicleType || 'Vehicle'}</span>
                                                    <div className="font-bold text-primary">{trip.vehicleId?.vehicleNumber || trip.vehicleId?.registrationNumber || 'Unknown'}</div>
                                                </div>
                                                <div className="text-xs text-secondary font-medium mt-1">{trip.driverName || trip.driverId?.name || 'No Driver'}</div>
                                            </td>
                                            <td>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-white-dark uppercase tracking-tighter">CUSTOMER: {trip.customerId?.name || 'INTERNAL'}</span>
                                                    <div className="mt-1">
                                                        <span className="text-[10px] font-bold uppercase">{trip.fromLocation}</span>
                                                        <span className="mx-1 text-white-dark">→</span>
                                                        <span className="text-[10px] font-bold uppercase">{trip.toLocation}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge badge-outline-dark">{trip.stoneTypeId?.name || 'Material'}</span>
                                                <div className="text-[10px] mt-1 font-bold">{trip.loadQuantity} {trip.loadUnit}</div>
                                            </td>
                                            <td className="!text-right text-danger font-bold">₹{((trip.driverAmount || 0) + (trip.driverBata || 0) + (trip.otherExpenses || 0)).toLocaleString()}</td>
                                            <td className="!text-center">
                                                {trip.saleId ? (
                                                    <span className="badge badge-outline-success font-black border-dashed">{trip.saleId.invoiceNumber}</span>
                                                ) : (
                                                    <span className="text-[10px] text-white-dark italic">Internal Trip</span>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {canEditRecord(currentUser, trip.createdAt || trip.date) ? (
                                                        <button onClick={() => handleEdit(trip)} className="btn btn-sm btn-outline-primary p-1">
                                                            <IconEdit className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] text-white-dark italic">Locked</span>
                                                    )}
                                                    {isOwner && (
                                                        <button onClick={() => setDeleteId(trip._id)} className="btn btn-sm btn-outline-danger p-1">
                                                            <IconTrashLines className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ));
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <DeleteConfirmModal
                show={!!deleteId}
                onCancel={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Trip Record"
                message="Are you sure you want to delete this trip record? This will also remove associated profit data."
            />
        </div>
    );
};

export default TripManagement;
