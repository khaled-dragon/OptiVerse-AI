document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("Submit button clicked..."); // عشان نتأكد إن الفانكشن بدأت

    const imageInput = document.getElementById('imageInput');
    const file = imageInput.files[0];
    if(!file) return alert("Please select an image");

    const btnText = document.getElementById('btnText');
    const loader = document.getElementById('loader');
    btnText.textContent = "Processing...";
    loader.classList.remove('hidden');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('user_id', '1'); 
    formData.append('patient_id', document.getElementById('patientId').value || "Unknown");

    try {
        console.log("Sending request to HF...");
        const response = await fetch('https://khaled135-optiverse-backend.hf.space/predict', {
            method: 'POST',
            body: formData,
            // متبعتش أي Headers يدوية هنا، المتصفح هيظبطها
        });

        console.log("Response Status:", response.status);

        if (!response.ok) {
            const errorTxt = await response.text();
            throw new Error(`Server Error (${response.status}): ${errorTxt}`);
        }

        const result = await response.json();
        console.log("Server Result:", result);

        if (result.status === "success" || result.diagnosis) {
            localStorage.setItem('lastResult', JSON.stringify(result));
            alert("Analysis Complete! Redirecting...");
            window.location.href = 'result.html'; 
        } else {
            throw new Error("Invalid response format from server");
        }

    } catch (error) {
        console.error("FULL ERROR DETAILS:", error);
        alert("Failed: " + error.message);
    } finally {
        btnText.textContent = "Run Analysis";
        loader.classList.add('hidden');
    }
});
