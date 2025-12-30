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
    
    // جلب بيانات المستخدم من localStorage مع التأكد من وجودها
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : { user_id: 1 };
    
    const patientId = document.getElementById('patientId').value || "Unknown";
    const file = imageInput.files[0];
    
    if(!file) return alert("Please select an image");

    // UI Loading State
    const btnText = document.getElementById('btnText');
    const loader = document.getElementById('loader');
    btnText.textContent = "Processing...";
    loader.classList.remove('hidden');

    // تجهيز البيانات لإرسالها للـ Backend
    const formData = new FormData();
    formData.append('image', file);
    formData.append('user_id', user.user_id);
    formData.append('patient_id', patientId);

    try {
        // --- التعديل الجوهري هنا ---
        // بنكلم رابط Hugging Face مباشرة بدل apiRequest
        const response = await fetch('https://khaled135-optiverse-backend.hf.space/predict', {
            method: 'POST',
            body: formData
            // ملاحظة: لا نضع Headers يدوية هنا لأن المتصفح سيقوم بضبط Boundary الـ FormData تلقائياً
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();

        if (result.diagnosis) {
            // حفظ النتيجة لعرضها في صفحة result.html
            localStorage.setItem('lastResult', JSON.stringify(result));
            window.location.href = 'result.html';
        } else {
            throw new Error("Diagnosis not found in response");
        }

    } catch (error) {
        console.error("API Error:", error);
        alert("Analysis failed: " + error.message);
        btnText.textContent = "Run Analysis";
        loader.classList.add('hidden');
    }
});
