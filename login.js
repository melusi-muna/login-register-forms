// Universal JavaScript for both login and register pages
document.addEventListener('DOMContentLoaded', function() {
    initializePasswordToggles();
    initializeFormValidation();
    initializeRealTimeValidation();
    initializeUserStorage(); // Initialize user data storage
});

// Initialize user storage in localStorage
function initializeUserStorage() {
    if (!localStorage.getItem('registeredUsers')) {
        localStorage.setItem('registeredUsers', JSON.stringify([]));
    }
}

// Password toggle functionality
function initializePasswordToggles() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    
    passwordInputs.forEach(input => {
        // Create toggle button if it doesn't exist
        if (!input.parentNode.querySelector('.password-toggle')) {
            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'password-toggle';
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
            toggleBtn.onclick = () => togglePassword(input);
            input.parentNode.appendChild(toggleBtn);
        }
    });
}

function togglePassword(input) {
    const eyeIcon = input.parentNode.querySelector('.password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        eyeIcon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        eyeIcon.className = 'fas fa-eye';
    }
}

// Real-time validation
function initializeRealTimeValidation() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    
    // Password length hint
    if (passwordInput) {
        passwordInput.addEventListener('focus', function() {
            showHint('Password must be at least 6 characters long', 'password');
        });
        
        passwordInput.addEventListener('input', function() {
            if (this.value.length > 0 && this.value.length < 6) {
                showError('Password must be at least 6 characters', 'password');
            } else if (this.value.length >= 6) {
                removeMessage('password');
            }
        });
        
        passwordInput.addEventListener('blur', function() {
            if (this.value.length === 0) {
                removeMessage('password');
            }
        });
    }
    
    // Password match validation
    if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            if (passwordInput.value !== this.value && this.value.length > 0) {
                showError('Passwords do not match', 'confirm_password');
                this.style.borderColor = 'var(--error-color)';
            } else if (passwordInput.value === this.value && this.value.length > 0) {
                removeMessage('confirm_password');
                this.style.borderColor = 'var(--success-color)';
            } else {
                removeMessage('confirm_password');
                this.style.borderColor = '';
            }
        });
    }
}

// Form validation
function initializeFormValidation() {
    const form = document.querySelector('form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Remove any existing messages first
        removeAllMessages();
        
        const validationResult = validateForm(form);
        
        if (validationResult.isValid) {
            if (form.action.includes('/register')) {
                // Handle registration
                handleRegistration(validationResult.formData);
            } else {
                // Handle login
                handleLogin(validationResult.formData);
            }
        } else {
            showError(validationResult.message);
        }
    });
}

// Handle user registration
function handleRegistration(formData) {
    const users = JSON.parse(localStorage.getItem('registeredUsers'));
    
    // Check if user already exists
    const existingUser = users.find(user => user.email === formData.email);
    if (existingUser) {
        showError('An account with this email already exists. Please login instead.');
        return;
    }
    
    // Add new user (in real app, you'd hash the password!)
    users.push({
        fullnames: formData.fullnames,
        email: formData.email,
        password: formData.password, // In production, NEVER store plain passwords!
        createdAt: new Date().toISOString()
    });
    
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    
    showSuccess('✅ Account successfully created! Redirecting to login...');
    
    // Redirect to login page after successful registration
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

// Handle user login
function handleLogin(formData) {
    const users = JSON.parse(localStorage.getItem('registeredUsers'));
    
    // Find user by email
    const user = users.find(user => user.email === formData.email);
    
    if (!user) {
        showError('No account found with this email. Please register first.');
        return;
    }
    
    // Verify password (in real app, you'd compare hashed passwords!)
    if (user.password !== formData.password) {
        showError('Invalid password. Please try again.');
        return;
    }
    
    // Store logged-in user session
    localStorage.setItem('currentUser', JSON.stringify({
        email: user.email,
        fullnames: user.fullnames,
        loggedInAt: new Date().toISOString()
    }));
    
    showSuccess('✅ Login successful! Welcome back, ' + user.fullnames + '!');
    
    // Redirect to dashboard or home page
    setTimeout(() => {
        // window.location.href = 'dashboard.html'; // Redirect to your app's main page
        console.log('User logged in:', user.email);
        alert('Welcome to your dashboard, ' + user.fullnames + '!');
        // In a real app, you'd redirect to the main application page
    }, 2000);
}

// Enhanced form validation logic
function validateForm(form) {
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;
    const confirmPassword = document.getElementById('confirm_password')?.value;
    const fullnames = document.getElementById('fullnames')?.value.trim();
    
    // Login page validation
    if (form.action.includes('/login')) {
        if (!email) {
            return { isValid: false, message: 'Please enter your email address' };
        }
        if (!validateEmail(email)) {
            return { isValid: false, message: 'Please enter a valid email address' };
        }
        if (!password) {
            return { isValid: false, message: 'Please enter your password' };
        }
        if (password.length < 6) {
            return { isValid: false, message: 'Password must be at least 6 characters long' };
        }
        return { 
            isValid: true, 
            message: 'Validating credentials...',
            formData: { email, password }
        };
    }
    
    // Register page validation
    if (form.action.includes('/register')) {
        if (!fullnames) {
            return { isValid: false, message: 'Please enter your full name' };
        }
        if (fullnames.length < 2) {
            return { isValid: false, message: 'Full name must be at least 2 characters long' };
        }
        if (!email) {
            return { isValid: false, message: 'Please enter your email address' };
        }
        if (!validateEmail(email)) {
            return { isValid: false, message: 'Please enter a valid email address' };
        }
        if (!password) {
            return { isValid: false, message: 'Please enter a password' };
        }
        if (password.length < 6) {
            return { isValid: false, message: 'Password must be at least 6 characters long' };
        }
        if (!confirmPassword) {
            return { isValid: false, message: 'Please confirm your password' };
        }
        if (password !== confirmPassword) {
            return { isValid: false, message: 'Passwords do not match' };
        }
        return { 
            isValid: true, 
            message: 'Creating your account...',
            formData: { fullnames, email, password }
        };
    }
    
    return { isValid: true, message: 'Form submitted successfully!' };
}

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Message functions
function showError(message, field = null) {
    if (field) {
        removeMessage(field);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message error field-message';
        errorDiv.setAttribute('data-field', field);
        errorDiv.textContent = message;
        
        const input = document.getElementById(field);
        if (input) {
            input.parentNode.appendChild(errorDiv);
        }
    } else {
        removeAllMessages();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message error';
        errorDiv.textContent = message;
        
        const form = document.querySelector('form');
        form.insertBefore(errorDiv, form.firstChild);
    }
}

function showSuccess(message) {
    removeAllMessages();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'message success';
    successDiv.textContent = message;
    
    const form = document.querySelector('form');
    form.insertBefore(successDiv, form.firstChild);
}

function showHint(message, field) {
    removeMessage(field);
    
    const hintDiv = document.createElement('div');
    hintDiv.className = 'message hint';
    hintDiv.setAttribute('data-field', field);
    hintDiv.textContent = message;
    
    const input = document.getElementById(field);
    if (input) {
        input.parentNode.appendChild(hintDiv);
    }
}

function removeMessage(field) {
    const message = document.querySelector(`.message[data-field="${field}"]`);
    if (message && message.parentNode) {
        message.parentNode.removeChild(message);
    }
}

function removeAllMessages() {
    const messages = document.querySelectorAll('.message:not(.field-message)');
    messages.forEach(msg => {
        if (msg.parentNode) {
            msg.parentNode.removeChild(msg);
        }
    });
}

// Check if user is already logged in (optional feature)
function checkExistingSession() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser && window.location.pathname.includes('login.html')) {
        const user = JSON.parse(currentUser);
        showSuccess('You are already logged in as ' + user.fullnames);
        // Optionally redirect away from login page
    }
}

// Initialize session check on login page
if (window.location.pathname.includes('login.html')) {
    document.addEventListener('DOMContentLoaded', checkExistingSession);
}