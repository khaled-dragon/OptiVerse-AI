// Handle Login Logic
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = loginForm.querySelector('button');
        const originalText = btn.innerHTML;

        // UI Loading State
        btn.innerHTML = `<div class="loader w-5 h-5 border-2"></div>`;
        btn.disabled = true;

        const response = await apiRequest('/login', 'POST', { email, password });

        if (response.user_id) {
            // Save user session
            localStorage.setItem('user', JSON.stringify(response));
            window.location.href = 'dashboard.html';
        } else {
            alert(response.error || "Login failed. Please check your credentials.");
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

// Handle Signup Logic
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const accountType = document.getElementById('accountType').value;
        const btn = signupForm.querySelector('button');
        
        // UI Loading State
        const originalText = btn.innerHTML;
        btn.innerHTML = "Creating Account...";
        btn.disabled = true;

        const response = await apiRequest('/signup', 'POST', {
            fullName,
            email,
            password,
            accountType
        });

        if (response.user_id) {
            alert("Account created successfully! Redirecting to login...");
            window.location.href = 'login.html';
        } else {
            alert(response.error || "Signup failed. Try a different email.");
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}