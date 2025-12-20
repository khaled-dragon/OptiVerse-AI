// Image Preview Logic
const imageInput = document.getElementById('imageInput');
const preview = document.getElementById('preview');
const placeholder = document.getElementById('uploadPlaceholder');

imageInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
            placeholder.classList.add('hidden');
        }
        reader.readAsDataURL(file);
    }
});

// Form Submission
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem("user"));
    const patientId = document.getElementById('patientId').value;
    const file = imageInput.files[0];
    
    if(!file) return alert("Please select an image");

    // UI Loading State
    const btnText = document.getElementById('btnText');
    const loader = document.getElementById('loader');
    btnText.textContent = "Processing...";
    loader.classList.remove('hidden');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('user_id', user.user_id);
    formData.append('patient_id', patientId);

    const result = await apiRequest('/predict', 'POST', formData, true);

    if (result.diagnosis) {
        // Save result to local storage to display on result page
        localStorage.setItem('lastResult', JSON.stringify(result));
        window.location.href = 'result.html';
    } else {
        alert("Analysis failed. Please try again.");
        btnText.textContent = "Run Analysis";
        loader.classList.add('hidden');
    }
});