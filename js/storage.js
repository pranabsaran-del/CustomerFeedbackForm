// storage.js - localStorage abstraction for feedback records

const FeedbackStorage = (() => {
    const STORAGE_KEY = 'cummins_feedback';

    function generateId() {
        return 'fb_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    }

    function getAll() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    function saveAll(records) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }

    function add(record) {
        const records = getAll();
        const newRecord = {
            id: generateId(),
            ...record,
            submittedAt: new Date().toISOString()
        };
        records.push(newRecord);
        saveAll(records);
        return newRecord;
    }

    function remove(id) {
        const records = getAll().filter(r => r.id !== id);
        saveAll(records);
    }

    function clearAll() {
        localStorage.removeItem(STORAGE_KEY);
    }

    function getFiltered(filters = {}) {
        let records = getAll();

        if (filters.company) {
            records = records.filter(r => r.company === filters.company);
        }
        if (filters.category) {
            records = records.filter(r => r.category === filters.category);
        }
        if (filters.dateFrom) {
            records = records.filter(r => r.dateOfIssue >= filters.dateFrom);
        }
        if (filters.dateTo) {
            records = records.filter(r => r.dateOfIssue <= filters.dateTo);
        }

        return records;
    }

    function getMetrics(filters = {}) {
        const records = getFiltered(filters);
        const totalOpportunities = filters.totalOpportunities || 10000;

        const total = records.length;
        const dpmo = totalOpportunities > 0
            ? Math.round((total / totalOpportunities) * 1000000)
            : 0;

        // Count by category
        const byCategory = {};
        records.forEach(r => {
            byCategory[r.category] = (byCategory[r.category] || 0) + 1;
        });

        // Find top category
        let topCategory = '-';
        let topCount = 0;
        for (const [cat, count] of Object.entries(byCategory)) {
            if (count > topCount) {
                topCategory = cat;
                topCount = count;
            }
        }

        // Critical + High count
        const criticalHigh = records.filter(
            r => r.severity === 'critical' || r.severity === 'high'
        ).length;

        // Sigma level approximation
        let sigmaLevel = '';
        if (dpmo === 0) sigmaLevel = '';
        else if (dpmo <= 3.4) sigmaLevel = '~6σ (World Class)';
        else if (dpmo <= 233) sigmaLevel = '~5σ';
        else if (dpmo <= 6210) sigmaLevel = '~4σ';
        else if (dpmo <= 66807) sigmaLevel = '~3σ';
        else if (dpmo <= 308538) sigmaLevel = '~2σ';
        else sigmaLevel = '<2σ';

        return {
            total,
            dpmo,
            sigmaLevel,
            byCategory,
            topCategory,
            criticalHigh,
            records
        };
    }

    function getUniqueCompanies() {
        const records = getAll();
        const companies = new Set(records.map(r => r.company));
        return Array.from(companies).sort();
    }

    function exportCSV() {
        const records = getAll();
        if (records.length === 0) return '';

        const headers = [
            'ID', 'Customer Name', 'Company', 'Part Number',
            'Shipment Ref', 'Category', 'Severity', 'Description',
            'Date of Issue', 'Submitted At', 'Photos Count'
        ];

        const rows = records.map(r => [
            r.id,
            `"${(r.customerName || '').replace(/"/g, '""')}"`,
            `"${(r.company || '').replace(/"/g, '""')}"`,
            r.partNumber,
            r.shipmentRef,
            r.category,
            r.severity,
            `"${(r.description || '').replace(/"/g, '""')}"`,
            r.dateOfIssue,
            r.submittedAt,
            (r.photos || []).length
        ]);

        return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    // Category display names
    const CATEGORY_LABELS = {
        'damaged': 'Damaged in Transit',
        'wrong-part': 'Wrong Part',
        'missing-parts': 'Missing Parts',
        'labeling-issue': 'Labeling Issue',
        'packaging-issue': 'Packaging Issue',
        'quantity-discrepancy': 'Quantity Discrepancy',
        'contamination': 'Contamination',
        'other': 'Other'
    };

    function getCategoryLabel(key) {
        return CATEGORY_LABELS[key] || key;
    }

    return {
        getAll,
        add,
        remove,
        clearAll,
        getFiltered,
        getMetrics,
        getUniqueCompanies,
        exportCSV,
        getCategoryLabel,
        CATEGORY_LABELS
    };
})();
