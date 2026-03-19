'use client';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

interface WorkflowStep {
    stepNo: number;
    titleTamil: string;
    titleEnglish: string;
    descriptionTamil: string;
    fields: { name: string; tamil: string; required: boolean }[];
    tips: string[];
}

interface WorkflowSection {
    id: string;
    icon: string;
    titleTamil: string;
    titleEnglish: string;
    color: string;
    gradient: string;
    overviewTamil: string;
    steps: WorkflowStep[];
    roles: string[];
}

const workflowData: WorkflowSection[] = [
    {
        id: 'system-flow',
        icon: '🔄',
        titleTamil: 'ஒட்டுமொத்த பணிப்பாய்வு',
        titleEnglish: 'Overall System Flow',
        color: '#6366f1',
        gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        overviewTamil: 'இந்த மென்பொருளை சரியாக பயன்படுத்த, தரவுகளை ஒரு குறிப்பிட்ட வரிசையில் உள்ளீடு செய்ய வேண்டும். முதலில் அடிப்படை தகவல்களை (Masters) பதிவு செய்த பின்னரே தினசரி பதிவுகளை செய்ய முடியும்.',
        steps: [
            {
                stepNo: 1,
                titleTamil: 'படி 1: அடிப்படை பதிவுகள் (Masters)',
                titleEnglish: 'Step 1: Master Registration',
                descriptionTamil: 'எந்தவொரு தினசரி பதிவையும் செய்வதற்கு முன், இவற்றை முதலில் பதிவு செய்ய வேண்டும்.',
                fields: [
                    { name: 'Stone Types', tamil: 'கல் வகைகளை அமைத்தல்', required: true },
                    { name: 'Categories', tamil: 'எந்திரம், வாகனம் மற்றும் செலவு வகைகள்', required: true },
                    { name: 'Vendor / Customer', tamil: 'சப்ளையர் மற்றும் வாடிக்கையாளர்', required: true },
                    { name: 'Vehicles / Machines', tamil: 'எல்லா வண்டிகள் & இயந்திரங்கள்', required: true },
                    { name: 'Labour List', tamil: 'எல்லா தொழிலாளர்கள்', required: true },
                ],
                tips: [
                    'முதலில் "Masters" மெனுவில் அனைத்து வகைகளையும் (Categories) உருவாக்கவும்.',
                    'Vendor Management மற்றும் Sales-ல் வாடிக்கையாளர்களை பதிவு செய்யவும்.',
                    'Machine & Vehicle மற்றும் Labour Management-ல் அடிப்படை தரவுகளை பதிவு செய்யவும்.',
                ],
            },
            {
                stepNo: 2,
                titleTamil: 'படி 2: தினசரி பதிவுகள் (Daily Operations)',
                titleEnglish: 'Step 2: Daily Operations',
                descriptionTamil: 'அடிப்படை தகவல்கள் உள்ளிடப்பட்ட பிறகு, அன்றக வேலைகளை பதிவு செய்யலாம்.',
                fields: [
                    { name: 'Daily Attendance', tamil: 'தொழிலாளர் வருகை (Labour List-ல் இருந்து)', required: true },
                    { name: 'Transport Trips', tamil: 'வாகன டிரிப்கள் பதிவு நிலை', required: true },
                ],
                tips: [
                    'தினமும் காலையில் வருகை (Attendance) பதிவு செய்யவும்.',
                    'ஓடும் டிரிப்களை (Trips) அன்றாடம் Transport மெனுவில் பதிவு செய்யவும்.',
                ],
            },
            {
                stepNo: 3,
                titleTamil: 'படி 3: செலவு மற்றும் விற்பனை (Expenses & Sales)',
                titleEnglish: 'Step 3: Expenses Tracking & Sales',
                descriptionTamil: 'பராமரிப்பு மற்றும் செலவுகளை நிர்வகித்தல், அத்துடன் விற்பனை பதிவுகளை உருவாக்குதல்.',
                fields: [
                    { name: 'Expenses', tamil: 'டீசல், பராமரிப்பு, வெடிமருந்து செலவுகள்', required: true },
                    { name: 'Direct Sales', tamil: 'வாடிக்கையாளருக்கு সরাসরি பில் (Sales Entry)', required: true },
                    { name: 'Trip Conversion', tamil: 'Transport Trips-ஐ Sales ஆக மாற்றுதல்', required: false },
                ],
                tips: [
                    'Diesel, Maintenance போன்ற செலவுகளை அந்தந்த Expenses பக்கத்தில் வண்டி/இயந்திரத்தை தேர்வு செய்து பதியவும்.',
                    'கல் விற்பனையை Sales Entry மூலம் உருவாக்கலாம் அல்லது Transport Trip பக்கத்தில் "Convert to Sale" செய்யலாம்.',
                ],
            },
            {
                stepNo: 4,
                titleTamil: 'படி 4: தீர்வு & அறிக்கைகள் (Final Settlements)',
                titleEnglish: 'Step 4: Final Settlements',
                descriptionTamil: 'பதிவுகளுக்கு இறுதியாக கணக்கு முடித்தல் மற்றும் அறிக்கைகளை கவனித்தல்.',
                fields: [
                    { name: 'Wages Calculation', tamil: 'சம்பளம் கணக்கீடு (Attendance இலிருந்து)', required: true },
                    { name: 'Vendor Payments', tamil: 'கான்ட்ராக்டர், சப்ளையர்களுக்கு பணம் கொடுத்தல்', required: true },
                    { name: 'Sales Payments', tamil: 'வாடிக்கையாளர் கொடுத்த பணம் (Pending Payments) பதிவு', required: true },
                ],
                tips: [
                    'Vendor Payment மற்றும் Pending Payments-ல் பணப்பரிவர்த்தனையை முடிக்கவும்.',
                    'Accounts & Reports மெனுவில் Day Book, Cash Flow-ல் அனைத்தையும் கண்காணிக்கவும்.',
                ],
            },
        ],
        roles: ['owner', 'admin', 'manager', 'supervisor', 'accountant'],
    },
    {
        id: 'masters',
        icon: '📋',
        titleTamil: 'அடிப்படை தரவுகள் அமைத்தல்',
        titleEnglish: 'Masters Registration',
        color: '#14b8a6',
        gradient: 'linear-gradient(135deg, #14b8a6, #0f766e)',
        overviewTamil: 'மென்பொருளின் அடிப்படை வகைகளை உருவாக்கும் இடம். இங்கு உருவாக்கப்படும் வகைகள்தான் மற்ற அனைத்து இடங்களிலும் Dropdown ஆப்ஷனாக வரும்.',
        steps: [
            {
                stepNo: 1,
                titleTamil: 'வகைகள் (Categories) உருவாக்குதல்',
                titleEnglish: 'Add Categories & Types',
                descriptionTamil: 'Sidebar மெனுவில் Masters கிளிக் செய்து உள்ளே சென்று வகைகளை உருவாக்கவும்.',
                fields: [
                    { name: 'Stone Types', tamil: 'M-Sand, Jelly போன்ற கல் வகைகள்', required: true },
                    { name: 'Explosive Materials', tamil: 'குவாரியில் பயன்படும் வெடிமருந்து வகைகள்', required: true },
                    { name: 'Vehicle Categories', tamil: 'Tipper, Lorry போன்ற വാഹന வகைகள்', required: true },
                    { name: 'Machine Categories', tamil: 'JCB, Breaker போன்ற இயந்திர வகைகள்', required: true },
                    { name: 'Expense Categories', tamil: 'கூடுதல் செலவு வகைகள்', required: true },
                ],
                tips: ['இவற்றை ஒருமுறை மட்டும் பதிவு செய்தால் போதுமானது.'],
            }
        ],
        roles: ['owner', 'admin', 'manager'],
    },
    {
        id: 'expenses',
        icon: '💰',
        titleTamil: 'செலவு பதிவு',
        titleEnglish: 'Expense Entry',
        color: '#ef4444',
        gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
        overviewTamil: 'குவாரியின் அனைத்து செலவுகளையும் வகை வாரியாக பதிவு செய்யும் பகுதி.',
        steps: [
            {
                stepNo: 1,
                titleTamil: 'செலவு வகை தேர்வு',
                titleEnglish: 'Select Category',
                descriptionTamil: 'Sidebar மெனுவில் Expenses → தேவையான வகையை தேர்வு செய்யவும்.',
                fields: [
                    { name: 'Diesel / Fuel', tamil: 'டீசல் பதிவு (வண்டியை தேர்வு செய்யவும்)', required: true },
                    { name: 'Maintenance', tamil: 'பராமரிப்பு செலவுகள்', required: true },
                    { name: 'Labour Wages', tamil: 'தொழிலாளர் கூலி (attendance இருந்து)', required: false },
                    { name: 'Explosive Cost', tamil: 'வெடிமருந்து செலவுகள்', required: false },
                    { name: 'Transport', tamil: 'போக்குவரத்து சார் செலவுகள்', required: false },
                    { name: 'Office & Misc', tamil: 'இதர அலுவலக செலவுகள்', required: false },
                ],
                tips: ['உதாரணமாக Diesel பக்கத்தில் வாகன எண்ணை தேர்வு செய்து டீசல் அளவை பதிவிடலாம்.'],
            }
        ],
        roles: ['owner', 'manager', 'supervisor'],
    },
    {
        id: 'sales',
        icon: '🧾',
        titleTamil: 'விற்பனை & பில்லிங்',
        titleEnglish: 'Sales & Billing',
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        overviewTamil: 'கல் விற்பனை, இன்வாய்ஸ், ரொக்கம்/கடன் விற்பனை மற்றும் நிலுவை தொகையை நிர்வகிக்கும் பகுதி.',
        steps: [
            {
                stepNo: 1,
                titleTamil: 'வாடிக்கையாளர் & விற்பனை',
                titleEnglish: 'Sales Pipeline',
                descriptionTamil: 'முதலில் Customer Management-ல் வாடிக்கையாளரை பதிவு தேவைானால் செய்யவும், பின்பு Sales Entry போடவும்.',
                fields: [
                    { name: 'Customer Management', tamil: 'வாடிக்கையாளர் பதிவு', required: true },
                    { name: 'Sales Entry', tamil: 'விற்பனை பில் தயாரித்தல்', required: true },
                    { name: 'Invoice Generation', tamil: 'விற்பனைக்கு Invoice உருவாக்குதல்', required: false },
                    { name: 'Cash / Credit Sales', tamil: 'பண / கடன் விற்பனைகளை தனித்தனியே பார்த்தல்', required: false },
                    { name: 'Pending Payments', tamil: 'கடன் நிலுவை தொகையை வசூலித்தல் ஆப்ஷன்', required: true },
                ],
                tips: [
                    'Sales Entry-உடனே Amount தானாக கணக்கிடப்படும். "Credit" என தேர்வு செய்தால் Payment நிலுவையில் இருக்கும்.',
                    'Pending Payments-ல் பணம் பெற்றதை Update செய்தால் "Paid" என மாறும்.',
                ],
            }
        ],
        roles: ['owner', 'manager', 'accountant'],
    },
    {
        id: 'assets',
        icon: '🏗️',
        titleTamil: 'இயந்திரம் & வாகன மேலாண்மை',
        titleEnglish: 'Machine & Vehicle Management',
        color: '#ec4899',
        gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
        overviewTamil: 'இயந்திரங்கள் மற்றும் வாகனங்களை நிர்வகிக்கும் அடிப்படை பகுதி.',
        steps: [
            {
                stepNo: 1,
                titleTamil: 'இயந்திரம்/வாகனம் பதிவு',
                titleEnglish: 'Register Machine/Vehicle',
                descriptionTamil: 'Machine & Vehicle மெனுவில் சென்று புதிய இயந்திரம் அல்லது வாகனத்தை தரவு தளத்தில் சேர்க்கவும்.',
                fields: [
                    { name: 'Machine Details', tamil: 'இயந்திர விவரங்கள் (Ex: JCB, Breaker)', required: true },
                    { name: 'Vehicle Details', tamil: 'வாகன விவரங்கள் (Ex: Tipper, Lorry)', required: true },
                ],
                tips: [
                    'வண்டிகளை சேர்க்கும்போது Masters -> Category சரியாக தேர்ந்தெடுத்து இருக்க வேண்டும்.',
                    'இங்கு பதிவிடும் வண்டிகள் தான் Diesel Expense பக்கத்தில் Dropdown-ல் வரும்.'
                ],
            }
        ],
        roles: ['owner', 'manager', 'supervisor'],
    },
    {
        id: 'labour',
        icon: '👷',
        titleTamil: 'தொழிலாளர் மேலாண்மை',
        titleEnglish: 'Labour Management',
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        overviewTamil: 'தொழிலாளர் வரவு, வருகை கணக்கீடு மற்றும் சம்பளம் வழங்குதல்.',
        steps: [
            {
                stepNo: 1,
                titleTamil: 'தொழிலாளர் பதிவேடு',
                titleEnglish: 'Labour Pipeline',
                descriptionTamil: 'கீழ்க்காணும் முறையில் தொழிலாளர்களின் சம்பளம் மற்றும் வருகையை சீரமைக்கவும்.',
                fields: [
                    { name: 'Labour List', tamil: 'தொழிலாளர் பதிவு (Direct/Vendor என தேர்வு செய்யவும்)', required: true },
                    { name: 'Daily Attendance', tamil: 'தினசரி வருகை பதிவு (Present/Absent/Half)', required: true },
                    { name: 'Wages Calculation', tamil: 'கணக்கிடப்பட்ட சம்பளம் (Attendance-லிருந்து)', required: true },
                    { name: 'Advance Payment', tamil: 'முன்பணம் கொடுத்ததை பதிவு செய்தல்', required: false },
                    { name: 'Labour Report', tamil: 'தொழிலாளர்களின் முழுமையான அறிக்கை', required: false },
                ],
                tips: [
                    'Vendor ஆளாக இருந்தால் Vendor Management பகுதியிலும் Contractor ஐ பதிவு செய்திருக்க வேண்டும்.',
                ],
            }
        ],
        roles: ['owner', 'manager', 'supervisor'],
    },
    {
        id: 'transport',
        icon: '🚛',
        titleTamil: 'போக்குவரத்து மேலாண்மை',
        titleEnglish: 'Transport Management',
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
        overviewTamil: 'வாகன டிரிப் பதிவு மற்றும் டிரைவர் கட்டணம் ஆகியவற்றை நிர்வகிக்கும் பகுதி.',
        steps: [
            {
                stepNo: 1,
                titleTamil: 'டிரிப் மற்றும் டிரைவர்கள்',
                titleEnglish: 'Trips & Driver Pay',
                descriptionTamil: 'ஒவ்வொரு டிரிப்பின் விவரங்களையும் முறையாக பதிவு செய்து அதற்கான பில்களை உருவாக்குங்கள்.',
                fields: [
                    { name: 'Vehicle Trip Management', tamil: 'டிரிப் பதிவு செய்தல் மற்றும் "Convert to Sale" மூலம் நேரடியாக Sales Entry ஆக்குதல்', required: true },
                    { name: 'Driver Payment', tamil: 'டிரைவர்களுக்கு செய்த கட்டணம்', required: true },
                    { name: 'Permit Management', tamil: 'வண்டி பாஸ் மற்றும் பெர்மிட் மேலாண்மை', required: false },
                ],
                tips: [
                    'டிரிப் பதிவில் Customer பெயர் இருந்தால், அதை ஒரே கிளிக்கில் Sales Invoice-ஆக மாற்றிவிடலாம்!',
                ],
            }
        ],
        roles: ['owner', 'manager', 'supervisor'],
    },
    {
        id: 'vendors',
        icon: '🏪',
        titleTamil: 'விநியோகஸ்தர் மேலாண்மை',
        titleEnglish: 'Vendor Management',
        color: '#06b6d4',
        gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
        overviewTamil: 'வெடிமருந்து சப்ளையர், தொழிலாளர் கான்ட்ராக்டர் மற்றும் போக்குவரத்து விநியோகஸ்தர் நிர்வகிப்பு.',
        steps: [
            {
                stepNo: 1,
                titleTamil: 'சப்ளையர் கணக்குகள்',
                titleEnglish: 'Vendor Pipeline',
                descriptionTamil: 'விற்பனையாளர்கள் (Vendors) அமைத்து அவர்களின் பண மதிப்புகளை கண்காணிக்கவும்.',
                fields: [
                    { name: 'Explosive Suppliers', tamil: 'வெடிமருந்து சப்ளையர்கள்', required: false },
                    { name: 'Labour Contractors', tamil: 'கான்ட்ராக்டர்கள்', required: false },
                    { name: 'Transport Vendors', tamil: 'போக்குவரத்து சப்ளையர்கள்', required: false },
                    { name: 'Payment History', tamil: 'விநியோகஸ்தருக்கு செய்த பேமென்ட்', required: true },
                    { name: 'Outstanding Balance', tamil: 'விநியோகஸ்தர்களுக்கு தரவேண்டிய நிலுவை', required: true },
                ],
                tips: ['Vendor Payment செய்யும் போது Outstanding Balance தானாகக் குறையும்.'],
            }
        ],
        roles: ['owner', 'manager', 'accountant'],
    },
    {
        id: 'reports',
        icon: '📊',
        titleTamil: 'கணக்கு & அறிக்கைகள்',
        titleEnglish: 'Accounts & Reports',
        color: '#64748b',
        gradient: 'linear-gradient(135deg, #64748b, #475569)',
        overviewTamil: 'தினசரி புத்தகம், பணப்புழக்கம், லாப நஷ்ட கணக்கு ஆகியவற்றை பார்க்கும் பகுதி.',
        steps: [
            {
                stepNo: 1,
                titleTamil: 'அறிக்கை பார்த்தல்',
                titleEnglish: 'View Reports',
                descriptionTamil: 'எல்லா Data Entry-ம் முடிக்கப்பட்ட பின்னர் இங்கு அறிக்கையாகக் காணலாம்.',
                fields: [
                    { name: 'Day Book', tamil: 'இன்றைய முழு வரவு செலவு (Day Book)', required: true },
                    { name: 'Cash Flow Statement', tamil: 'பணப்புழக்கம் அறிக்கை', required: true },
                    { name: 'Profit & Loss A/c', tamil: 'நஷ்ட லாப அறிக்கை', required: true },
                    { name: 'Monthly/Yearly Reports', tamil: 'மொத்த சுருக்க அறிக்கை', required: true },
                ],
                tips: ['Date Filter பயன்படுத்தி தேவைப்படும் நாட்களுக்கான அறிக்கையை PDF ஆக பதிவிறக்கலாம்.'],
            }
        ],
        roles: ['owner', 'accountant'],
    },
];

const DataEntryWorkflow = () => {
    const [activeSection, setActiveSection] = useState<string>('system-flow');
    const [expandedStep, setExpandedStep] = useState<number | null>(null);
    const currentUser = useSelector((state: IRootState) => state.auth.user);
    const userRole = currentUser?.role?.toLowerCase() || 'all';
    const isAdmin = userRole === 'owner' || userRole === 'admin';

    useEffect(() => {
        if (userRole && userRole !== 'all') {
            // Default to first visible section for this role
            // Skip 'system-flow' as default for specific roles to get them straight to their modules
            const firstVisible = workflowData.find(s => s.id !== 'system-flow' && s.roles.includes(userRole));
            if (firstVisible) {
                setActiveSection(firstVisible.id);
            } else {
                const anyVisible = workflowData.find(s => s.roles.includes(userRole));
                if (anyVisible) setActiveSection(anyVisible.id);
            }
        }
    }, [userRole]);

    const filteredSections = workflowData.filter((s: any) =>
        isAdmin || s.roles.includes(userRole)
    );

    const activeData = workflowData.find((s) => s.id === activeSection);

    return (
        <div className="min-h-screen">
            {/* Page Header */}
            <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white shadow-2xl">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
                <div className="relative z-10">
                    <h1 className="mb-2 text-3xl font-black tracking-tight">📋 Data Entry Workflow</h1>
                    <h2 className="mb-1 text-xl font-semibold text-white/90">தரவு பதிவு செயல்முறை வழிகாட்டி</h2>
                    <p className="text-sm text-white/75">கார்த்திக் எர்த் மூவர்ஸ் - கல் குவாரி மேலாண்மை அமைப்பு</p>
                    <p className="mt-3 text-sm leading-relaxed text-white/80">
                        இந்த பக்கத்தில் ஒவ்வொரு Data Entry செயல்முறையும் படிப்படியாக தமிழில் விளக்கப்பட்டுள்ளது.
                        உங்கள் பொறுப்பை (Role) தேர்வு செய்து உங்களுக்கு தேவையான வழிமுறைகளை மட்டும் பார்க்கலாம்.
                    </p>
                </div>
            </div>



            {/* Visual Workflow Path */}
            <div className="mb-8 overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-6 text-lg font-black text-gray-800 dark:text-white flex items-center gap-2">
                    <span className="text-2xl">🔗</span> Module Connection Flow (தரவு ஓட்டம்)
                </h3>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
                    {/* Background connecting line for desktop */}
                    <div className="hidden md:block absolute top-[45%] left-10 right-10 h-1 bg-gray-200 dark:bg-gray-700 z-0 rounded-full"></div>

                    {/* Step 1 */}
                    <div className="flex-1 rounded-2xl bg-white p-5 border-2 border-indigo-100 text-center w-full dark:bg-gray-800 dark:border-indigo-900 shadow-[0_10px_20px_-10px_rgba(99,102,241,0.2)] z-10 transition-transform hover:-translate-y-1">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-2xl font-black mb-3 border border-indigo-200 dark:border-indigo-800">1</div>
                        <h4 className="font-extrabold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider text-xs mb-1">Step 1: Masters</h4>
                        <p className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-2">அடிப்படை தரவு</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">Vehicles, Labours, Customers, Vendors, Stone Types, Lease Owners</p>
                    </div>

                    <div className="md:hidden text-2xl text-gray-300 font-black">⬇</div>

                    {/* Step 2 */}
                    <div className="flex-1 rounded-2xl bg-white p-5 border-2 border-blue-100 text-center w-full dark:bg-gray-800 dark:border-blue-900 shadow-[0_10px_20px_-10px_rgba(59,130,246,0.2)] z-10 transition-transform hover:-translate-y-1">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-2xl font-black mb-3 border border-blue-200 dark:border-blue-800">2</div>
                        <h4 className="font-extrabold text-blue-700 dark:text-blue-300 uppercase tracking-wider text-xs mb-1">Step 2: Operations</h4>
                        <p className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-2">தினசரி வேலைகள்</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">Labour Attendance, Transport Trips, Daily Operations Setup</p>
                    </div>

                    <div className="md:hidden text-2xl text-gray-300 font-black">⬇</div>

                    {/* Step 3 */}
                    <div className="flex-1 rounded-2xl bg-white p-5 border-2 border-amber-100 text-center w-full dark:bg-gray-800 dark:border-amber-900 shadow-[0_10px_20px_-10px_rgba(245,158,11,0.2)] z-10 transition-transform hover:-translate-y-1">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 text-2xl font-black mb-3 border border-amber-200 dark:border-amber-800">3</div>
                        <h4 className="font-extrabold text-amber-700 dark:text-amber-300 uppercase tracking-wider text-xs mb-1">Step 3: Transact</h4>
                        <p className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-2">செலவு & விற்பனை</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">Diesel, Maintenance, Wages, Billing Entries, Invoices Generated</p>
                    </div>

                    <div className="md:hidden text-2xl text-gray-300 font-black">⬇</div>

                    {/* Step 4 */}
                    <div className="flex-1 rounded-2xl bg-white p-5 border-2 border-emerald-100 text-center w-full dark:bg-gray-800 dark:border-emerald-900 shadow-[0_10px_20px_-10px_rgba(16,185,129,0.2)] z-10 transition-transform hover:-translate-y-1">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-2xl font-black mb-3 border border-emerald-200 dark:border-emerald-800">4</div>
                        <h4 className="font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider text-xs mb-1">Step 4: Finalize</h4>
                        <p className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-2">தீர்வு & அறிக்கை</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">Vendor Payments, Day Book, Cash Flow, Pending Payment Collections</p>
                    </div>
                </div>

                <div className="mt-8 rounded-2xl border-2 border-gray-100 p-5 dark:border-gray-700 dark:bg-gray-800/50 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <p className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                        <span className="w-2 h-6 bg-primary rounded-full block"></span>
                        Connected Modules (இணைக்கப்பட்ட பகுதிகள் எப்படி இயங்குகிறது):
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 relative z-10">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-[11px] uppercase tracking-wide mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Labour To Wages To Payment</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-medium">
                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Master (Labour)</span>
                                <span>➔</span>
                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Daily Attendance</span>
                                <span>➔</span>
                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Wages Calculation</span>
                                <span>➔</span>
                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Vendor Payment (If Contractor)</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-[11px] uppercase tracking-wide mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Transport To Sales Generation</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-medium">
                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Transport Trips Entry</span>
                                <span>➔</span>
                                <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded font-bold border border-emerald-100 dark:border-emerald-800">Convert to Sale Button</span>
                                <span>➔</span>
                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Sales Entry Auto Created</span>
                                <span>➔</span>
                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Generate Invoice</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-[11px] uppercase tracking-wide mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Machine/Vehicle To Expenses</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-medium">
                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Master (Machine/Vehicle)</span>
                                <span>➔</span>
                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Diesel Used</span>
                                <span>&amp;</span>
                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Maintenance Expense</span>
                                <span>➔</span>
                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-primary font-bold">Reflected in Accounts</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-[11px] uppercase tracking-wide mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Sales To Payment Lifecycle</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-medium">
                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Master (Customer)</span>
                                <span>➔</span>
                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Credit Sales Entry</span>
                                <span>➔</span>
                                <span className="bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 px-2 py-1 rounded font-bold border border-rose-100 dark:border-rose-800">Pending Payments Log</span>
                                <span>➔</span>
                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Receive Cash & Update Status</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                {filteredSections.map((section: any) => (
                    <button
                        key={section.id}
                        onClick={() => { setActiveSection(section.id); setExpandedStep(null); }}
                        className={`group relative overflow-hidden rounded-xl border-2 p-3 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg ${activeSection === section.id
                            ? 'border-transparent shadow-lg'
                            : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800'
                            }`}
                        style={activeSection === section.id ? { background: section.gradient, color: 'white' } : {}}
                    >
                        <div className="text-2xl">{section.icon}</div>
                        <div className="mt-1 text-[10px] font-bold uppercase tracking-wider">{section.titleEnglish}</div>
                        <div className="mt-0.5 text-[10px] font-medium opacity-80">{section.titleTamil}</div>
                    </button>
                ))}
            </div>

            {/* Active Section Content */}
            {activeData && (
                <div className="space-y-6">
                    {/* Section Header */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-md" style={{ background: activeData.gradient }}>
                                {activeData.icon}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-800 dark:text-white">
                                    {activeData.titleTamil} <span className="text-lg font-medium text-gray-400">({activeData.titleEnglish})</span>
                                </h3>
                                <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{activeData.overviewTamil}</p>
                            </div>
                        </div>

                        {/* Navigation Path */}
                        <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">📍 வழிசெலுத்தல் (Navigation Path)</p>
                            <p className="mt-1 font-mono text-sm font-bold" style={{ color: activeData.color }}>
                                Sidebar Menu → {activeData.titleEnglish} → Sub Pages
                            </p>
                        </div>
                    </div>

                    {/* Steps */}
                    <div className="space-y-4">
                        {activeData.steps.map((step, idx) => (
                            <div
                                key={idx}
                                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                            >
                                {/* Step Header */}
                                <button
                                    onClick={() => setExpandedStep(expandedStep === idx ? null : idx)}
                                    className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                    <div
                                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-black text-white shadow-md"
                                        style={{ background: activeData.gradient }}
                                    >
                                        {step.stepNo}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-bold text-gray-800 dark:text-white">
                                            படி {step.stepNo}: {step.titleTamil}
                                        </h4>
                                        <p className="text-sm text-gray-400">{step.titleEnglish}</p>
                                    </div>
                                    <div className={`text-xl transition-transform duration-300 ${expandedStep === idx ? 'rotate-180' : ''}`}>
                                        ▼
                                    </div>
                                </button>

                                {/* Step Content */}
                                <div className={`transition-all duration-500 ease-in-out ${expandedStep === idx ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                                    <div className="border-t border-gray-100 p-5 dark:border-gray-700">
                                        {/* Description */}
                                        <div className="mb-5 rounded-xl bg-blue-50/70 p-4 dark:bg-blue-900/20">
                                            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">📝 விளக்கம்:</p>
                                            <p className="mt-1 text-sm leading-relaxed text-blue-700 dark:text-blue-200">{step.descriptionTamil}</p>
                                        </div>

                                        {/* Fields Table */}
                                        <div className="mb-5">
                                            <p className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">📋 நிரப்ப வேண்டிய புலங்கள் (Fields):</p>
                                            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="bg-gray-50 dark:bg-gray-700">
                                                            <th className="px-4 py-2.5 text-left font-bold text-gray-600 dark:text-gray-300">Field Name</th>
                                                            <th className="px-4 py-2.5 text-left font-bold text-gray-600 dark:text-gray-300">தமிழ் விளக்கம்</th>
                                                            <th className="px-4 py-2.5 text-center font-bold text-gray-600 dark:text-gray-300">கட்டாயம்?</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {step.fields.map((field, fIdx) => (
                                                            <tr key={fIdx} className="border-t border-gray-100 dark:border-gray-600">
                                                                <td className="px-4 py-2 font-mono text-xs font-semibold text-gray-800 dark:text-gray-200">{field.name}</td>
                                                                <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{field.tamil}</td>
                                                                <td className="px-4 py-2 text-center">
                                                                    {field.required ? (
                                                                        <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                                                            ✓ ஆம்
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                                                            விருப்பம்
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Tips */}
                                        <div className="rounded-xl bg-amber-50/70 p-4 dark:bg-amber-900/20">
                                            <p className="mb-2 text-sm font-bold text-amber-700 dark:text-amber-300">💡 குறிப்புகள் (Tips):</p>
                                            <ul className="space-y-1">
                                                {step.tips.map((tip, tIdx) => (
                                                    <li key={tIdx} className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-200">
                                                        <span className="mt-0.5 text-amber-500">▸</span>
                                                        {tip}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>


                </div>
            )}

            {/* Footer Help Section */}
            <div className="mt-10 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white shadow-xl">
                <h4 className="mb-3 text-lg font-bold">❓ உதவி & முக்கிய குறிப்புகள்</h4>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl bg-white/10 p-4">
                        <p className="mb-1 text-sm font-bold text-yellow-300">⚠️ கட்டாய புலங்கள்</p>
                        <p className="text-xs text-gray-300">சிவப்பு நிறத்தில் &quot;ஆம்&quot; என்று குறிக்கப்பட்ட fields கட்டாயம் நிரப்ப வேண்டும். இல்லையெனில் சேமிக்க முடியாது.</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-4">
                        <p className="mb-1 text-sm font-bold text-green-300">✅ தினசரி பதிவு</p>
                        <p className="text-xs text-gray-300">வருகை மற்றும் செலவுகளை தினமும் பதிவு செய்ய வேண்டும். தாமதமாக பதிவு செய்தால் தவறுகள் ஏற்படலாம்.</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-4">
                        <p className="mb-1 text-sm font-bold text-blue-300">📱 தொடர்புக்கு</p>
                        <p className="text-xs text-gray-300">ஏதேனும் சிக்கல் ஏற்பட்டால் நிர்வாகியை தொடர்பு கொள்ளவும்.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataEntryWorkflow;
