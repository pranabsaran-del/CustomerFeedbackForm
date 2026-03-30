// form.js - Form validation, photo upload, and submission

const FeedbackForm = (() => {
    let photos = []; // Array of base64 data URLs
    const MAX_PHOTOS = 3;
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_DIMENSION = 800; // Resize images to max 800px

    function init() {
        const form = document.getElementById('feedback-form');
        const uploadZone = document.getElementById('uploadZone');
        const photoInput = document.getElementById('photoInput');
        const companySelect = document.getElementById('company');

        // Set default date
        document.getElementById('dateOfIssue').valueAsDate = new Date();

        // Form submission
        form.addEventListener('submit', handleSubmit);

        // Form reset
        form.addEventListener('reset', () => {
            setTimeout(() => {
                photos = [];
                renderPreviews();
                clearErrors();
                document.getElementById('otherCompanyGroup').style.display = 'none';
                document.getElementById('dateOfIssue').valueAsDate = new Date();
            }, 10);
        });

        // Company "Other" toggle
        companySelect.addEventListener('change', () => {
            const otherGroup = document.getElementById('otherCompanyGroup');
            otherGroup.style.display = companySelect.value === 'Other' ? '' : 'none';
        });

        // Upload zone events
        uploadZone.addEventListener('click', () => photoInput.click());
        photoInput.addEventListener('change', (e) => handleFiles(e.target.files));

        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        });
    }

    function handleFiles(files) {
        for (const file of files) {
            if (photos.length >= MAX_PHOTOS) {
                alert(`Maximum ${MAX_PHOTOS} photos allowed.`);
                break;
            }
            if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
                alert('Only JPG, PNG, and WEBP images are accepted.');
                continue;
            }
            if (file.size > MAX_FILE_SIZE) {
                alert(`File "${file.name}" exceeds 5 MB limit.`);
                continue;
            }
            resizeAndStore(file);
        }
        // Reset file input
        document.getElementById('photoInput').value = '';
    }

    function resizeAndStore(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                    if (width > height) {
                        height = Math.round(height * MAX_DIMENSION / width);
                        width = MAX_DIMENSION;
                    } else {
                        width = Math.round(width * MAX_DIMENSION / height);
                        height = MAX_DIMENSION;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                photos.push(dataUrl);
                renderPreviews();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function renderPreviews() {
        const container = document.getElementById('photoPreviews');
        container.innerHTML = '';

        photos.forEach((dataUrl, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'photo-preview';

            const img = document.createElement('img');
            img.src = dataUrl;
            img.alt = `Photo ${index + 1}`;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'photo-remove';
            removeBtn.type = 'button';
            removeBtn.innerHTML = '&times;';
            removeBtn.addEventListener('click', () => {
                photos.splice(index, 1);
                renderPreviews();
            });

            wrapper.appendChild(img);
            wrapper.appendChild(removeBtn);
            container.appendChild(wrapper);
        });
    }

    function handleSubmit(e) {
        e.preventDefault();
        clearErrors();

        const form = document.getElementById('feedback-form');
        const data = {
            customerName: form.customerName.value.trim(),
            company: form.company.value === 'Other'
                ? document.getElementById('otherCompany').value.trim()
                : form.company.value,
            partNumber: form.partNumber.value.trim(),
            shipmentRef: form.shipmentRef.value.trim(),
            category: form.category.value,
            severity: form.severity.value,
            dateOfIssue: form.dateOfIssue.value,
            description: form.description.value.trim(),
            photos: [...photos]
        };

        // Validate
        let valid = true;

        if (!data.customerName) {
            showError('customerName', 'Customer name is required.');
            valid = false;
        }
        if (!form.company.value) {
            showError('company', 'Please select a company.');
            valid = false;
        }
        if (form.company.value === 'Other' && !data.company) {
            showError('otherCompany', 'Please enter the company name.');
            valid = false;
        }
        if (!data.partNumber) {
            showError('partNumber', 'Part number is required.');
            valid = false;
        }
        if (!data.shipmentRef) {
            showError('shipmentRef', 'Shipment reference is required.');
            valid = false;
        }
        if (!data.category) {
            showError('category', 'Please select a defect category.');
            valid = false;
        }
        if (!data.severity) {
            showSeverityError('Please select a severity level.');
            valid = false;
        }
        if (!data.dateOfIssue) {
            showError('dateOfIssue', 'Date of issue is required.');
            valid = false;
        }
        if (!data.description || data.description.length < 20) {
            showError('description', 'Description must be at least 20 characters.');
            valid = false;
        }

        if (!valid) {
            // Scroll to first error
            const firstError = document.querySelector('.error');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // Save
        FeedbackStorage.add(data);

        // Reset form
        form.reset();
        photos = [];
        renderPreviews();
        document.getElementById('dateOfIssue').valueAsDate = new Date();

        // Show success toast
        showToast();
    }

    function showError(fieldId, message) {
        const input = document.getElementById(fieldId);
        if (input) {
            input.classList.add('error');
            const errSpan = input.parentElement.querySelector('.error-msg');
            if (errSpan) errSpan.textContent = message;
        }
    }

    function showSeverityError(message) {
        const group = document.querySelector('.severity-group');
        if (group) {
            const errSpan = group.querySelector('.error-msg');
            if (errSpan) errSpan.textContent = message;
        }
    }

    function clearErrors() {
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
    }

    function showToast() {
        const toast = document.getElementById('successToast');
        toast.style.display = 'flex';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 4000);
    }

    return { init };
})();
