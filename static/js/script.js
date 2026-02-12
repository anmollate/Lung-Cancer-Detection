document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const imagePreview = document.getElementById('image-preview');
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultsContainer = document.getElementById('results');
    const loaderContainer = document.querySelector('.loader-container');
    const resultContent = document.getElementById('result-content');
    const probFill = document.getElementById('prob-fill');
    const resultText = document.getElementById('result-text');
    const resultDetails = document.getElementById('result-details');
    const resetBtn = document.getElementById('reset-btn');

    // Handle Click to Browse
    dropZone.addEventListener('click', () => fileInput.click());

    // Handle Drag & Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#2563eb';
        dropZone.style.background = 'rgba(37, 99, 235, 0.05)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = '#e2e8f0';
        dropZone.style.background = 'transparent';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length) handleFile(files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (PNG, JPG).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            uploadPlaceholder.classList.add('hidden');
            previewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    // Analyze Button Logic
    analyzeBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const file = fileInput.files[0];
        if (!file) return;

        analyzeBtn.disabled = true;
        analyzeBtn.innerText = 'Analyzing...';
        
        resultsContainer.classList.remove('hidden');
        loaderContainer.classList.remove('hidden');
        resultContent.classList.add('hidden');
        
        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth' });

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Analysis failed');

            const data = await response.json();
            
            // Show results with a slight delay for better UX
            setTimeout(() => {
                loaderContainer.classList.add('hidden');
                resultContent.classList.remove('hidden');
                
                // Animation for progress bar
                setTimeout(() => {
                    probFill.style.width = `${data.probability * 100}%`;
                }, 100);

                resultText.innerText = data.prediction;
                resultDetails.innerText = data.details;
            }, 1500);

        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong during analysis. Please try again.');
            resetUI();
        }
    });

    // Reset Button Logic
    resetBtn.addEventListener('click', resetUI);

    function resetUI() {
        fileInput.value = '';
        uploadPlaceholder.classList.remove('hidden');
        previewContainer.classList.add('hidden');
        resultsContainer.classList.add('hidden');
        resultContent.classList.add('hidden');
        probFill.style.width = '0%';
        analyzeBtn.disabled = false;
        analyzeBtn.innerText = 'Start Analysis';
        dropZone.style.borderColor = '#e2e8f0';
        dropZone.style.background = 'transparent';
    }
});
