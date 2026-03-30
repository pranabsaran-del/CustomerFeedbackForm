# Cummins Parts Shipment - Customer Feedback Portal

A web application for capturing and tracking customer feedback on Cummins parts shipment quality. Designed to provide a seamless mechanism for every customer to submit shipment issues — broader than just RGAs, covering all claim types.

## Features

- **Feedback Submission Form** — Report shipping defects with detailed fields including customer info, part number, shipment reference, defect category, severity, description, and photo evidence upload
- **Photo Upload** — Drag-and-drop or browse to attach up to 3 photos per report (auto-resized for storage efficiency)
- **DPMO Dashboard** — Track Defects Per Million Opportunities with configurable total shipment count, sigma level indicators, and category breakdown charts
- **Filtering & Export** — Filter records by date range, company, and defect category; export data as CSV
- **Demo Data** — Pre-seeded with sample records so the dashboard is immediately useful for demonstrations

## Defect Categories

- Damaged in Transit
- Wrong Part Shipped
- Missing Parts
- Labeling / Marking Issue
- Packaging Issue
- Quantity Discrepancy
- Contamination / Foreign Material
- Other

## Getting Started

1. Open `index.html` in a web browser — no build step or server required
2. Submit feedback using the form or switch to the Dashboard to view metrics
3. Data is stored in the browser's localStorage

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- No frameworks or external dependencies
- Responsive design (mobile-friendly)
- Print-friendly dashboard

## Usage Context

This tool supports the "let me know how I am doing" approach to customer quality feedback, intended for integration into customer onboarding processes. For customers like Stellantis, this provides a centralized portal where shipping defects can be logged and tracked for quality improvement meetings.
