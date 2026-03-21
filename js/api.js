const API_BASE = "https://khaled135-optiverse-backend.hf.space";

async function apiRequest(endpoint, method = "GET", body = null, isFormData = false) {
    const options = {
        method,

        headers: isFormData ? {} : { "Content-Type": "application/json" },
    };
    
    if (body) options.body = isFormData ? body : JSON.stringify(body);

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        return { error: "Connection failed" };
    }
}
