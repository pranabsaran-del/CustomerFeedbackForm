// app.js - Application initialization, view routing, demo data

(function () {
    'use strict';

    // Initialize modules
    FeedbackForm.init();
    Dashboard.init();

    // View navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetView = btn.dataset.view;

            // Update nav buttons
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update views
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById(targetView).classList.add('active');

            // Refresh dashboard when switching to it
            if (targetView === 'dashboard-view') {
                Dashboard.render();
            }
        });
    });

    // Lightbox close handlers
    const lightbox = document.getElementById('lightbox');
    lightbox.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });

    function closeLightbox() {
        document.getElementById('lightbox').style.display = 'none';
    }

    // Seed demo data if empty
    if (FeedbackStorage.getAll().length === 0) {
        seedDemoData();
    }

    function seedDemoData() {
        const demoRecords = [
            {
                customerName: 'Mike Johnson',
                company: 'Stellantis',
                partNumber: '3802429',
                shipmentRef: 'SO-2024-01234',
                category: 'damaged',
                severity: 'high',
                dateOfIssue: '2026-03-15',
                description: 'Turbocharger housing arrived with visible cracks on the mounting flange. Packaging had signs of impact damage on the outer carton.',
                photos: []
            },
            {
                customerName: 'Sarah Chen',
                company: 'PACCAR',
                partNumber: '4921493',
                shipmentRef: 'SO-2024-01198',
                category: 'wrong-part',
                severity: 'critical',
                dateOfIssue: '2026-03-12',
                description: 'Received fuel injector for ISX15 instead of the ordered ISB6.7 injector. Part number on box was correct but the actual part inside was wrong.',
                photos: []
            },
            {
                customerName: 'Robert Williams',
                company: 'Daimler',
                partNumber: '5473752',
                shipmentRef: 'SO-2024-01301',
                category: 'missing-parts',
                severity: 'medium',
                dateOfIssue: '2026-03-18',
                description: 'Ordered 12 cylinder liners, only 10 were in the shipment. Packing slip shows qty 12 but actual count is 10.',
                photos: []
            },
            {
                customerName: 'Lisa Anderson',
                company: 'Stellantis',
                partNumber: '3964820',
                shipmentRef: 'SO-2024-01156',
                category: 'labeling-issue',
                severity: 'low',
                dateOfIssue: '2026-03-10',
                description: 'Part label shows incorrect weight specifications. The label indicates 2.3 kg but the part actually weighs 3.1 kg per our receiving scale.',
                photos: []
            },
            {
                customerName: 'James Park',
                company: 'Volvo',
                partNumber: '4352089',
                shipmentRef: 'SO-2024-01278',
                category: 'packaging-issue',
                severity: 'medium',
                dateOfIssue: '2026-03-20',
                description: 'EGR valve received without proper anti-static packaging. Component was loose in the box with minimal cushioning material. No damage detected but risk is unacceptable.',
                photos: []
            },
            {
                customerName: 'Maria Garcia',
                company: 'Navistar',
                partNumber: '5301247',
                shipmentRef: 'SO-2024-01345',
                category: 'contamination',
                severity: 'critical',
                dateOfIssue: '2026-03-22',
                description: 'Metal shavings found inside sealed fuel system component packaging. This is a serious quality concern as contamination could cause engine damage if not caught.',
                photos: []
            },
            {
                customerName: 'Tom Bradley',
                company: 'PACCAR',
                partNumber: '4088842',
                shipmentRef: 'SO-2024-01389',
                category: 'quantity-discrepancy',
                severity: 'low',
                dateOfIssue: '2026-03-25',
                description: 'Received 24 gasket kits instead of the 20 ordered. Not a defect per se but inventory reconciliation issue. Invoice matches order qty of 20.',
                photos: []
            },
            {
                customerName: 'Angela Foster',
                company: 'Stellantis',
                partNumber: '3917654',
                shipmentRef: 'SO-2024-01402',
                category: 'damaged',
                severity: 'high',
                dateOfIssue: '2026-03-26',
                description: 'Water pump pulley has bent fins, likely from being dropped. The outer shipping box was intact but inner packaging was insufficient for the part weight.',
                photos: []
            }
        ];

        demoRecords.forEach(record => FeedbackStorage.add(record));
    }
})();
