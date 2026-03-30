// dashboard.js - Dashboard rendering, metrics, filtering

const Dashboard = (() => {

    function init() {
        document.getElementById('applyFiltersBtn').addEventListener('click', render);
        document.getElementById('resetFiltersBtn').addEventListener('click', resetFilters);
        document.getElementById('exportCsvBtn').addEventListener('click', handleExport);
        document.getElementById('clearAllBtn').addEventListener('click', handleClearAll);
    }

    function getFilters() {
        return {
            dateFrom: document.getElementById('filterDateFrom').value || undefined,
            dateTo: document.getElementById('filterDateTo').value || undefined,
            company: document.getElementById('filterCompany').value || undefined,
            category: document.getElementById('filterCategory').value || undefined,
            totalOpportunities: parseInt(document.getElementById('totalOpportunities').value) || 10000
        };
    }

    function resetFilters() {
        document.getElementById('filterDateFrom').value = '';
        document.getElementById('filterDateTo').value = '';
        document.getElementById('filterCompany').value = '';
        document.getElementById('filterCategory').value = '';
        document.getElementById('totalOpportunities').value = '10000';
        render();
    }

    function render() {
        const filters = getFilters();
        const metrics = FeedbackStorage.getMetrics(filters);

        updateCompanyFilter();
        renderSummaryCards(metrics);
        renderBarChart(metrics);
        renderTable(metrics.records);
    }

    function updateCompanyFilter() {
        const select = document.getElementById('filterCompany');
        const currentValue = select.value;
        const companies = FeedbackStorage.getUniqueCompanies();

        // Keep first "All" option
        select.innerHTML = '<option value="">All</option>';
        companies.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            select.appendChild(opt);
        });

        select.value = currentValue;
    }

    function renderSummaryCards(metrics) {
        document.getElementById('totalSubmissions').textContent = metrics.total;
        document.getElementById('dpmoValue').textContent = metrics.dpmo.toLocaleString();
        document.getElementById('dpmoSigma').textContent = metrics.sigmaLevel;
        document.getElementById('topCategory').textContent =
            FeedbackStorage.getCategoryLabel(metrics.topCategory);
        document.getElementById('criticalHighCount').textContent = metrics.criticalHigh;

        // Color the DPMO card
        const dpmoCard = document.querySelector('.card-dpmo');
        dpmoCard.classList.remove('dpmo-green', 'dpmo-yellow', 'dpmo-red');
        if (metrics.dpmo === 0) {
            // No color
        } else if (metrics.dpmo <= 6210) {
            dpmoCard.classList.add('dpmo-green');
        } else if (metrics.dpmo <= 66807) {
            dpmoCard.classList.add('dpmo-yellow');
        } else {
            dpmoCard.classList.add('dpmo-red');
        }
    }

    function renderBarChart(metrics) {
        const container = document.getElementById('barChart');
        container.innerHTML = '';

        const categories = Object.keys(FeedbackStorage.CATEGORY_LABELS);
        const maxCount = Math.max(1, ...Object.values(metrics.byCategory));

        categories.forEach(cat => {
            const count = metrics.byCategory[cat] || 0;
            const pct = (count / maxCount) * 100;

            const row = document.createElement('div');
            row.className = 'bar-row';
            row.innerHTML = `
                <span class="bar-label">${FeedbackStorage.getCategoryLabel(cat)}</span>
                <div class="bar-track">
                    <div class="bar-fill" style="width: ${pct}%"></div>
                </div>
                <span class="bar-count">${count}</span>
            `;
            container.appendChild(row);
        });
    }

    function renderTable(records) {
        const tbody = document.getElementById('feedbackTableBody');
        const emptyState = document.getElementById('emptyState');

        if (records.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = '';
            return;
        }

        emptyState.style.display = 'none';

        // Sort by date descending
        const sorted = [...records].sort((a, b) =>
            new Date(b.submittedAt) - new Date(a.submittedAt)
        );

        tbody.innerHTML = sorted.map(r => `
            <tr>
                <td>${formatDate(r.dateOfIssue)}</td>
                <td>${escapeHtml(r.company)}</td>
                <td>${escapeHtml(r.partNumber)}</td>
                <td>${FeedbackStorage.getCategoryLabel(r.category)}</td>
                <td><span class="severity-badge ${r.severity}">${r.severity}</span></td>
                <td class="desc-cell" title="${escapeHtml(r.description)}">${escapeHtml(r.description)}</td>
                <td>${renderPhotoThumbs(r.photos)}</td>
            </tr>
        `).join('');

        // Attach lightbox handlers
        tbody.querySelectorAll('.photo-thumb').forEach(img => {
            img.addEventListener('click', () => openLightbox(img.src));
        });
    }

    function renderPhotoThumbs(photos) {
        if (!photos || photos.length === 0) return '<span style="color:#999">—</span>';
        return photos.map(p =>
            `<img src="${p}" class="photo-thumb" alt="Evidence photo">`
        ).join('');
    }

    function openLightbox(src) {
        const lightbox = document.getElementById('lightbox');
        document.getElementById('lightboxImg').src = src;
        lightbox.style.display = 'flex';
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function handleExport() {
        const csv = FeedbackStorage.exportCSV();
        if (!csv) {
            alert('No data to export.');
            return;
        }

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cummins_feedback_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }

    function handleClearAll() {
        if (confirm('Are you sure you want to delete all feedback records? This cannot be undone.')) {
            FeedbackStorage.clearAll();
            render();
        }
    }

    return { init, render };
})();
