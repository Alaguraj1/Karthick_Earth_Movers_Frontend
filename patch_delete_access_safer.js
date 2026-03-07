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
        console.error(`Missing file: ${relPath}`);
        continue;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // 1. imports
    if (!content.includes('import { useSelector }')) {
        content = content.replace(/(import React[^;]*;)/, "$1\nimport { useSelector } from 'react-redux';\nimport { IRootState } from '@/store';");
        hasChanges = true;
    } else if (!content.includes('IRootState')) {
        content = content.replace(/(import { useSelector } from 'react-redux';)/, "$1\nimport { IRootState } from '@/store';");
        hasChanges = true;
    }

    // 2. inject isOwner
    const compMatch = content.match(/(const\s+[A-Z][a-zA-Z0-9_]*\s*=\s*(async\s+)?(\(\s*\)|\([^)]*\))\s*=>\s*\{|export\s+default\s+function\s+[A-Z][a-zA-Z0-9_]*\s*\([^)]*\)\s*\{)/);

    if (compMatch && !content.includes('const isOwner')) {
        const injectStr = `\n    const currentUser = useSelector((state: IRootState) => state.auth.user);\n    const isOwner = currentUser?.role?.toLowerCase() === 'owner';\n`;
        content = content.replace(compMatch[0], compMatch[0] + injectStr);
        hasChanges = true;
    }

    // 3. custom search for button surrounding IconTrashLines
    let newContent = '';
    let cursor = 0;
    while (true) {
        let trashPos = content.indexOf('<IconTrashLines', cursor);
        if (trashPos === -1) {
            newContent += content.substring(cursor);
            break;
        }

        let buttonStart = content.lastIndexOf('<button', trashPos);
        let interveningClose = content.indexOf('</button>', buttonStart);
        let buttonEnd = content.indexOf('</button>', trashPos) + '</button>'.length;

        // Ensure we found a <button> closer than cursor and before <IconTrashLines>
        if (buttonStart !== -1 && buttonStart >= cursor && (interveningClose === -1 || interveningClose > trashPos)) {
            newContent += content.substring(cursor, buttonStart);

            // Avoid double wrapping if already wrapped:
            const beforeButtonStr = content.substring(Math.max(0, buttonStart - 20), buttonStart);
            if (beforeButtonStr.includes('{isOwner &&')) {
                newContent += content.substring(buttonStart, buttonEnd);
            } else {
                newContent += '{isOwner && (' + content.substring(buttonStart, buttonEnd) + ')}';
            }
            cursor = buttonEnd;
            hasChanges = true;
        } else {
            // Couldn't find valid wrapping button, just copy past IconTrashLines
            newContent += content.substring(cursor, trashPos + '<IconTrashLines'.length);
            cursor = trashPos + '<IconTrashLines'.length;
        }
    }

    content = newContent;

    if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${relPath}`);
    }
}
