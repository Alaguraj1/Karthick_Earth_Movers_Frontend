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
import IconPencil from '@/components/icon/icon-pencil';
import IconEye from '@/components/icon/icon-eye';

const VendorPaymentManagement = () => {
    const currentUser = useSelector((state: IRootState) => state.auth.user);
    const isOwner = currentUser?.role?.toLowerCase() === 'owner';
    const { showToast } = useToast();

    // Data State
    const [allVendors, setAllVendors] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [balances, setBalances] = useState<any>({});
    const [loading, setLoading] = useState(true);

    // Filter & UI State
    const [activeTab, setActiveTab] = useState<'settlement' | 'history'>('settlement');
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [historySearch, setHistorySearch] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Settlement Logic State
    const [isFetchingSubData, setIsFetchingSubData] = useState(false);
    const [vendorTrips, setVendorTrips] = useState<any[]>([]);
    const [dieselExpenses, setDieselExpenses] = useState<number>(0);
    const [maintenanceExpenses, setMaintenanceExpenses] = useState<number>(0);
    const [dailyAdvances, setDailyAdvances] = useState<number>(0);
    const [materialRates, setMaterialRates] = useState<Record<string, string>>({});
    
    // Payment Logic
    const [paymentMode, setPaymentMode] = useState<string>('Bank');
    const [billUrl, setBillUrl] = useState<string>('');
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [alreadySettledWarning, setAlreadySettledWarning] = useState<boolean>(false);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        vendorSelected: '', // Value format: "id|type|name"
        paymentType: 'Bill',
        invoiceAmount: 0,
        referenceNumber: '',
        notes: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [balRes, expRes, transRes, payRes] = await Promise.all([
                api.get('/vendors/outstanding'),
                api.get('/vendors/explosive'),
                api.get('/vendors/transport'),
                api.get('/vendors/payments')
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
                    label: `${v.companyName ? `${v.companyName} - ` : ''}${v.name} (${v.vehicles?.length || 0} Vehicles)`
                })));
            }
            setAllVendors(vendors);
        } catch (error) {
            console.error('Fetch error:', error);
            showToast('Error fetching data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchSettlementData = async (date: string, vendorId: string, vendorType: string, currentEditingId: string | null = null) => {
        if (!date || !vendorId) return;
        try {
            setIsFetchingSubData(true);
            
            // Fetch with date range for better performance
            const [tripRes, expenseRes, advanceRes] = await Promise.all([
                api.get(`/trips?date=${date}`),
                api.get(`/expenses?startDate=${date}&endDate=${date}T23:59:59.999Z`),
                api.get(`/vendors/payments?date=${date}&paymentType=Advance`)
            ]);

            const vendor = allVendors.find(v => v._id === vendorId && v.type === vendorType);
            const vendorVehicles = vendor?.vehicles || [];
            
            const normalize = (v: string) => (v || '').replace(/[\s-]/g, '').toLowerCase();
            const extractNum = (v: string) => {
                const match = (v || '').match(/\((.*?)\)/);
                return match ? match[1] : v;
            };

            const vehicleNumbers = vendorVehicles.map((v: any) => normalize(v.vehicleNumber));

            if (tripRes.data.success) {
                const filtered = tripRes.data.data.filter((t: any) => {
                    const tripVNum = normalize(t.vehicleId?.vehicleNumber || t.vehicleId?.registrationNumber || t.manualVehicleNumber || '');
                    return vehicleNumbers.includes(tripVNum);
                });
                setVendorTrips(filtered);
            }

            let diesel = 0;
            let maintenance = 0;
            if (expenseRes.data.success) {
                expenseRes.data.data.forEach((e: any) => {
                    // Check date purely in frontend too for safety
                    const recordDate = new Date(e.date).toISOString().split('T')[0];
                    if (recordDate !== date) return;

                    // CHECK vehicleNumber FIRST, then extract from vehicleOrMachine if needed
                    const rawNum = e.vehicleNumber || extractNum(e.vehicleOrMachine);
                    const expVNum = normalize(rawNum);
                    
                    if (vehicleNumbers.includes(expVNum)) {
                        if (e.category === 'Diesel') diesel += e.amount;
                        if (e.category === 'Machine Maintenance') maintenance += e.amount;
                    }
                });
            }
            setDieselExpenses(diesel);
            setMaintenanceExpenses(maintenance);

            if (advanceRes.data.success) {
                const dayPayments = advanceRes.data.data.filter((p: any) => 
                    p.vendorId === vendorId && 
                    new Date(p.date).toISOString().split('T')[0] === date
                );

                const existingSettlements = dayPayments.filter((p: any) => p.paymentType !== 'Advance' && p._id !== currentEditingId);
                setAlreadySettledWarning(existingSettlements.length > 0);

                const advances = dayPayments
                    .filter((p: any) => p.paymentType === 'Advance')
                    .reduce((sum: number, p: any) => sum + p.paidAmount, 0);
                    
                setDailyAdvances(advances);
            }
        } catch (error) {
            console.error('SubData fetch error:', error);
            showToast('Could not load daily trip/expense data', 'error');
        } finally {
            setIsFetchingSubData(false);
        }
    };

    const uniqueMaterials = Array.from(new Set(vendorTrips.map(t => t.stoneTypeId?.name || 'General')));
    const tonsByMaterial = uniqueMaterials.reduce((acc, material) => {
        acc[material] = vendorTrips.filter(t => (t.stoneTypeId?.name || 'General') === material).reduce((sum, t) => sum + (t.loadQuantity || 0), 0);
        return acc;
    }, {} as Record<string, number>);

    const totalTons = vendorTrips.reduce((sum, t) => sum + (t.loadQuantity || 0), 0);
    const grossTotal = Object.keys(tonsByMaterial).reduce((sum, material) => sum + (tonsByMaterial[material] * Number(materialRates[material] || 0)), 0);
    const netPayable = grossTotal - dieselExpenses - maintenanceExpenses - dailyAdvances;

    const convertJfifToJpg = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return reject('Could not get canvas context');
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const newFile = new File([blob], file.name.replace(/\.jfif$/i, '.jpg'), { type: 'image/jpeg' });
                            resolve(newFile);
                        } else {
                            reject('Blob creation failed');
                        }
                    }, 'image/jpeg', 0.9);
                };
                img.onerror = () => reject('Image load failed');
                if (e.target?.result) img.src = e.target.result as string;
            };
            reader.onerror = () => reject('File read failed');
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e: any) => {
        if (e.target.files && e.target.files[0]) {
            let file = e.target.files[0];
            setIsUploading(true);
            try {
                if (file.name.toLowerCase().endsWith('.jfif')) {
                    showToast('Converting JFIF to JPG...', 'info');
                    file = await convertJfifToJpg(file);
                }
                const uploadData = new FormData();
                uploadData.append('bill', file);
                const { data } = await api.post('/upload', uploadData);
                if (data.filePath) {
                    setBillUrl(data.filePath);
                    showToast('File uploaded successfully!', 'success');
                } else {
                    showToast('Upload failed. Please try again.', 'error');
                }
            } catch (err) {
                console.error('File upload failed:', err);
                showToast('Error uploading file', 'error');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'date' || name === 'vendorSelected') {
            const dateToUse = name === 'date' ? value : formData.date;
            const vendorToUse = name === 'vendorSelected' ? value : formData.vendorSelected;
            if (dateToUse && vendorToUse) {
                const [vId, vType] = vendorToUse.split('|');
                if (vType === 'TransportVendor') {
                    if (!editingId) setMaterialRates({}); // wipe custom set temporarily
                    fetchSettlementData(dateToUse, vId, vType, editingId);
                }
            }
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!formData.vendorSelected) return showToast('Please select a vendor', 'error');
        if (alreadySettledWarning && !editingId) return showToast('Settlement already recorded for this date. Cannot duplicate.', 'error');
        try {
            const [vId, vType, vName] = formData.vendorSelected.split('|');
            const data = {
                ...formData,
                vendorId: vId,
                vendorType: vType,
                vendorName: vName,
                invoiceAmount: grossTotal,
                paidAmount: (netPayable > 0 ? netPayable : 0) + dieselExpenses + maintenanceExpenses + dailyAdvances,
                paymentMode: paymentMode,
                billUrl: billUrl,
                notes: `Daily Settlement: ${Object.keys(tonsByMaterial).map(m => `${tonsByMaterial[m].toFixed(2)} Tons of ${m} @ ₹${materialRates[m] || 0}`).join(' | ')}. Deductions: Diesel ₹${dieselExpenses}, Maint ₹${maintenanceExpenses}, Adv ₹${dailyAdvances}. ${formData.notes}`
            };

            if (editingId) {
                await api.put(`/vendors/payments/${editingId}`, data);
                showToast('Settlement updated successfully!', 'success');
            } else {
                await api.post('/vendors/payments', data);
                showToast('Settlement recorded successfully!', 'success');
            }
            resetForm();
            fetchData();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Error saving settlement', 'error');
        }
    };

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            vendorSelected: '',
            paymentType: 'Bill',
            invoiceAmount: 0,
            referenceNumber: '',
            notes: ''
        });
        setVendorTrips([]);
        setMaterialRates({});
        setDieselExpenses(0);
        setMaintenanceExpenses(0);
        setDailyAdvances(0);
        setPaymentMode('Bank');
        setBillUrl('');
        setEditingId(null);
        setAlreadySettledWarning(false);
        setActiveTab('history');
    };

    const handleEdit = (record: any) => {
        const [vId, vType] = record.vendorId && typeof record.vendorId === 'object' ? [record.vendorId._id, record.vendorType] : [record.vendorId, record.vendorType];
        
        // Parse material rates out of notes
        const parsedMaterialRates: Record<string, string> = {};
        const ratesMatch = (record.notes || '').match(/Daily Settlement: (.*?)\. Deductions:/);
        if (ratesMatch && ratesMatch[1]) {
            const sections = ratesMatch[1].split(' | ');
            sections.forEach((sec: string) => {
                const parts = sec.match(/Tons of (.*?) @ ₹(\d+(?:\.\d+)?)/);
                if (parts && parts.length === 3) {
                    parsedMaterialRates[parts[1].trim()] = parts[2];
                }
            });
        }
        setMaterialRates(parsedMaterialRates);

        const details = parseSettlementNotes(record.notes || '');

        setFormData({
            date: new Date(record.date).toISOString().split('T')[0],
            vendorSelected: `${vId}|${record.vendorType}|${record.vendorName}`,
            paymentType: record.paymentType || 'Bill',
            invoiceAmount: record.invoiceAmount || 0,
            referenceNumber: record.referenceNumber || '',
            notes: details.userNotes || record.notes || ''
        });
        setPaymentMode(record.paymentMode || 'Bank');
        setBillUrl(record.billUrl || '');
        setEditingId(record._id);
        setAlreadySettledWarning(false);
        setActiveTab('settlement');

        // Trigger sub-data fetch for the edited date/vendor
        fetchSettlementData(new Date(record.date).toISOString().split('T')[0], vId, record.vendorType, record._id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/vendors/payments/${deleteId}`);
            showToast('Record deleted!', 'success');
            setDeleteId(null);
            fetchData();
        } catch (error) {
            showToast('Error deleting record', 'error');
        }
    };

    const parseSettlementNotes = (notes: string) => {
        const tonsMatch = notes.match(/Daily Settlement: ([\d.]+) Tons @ ₹([\d.]+)/);
        const dieselMatch = notes.match(/Diesel ₹(\d+)/);
        const maintMatch = notes.match(/Maint ₹(\d+)/);
        const advMatch = notes.match(/Adv ₹(\d+)/);
        const userNotes = notes.split('. ')[4] || '';
        return {
            tons: tonsMatch ? tonsMatch[1] : '0',
            rate: tonsMatch ? tonsMatch[2] : '0',
            diesel: dieselMatch ? dieselMatch[1] : '0',
            maint: maintMatch ? maintMatch[1] : '0',
            adv: advMatch ? advMatch[1] : '0',
            userNotes
        };
    };

    const filteredPayments = payments.filter((p) =>
        p.vendorName?.toLowerCase().includes(historySearch.toLowerCase()) ||
        p.notes?.toLowerCase().includes(historySearch.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white-light">Vendor Settlement & Payment</h2>
                    <p className="text-white-dark text-sm mt-1">Daily trip earnings minus expenditures logic.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setActiveTab('settlement'); setSelectedRecord(null); }} className={`btn ${activeTab === 'settlement' ? 'btn-primary' : 'btn-outline-primary'}`}>
                        <IconPlus className="w-4 h-4 mr-2" /> New Settlement
                    </button>
                    <button onClick={() => { setActiveTab('history'); setSelectedRecord(null); }} className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-outline-primary'}`}>
                        📊 View History
                    </button>
                </div>
            </div>

            {selectedRecord && (
                <div className="panel shadow-2xl rounded-3xl border-none overflow-hidden animate__animated animate__fadeIn">
                    <div className="bg-gradient-to-r from-primary to-blue-700 p-8 text-white flex justify-between items-start">
                        <div>
                            <div className="text-[10px] font-black uppercase opacity-60 mb-2">Detailed Receipt</div>
                            <h2 className="text-3xl font-black">{selectedRecord.vendorName}</h2>
                            <p className="opacity-70 text-sm font-bold mt-1">{new Date(selectedRecord.date).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => setSelectedRecord(null)} className="text-white opacity-50 hover:opacity-100">✕ Close</button>
                    </div>
                    <div className="p-8 space-y-8">
                        {(() => {
                            const details = parseSettlementNotes(selectedRecord.notes || '');
                            const totalDed = Number(details.diesel) + Number(details.maint) + Number(details.adv);
                            return (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                            <div className="text-xs font-bold text-primary opacity-60">Gross Earnings</div>
                                            <div className="text-xl font-black">{details.tons} Tons @ ₹{details.rate}</div>
                                            <div className="text-xs font-bold mt-1">Subtotal: ₹{selectedRecord.invoiceAmount.toLocaleString()}</div>
                                        </div>
                                        <div className="p-4 bg-danger/5 rounded-xl border border-danger/10">
                                            <div className="text-xs font-bold text-danger opacity-60">Total Deductions</div>
                                            <div className="text-xl font-black text-danger">₹{totalDed.toLocaleString()}</div>
                                        </div>
                                        <div className="p-4 bg-success/5 rounded-xl border border-success/10">
                                            <div className="text-xs font-bold text-success opacity-60">Net Paid (Ledger)</div>
                                            <div className="text-xl font-black text-success">₹{(selectedRecord.invoiceAmount - totalDed).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-dark/5 rounded-xl">
                                        <h6 className="text-[10px] font-black uppercase mb-3 opacity-40">Itemized Breakdown</h6>
                                        <div className="space-y-2 text-sm font-bold">
                                            <div className="flex justify-between"><span>Diesel Cost:</span><span className="text-danger">₹{Number(details.diesel).toLocaleString()}</span></div>
                                            <div className="flex justify-between"><span>Maintenance:</span><span className="text-danger">₹{Number(details.maint).toLocaleString()}</span></div>
                                            <div className="flex justify-between"><span>Daily Advance:</span><span className="text-danger">₹{Number(details.adv).toLocaleString()}</span></div>
                                        </div>
                                    </div>
                                    {details.userNotes && <div className="p-3 bg-yellow-50 rounded-lg text-xs italic">Note: {details.userNotes}</div>}
                                </>
                            );
                        })()}
                        <button onClick={() => setSelectedRecord(null)} className="btn btn-outline-dark w-full">Back to List</button>
                    </div>
                </div>
            )}

            {!selectedRecord && activeTab === 'settlement' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <div className="panel shadow-lg rounded-2xl">
                            <h5 className="font-black text-xs uppercase mb-5 border-b pb-2">Record Settlement</h5>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div><label className="text-[10px] font-bold uppercase opacity-50">Date</label><input type="date" name="date" className="form-input font-bold" value={formData.date} onChange={handleChange} required /></div>
                                <div><label className="text-[10px] font-bold uppercase opacity-50">Transport Vendor Name</label>
                                    <select name="vendorSelected" className="form-select font-bold text-sm" value={formData.vendorSelected} onChange={handleChange} required>
                                        <option value="">Select Vendor...</option>
                                        {allVendors.map(v => (
                                            <option key={`${v._id}|${v.type}`} value={`${v._id}|${v.type}|${v.type === 'TransportVendor' && v.companyName ? `${v.companyName} - ${v.name}` : v.name}`}>
                                                {v.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {alreadySettledWarning && (
                                    <div className="p-3 bg-warning/20 border-l-4 border-warning rounded-lg text-[10px] font-black text-warning-dark uppercase">
                                        ⚠️ A settlement has already been recorded for this transport vendor on this specific date. Overwriting or proceeding could result in duplication.
                                    </div>
                                )}
                                <hr />
                                <div>
                                    <label className="text-[10px] font-bold uppercase opacity-50 block mb-2">Material Wise Rate Per Ton (₹)</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {uniqueMaterials.length === 0 && <span className="text-xs italic opacity-50 my-2">Select date & vendor</span>}
                                        {uniqueMaterials.map(material => (
                                            <div key={material} className="p-3 bg-gray-50/50 rounded-xl border border-dashed border-gray-300 dark:border-dark-light/20">
                                                <div className="text-[10px] font-bold uppercase text-primary truncate" title={material}>{material}</div>
                                                <div className="text-[10px] opacity-60 mb-2">{tonsByMaterial[material].toFixed(2)} Tons</div>
                                                <input 
                                                    type="number" 
                                                    step="0.01" 
                                                    className="form-input text-sm font-black border-primary/30 h-8" 
                                                    value={materialRates[material] || ''} 
                                                    onChange={(e) => setMaterialRates(prev => ({ ...prev, [material]: e.target.value }))} 
                                                    placeholder="0" 
                                                    required 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[9px] opacity-40 mt-2">Overall Total: {totalTons.toFixed(2)} Tons</p>
                                </div>
                                <div><label className="text-[10px] font-bold uppercase opacity-50">Reference/Notes</label>
                                    <input type="text" name="referenceNumber" className="form-input text-xs mb-2" value={formData.referenceNumber} onChange={handleChange} placeholder="Bill #" />
                                    <textarea name="notes" className="form-textarea text-xs" rows={2} value={formData.notes} onChange={handleChange} placeholder="Note..."></textarea>
                                </div>
                                <hr />
                                <div className="p-4 bg-success/10 border-l-4 border-success rounded mt-4 mb-4 font-black">
                                    <div className="text-[10px] uppercase opacity-70 mb-1">Final Amount To Pay</div>
                                    <div className="text-2xl text-success">₹ {(netPayable > 0 ? netPayable : 0).toLocaleString()}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase opacity-50 block mb-2">Payment Mode</label>
                                        <select className="form-select text-xs font-bold w-full" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                                            <option value="Bank">Bank Transfer</option>
                                            <option value="Cash">Cash</option>
                                            <option value="UPI">UPI</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase opacity-50 block mb-2">Attach Receipt</label>
                                        <label className={`btn btn-sm ${billUrl ? 'btn-success' : 'btn-outline-primary'} w-full flex items-center justify-center gap-2 cursor-pointer h-[38px]`}>
                                            <input type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} accept="image/*,.pdf" />
                                            {isUploading ? (
                                                <span className="animate-spin inline-block w-4 h-4 border-[2px] border-current border-t-transparent rounded-full"></span>
                                            ) : (
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4V20M12 4L8 8M12 4L16 8M4 12V16C4 18.2091 5.79086 20 8 20H16C18.2091 20 20 18.2091 20 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            )}
                                            <span className="text-[10px]">{billUrl ? 'Receipt Attached (✓)' : isUploading ? 'Uploading...' : 'Upload File'}</span>
                                        </label>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary w-full py-4 mt-6 font-black uppercase tracking-widest text-xs" disabled={isFetchingSubData || grossTotal === 0 || (alreadySettledWarning && !editingId)}>
                                    <IconSave className="mr-2 w-4 h-4" />
                                    {editingId ? 'Update Settlement' : 'Save Settlement'}
                                </button>
                                {editingId && <button type="button" onClick={resetForm} className="btn btn-outline-danger w-full mt-2 text-xs">Cancel Edit</button>}
                            </form>
                        </div>
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="panel bg-primary text-white p-6 rounded-2xl shadow-xl">
                                <h6 className="text-[10px] font-black uppercase opacity-60 mb-8">Gross Earnings</h6>
                                <div className="text-3xl font-black">₹{grossTotal.toLocaleString()}</div>
                                <div className="text-xs mt-2 opacity-70">{totalTons.toFixed(2)} Tons Brought</div>
                            </div>
                            <div className="panel bg-white dark:bg-dark p-6 rounded-2xl shadow-xl border-l-4 border-danger flex flex-col justify-between">
                                <div>
                                    <h6 className="text-[10px] font-black uppercase opacity-60 mb-2 text-danger">Total Deductions</h6>
                                    <div className="text-3xl font-black text-danger">₹{(dieselExpenses + maintenanceExpenses + dailyAdvances).toLocaleString()}</div>
                                </div>
                                <div className="mt-4 space-y-2 border-t border-danger/10 pt-4">
                                    <div className="flex justify-between text-[10px] font-black uppercase">
                                        <span className="opacity-40">Diesel (டீசல்)</span>
                                        <span className="text-danger">₹{dieselExpenses.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black uppercase">
                                        <span className="opacity-40">Maintenance (பராமரிப்பு)</span>
                                        <span className="text-danger">₹{maintenanceExpenses.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black uppercase">
                                        <span className="opacity-40">Daily Advance (முன்பணம்)</span>
                                        <span className="text-danger">₹{dailyAdvances.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="panel p-8 text-center bg-success/5 rounded-2xl border-2 border-dashed border-success/20">
                            <div className="text-[10px] font-black uppercase text-success mb-1">Final Net Payable</div>
                            <div className={`text-5xl font-black ${netPayable < 0 ? 'text-danger' : 'text-success'}`}>₹{Math.abs(netPayable).toLocaleString()}</div>
                        </div>
                        <div className="panel rounded-2xl overflow-hidden">
                            <h6 className="text-[10px] font-black uppercase p-4 border-b bg-gray-50/50">Daily Trip Log (Verification)</h6>
                            <div className="table-responsive">
                                <table className="table-sm">
                                    <thead><tr className="text-[10px] uppercase font-bold text-dark/40"><th>Vehicle</th><th>Material</th><th>Route</th><th className="text-right">Tons</th></tr></thead>
                                    <tbody>
                                        {vendorTrips.length === 0 ? <tr><td colSpan={3} className="text-center py-8 opacity-20 italic">No trips found.</td></tr> : 
                                            vendorTrips.map((t, idx) => (
                                                <tr key={idx}>
                                                    <td className="font-bold text-xs">{(t.vehicleId?.vehicleNumber || t.manualVehicleNumber || 'N/A').toUpperCase()}</td>
                                                    <td className="text-[10px] text-secondary font-semibold">{t.stoneTypeId?.name || 'General'}</td>
                                                    <td className="text-[10px]">{t.fromLocation} → {t.toLocation}</td>
                                                    <td className="text-right font-black text-xs">{t.loadQuantity || 0}</td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!selectedRecord && activeTab === 'history' && (
                <div className="panel shadow-lg rounded-2xl border-none">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b">
                        <h5 className="font-black text-lg">History</h5>
                        <input type="text" placeholder="Search..." className="form-input w-full max-w-xs text-xs" value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} />
                    </div>
                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead><tr className="text-[10px] uppercase font-black text-dark/40"><th>Date</th><th>Transport Vendor Name</th><th className="text-right">Net Bill</th><th>Details</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody>
                                {filteredPayments.length === 0 ? <tr><td colSpan={6} className="text-center py-20 italic">No history found.</td></tr> :
                                    filteredPayments.map(p => (
                                        <tr key={p._id}>
                                            <td className="text-xs font-bold">{new Date(p.date).toLocaleDateString()}</td>
                                            <td className="text-xs font-black">{p.vendorName}</td>
                                            <td className="text-right text-primary font-black">₹{p.invoiceAmount.toLocaleString()}</td>
                                            <td className="text-[10px] opacity-70 italic max-w-sm leading-relaxed">{p.notes}</td>
                                            <td><span className="badge bg-success text-[9px] uppercase tracking-wider">Paid</span></td>
                                            <td>
                                                <div className="flex gap-2 items-center">
                                                    <button onClick={() => setSelectedRecord(p)} className="text-primary p-1 hover:bg-primary/10 rounded" title="View Details"><IconEye className="w-5 h-5" /></button>
                                                    <button onClick={() => handleEdit(p)} className="text-info p-1 hover:bg-info/10 rounded"><IconPencil className="w-4 h-4" /></button>
                                                    {isOwner && <button onClick={() => setDeleteId(p._id)} className="text-danger p-1 hover:bg-danger/10 rounded"><IconTrashLines className="w-4 h-4" /></button>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <DeleteConfirmModal show={!!deleteId} onCancel={() => setDeleteId(null)} onConfirm={confirmDelete} title="Confirm" message="Delete this record?" />
        </div>
    );
};

export default VendorPaymentManagement;
