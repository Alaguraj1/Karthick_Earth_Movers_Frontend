const fs = require('fs');

const path = 'd:/Effidooo/Stone Mine/Karthick Earth movers/frontend/components/stone-mine/data-entry-workflow.tsx';
let content = fs.readFileSync(path, 'utf8');

const newData = `const workflowData: WorkflowSection[] = [
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
        ]
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
                ],
                tips: [
                    'டிரிப் பதிவில் Customer பெயர் இருந்தால், அதை ஒரே கிளிக்கில் Sales Invoice-ஆக மாற்றிவிடலாம்!',
                ],
            }
        ],
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
    },
];`;

const startIndex = content.indexOf('const workflowData: WorkflowSection[] = [');
const endIndex = content.indexOf('const DataEntryWorkflow = () => {');

if (startIndex !== -1 && endIndex !== -1) {
    const beforeStr = content.substring(0, startIndex);
    const afterStr = content.substring(endIndex);
    fs.writeFileSync(path, beforeStr + newData + '\n\n' + afterStr, 'utf8');
    console.log("Successfully updated workflow data");
} else {
    console.log("Could not find start/end marks");
}
