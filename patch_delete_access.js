const fs = require('fs');
const path = require('path');

const files = [
    "app/(defaults)/assets/machines/page.tsx",
    "app/(defaults)/assets/vehicles/page.tsx",
    "app/(defaults)/labour/list/page.tsx",
    "app/(defaults)/masters/expense-categories/page.tsx",
    "app/(defaults)/masters/explosive-materials/page.tsx",
    "app/(defaults)/masters/machine-categories/page.tsx",
    "app/(defaults)/masters/stone-types/page.tsx",
    "app/(defaults)/masters/vehicle-categories/page.tsx",
    "components/stone-mine/expense-category-manager.tsx",
    "components/stone-mine/expense-list.tsx",
    "components/stone-mine/explosive-cost-management.tsx",
    "components/stone-mine/transport/driver-payment-management.tsx",
    "components/stone-mine/transport/trip-management.tsx",
    "components/stone-mine/vendor/explosive-supplier-management.tsx",
    "components/stone-mine/vendor/labour-contractor-management.tsx",
    "components/stone-mine/vendor/transport-vendor-management.tsx",
    "components/stone-mine/vendor/vendor-payment-management.tsx"
];

for (const relPath of files) {
    const filePath = path.join(__dirname, relPath);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        continue;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // 1. Check if we need to add imports
    if (!content.includes('import { useSelector }')) {
        content = content.replace(/(import React[^;]*;)/, "$1\nimport { useSelector } from 'react-redux';\nimport { IRootState } from '@/store';");
        hasChanges = true;
    } else if (!content.includes('IRootState')) {
        content = content.replace(/(import { useSelector } from 'react-redux';)/, "$1\nimport { IRootState } from '@/store';");
        hasChanges = true;
    }

    // 2. Inject isOwner inside the main component function
    // Look for const [Name] = () => { or export default function [Name]() {
    const compMatch = content.match(/(const\s+[A-Z][a-zA-Z0-9_]*\s*=\s*(async\s+)?(\(\s*\)|\([^)]*\))\s*=>\s*\{|export\s+default\s+function\s+[A-Z][a-zA-Z0-9_]*\s*\([^)]*\)\s*\{)/);

    if (compMatch && !content.includes('const isOwner')) {
        const injectStr = `\n    const currentUser = useSelector((state: IRootState) => state.auth.user);\n    const isOwner = currentUser?.role?.toLowerCase() === 'owner';\n`;
        content = content.replace(compMatch[0], compMatch[0] + injectStr);
        hasChanges = true;
    }

    // 3. Wrap the button containing IconTrashLines
    // The button might have multiple lines. We can use a regex that matches <button ...> ... <IconTrashLines ... /> ... </button>
    // Since we don't know if the button has nested children (other than IconTrash), we capture the entire button.
    const buttonRegex = /(<button[^>]*>[\s\S]*?<IconTrashLines[^>]*\/>[\s\S]*?<\/button>)/g;

    content = content.replace(buttonRegex, (match) => {
        // If it's already wrapped in isOwner, skip it.
        // It's hard to tell if it's wrapped, but we can check if `{isOwner && (` is near it. However, we'll just wrap it if it's not wrapped.
        // Let's assume none of them are wrapped yet because we verified none use currentUser.
        hasChanges = true;
        return `{isOwner && (\n${match}\n)}`;
    });

    if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${relPath}`);
    } else {
        console.log(`No changes needed for ${relPath}`);
    }
}
