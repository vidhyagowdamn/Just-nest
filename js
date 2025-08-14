// User authentication system
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('justnest_users') || '[]');
        this.currentUser = JSON.parse(localStorage.getItem('justnest_current_user') || 'null');
        this.initializeAuth();
    }

    initializeAuth() {
        if (this.currentUser) {
            this.showUserSection();
        }
    }

    login(email, password, rememberMe = false) {
        const user = this.users.find(u => 
            (u.email === email || u.phone === email) && u.password === password
        );

        if (user) {
            this.currentUser = { ...user };
            delete this.currentUser.password; // Don't store password in session
            
            if (rememberMe) {
                localStorage.setItem('justnest_current_user', JSON.stringify(this.currentUser));
            } else {
                sessionStorage.setItem('justnest_current_user', JSON.stringify(this.currentUser));
            }
            
            this.showUserSection();
            return { success: true };
        } else {
            return { success: false, message: 'Invalid email/phone or password' };
        }
    }

    signup(userData) {
        // Check if user already exists
        const existingUser = this.users.find(u => 
            u.email === userData.email || u.phone === userData.phone
        );

        if (existingUser) {
            return { success: false, message: 'User with this email or phone already exists' };
        }

        // Validate password
        if (!this.validatePassword(userData.password)) {
            return { success: false, message: 'Password must be at least 8 characters with letters and numbers' };
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            password: userData.password, // In real app, this should be hashed
            userType: userData.userType,
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        localStorage.setItem('justnest_users', JSON.stringify(this.users));

        return { success: true, message: 'Account created successfully! You can now login.' };
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('justnest_current_user');
        sessionStorage.removeItem('justnest_current_user');
        this.showLoginSection();
    }

    validatePassword(password) {
        return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
    }

    showUserSection() {
        const authSection = document.getElementById('authSection');
        const loginBtn = document.getElementById('loginBtn');
        const userSection = document.getElementById('userSection');
        const welcomeMessage = document.getElementById('welcomeMessage');

        loginBtn.style.display = 'none';
        userSection.classList.remove('hidden');
        welcomeMessage.textContent = `Welcome, ${this.currentUser.firstName}!`;
    }

    showLoginSection() {
        const authSection = document.getElementById('authSection');
        const loginBtn = document.getElementById('loginBtn');
        const userSection = document.getElementById('userSection');

        loginBtn.style.display = 'block';
        userSection.classList.add('hidden');
    }
}

// Initialize auth system
const authSystem = new AuthSystem();

// Modal functionality
const loginModal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
const closeModal = document.getElementById('closeModal');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const logoutBtn = document.getElementById('logoutBtn');

// Modal open/close
loginBtn.addEventListener('click', () => {
    loginModal.classList.remove('hidden');
});

closeModal.addEventListener('click', () => {
    loginModal.classList.add('hidden');
    resetForms();
});

// Close modal when clicking outside
loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.classList.add('hidden');
        resetForms();
    }
});

// Tab switching
loginTab.addEventListener('click', () => {
    switchToLoginTab();
});

signupTab.addEventListener('click', () => {
    switchToSignupTab();
});

function switchToLoginTab() {
    loginTab.classList.add('border-blue-500', 'text-blue-600', 'font-semibold');
    loginTab.classList.remove('text-gray-500');
    signupTab.classList.remove('border-blue-500', 'text-blue-600', 'font-semibold');
    signupTab.classList.add('text-gray-500');
    
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    resetForms();
}

function switchToSignupTab() {
    signupTab.classList.add('border-blue-500', 'text-blue-600', 'font-semibold');
    signupTab.classList.remove('text-gray-500');
    loginTab.classList.remove('border-blue-500', 'text-blue-600', 'font-semibold');
    loginTab.classList.add('text-gray-500');
    
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    resetForms();
}

// Password visibility toggle
document.getElementById('toggleLoginPassword').addEventListener('click', function() {
    togglePasswordVisibility('loginPassword', this);
});

document.getElementById('toggleSignupPassword').addEventListener('click', function() {
    togglePasswordVisibility('signupPassword', this);
});

function togglePasswordVisibility(inputId, toggleBtn) {
    const input = document.getElementById(inputId);
    const icon = toggleBtn.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const loginSpinner = document.getElementById('loginSpinner');
    const loginError = document.getElementById('loginError');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Show loading state
    loginSpinner.classList.remove('hidden');
    submitBtn.disabled = true;
    loginError.classList.add('hidden');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    const result = authSystem.login(email, password, rememberMe);
    
    // Hide loading state
    loginSpinner.classList.add('hidden');
    submitBtn.disabled = false;
    
    if (result.success) {
        loginModal.classList.add('hidden');
        resetForms();
        showNotification('Login successful! Welcome to JUSTNEST.', 'success');
    } else {
        loginError.textContent = result.message;
        loginError.classList.remove('hidden');
    }
});

// Signup form submission
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const signupSpinner = document.getElementById('signupSpinner');
    const signupError = document.getElementById('signupError');
    const signupSuccess = document.getElementById('signupSuccess');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Validate password confirmation
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        signupError.textContent = 'Passwords do not match';
        signupError.classList.remove('hidden');
        signupSuccess.classList.add('hidden');
        return;
    }
    
    // Show loading state
    signupSpinner.classList.remove('hidden');
    submitBtn.disabled = true;
    signupError.classList.add('hidden');
    signupSuccess.classList.add('hidden');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const userData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('signupEmail').value,
        phone: document.getElementById('signupPhone').value,
        password: password,
        userType: document.getElementById('userType').value
    };
    
    const result = authSystem.signup(userData);
    
    // Hide loading state
    signupSpinner.classList.add('hidden');
    submitBtn.disabled = false;
    
    if (result.success) {
        signupSuccess.textContent = result.message;
        signupSuccess.classList.remove('hidden');
        signupError.classList.add('hidden');
        
        // Switch to login tab after successful signup
        setTimeout(() => {
            switchToLoginTab();
        }, 2000);
    } else {
        signupError.textContent = result.message;
        signupError.classList.remove('hidden');
        signupSuccess.classList.add('hidden');
    }
});

// Logout functionality
logoutBtn.addEventListener('click', () => {
    authSystem.logout();
    showNotification('You have been logged out successfully.', 'info');
});

// Reset forms
function resetForms() {
    loginForm.reset();
    signupForm.reset();
    
    // Hide all error/success messages
    document.getElementById('loginError').classList.add('hidden');
    document.getElementById('signupError').classList.add('hidden');
    document.getElementById('signupSuccess').classList.add('hidden');
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg transition-all duration-300 transform translate-x-full opacity-0`;
    
    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    }[type] || 'bg-blue-500';
    
    notification.classList.add(bgColor);
    notification.innerHTML = `
        <div class="flex items-center text-white">
            <span>${message}</span>
            <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full', 'opacity-0');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}


// Mobile menu toggle
document.querySelector('.md\\:hidden').addEventListener('click', function() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.remove('hidden');
    } else {
        mobileMenu.classList.add('hidden');
    }
});

// Speech to text placeholder functionality
document.getElementById('speechToTextBtn').addEventListener('click', function() {
    alert('Speech to text activated! In the actual implementation, this would use the BHASHINI API to convert speech to text in multiple languages.');
});
// Speech-to-Text functionality for the microphone button

// Legal Issue Form Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Create and inject the legal issue modal HTML
    const legalIssueModalHTML = `
        <div id="legalIssueModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center">
            <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">Post Your Legal Issue</h2>
                        <button id="closeLegalModal" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <form id="legalIssueForm" class="space-y-6">
                        <div id="legalIssueError" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"></div>
                        <div id="legalIssueSuccess" class="hidden bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"></div>
                        
                        <!-- Personal Information Section -->
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h3 class="text-lg font-semibold mb-4 text-gray-800">Personal Information</h3>
                            
                            <div class="mb-4">
                                <label class="flex items-center">
                                    <input type="checkbox" id="postAnonymously" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                                    <span class="ml-2 text-sm text-gray-700">Post anonymously (your identity will be protected)</span>
                                </label>
                            </div>
                            
                            <div id="personalInfoSection" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="issuerName" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input type="text" id="issuerName" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your full name">
                                </div>
                                <div>
                                    <label for="issuerPhone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input type="tel" id="issuerPhone" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your phone number">
                                </div>
                                <div>
                                    <label for="issuerEmail" class="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                                    <input type="email" id="issuerEmail" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your email">
                                </div>
                                <div>
                                    <label for="issuerLocation" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input type="text" id="issuerLocation" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="City, State" required>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Legal Issue Details Section -->
                        <div class="space-y-4">
                            <h3 class="text-lg font-semibold text-gray-800">Legal Issue Details</h3>
                            
                            <div>
                                <label for="issueCategory" class="block text-sm font-medium text-gray-700 mb-1">Issue Category *</label>
                                <select id="issueCategory" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                                    <option value="">Select a category</option>
                                    <option value="property">Property/Land Disputes</option>
                                    <option value="family">Family Law</option>
                                    <option value="labor">Labor/Employment Issues</option>
                                    <option value="consumer">Consumer Protection</option>
                                    <option value="domestic-violence">Domestic Violence</option>
                                    <option value="criminal">Criminal Law</option>
                                    <option value="civil">Civil Disputes</option>
                                    <option value="government">Government Services</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            
                            <div>
                                <label for="issueTitle" class="block text-sm font-medium text-gray-700 mb-1">Issue Title *</label>
                                <input type="text" id="issueTitle" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Brief title describing your issue" required maxlength="100">
                                <div class="text-xs text-gray-500 mt-1">Maximum 100 characters</div>
                            </div>
                            
                            <div>
                                <label for="issueDescription" class="block text-sm font-medium text-gray-700 mb-1">Detailed Description *</label>
                                <textarea id="issueDescription" rows="6" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Please provide a detailed description of your legal issue. Include relevant dates, parties involved, and any actions already taken." required></textarea>
                                <div class="text-xs text-gray-500 mt-1">Be as specific as possible to get better assistance</div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="issueUrgency" class="block text-sm font-medium text-gray-700 mb-1">Urgency Level *</label>
                                    <select id="issueUrgency" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                                        <option value="">Select urgency</option>
                                        <option value="low">Low - General advice needed</option>
                                        <option value="medium">Medium - Important but not urgent</option>
                                        <option value="high">High - Need quick resolution</option>
                                        <option value="emergency">Emergency - Immediate help required</option>
                                    </select>
                                </div>
                                <div>
                                    <label for="preferredLanguage" class="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
                                    <select id="preferredLanguage" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="en">English</option>
                                        <option value="hi">हिंदी (Hindi)</option>
                                        <option value="mr">मराठी (Marathi)</option>
                                        <option value="bn">বাংলা (Bengali)</option>
                                        <option value="ta">தமிழ் (Tamil)</option>
                                        <option value="te">తెలుగు (Telugu)</option>
                                        <option value="kn">ಕನ್ನಡ (Kannada)</option>
                                        <option value="ml">മലയാളം (Malayalam)</option>
                                        <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                                        <option value="gu">ગુજરાતી (Gujarati)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <!-- File Upload Section -->
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800 mb-2">Supporting Documents (Optional)</h3>
                            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <input type="file" id="supportingDocs" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" class="hidden">
                                <label for="supportingDocs" class="cursor-pointer">
                                    <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                                    <div class="text-gray-600">Click to upload documents</div>
                                    <div class="text-xs text-gray-500 mt-1">PDF, DOC, JPG, PNG files accepted (Max 5MB each)</div>
                                </label>
                                <div id="fileList" class="mt-3 text-sm text-left"></div>
                            </div>
                        </div>
                        
                        <!-- Voice Recording Section -->
                        <div class="bg-blue-50 p-4 rounded-lg">
                            <h3 class="text-lg font-semibold text-gray-800 mb-2">Voice Recording (Optional)</h3>
                            <p class="text-sm text-gray-600 mb-3">You can record your issue in your preferred language</p>
                            <div class="flex items-center space-x-4">
                                <button type="button" id="startRecording" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center">
                                    <i class="fas fa-microphone mr-2"></i>
                                    Start Recording
                                </button>
                                <button type="button" id="stopRecording" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md hidden flex items-center">
                                    <i class="fas fa-stop mr-2"></i>
                                    Stop Recording
                                </button>
                                <div id="recordingStatus" class="text-sm text-gray-600"></div>
                            </div>
                            <audio id="audioPlayback" controls class="w-full mt-3 hidden"></audio>
                        </div>
                        
                        <!-- Consent and Privacy -->
                        <div class="bg-yellow-50 p-4 rounded-lg">
                            <h3 class="text-lg font-semibold text-gray-800 mb-2">Consent & Privacy</h3>
                            <div class="space-y-2 text-sm">
                                <label class="flex items-start">
                                    <input type="checkbox" id="consentShare" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1" required>
                                    <span class="ml-2 text-gray-700">I consent to sharing this information with verified legal professionals who can help with my case.</span>
                                </label>
                                <label class="flex items-start">
                                    <input type="checkbox" id="consentFollow" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1">
                                    <span class="ml-2 text-gray-700">I agree to receive follow-up communications regarding my legal issue.</span>
                                </label>
                                <label class="flex items-start">
                                    <input type="checkbox" id="consentEducational" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1">
                                    <span class="ml-2 text-gray-700">I consent to my case being used for educational purposes (anonymized) to help others with similar issues.</span>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Submit Buttons -->
                        <div class="flex space-x-4">
                            <button type="submit" class="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition">
                                <span id="submitSpinner" class="hidden">
                                    <i class="fas fa-spinner fa-spin mr-2"></i>
                                </span>
                                Submit Legal Issue
                            </button>
                            <button type="button" id="saveDraft" class="bg-gray-500 text-white py-3 px-6 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition">
                                Save as Draft
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Inject the modal HTML into the body
    document.body.insertAdjacentHTML('beforeend', legalIssueModalHTML);
    
    // Get modal elements
    const legalIssueModal = document.getElementById('legalIssueModal');
    const closeLegalModal = document.getElementById('closeLegalModal');
    const legalIssueForm = document.getElementById('legalIssueForm');
    const postAnonymously = document.getElementById('postAnonymously');
    const personalInfoSection = document.getElementById('personalInfoSection');
    
    // Find the "Post Your Legal Issue" button in the hero section
    const postLegalIssueBtn = document.querySelector('button:has(i.fas.fa-gavel)') || 
                              Array.from(document.querySelectorAll('button')).find(btn => 
                                  btn.textContent.includes('Post Your Legal Issue'));
    
    // Event Listeners
    
    // Open modal when "Post Your Legal Issue" button is clicked
    if (postLegalIssueBtn) {
        postLegalIssueBtn.addEventListener('click', function(e) {
            e.preventDefault();
            legalIssueModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    }
    
    // Close modal
    function closeLegalIssueModal() {
        legalIssueModal.classList.add('hidden');
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
    
    closeLegalModal.addEventListener('click', closeLegalIssueModal);
    
    // Close modal when clicking outside
    legalIssueModal.addEventListener('click', function(e) {
        if (e.target === legalIssueModal) {
            closeLegalIssueModal();
        }
    });
    
    // Handle anonymous posting toggle
    postAnonymously.addEventListener('change', function() {
        const inputs = personalInfoSection.querySelectorAll('input');
        inputs.forEach(input => {
            if (this.checked) {
                input.removeAttribute('required');
                input.disabled = true;
                input.style.backgroundColor = '#f9fafb';
            } else {
                if (input.id === 'issuerName' || input.id === 'issuerPhone' || input.id === 'issuerLocation') {
                    input.setAttribute('required', 'required');
                }
                input.disabled = false;
                input.style.backgroundColor = 'white';
            }
        });
    });
    
    // File upload handling
    const supportingDocs = document.getElementById('supportingDocs');
    const fileList = document.getElementById('fileList');
    
    supportingDocs.addEventListener('change', function() {
        fileList.innerHTML = '';
        Array.from(this.files).forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'flex items-center justify-between bg-white p-2 rounded border mt-1';
            fileItem.innerHTML = `
                <span class="text-sm">${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                <button type="button" onclick="this.parentElement.remove()" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-times"></i>
                </button>
            `;
            fileList.appendChild(fileItem);
        });
    });
    
    // Voice recording functionality
    let mediaRecorder;
    let audioChunks = [];
    const startRecording = document.getElementById('startRecording');
    const stopRecording = document.getElementById('stopRecording');
    const recordingStatus = document.getElementById('recordingStatus');
    const audioPlayback = document.getElementById('audioPlayback');
    
    startRecording.addEventListener('click', async function() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                audioPlayback.src = audioUrl;
                audioPlayback.classList.remove('hidden');
                recordingStatus.textContent = 'Recording saved successfully';
            };
            
            mediaRecorder.start();
            startRecording.classList.add('hidden');
            stopRecording.classList.remove('hidden');
            recordingStatus.textContent = 'Recording in progress...';
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
            recordingStatus.textContent = 'Error: Could not access microphone';
        }
    });
    
    stopRecording.addEventListener('click', function() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        startRecording.classList.remove('hidden');
        stopRecording.classList.add('hidden');
    });
    
    // Form submission
    legalIssueForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitSpinner = document.getElementById('submitSpinner');
        const errorDiv = document.getElementById('legalIssueError');
        const successDiv = document.getElementById('legalIssueSuccess');
        
        // Show loading spinner
        submitSpinner.classList.remove('hidden');
        this.querySelector('button[type="submit"]').disabled = true;
        
        // Hide previous messages
        errorDiv.classList.add('hidden');
        successDiv.classList.add('hidden');
        
        // Collect form data
        const formData = {
            anonymous: postAnonymously.checked,
            personalInfo: postAnonymously.checked ? null : {
                name: document.getElementById('issuerName').value,
                phone: document.getElementById('issuerPhone').value,
                email: document.getElementById('issuerEmail').value,
                location: document.getElementById('issuerLocation').value
            },
            issue: {
                category: document.getElementById('issueCategory').value,
                title: document.getElementById('issueTitle').value,
                description: document.getElementById('issueDescription').value,
                urgency: document.getElementById('issueUrgency').value,
                language: document.getElementById('preferredLanguage').value
            },
            consent: {
                share: document.getElementById('consentShare').checked,
                followUp: document.getElementById('consentFollow').checked,
                educational: document.getElementById('consentEducational').checked
            },
            timestamp: new Date().toISOString(),
            files: Array.from(supportingDocs.files),
            hasAudio: !audioPlayback.classList.contains('hidden')
        };
        
        // Simulate API call
        setTimeout(() => {
            // Hide loading spinner
            submitSpinner.classList.add('hidden');
            this.querySelector('button[type="submit"]').disabled = false;
            
            // Show success message
            successDiv.textContent = `Your legal issue has been submitted successfully! ${formData.anonymous ? 'Your identity is protected.' : 'We will contact you soon.'} Reference ID: LI${Date.now().toString().slice(-6)}`;
            successDiv.classList.remove('hidden');
            
            console.log('Legal Issue Submitted:', formData);
            
            // Auto-close modal after 3 seconds
            setTimeout(() => {
                closeLegalIssueModal();
                legalIssueForm.reset();
                fileList.innerHTML = '';
                audioPlayback.classList.add('hidden');
                successDiv.classList.add('hidden');
            }, 3000);
            
        }, 2000);
    });
    
    // Save draft functionality
    document.getElementById('saveDraft').addEventListener('click', function() {
        const draftData = {
            category: document.getElementById('issueCategory').value,
            title: document.getElementById('issueTitle').value,
            description: document.getElementById('issueDescription').value,
            urgency: document.getElementById('issueUrgency').value,
            language: document.getElementById('preferredLanguage').value,
            timestamp: new Date().toISOString()
        };
        
        // Save to memory (in a real app, this would go to localStorage or server)
        console.log('Draft saved:', draftData);
        
        const successDiv = document.getElementById('legalIssueSuccess');
        successDiv.textContent = 'Draft saved successfully! You can continue editing later.';
        successDiv.classList.remove('hidden');
        
        setTimeout(() => {
            successDiv.classList.add('hidden');
        }, 3000);
    });
});

// Additional utility functions for the legal issue form

// Function to validate form before submission
function validateLegalIssueForm() {
    const form = document.getElementById('legalIssueForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('border-red-500');
            isValid = false;
        } else {
            field.classList.remove('border-red-500');
        }
    });
    
    return isValid;
}

// Function to auto-save draft every 30 seconds
function autoSaveDraft() {
    setInterval(() => {
        const title = document.getElementById('issueTitle')?.value;
        const description = document.getElementById('issueDescription')?.value;
        
        if (title || description) {
            const autoSaveData = {
                title,
                description,
                category: document.getElementById('issueCategory')?.value,
                autoSaved: true,
                timestamp: new Date().toISOString()
            };
            
            console.log('Auto-saved draft:', autoSaveData);
        }
    }, 30000); // Auto-save every 30 seconds
}

// Initialize auto-save when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    autoSaveDraft();
});
// Sample lawyer data
const lawyersDatabase = [
    {
        id: 1,
        name: "Advocate Rajesh Kumar",
        specialization: "Property & Land Rights",
        experience: 12,
        location: "Delhi",
        rating: 4.8,
        cases: 156,
        languages: ["Hindi", "English", "Punjabi"],
        phone: "+91-98765-43210",
        email: "rajesh.kumar@legal.com",
        image: "/api/placeholder/80/80",
        verified: true,
        description: "Experienced in rural property disputes and land acquisition cases.",
        availability: "Available"
    },
    {
        id: 2,
        name: "Advocate Priya Sharma",
        specialization: "Women's Rights & Domestic Violence",
        experience: 8,
        location: "Mumbai",
        rating: 4.9,
        cases: 98,
        languages: ["Hindi", "English", "Marathi"],
        phone: "+91-87654-32109",
        email: "priya.sharma@legal.com",
        image: "/api/placeholder/80/80",
        verified: true,
        description: "Dedicated to women's safety and domestic violence cases with confidential support.",
        availability: "Available"
    },
    {
        id: 3,
        name: "Advocate Mohammed Ali",
        specialization: "Labor Law & Consumer Rights",
        experience: 15,
        location: "Bangalore",
        rating: 4.7,
        cases: 203,
        languages: ["English", "Hindi", "Kannada", "Urdu"],
        phone: "+91-76543-21098",
        email: "mohammed.ali@legal.com",
        image: "/api/placeholder/80/80",
        verified: true,
        description: "Expert in labor disputes, consumer protection, and employment rights.",
        availability: "Busy"
    },
    {
        id: 4,
        name: "Advocate Lakshmi Devi",
        specialization: "Family Law & Senior Citizen Rights",
        experience: 20,
        location: "Chennai",
        rating: 4.6,
        cases: 245,
        languages: ["Tamil", "English", "Telugu"],
        phone: "+91-65432-10987",
        email: "lakshmi.devi@legal.com",
        image: "/api/placeholder/80/80",
        verified: true,
        description: "Specializes in family disputes, inheritance, and senior citizen legal rights.",
        availability: "Available"
    },
    {
        id: 5,
        name: "Advocate Arjun Singh",
        specialization: "Criminal Law & Civil Rights",
        experience: 10,
        location: "Jaipur",
        rating: 4.5,
        cases: 134,
        languages: ["Hindi", "English", "Rajasthani"],
        phone: "+91-54321-09876",
        email: "arjun.singh@legal.com",
        image: "/api/placeholder/80/80",
        verified: true,
        description: "Criminal defense lawyer with focus on civil rights violations.",
        availability: "Available"
    },
    {
        id: 6,
        name: "Advocate Meera Patel",
        specialization: "Corporate Law & Business Disputes",
        experience: 14,
        location: "Ahmedabad",
        rating: 4.8,
        cases: 187,
        languages: ["Gujarati", "English", "Hindi"],
        phone: "+91-43210-98765",
        email: "meera.patel@legal.com",
        image: "/api/placeholder/80/80",
        verified: true,
        description: "Corporate legal advisor with expertise in business law and commercial disputes.",
        availability: "Available"
    },
    {
        id: 7,
        name: "Advocate Suresh Reddy",
        specialization: "Agricultural Law & Rural Issues",
        experience: 18,
        location: "Hyderabad",
        rating: 4.7,
        cases: 176,
        languages: ["Telugu", "English", "Hindi"],
        phone: "+91-32109-87654",
        email: "suresh.reddy@legal.com",
        image: "/api/placeholder/80/80",
        verified: true,
        description: "Agricultural law specialist helping farmers with land and crop insurance issues.",
        availability: "Available"
    },
    {
        id: 8,
        name: "Advocate Kavita Joshi",
        specialization: "Child Rights & Education Law",
        experience: 9,
        location: "Pune",
        rating: 4.9,
        cases: 112,
        languages: ["Marathi", "English", "Hindi"],
        phone: "+91-21098-76543",
        email: "kavita.joshi@legal.com",
        image: "/api/placeholder/80/80",
        verified: true,
        description: "Child rights advocate focusing on education and child welfare cases.",
        availability: "Available"
    }
];

// Function to get random lawyers
function getRandomLawyers(count = 6) {
    const shuffled = [...lawyersDatabase].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Function to create lawyer card HTML
function createLawyerCard(lawyer) {
    const availabilityClass = lawyer.availability === 'Available' ? 'text-green-600' : 'text-red-600';
    const availabilityIcon = lawyer.availability === 'Available' ? 'fa-circle' : 'fa-circle';
    
    return `
        <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border">
            <div class="flex items-start gap-4">
                <div class="relative">
                    <img src="${lawyer.image}" alt="${lawyer.name}" class="w-16 h-16 rounded-full object-cover">
                    ${lawyer.verified ? '<div class="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"><i class="fas fa-check"></i></div>' : ''}
                </div>
                
                <div class="flex-1">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold text-lg text-gray-800">${lawyer.name}</h3>
                        <div class="flex items-center gap-1">
                            <i class="fas fa-star text-yellow-500"></i>
                            <span class="font-semibold">${lawyer.rating}</span>
                        </div>
                    </div>
                    
                    <p class="text-blue-600 font-medium mb-1">${lawyer.specialization}</p>
                    <p class="text-gray-600 text-sm mb-2">${lawyer.description}</p>
                    
                    <div class="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span><i class="fas fa-briefcase mr-1"></i>${lawyer.experience} years exp</span>
                        <span><i class="fas fa-gavel mr-1"></i>${lawyer.cases} cases</span>
                        <span><i class="fas fa-map-marker-alt mr-1"></i>${lawyer.location}</span>
                    </div>
                    
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-sm text-gray-600">Languages:</span>
                        <div class="flex gap-1">
                            ${lawyer.languages.map(lang => `<span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">${lang}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <i class="fas ${availabilityIcon} ${availabilityClass} text-xs"></i>
                            <span class="text-sm ${availabilityClass} font-medium">${lawyer.availability}</span>
                        </div>
                        
                        <div class="flex gap-2">
                            <button onclick="contactLawyer(${lawyer.id})" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition flex items-center gap-1">
                                <i class="fas fa-phone"></i> Contact
                            </button>
                            <button onclick="viewLawyerProfile(${lawyer.id})" class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm transition">
                                View Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Function to show lawyers modal
function showLawyersModal() {
    const randomLawyers = getRandomLawyers(6);
    
    const modalHTML = `
        <div id="lawyersModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-800">Find a Lawyer</h2>
                            <p class="text-gray-600 mt-1">Connect with verified legal professionals near you</p>
                        </div>
                        <button onclick="closeLawyersModal()" class="text-gray-400 hover:text-gray-600 text-2xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="mt-4 flex flex-wrap gap-4">
                        <div class="flex items-center gap-2">
                            <select id="specializationFilter" class="border border-gray-300 rounded-md px-3 py-2 text-sm">
                                <option value="">All Specializations</option>
                                <option value="Property & Land Rights">Property & Land Rights</option>
                                <option value="Women's Rights & Domestic Violence">Women's Rights</option>
                                <option value="Labor Law & Consumer Rights">Labor Law</option>
                                <option value="Family Law & Senior Citizen Rights">Family Law</option>
                                <option value="Criminal Law & Civil Rights">Criminal Law</option>
                                <option value="Corporate Law & Business Disputes">Corporate Law</option>
                                <option value="Agricultural Law & Rural Issues">Agricultural Law</option>
                                <option value="Child Rights & Education Law">Child Rights</option>
                            </select>
                        </div>
                        
                        <div class="flex items-center gap-2">
                            <select id="locationFilter" class="border border-gray-300 rounded-md px-3 py-2 text-sm">
                                <option value="">All Locations</option>
                                <option value="Delhi">Delhi</option>
                                <option value="Mumbai">Mumbai</option>
                                <option value="Bangalore">Bangalore</option>
                                <option value="Chennai">Chennai</option>
                                <option value="Jaipur">Jaipur</option>
                                <option value="Ahmedabad">Ahmedabad</option>
                                <option value="Hyderabad">Hyderabad</option>
                                <option value="Pune">Pune</option>
                            </select>
                        </div>
                        
                        <button onclick="refreshLawyers()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition flex items-center gap-2">
                            <i class="fas fa-refresh"></i> Refresh Results
                        </button>
                    </div>
                </div>
                
                <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div id="lawyersGrid" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        ${randomLawyers.map(lawyer => createLawyerCard(lawyer)).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
}

// Function to close lawyers modal
function closeLawyersModal() {
    const modal = document.getElementById('lawyersModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Function to refresh lawyers list
function refreshLawyers() {
    const specializationFilter = document.getElementById('specializationFilter').value;
    const locationFilter = document.getElementById('locationFilter').value;
    
    let filteredLawyers = [...lawyersDatabase];
    
    if (specializationFilter) {
        filteredLawyers = filteredLawyers.filter(lawyer => 
            lawyer.specialization.includes(specializationFilter)
        );
    }
    
    if (locationFilter) {
        filteredLawyers = filteredLawyers.filter(lawyer => 
            lawyer.location === locationFilter
        );
    }
    
    // Shuffle and take up to 6 lawyers
    const shuffled = filteredLawyers.sort(() => 0.5 - Math.random());
    const selectedLawyers = shuffled.slice(0, 6);
    
    const lawyersGrid = document.getElementById('lawyersGrid');
    if (selectedLawyers.length > 0) {
        lawyersGrid.innerHTML = selectedLawyers.map(lawyer => createLawyerCard(lawyer)).join('');
    } else {
        lawyersGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-gray-400 text-6xl mb-4">
                    <i class="fas fa-search"></i>
                </div>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">No lawyers found</h3>
                <p class="text-gray-500">Try adjusting your filters or refresh to see more results.</p>
            </div>
        `;
    }
}

// Function to contact lawyer
function contactLawyer(lawyerId) {
    const lawyer = lawyersDatabase.find(l => l.id === lawyerId);
    if (lawyer) {
        const contactModal = `
            <div id="contactModal" class="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
                <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-xl font-bold text-gray-800">Contact ${lawyer.name}</h3>
                            <button onclick="closeContactModal()" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div class="space-y-4">
                            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <i class="fas fa-phone text-blue-600"></i>
                                <div>
                                    <p class="font-medium">Phone</p>
                                    <p class="text-gray-600">${lawyer.phone}</p>
                                </div>
                                <button onclick="window.open('tel:${lawyer.phone}')" class="ml-auto bg-blue-600 text-white px-3 py-1 rounded text-sm">Call</button>
                            </div>
                            
                            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <i class="fas fa-envelope text-green-600"></i>
                                <div>
                                    <p class="font-medium">Email</p>
                                    <p class="text-gray-600">${lawyer.email}</p>
                                </div>
                                <button onclick="window.open('mailto:${lawyer.email}')" class="ml-auto bg-green-600 text-white px-3 py-1 rounded text-sm">Email</button>
                            </div>
                            
                            <div class="mt-6">
                                <button onclick="scheduleMeeting(${lawyer.id})" class="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md transition">
                                    <i class="fas fa-calendar mr-2"></i>Schedule Consultation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', contactModal);
    }
}

// Function to close contact modal
function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.remove();
    }
}

// Function to view lawyer profile
function viewLawyerProfile(lawyerId) {
    const lawyer = lawyersDatabase.find(l => l.id === lawyerId);
    if (lawyer) {
        alert(`Viewing profile for ${lawyer.name}\n\nThis would open a detailed profile page with:\n- Complete biography\n- Case history\n- Client reviews\n- Certifications\n- Consultation rates\n- Available time slots`);
    }
}

// Function to schedule meeting
function scheduleMeeting(lawyerId) {
    const lawyer = lawyersDatabase.find(l => l.id === lawyerId);
    if (lawyer) {
        closeContactModal();
        alert(`Scheduling consultation with ${lawyer.name}\n\nThis would open a calendar interface to:\n- Select available dates\n- Choose consultation type (phone/video/in-person)\n- Provide case details\n- Confirm appointment`);
    }
}

// Initialize the find lawyer functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to the "Find a Lawyer" button
    const findLawyerBtn = document.querySelector('button:has(i.fa-user-tie)');
    if (findLawyerBtn) {
        findLawyerBtn.addEventListener('click', showLawyersModal);
    }
    
    // Also add to navigation links if they exist
    const navLinks = document.querySelectorAll('a[href="#"]');
    navLinks.forEach(link => {
        if (link.textContent.includes('Find Lawyers')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                showLawyersModal();
            });
        }
    });
    
    // Close modal when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.id === 'lawyersModal') {
            closeLawyersModal();
        }
        if (e.target.id === 'contactModal') {
            closeContactModal();
        }
    });
    
    // Close modal on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeLawyersModal();
            closeContactModal();
        }
    });
});
// Educational Videos Module for JUSTNEST
class EducationalVideos {
    constructor() {
        this.videos = [
            {
                id: 'dQw4w9WgXcQ', // Replace with actual video IDs
                title: 'Understanding Your Legal Rights - Basics',
                description: 'Learn about fundamental legal rights every citizen should know',
                category: 'basic-rights',
                language: 'en',
                duration: '15:30',
                views: '25K',
                rating: 4.8,
                coverImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=640&h=360&fit=crop&crop=center' // Legal books and gavel
            },
            {
                id: 'K4TOrB7at0Y', // Replace with actual video IDs
                title: 'Women Safety Laws in India',
                description: 'Comprehensive guide to women protection laws and how to use them',
                category: 'womens-rights',
                language: 'hi',
                duration: '22:45',
                views: '18K',
                rating: 4.9,
                coverImage: 'https://images.unsplash.com/photo-1594736797933-d0cb71c4e252?w=640&h=360&fit=crop&crop=center' // Woman with justice scales
            },
            {
                id: 'fJ9rUzIMcZQ', // Replace with actual video IDs
                title: 'Property Rights for Rural Areas',
                description: 'Understanding land ownership and property disputes',
                category: 'property-rights',
                language: 'en',
                duration: '18:20',
                views: '12K',
                rating: 4.7,
                coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=640&h=360&fit=crop&crop=center' // Property documents and keys
            },
            {
                id: 'M7lc1UVf-VE', // Replace with actual video IDs
                title: 'Consumer Protection Laws',
                description: 'How to protect yourself from fraud and get consumer rights',
                category: 'consumer-rights',
                language: 'hi',
                duration: '20:15',
                views: '30K',
                rating: 4.6,
                coverImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=640&h=360&fit=crop&crop=center' // Consumer protection shield
            },
            {
                id: 'ScMzIvxBSi4', // Replace with actual video IDs
                title: 'Labor Laws and Worker Rights',
                description: 'Essential labor laws every worker should know',
                category: 'labor-rights',
                language: 'en',
                duration: '25:10',
                views: '15K',
                rating: 4.8,
                coverImage: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=640&h=360&fit=crop&crop=center' // Workers and labor rights
            },
            {
                id: 'kJQP7kiw5Fk', // Replace with actual video IDs
                title: 'Senior Citizens Legal Support',
                description: 'Legal protections and benefits for elderly citizens',
                category: 'senior-rights',
                language: 'hi',
                duration: '16:45',
                views: '8K',
                rating: 4.9,
                coverImage: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=640&h=360&fit=crop&crop=center' // Elderly person with legal documents
            }
        ];

        // Alternative cover images for legal rights themes
        this.alternativeCoverImages = {
            'basic-rights': [
                'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=640&h=360&fit=crop&crop=center', // Justice statue
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&h=360&fit=crop&crop=center', // Legal consultation
                'https://images.unsplash.com/photo-1589391886645-d51941baf7fb?w=640&h=360&fit=crop&crop=center'  // Legal documents
            ],
            'womens-rights': [
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=640&h=360&fit=crop&crop=center', // Women empowerment
                'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=640&h=360&fit=crop&crop=center', // Strong woman silhouette
                'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=640&h=360&fit=crop&crop=center'  // Women in professional setting
            ],
            'property-rights': [
                'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=640&h=360&fit=crop&crop=center', // Real estate documents
                'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=640&h=360&fit=crop&crop=center', // Property contract signing
                'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=640&h=360&fit=crop&crop=center'  // Buildings and property
            ],
            'consumer-rights': [
                'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=640&h=360&fit=crop&crop=center', // Consumer protection
                'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=640&h=360&fit=crop&crop=center', // Shopping and rights
                'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=640&h=360&fit=crop&crop=center'  // Consumer advocacy
            ],
            'labor-rights': [
                'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=640&h=360&fit=crop&crop=center', // Workers united
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&h=360&fit=crop&crop=center', // Workplace discussion
                'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=640&h=360&fit=crop&crop=center'  // Labor contract
            ],
            'senior-rights': [
                'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=640&h=360&fit=crop&crop=center', // Elderly care
                'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=640&h=360&fit=crop&crop=center', // Senior citizen support
                'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=640&h=360&fit=crop&crop=center'  // Elderly legal consultation
            ]
        };

        this.categories = {
            'all': 'All Videos',
            'basic-rights': 'Basic Rights',
            'womens-rights': "Women's Rights",
            'property-rights': 'Property Rights',
            'consumer-rights': 'Consumer Rights',
            'labor-rights': 'Labor Rights',
            'senior-rights': 'Senior Citizens'
        };

        this.currentCategory = 'all';
        this.currentLanguage = 'all';
        this.currentVideo = null;
        
        this.init();
    }

    init() {
        this.createVideoSection();
        this.bindEvents();
        this.loadYouTubeAPI();
    }

    createVideoSection() {
        // Create the video section HTML
        const videoSection = document.createElement('section');
        videoSection.id = 'educational-videos';
        videoSection.className = 'py-16 bg-gray-50';
        videoSection.innerHTML = `
            <div class="container mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-12">Educational Videos</h2>
                
                <!-- Video Player Modal -->
                <div id="videoModal" class="fixed inset-0 bg-black bg-opacity-75 z-50 hidden flex items-center justify-center p-4">
                    <div class="bg-white rounded-lg max-w-4xl w-full max-h-full overflow-auto">
                        <div class="p-6">
                            <div class="flex justify-between items-center mb-4">
                                <h3 id="videoTitle" class="text-2xl font-bold"></h3>
                                <button id="closeVideoModal" class="text-gray-500 hover:text-gray-700">
                                    <i class="fas fa-times text-2xl"></i>
                                </button>
                            </div>
                            <div class="aspect-w-16 aspect-h-9 mb-4">
                                <div id="videoPlayer" class="w-full h-96"></div>
                            </div>
                            <div id="videoDescription" class="text-gray-700 mb-4"></div>
                            <div class="flex flex-wrap gap-4 text-sm text-gray-600">
                                <span id="videoDuration" class="flex items-center">
                                    <i class="fas fa-clock mr-1"></i>
                                    <span></span>
                                </span>
                                <span id="videoViews" class="flex items-center">
                                    <i class="fas fa-eye mr-1"></i>
                                    <span></span>
                                </span>
                                <span id="videoRating" class="flex items-center">
                                    <i class="fas fa-star mr-1 text-yellow-500"></i>
                                    <span></span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Filters -->
                <div class="mb-8 flex flex-wrap gap-4 justify-center">
                    <div class="flex items-center gap-2">
                        <label class="text-sm font-medium text-gray-700">Category:</label>
                        <select id="categoryFilter" class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            ${Object.entries(this.categories).map(([key, value]) => 
                                `<option value="${key}">${value}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="flex items-center gap-2">
                        <label class="text-sm font-medium text-gray-700">Language:</label>
                        <select id="languageFilter" class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="all">All Languages</option>
                            <option value="en">English</option>
                            <option value="hi">हिंदी</option>
                        </select>
                    </div>
                    
                    <div class="flex items-center gap-2">
                        <input type="text" id="searchVideos" placeholder="Search videos..." class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <button id="searchBtn" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Video Grid -->
                <div id="videoGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Videos will be loaded here -->
                </div>
                
                <!-- Loading Indicator -->
                <div id="videoLoading" class="text-center py-8 hidden">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p class="mt-2 text-gray-600">Loading videos...</p>
                </div>
                
                <!-- No Results -->
                <div id="noResults" class="text-center py-8 hidden">
                    <i class="fas fa-video text-gray-400 text-4xl mb-4"></i>
                    <p class="text-gray-600">No videos found matching your criteria.</p>
                </div>
            </div>
        `;

        // Insert after the hero section
        const heroSection = document.querySelector('.hero-section');
        heroSection.insertAdjacentElement('afterend', videoSection);
    }

    bindEvents() {
        // Educational Videos button in hero section
        document.addEventListener('click', (e) => {
            if (e.target.closest('button') && e.target.closest('button').textContent.includes('Educational Videos')) {
                e.preventDefault();
                this.scrollToVideos();
            }
        });

        // Filter events
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.currentCategory = e.target.value;
            this.renderVideos();
        });

        document.getElementById('languageFilter').addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            this.renderVideos();
        });

        // Search functionality
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.renderVideos();
        });

        document.getElementById('searchVideos').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.renderVideos();
            }
        });

        // Modal events
        document.getElementById('closeVideoModal').addEventListener('click', () => {
            this.closeVideoModal();
        });

        document.getElementById('videoModal').addEventListener('click', (e) => {
            if (e.target.id === 'videoModal') {
                this.closeVideoModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !document.getElementById('videoModal').classList.contains('hidden')) {
                this.closeVideoModal();
            }
        });
    }

    loadYouTubeAPI() {
        // Load YouTube IFrame API
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        // Initialize videos after API loads
        window.onYouTubeIframeAPIReady = () => {
            this.renderVideos();
        };

        // If API already loaded
        if (window.YT && window.YT.Player) {
            this.renderVideos();
        }
    }

    renderVideos() {
        const videoGrid = document.getElementById('videoGrid');
        const loading = document.getElementById('videoLoading');
        const noResults = document.getElementById('noResults');
        
        loading.classList.remove('hidden');
        videoGrid.innerHTML = '';
        noResults.classList.add('hidden');

        // Filter videos
        const filteredVideos = this.filterVideos();

        setTimeout(() => {
            loading.classList.add('hidden');
            
            if (filteredVideos.length === 0) {
                noResults.classList.remove('hidden');
                return;
            }

            filteredVideos.forEach(video => {
                const videoCard = this.createVideoCard(video);
                videoGrid.appendChild(videoCard);
            });
        }, 500);
    }

    filterVideos() {
        let filtered = [...this.videos];
        const searchTerm = document.getElementById('searchVideos').value.toLowerCase();

        // Filter by category
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(video => video.category === this.currentCategory);
        }

        // Filter by language
        if (this.currentLanguage !== 'all') {
            filtered = filtered.filter(video => video.language === this.currentLanguage);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(video => 
                video.title.toLowerCase().includes(searchTerm) ||
                video.description.toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }

    // Method to get a random alternative cover image for fallback
    getAlternativeCoverImage(category) {
        const alternatives = this.alternativeCoverImages[category];
        if (alternatives && alternatives.length > 0) {
            return alternatives[Math.floor(Math.random() * alternatives.length)];
        }
        return 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=640&h=360&fit=crop&crop=center'; // Default legal image
    }

    createVideoCard(video) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer';
        card.dataset.videoId = video.id;
        
        // Use custom cover image or fallback to alternative
        const coverImage = video.coverImage || this.getAlternativeCoverImage(video.category);
        
        card.innerHTML = `
            <div class="relative">
                <img src="${coverImage}" 
                     alt="${video.title}" 
                     class="w-full h-48 object-cover rounded-t-lg"
                     onerror="this.src='${this.getAlternativeCoverImage(video.category)}'">
                <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-t-lg hover:bg-opacity-40 transition-all">
                    <div class="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition transform hover:scale-110">
                        <i class="fas fa-play text-xl"></i>
                    </div>
                </div>
                <div class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                    ${video.duration}
                </div>
                <div class="absolute top-2 left-2 bg-blue-600 bg-opacity-90 text-white px-2 py-1 rounded text-xs font-semibold">
                    Legal Rights
                </div>
            </div>
            <div class="p-4">
                <h3 class="font-bold text-lg mb-2 line-clamp-2">${video.title}</h3>
                <p class="text-gray-600 text-sm mb-3 line-clamp-3">${video.description}</p>
                <div class="flex justify-between items-center text-sm text-gray-500">
                    <span class="flex items-center">
                        <i class="fas fa-eye mr-1"></i>
                        ${video.views} views
                    </span>
                    <span class="flex items-center">
                        <i class="fas fa-star text-yellow-500 mr-1"></i>
                        ${video.rating}
                    </span>
                </div>
                <div class="mt-2">
                    <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        ${this.categories[video.category]}
                    </span>
                    <span class="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded ml-1">
                        ${video.language === 'en' ? 'English' : 'हिंदी'}
                    </span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            this.openVideoModal(video);
        });

        return card;
    }

    openVideoModal(video) {
        this.currentVideo = video;
        const modal = document.getElementById('videoModal');
        const title = document.getElementById('videoTitle');
        const description = document.getElementById('videoDescription');
        const duration = document.getElementById('videoDuration').querySelector('span');
        const views = document.getElementById('videoViews').querySelector('span');
        const rating = document.getElementById('videoRating').querySelector('span');

        title.textContent = video.title;
        description.textContent = video.description;
        duration.textContent = video.duration;
        views.textContent = video.views + ' views';
        rating.textContent = video.rating;

        // Create YouTube player
        if (window.YT && window.YT.Player) {
            new window.YT.Player('videoPlayer', {
                height: '390',
                width: '640',
                videoId: video.id,
                playerVars: {
                    autoplay: 1,
                    modestbranding: 1,
                    rel: 0
                }
            });
        }

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeVideoModal() {
        const modal = document.getElementById('videoModal');
        const playerDiv = document.getElementById('videoPlayer');
        
        // Destroy the player
        playerDiv.innerHTML = '';
        
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        this.currentVideo = null;
    }

    scrollToVideos() {
        const videoSection = document.getElementById('educational-videos');
        videoSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Method to add new videos dynamically
    addVideo(videoData) {
        this.videos.push(videoData);
        this.renderVideos();
    }

    // Method to update video data
    updateVideoData(videoId, newData) {
        const videoIndex = this.videos.findIndex(v => v.id === videoId);
        if (videoIndex !== -1) {
            this.videos[videoIndex] = { ...this.videos[videoIndex], ...newData };
            this.renderVideos();
        }
    }

    // Method to update cover image for a specific video
    updateVideoCover(videoId, newCoverImage) {
        const videoIndex = this.videos.findIndex(v => v.id === videoId);
        if (videoIndex !== -1) {
            this.videos[videoIndex].coverImage = newCoverImage;
            this.renderVideos();
        }
    }

    // Method to randomly assign new cover images to all videos
    randomizeAllCovers() {
        this.videos.forEach(video => {
            video.coverImage = this.getAlternativeCoverImage(video.category);
        });
        this.renderVideos();
    }
}

// Initialize the educational videos when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the main page (has hero section)
    if (document.querySelector('.hero-section')) {
        window.educationalVideos = new EducationalVideos();
    }
});

// Add some CSS for better video display
const videoStyles = document.createElement('style');
videoStyles.textContent = `
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .aspect-w-16 {
        position: relative;
        padding-bottom: 56.25%; /* 16:9 aspect ratio */
    }
    
    .aspect-h-9 {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
    
    #videoPlayer {
        width: 100%;
        height: 100%;
    }
    
    @media (max-width: 768px) {
        #videoModal .max-w-4xl {
            max-width: 95vw;
        }
        
        #videoPlayer {
            height: 250px;
        }
    }
    
    /* Enhanced hover effects for video cards */
    .bg-white.rounded-lg.shadow-md:hover {
        transform: translateY(-2px);
        transition: all 0.3s ease;
    }
    
    /* Legal Rights badge styling */
    .absolute.top-2.left-2 {
        backdrop-filter: blur(4px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }
`;

document.head.appendChild(videoStyles);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EducationalVideos;
}
// Women's Support Emergency Contact System
class WomenSupportSystem {
    constructor() {
        this.emergencyContacts = [
            { name: "Women Helpline", number: "1091", type: "police" },
            { name: "Domestic Violence Helpline", number: "181", type: "support" },
            { name: "Child Helpline", number: "1098", type: "child" },
            { name: "Police Emergency", number: "100", type: "police" },
            { name: "Medical Emergency", number: "108", type: "medical" }
        ];
        
        this.trustedContacts = JSON.parse(localStorage.getItem('trustedContacts') || '[]');
        this.isEmergencyMode = false;
        this.init();
    }

    init() {
        this.createSupportInterface();
        this.setupEventListeners();
        this.setupQuickAccess();
    }

    createSupportInterface() {
        // Create floating emergency button
        const emergencyBtn = document.createElement('div');
        emergencyBtn.id = 'emergencyBtn';
        emergencyBtn.className = 'fixed bottom-4 right-4 z-50 bg-red-600 text-white p-4 rounded-full shadow-lg cursor-pointer hover:bg-red-700 transition-all';
        emergencyBtn.innerHTML = '<i class="fas fa-exclamation-triangle text-xl"></i>';
        emergencyBtn.title = 'Emergency Help';
        document.body.appendChild(emergencyBtn);

        // Create support modal
        const supportModal = document.createElement('div');
        supportModal.id = 'supportModal';
        supportModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center';
        supportModal.innerHTML = this.getSupportModalHTML();
        document.body.appendChild(supportModal);
    }

    getSupportModalHTML() {
        return `
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold text-red-600">
                            <i class="fas fa-shield-alt mr-2"></i>Women's Support
                        </h2>
                        <button id="closeSupportModal" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="space-y-4">
                        <!-- Quick Actions -->
                        <div class="bg-red-50 p-4 rounded-lg">
                            <h3 class="font-bold text-red-800 mb-2">Emergency Actions</h3>
                            <div class="grid grid-cols-2 gap-2">
                                <button id="sosBtn" class="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700">
                                    <i class="fas fa-exclamation mr-1"></i>SOS Alert
                                </button>
                                <button id="fakeCallBtn" class="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                                    <i class="fas fa-phone mr-1"></i>Fake Call
                                </button>
                            </div>
                        </div>

                        <!-- Emergency Contacts -->
                        <div>
                            <h3 class="font-bold mb-2">Emergency Contacts</h3>
                            <div id="emergencyContactsList" class="space-y-2">
                                ${this.getEmergencyContactsHTML()}
                            </div>
                        </div>

                        <!-- Trusted Contacts -->
                        <div>
                            <h3 class="font-bold mb-2">Your Trusted Contacts</h3>
                            <div id="trustedContactsList" class="space-y-2 mb-2">
                                ${this.getTrustedContactsHTML()}
                            </div>
                            <button id="addTrustedContactBtn" class="text-blue-600 text-sm hover:underline">
                                <i class="fas fa-plus mr-1"></i>Add Trusted Contact
                            </button>
                        </div>

                        <!-- Quick Report -->
                        <div class="bg-yellow-50 p-4 rounded-lg">
                            <h3 class="font-bold text-yellow-800 mb-2">Quick Anonymous Report</h3>
                            <textarea id="quickReport" placeholder="Describe your situation (anonymous)..." 
                                class="w-full px-3 py-2 border rounded text-sm" rows="3"></textarea>
                            <button id="submitReportBtn" class="mt-2 bg-yellow-600 text-white px-4 py-2 rounded text-sm hover:bg-yellow-700">
                                Submit Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getEmergencyContactsHTML() {
        return this.emergencyContacts.map(contact => `
            <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                    <div class="font-medium text-sm">${contact.name}</div>
                    <div class="text-xs text-gray-600">${contact.number}</div>
                </div>
                <button onclick="womenSupport.callEmergency('${contact.number}')" 
                    class="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">
                    <i class="fas fa-phone mr-1"></i>Call
                </button>
            </div>
        `).join('');
    }

    getTrustedContactsHTML() {
        if (this.trustedContacts.length === 0) {
            return '<div class="text-gray-500 text-sm">No trusted contacts added yet</div>';
        }
        
        return this.trustedContacts.map((contact, index) => `
            <div class="flex justify-between items-center p-2 bg-blue-50 rounded">
                <div>
                    <div class="font-medium text-sm">${contact.name}</div>
                    <div class="text-xs text-gray-600">${contact.number}</div>
                </div>
                <div class="flex gap-1">
                    <button onclick="womenSupport.callTrusted('${contact.number}')" 
                        class="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700">
                        <i class="fas fa-phone"></i>
                    </button>
                    <button onclick="womenSupport.removeTrustedContact(${index})" 
                        class="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Emergency button
        document.getElementById('emergencyBtn').addEventListener('click', () => {
            this.showSupportModal();
        });

        // Close modal
        document.addEventListener('click', (e) => {
            if (e.target.id === 'closeSupportModal' || e.target.id === 'supportModal') {
                this.hideSupportModal();
            }
        });

        // SOS Alert
        document.addEventListener('click', (e) => {
            if (e.target.id === 'sosBtn') {
                this.triggerSOSAlert();
            }
        });

        // Fake Call
        document.addEventListener('click', (e) => {
            if (e.target.id === 'fakeCallBtn') {
                this.triggerFakeCall();
            }
        });

        // Add trusted contact
        document.addEventListener('click', (e) => {
            if (e.target.id === 'addTrustedContactBtn') {
                this.addTrustedContact();
            }
        });

        // Submit report
        document.addEventListener('click', (e) => {
            if (e.target.id === 'submitReportBtn') {
                this.submitAnonymousReport();
            }
        });

        // Emergency key combination (Ctrl + Shift + E)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'E') {
                e.preventDefault();
                this.triggerSOSAlert();
            }
        });
    }

    setupQuickAccess() {
        // Add emergency button to navigation if it exists
        const nav = document.querySelector('nav .flex.items-center.space-x-4');
        if (nav) {
            const quickHelpBtn = document.createElement('button');
            quickHelpBtn.className = 'bg-pink-600 text-white px-3 py-1 rounded text-sm hover:bg-pink-700';
            quickHelpBtn.innerHTML = '<i class="fas fa-heart mr-1"></i>Women Support';
            quickHelpBtn.onclick = () => this.showSupportModal();
            nav.appendChild(quickHelpBtn);
        }
    }

    showSupportModal() {
        document.getElementById('supportModal').classList.remove('hidden');
        // Refresh the content
        document.getElementById('trustedContactsList').innerHTML = this.getTrustedContactsHTML();
    }

    hideSupportModal() {
        document.getElementById('supportModal').classList.add('hidden');
    }

    triggerSOSAlert() {
        // Show immediate alert
        this.showAlert('SOS Alert Triggered!', 'Emergency contacts are being notified. Stay safe!', 'success');
        
        // Simulate sending alerts to trusted contacts
        this.trustedContacts.forEach(contact => {
            console.log(`Sending SOS alert to ${contact.name} at ${contact.number}`);
            // In real implementation, this would send SMS/call
        });

        // Auto-call emergency helpline
        this.callEmergency('1091');
        
        this.hideSupportModal();
    }

    triggerFakeCall() {
        const fakeCallModal = document.createElement('div');
        fakeCallModal.className = 'fixed inset-0 bg-black z-50 flex items-center justify-center';
        fakeCallModal.innerHTML = `
            <div class="text-white text-center">
                <div class="text-6xl mb-4"><i class="fas fa-phone"></i></div>
                <div class="text-2xl mb-2">Incoming Call...</div>
                <div class="text-xl mb-4">Mom</div>
                <div class="flex justify-center space-x-4">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                        class="bg-green-600 px-6 py-3 rounded-full">
                        <i class="fas fa-phone text-2xl"></i>
                    </button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                        class="bg-red-600 px-6 py-3 rounded-full">
                        <i class="fas fa-phone-slash text-2xl"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(fakeCallModal);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (document.body.contains(fakeCallModal)) {
                fakeCallModal.remove();
            }
        }, 10000);
        
        this.hideSupportModal();
    }

    addTrustedContact() {
        const name = prompt('Enter contact name:');
        const number = prompt('Enter contact number:');
        
        if (name && number) {
            this.trustedContacts.push({ name: name.trim(), number: number.trim() });
            localStorage.setItem('trustedContacts', JSON.stringify(this.trustedContacts));
            document.getElementById('trustedContactsList').innerHTML = this.getTrustedContactsHTML();
            this.showAlert('Success', 'Trusted contact added successfully!', 'success');
        }
    }

    removeTrustedContact(index) {
        if (confirm('Remove this trusted contact?')) {
            this.trustedContacts.splice(index, 1);
            localStorage.setItem('trustedContacts', JSON.stringify(this.trustedContacts));
            document.getElementById('trustedContactsList').innerHTML = this.getTrustedContactsHTML();
        }
    }

    callEmergency(number) {
        // In real implementation, this would initiate a call
        console.log(`Calling emergency number: ${number}`);
        this.showAlert('Calling...', `Dialing ${number}`, 'info');
        
        // Simulate call interface
        window.open(`tel:${number}`, '_self');
    }

    callTrusted(number) {
        console.log(`Calling trusted contact: ${number}`);
        this.showAlert('Calling...', `Dialing trusted contact`, 'info');
        window.open(`tel:${number}`, '_self');
    }

    submitAnonymousReport() {
        const report = document.getElementById('quickReport').value.trim();
        
        if (!report) {
            this.showAlert('Error', 'Please enter your report', 'error');
            return;
        }

        // Simulate report submission
        console.log('Anonymous report submitted:', report);
        
        // Clear the textarea
        document.getElementById('quickReport').value = '';
        
        this.showAlert('Report Submitted', 'Your anonymous report has been submitted safely. You will be contacted if needed.', 'success');
    }

    showAlert(title, message, type = 'info') {
        const alertDiv = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
        
        alertDiv.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-sm`;
        alertDiv.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <div class="font-bold">${title}</div>
                    <div class="text-sm">${message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white opacity-70 hover:opacity-100">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(alertDiv)) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // Method to be called when page loads
    static initialize() {
        window.womenSupport = new WomenSupportSystem();
        console.log('Women Support System initialized');
        console.log('Emergency hotkey: Ctrl + Shift + E');
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', WomenSupportSystem.initialize);
} else {
    WomenSupportSystem.initialize();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WomenSupportSystem;
}
// Legal Resources Data
const legalResources = [
    {
        title: "Understanding Property Rights in Rural Areas",
        category: "Property Law",
        description: "Comprehensive guide on land ownership, documentation, and dispute resolution.",
        downloadUrl: "#",
        language: "Hindi, English"
    },
    {
        title: "Women's Legal Rights and Protection",
        category: "Women's Rights",
        description: "Complete handbook on domestic violence laws, workplace rights, and legal remedies.",
        downloadUrl: "#",
        language: "Multiple Languages"
    },
    {
        title: "Consumer Protection Act - Simplified Guide",
        category: "Consumer Rights",
        description: "Easy-to-understand guide on consumer complaints and grievance procedures.",
        downloadUrl: "#",
        language: "English, Tamil, Telugu"
    },
    {
        title: "Labor Laws for Agricultural Workers",
        category: "Labor Rights",
        description: "Rights and protections for farm workers, minimum wages, and working conditions.",
        downloadUrl: "#",
        language: "Hindi, Punjabi, Marathi"
    },
    {
        title: "Senior Citizens Rights and Benefits",
        category: "Senior Rights",
        description: "Pension schemes, healthcare benefits, and legal protections for elderly.",
        downloadUrl: "#",
        language: "Multiple Languages"
    },
    {
        title: "Child Rights and Education Laws",
        category: "Child Welfare",
        description: "Right to education, child labor laws, and protection mechanisms.",
        downloadUrl: "#",
        language: "English, Bengali, Gujarati"
    }
];

// Create Legal Resources Modal
function createLegalResourcesModal() {
    const modalHTML = `
    <div id="legalResourcesModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center">
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-3xl font-bold text-gray-800 flex items-center">
                        <i class="fas fa-book-open text-blue-600 mr-3"></i>
                        Legal Resources
                    </h2>
                    <button id="closeLegalModal" class="text-gray-400 hover:text-gray-600 text-2xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="mb-4">
                    <input type="text" id="resourceSearch" 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                           placeholder="Search legal documents...">
                </div>
                
                <div id="resourcesList" class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    <!-- Resources will be populated here -->
                </div>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Populate Resources
function populateResources(resources = legalResources) {
    const resourcesList = document.getElementById('resourcesList');
    
    resourcesList.innerHTML = resources.map(resource => `
        <div class="bg-gray-50 rounded-lg p-4 hover:shadow-md transition border-l-4 border-blue-500">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-semibold text-lg text-gray-800">${resource.title}</h3>
                <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    ${resource.category}
                </span>
            </div>
            
            <p class="text-gray-600 text-sm mb-3">${resource.description}</p>
            
            <div class="flex justify-between items-center">
                <div class="text-xs text-gray-500">
                    <i class="fas fa-language mr-1"></i>
                    Available in: ${resource.language}
                </div>
                <div class="flex space-x-2">
                    <button class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center">
                        <i class="fas fa-eye mr-1"></i> View
                    </button>
                    <button class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center">
                        <i class="fas fa-download mr-1"></i> Download
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Search functionality
function setupResourceSearch() {
    const searchInput = document.getElementById('resourceSearch');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredResources = legalResources.filter(resource => 
            resource.title.toLowerCase().includes(searchTerm) ||
            resource.category.toLowerCase().includes(searchTerm) ||
            resource.description.toLowerCase().includes(searchTerm)
        );
        populateResources(filteredResources);
    });
}

// Initialize Legal Resources functionality
function initLegalResources() {
    // Create modal if it doesn't exist
    if (!document.getElementById('legalResourcesModal')) {
        createLegalResourcesModal();
    }
    
    // Find Legal Resources link and add click handler
    const legalResourcesLinks = document.querySelectorAll('a[href="#"]');
    legalResourcesLinks.forEach(link => {
        if (link.textContent.trim() === 'Legal Resources') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('legalResourcesModal').classList.remove('hidden');
                populateResources();
                setupResourceSearch();
            });
        }
    });
    
    // Close modal handlers
    document.addEventListener('click', (e) => {
        if (e.target.id === 'closeLegalModal' || e.target.id === 'legalResourcesModal') {
            document.getElementById('legalResourcesModal').classList.add('hidden');
        }
    });
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.getElementById('legalResourcesModal').classList.add('hidden');
        }
    });
}
// Community Users Display with Verification Status
class CommunityUsers {
    constructor() {
        this.users = [
            {
                id: 1,
                name: "Rajesh Kumar",
                type: "citizen",
                location: "Delhi, India",
                avatar: "/api/placeholder/40/40",
                joinDate: "2024-01-15",
                casesHelped: 0,
                rating: 0
            },
            {
                id: 2,
                name: "Adv. Priya Sharma",
                type: "lawyer",
                location: "Mumbai, Maharashtra",
                avatar: "/api/placeholder/40/40",
                joinDate: "2023-08-20",
                casesHelped: 45,
                rating: 4.8,
                verified: true,
                specialization: "Family Law"
            },
            {
                id: 3,
                name: "Mohan Singh",
                type: "citizen",
                location: "Jaipur, Rajasthan",
                avatar: "/api/placeholder/40/40",
                joinDate: "2024-02-10",
                casesHelped: 0,
                rating: 0
            },
            {
                id: 4,
                name: "Adv. Lakshmi Nair",
                type: "lawyer",
                location: "Chennai, Tamil Nadu",
                avatar: "/api/placeholder/40/40",
                joinDate: "2023-06-12",
                casesHelped: 67,
                rating: 4.9,
                verified: true,
                specialization: "Property Law"
            },
            {
                id: 5,
                name: "Amit Patel",
                type: "student",
                location: "Ahmedabad, Gujarat",
                avatar: "/api/placeholder/40/40",
                joinDate: "2024-03-05",
                casesHelped: 0,
                rating: 0
            }
        ];
        this.init();
    }

    init() {
        this.addCommunitySection();
        this.attachEventListeners();
    }

    addCommunitySection() {
        // Find the community link in navigation and add click handler
        const communityLink = document.querySelector('a[href="#"]:nth-child(5)');
        if (communityLink && communityLink.textContent.includes('Community')) {
            communityLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showCommunityModal();
            });
        }
    }

    showCommunityModal() {
        // Create and show community modal
        const modal = document.createElement('div');
        modal.id = 'communityModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
                <div class="p-6 border-b">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-gray-800">JUSTNEST Community</h2>
                        <button id="closeCommunityModal" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <p class="text-gray-600 mt-2">Connect with verified lawyers and fellow community members</p>
                </div>
                
                <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div class="flex gap-4 mb-6">
                        <button id="allUsersBtn" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                            All Members
                        </button>
                        <button id="lawyersBtn" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition">
                            Verified Lawyers
                        </button>
                        <button id="citizensBtn" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition">
                            Citizens
                        </button>
                    </div>
                    
                    <div id="usersList" class="space-y-4">
                        ${this.renderUsers(this.users)}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.attachModalEventListeners();
    }

    renderUsers(users) {
        return users.map(user => `
            <div class="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition cursor-pointer">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <img src="${user.avatar}" alt="${user.name}" class="w-12 h-12 rounded-full object-cover">
                        <div>
                            <div class="flex items-center space-x-2">
                                <h3 class="font-semibold text-gray-800">${user.name}</h3>
                                ${user.verified ? '<i class="fas fa-check-circle text-blue-600" title="Verified Account"></i>' : ''}
                                ${this.getUserTypeBadge(user.type)}
                            </div>
                            <p class="text-sm text-gray-600">
                                <i class="fas fa-map-marker-alt mr-1"></i>${user.location}
                            </p>
                            ${user.specialization ? `<p class="text-sm text-blue-600 font-medium">${user.specialization}</p>` : ''}
                        </div>
                    </div>
                    
                    <div class="text-right">
                        <div class="text-sm text-gray-500">
                            Joined: ${new Date(user.joinDate).toLocaleDateString()}
                        </div>
                        ${user.type === 'lawyer' ? `
                            <div class="flex items-center space-x-2 mt-1">
                                <span class="text-sm text-gray-600">${user.casesHelped} cases</span>
                                <div class="flex items-center">
                                    <i class="fas fa-star text-yellow-500 text-sm"></i>
                                    <span class="text-sm text-gray-600 ml-1">${user.rating}</span>
                                </div>
                            </div>
                        ` : ''}
                        <button class="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                            ${user.type === 'lawyer' ? 'Consult' : 'Connect'}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getUserTypeBadge(type) {
        const badges = {
            lawyer: '<span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Lawyer</span>',
            citizen: '<span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Citizen</span>',
            student: '<span class="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Student</span>'
        };
        return badges[type] || '<span class="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Member</span>';
    }

    attachModalEventListeners() {
        // Close modal
        document.getElementById('closeCommunityModal').addEventListener('click', () => {
            document.getElementById('communityModal').remove();
        });

        // Filter buttons
        document.getElementById('allUsersBtn').addEventListener('click', (e) => {
            this.setActiveFilter(e.target);
            this.updateUsersList(this.users);
        });

        document.getElementById('lawyersBtn').addEventListener('click', (e) => {
            this.setActiveFilter(e.target);
            const lawyers = this.users.filter(user => user.type === 'lawyer');
            this.updateUsersList(lawyers);
        });

        document.getElementById('citizensBtn').addEventListener('click', (e) => {
            this.setActiveFilter(e.target);
            const citizens = this.users.filter(user => user.type === 'citizen');
            this.updateUsersList(citizens);
        });

        // Close modal when clicking outside
        document.getElementById('communityModal').addEventListener('click', (e) => {
            if (e.target.id === 'communityModal') {
                document.getElementById('communityModal').remove();
            }
        });
    }

    setActiveFilter(activeBtn) {
        // Remove active class from all buttons
        document.querySelectorAll('#communityModal button[id$="Btn"]').forEach(btn => {
            btn.className = 'px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition';
        });
        
        // Add active class to clicked button
        activeBtn.className = 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition';
    }

    updateUsersList(users) {
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = this.renderUsers(users);
    }

    attachEventListeners() {
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.addCommunitySection();
            });
        }
    }
}

// Initialize Community Users when page loads
document.addEventListener('DOMContentLoaded', () => {
    new CommunityUsers();
});

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CommunityUsers;
}
// JUSTNEST E-Learning Module
class ELearningSystem {
    constructor() {
        this.currentLesson = 0;
        this.userProgress = {};
        this.quizScores = [];
        this.init();
    }

    init() {
        this.loadLessons();
        this.setupEventListeners();
        this.loadUserProgress();
    }

    // Legal education lessons data
    lessons = [
        {
            id: 1,
            title: "Understanding Your Basic Rights",
            content: "Every citizen has fundamental rights protected by the Constitution. These include right to equality, freedom of speech, and right to life and liberty.",
            videoUrl: "https://example.com/basic-rights-video",
            quiz: [
                {
                    question: "Which article guarantees right to equality?",
                    options: ["Article 14", "Article 19", "Article 21", "Article 32"],
                    correct: 0
                },
                {
                    question: "Right to life and liberty is under which article?",
                    options: ["Article 14", "Article 19", "Article 21", "Article 32"],
                    correct: 2
                }
            ]
        },
        {
            id: 2,
            title: "Women's Legal Rights",
            content: "Women have special legal protections including protection from domestic violence, workplace harassment, and equal property rights.",
            videoUrl: "https://example.com/womens-rights-video",
            quiz: [
                {
                    question: "Domestic Violence Act was enacted in which year?",
                    options: ["2005", "2006", "2007", "2008"],
                    correct: 0
                }
            ]
        },
        {
            id: 3,
            title: "Land and Property Rights",
            content: "Understanding property documentation, inheritance rights, and how to resolve land disputes legally.",
            videoUrl: "https://example.com/property-rights-video",
            quiz: [
                {
                    question: "Which document proves ownership of land?",
                    options: ["Aadhaar Card", "Revenue Records", "Voter ID", "PAN Card"],
                    correct: 1
                }
            ]
        }
    ];

    loadLessons() {
        const lessonContainer = document.getElementById('lesson-container');
        if (!lessonContainer) return;

        lessonContainer.innerHTML = this.lessons.map(lesson => `
            <div class="lesson-card bg-white p-6 rounded-lg shadow-md mb-4" data-lesson-id="${lesson.id}">
                <h3 class="text-xl font-bold mb-3 text-blue-800">${lesson.title}</h3>
                <p class="text-gray-700 mb-4">${lesson.content}</p>
                <div class="flex space-x-3">
                    <button onclick="eLearning.startLesson(${lesson.id})" 
                            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Start Lesson
                    </button>
                    <button onclick="eLearning.takeQuiz(${lesson.id})" 
                            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        Take Quiz
                    </button>
                </div>
                <div class="progress-bar mt-3">
                    <div class="bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                             style="width: ${this.getProgress(lesson.id)}%"></div>
                    </div>
                    <span class="text-sm text-gray-600">${this.getProgress(lesson.id)}% Complete</span>
                </div>
            </div>
        `).join('');
    }

    startLesson(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson) return;

        // Create lesson modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-90vh overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold text-gray-800">${lesson.title}</h2>
                        <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" 
                                class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="lesson-content mb-6">
                        <div class="bg-blue-50 p-4 rounded-lg mb-4">
                            <p class="text-gray-800">${lesson.content}</p>
                        </div>
                        
                        <div class="video-placeholder bg-gray-100 p-8 rounded-lg text-center mb-4">
                            <i class="fas fa-play-circle text-6xl text-blue-600 mb-4"></i>
                            <p class="text-gray-600">Educational Video: ${lesson.title}</p>
                            <button onclick="eLearning.playVideo('${lesson.videoUrl}')" 
                                    class="bg-blue-600 text-white px-6 py-2 rounded mt-2 hover:bg-blue-700">
                                Play Video
                            </button>
                        </div>
                    </div>
                    
                    <div class="flex justify-between">
                        <button onclick="eLearning.markComplete(${lessonId})" 
                                class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                            Mark as Complete
                        </button>
                        <button onclick="eLearning.takeQuiz(${lessonId})" 
                                class="bg-yellow-600 text-white px-6 py-2 rounded hover:bg-yellow-700">
                            Take Quiz
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    takeQuiz(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson || !lesson.quiz) return;

        let currentQuestion = 0;
        let score = 0;
        let answers = [];

        const showQuestion = () => {
            const question = lesson.quiz[currentQuestion];
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
            modal.innerHTML = `
                <div class="bg-white rounded-lg max-w-2xl w-full mx-4">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-xl font-bold">Quiz: ${lesson.title}</h2>
                            <span class="text-sm text-gray-600">Question ${currentQuestion + 1} of ${lesson.quiz.length}</span>
                        </div>
                        
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold mb-4">${question.question}</h3>
                            <div class="space-y-2">
                                ${question.options.map((option, index) => `
                                    <label class="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input type="radio" name="answer" value="${index}" class="mr-3">
                                        <span>${option}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="flex justify-between">
                            <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" 
                                    class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                                Cancel
                            </button>
                            <button onclick="eLearning.submitAnswer(this)" 
                                    class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                ${currentQuestion < lesson.quiz.length - 1 ? 'Next Question' : 'Submit Quiz'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Store quiz context in the modal
            modal.setAttribute('data-lesson-id', lessonId);
            modal.setAttribute('data-question-index', currentQuestion);
        };

        showQuestion();
    }

    submitAnswer(button) {
        const modal = button.closest('.fixed');
        const selectedAnswer = modal.querySelector('input[name="answer"]:checked');
        
        if (!selectedAnswer) {
            alert('Please select an answer');
            return;
        }

        const lessonId = parseInt(modal.getAttribute('data-lesson-id'));
        const questionIndex = parseInt(modal.getAttribute('data-question-index'));
        const lesson = this.lessons.find(l => l.id === lessonId);
        const question = lesson.quiz[questionIndex];
        
        const isCorrect = parseInt(selectedAnswer.value) === question.correct;
        
        // Show feedback
        const feedback = document.createElement('div');
        feedback.className = `p-4 rounded-lg mb-4 ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`;
        feedback.innerHTML = `
            <p class="font-semibold">${isCorrect ? 'Correct!' : 'Incorrect'}</p>
            ${!isCorrect ? `<p>The correct answer is: ${question.options[question.correct]}</p>` : ''}
        `;
        
        modal.querySelector('.mb-6').appendChild(feedback);
        button.style.display = 'none';
        
        // Add continue button
        const continueBtn = document.createElement('button');
        continueBtn.className = 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700';
        continueBtn.textContent = questionIndex < lesson.quiz.length - 1 ? 'Next Question' : 'View Results';
        continueBtn.onclick = () => {
            modal.remove();
            if (questionIndex < lesson.quiz.length - 1) {
                // Continue to next question (would need to track state)
                this.takeQuiz(lessonId);
            } else {
                this.showQuizResults(lessonId);
            }
        };
        
        button.parentElement.appendChild(continueBtn);
    }

    showQuizResults(lessonId) {
        // Simple results display
        alert('Quiz completed! Check your progress in the dashboard.');
        this.updateProgress(lessonId, 'quiz');
    }

    markComplete(lessonId) {
        this.updateProgress(lessonId, 'lesson');
        // Close modal
        document.querySelector('.fixed').remove();
        // Refresh lesson display
        this.loadLessons();
    }

    updateProgress(lessonId, type) {
        if (!this.userProgress[lessonId]) {
            this.userProgress[lessonId] = { lesson: false, quiz: false };
        }
        
        this.userProgress[lessonId][type] = true;
        this.saveProgress();
    }

    getProgress(lessonId) {
        const progress = this.userProgress[lessonId];
        if (!progress) return 0;
        
        let completed = 0;
        if (progress.lesson) completed += 50;
        if (progress.quiz) completed += 50;
        
        return completed;
    }

    saveProgress() {
        // In a real app, this would save to backend
        localStorage.setItem('justnest_progress', JSON.stringify(this.userProgress));
    }

    loadUserProgress() {
        const saved = localStorage.getItem('justnest_progress');
        if (saved) {
            this.userProgress = JSON.parse(saved);
        }
    }

    playVideo(videoUrl) {
        // Placeholder for video functionality
        alert('Video player would open here: ' + videoUrl);
    }

    setupEventListeners() {
        // Text-to-speech for accessibility
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('speak-text')) {
                this.speakText(e.target.textContent);
            }
        });
    }

    speakText(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-IN'; // Indian English
            speechSynthesis.speak(utterance);
        }
    }

    // Get overall progress
    getOverallProgress() {
        const totalLessons = this.lessons.length;
        let completedLessons = 0;
        
        Object.values(this.userProgress).forEach(progress => {
            if (progress.lesson && progress.quiz) {
                completedLessons++;
            }
        });
        
        return Math.round((completedLessons / totalLessons) * 100);
    }
}

// Initialize the e-learning system
const eLearning = new ELearningSystem();

// Add to existing JUSTNEST website
document.addEventListener('DOMContentLoaded', function() {
    // Create e-learning section if it doesn't exist
    if (!document.getElementById('lesson-container')) {
        const eLearningSection = document.createElement('section');
        eLearningSection.className = 'py-16 bg-gray-100';
        eLearningSection.innerHTML = `
            <div class="container mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-12">Legal Education Center</h2>
                <div id="lesson-container"></div>
                <div class="text-center mt-8">
                    <div class="bg-white p-6 rounded-lg shadow-md inline-block">
                        <h3 class="text-xl font-bold mb-2">Your Progress</h3>
                        <div class="w-64 bg-gray-200 rounded-full h-4 mb-2">
                            <div class="bg-green-600 h-4 rounded-full transition-all duration-300" 
                                 style="width: ${eLearning.getOverallProgress()}%"></div>
                        </div>
                        <span class="text-lg font-semibold text-green-600">${eLearning.getOverallProgress()}% Complete</span>
                    </div>
                </div>
            </div>
        `;
        
        // Insert after features section
        const featuresSection = document.querySelector('.py-16.bg-white');
        if (featuresSection) {
            featuresSection.insertAdjacentElement('afterend', eLearningSection);
        }
    }
});
// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initLegalResources);

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpeechToTextHandler;
}
// Legal Updates System for JUSTNEST
class LegalUpdatesManager {
    constructor() {
        this.updatesContainer = document.querySelector('#legalUpdatesContainer');
        this.lastUpdateTime = localStorage.getItem('lastLegalUpdate') || 0;
        this.updateInterval = 30 * 60 * 1000; // 30 minutes
        this.maxRetries = 3;
        this.apiEndpoints = {
            news: 'https://newsapi.org/v2/everything',
            legal: 'https://api.rss2json.com/v1/api.json'
        };
        
        // Categories for legal updates
        this.legalCategories = [
            'legal rights india',
            'supreme court judgments',
            'women rights law',
            'land rights india',
            'consumer protection act',
            'domestic violence law',
            'labor laws india',
            'rural legal aid'
        ];
        
        this.init();
    }

    init() {
        this.createUpdatesContainer();
        this.startAutoUpdate();
        this.setupManualRefresh();
        this.loadCachedUpdates();
        
        // Initial load
        this.fetchLegalUpdates();
    }

    createUpdatesContainer() {
        // Find the existing legal updates section or create one
        let existingSection = document.querySelector('.legal-updates-section');
        
        if (!existingSection) {
            const aiUpdatesSection = document.querySelector('section.bg-indigo-800');
            if (aiUpdatesSection) {
                const updatesDiv = aiUpdatesSection.querySelector('.bg-white');
                updatesDiv.id = 'legalUpdatesContainer';
                this.updatesContainer = updatesDiv;
            }
        }
    }

    async fetchLegalUpdates() {
        try {
            this.showLoadingState();
            
            const updates = await Promise.allSettled([
                this.fetchNewsAPIUpdates(),
                this.fetchGovernmentUpdates(),
                this.fetchCourtUpdates()
            ]);

            const allUpdates = updates
                .filter(result => result.status === 'fulfilled')
                .flatMap(result => result.value)
                .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
                .slice(0, 6); // Limit to 6 most recent updates

            if (allUpdates.length > 0) {
                this.displayUpdates(allUpdates);
                this.cacheUpdates(allUpdates);
                this.updateLastUpdateTime();
            } else {
                this.showErrorState('No legal updates available at the moment.');
            }

        } catch (error) {
            console.error('Error fetching legal updates:', error);
            this.showErrorState('Failed to fetch legal updates. Please try again later.');
        }
    }

    async fetchNewsAPIUpdates() {
        // Note: In production, you'd need a proper NewsAPI key and backend proxy
        try {
            const searches = this.legalCategories.slice(0, 3); // Limit API calls
            const promises = searches.map(async (query) => {
                // Simulated API call - replace with actual NewsAPI implementation
                return this.simulateNewsAPICall(query);
            });

            const results = await Promise.all(promises);
            return results.flat();
        } catch (error) {
            console.error('NewsAPI fetch error:', error);
            return [];
        }
    }

    async simulateNewsAPICall(query) {
        // Simulated legal news data - replace with actual API calls
        const simulatedNews = [
            {
                title: "New Digital Rights Framework Announced by Government",
                description: "The government has introduced new digital rights protections for citizens, focusing on privacy and data security in rural areas.",
                url: "#",
                publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                source: "Legal Affairs Ministry",
                category: "Digital Rights"
            },
            {
                title: "Supreme Court Rules on Women's Property Rights",
                description: "Landmark judgment strengthens women's inheritance rights in agricultural properties across India.",
                url: "#",
                publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                source: "Supreme Court of India",
                category: "Women's Rights"
            },
            {
                title: "Rural Legal Aid Program Expansion",
                description: "New initiative to provide free legal services in 500 additional villages nationwide.",
                url: "#",
                publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                source: "Department of Justice",
                category: "Legal Aid"
            }
        ];

        return simulatedNews.filter(news => 
            news.title.toLowerCase().includes(query.split(' ')[0]) ||
            news.description.toLowerCase().includes(query.split(' ')[0])
        );
    }

    async fetchGovernmentUpdates() {
        // Fetch from government legal portals
        try {
            // This would integrate with actual government RSS feeds or APIs
            return await this.simulateGovernmentUpdates();
        } catch (error) {
            console.error('Government updates fetch error:', error);
            return [];
        }
    }

    async simulateGovernmentUpdates() {
        return [
            {
                title: "Amendment to Consumer Protection Act 2024",
                description: "New provisions for online marketplace consumer protection and dispute resolution mechanisms.",
                url: "#",
                publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                source: "Ministry of Consumer Affairs",
                category: "Consumer Rights"
            },
            {
                title: "Rural Employment Guarantee Scheme Updates",
                description: "Enhanced legal protections for rural workers under MGNREGA with faster grievance redressal.",
                url: "#",
                publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                source: "Ministry of Rural Development",
                category: "Labor Rights"
            }
        ];
    }

    async fetchCourtUpdates() {
        // Fetch from court websites and legal databases
        try {
            return await this.simulateCourtUpdates();
        } catch (error) {
            console.error('Court updates fetch error:', error);
            return [];
        }
    }

    async simulateCourtUpdates() {
        return [
            {
                title: "High Court Judgment on Domestic Violence Cases",
                description: "New guidelines for faster processing of domestic violence cases and victim protection measures.",
                url: "#",
                publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                source: "Delhi High Court",
                category: "Women's Safety"
            }
        ];
    }

    displayUpdates(updates) {
        if (!this.updatesContainer) return;

        const updatesHTML = `
            <h3 class="font-bold text-xl mb-4 text-indigo-800 flex items-center">
                <i class="fas fa-gavel mr-2"></i>
                Latest Legal Updates
                <span class="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Updated ${new Date().toLocaleTimeString()}
                </span>
            </h3>
            <div class="space-y-4 text-left max-h-96 overflow-y-auto">
                ${updates.map(update => `
                    <div class="border-b border-gray-200 pb-4 hover:bg-gray-50 p-3 rounded transition-colors">
                        <div class="flex justify-between items-start mb-2">
                            <h4 class="font-semibold text-gray-800 flex-1 pr-2">${update.title}</h4>
                            <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full whitespace-nowrap">
                                ${update.category}
                            </span>
                        </div>
                        <p class="text-gray-600 text-sm mb-2">${update.description}</p>
                        <div class="flex justify-between items-center text-xs text-gray-500">
                            <span class="flex items-center">
                                <i class="fas fa-building mr-1"></i>
                                ${update.source}
                            </span>
                            <span class="flex items-center">
                                <i class="fas fa-clock mr-1"></i>
                                ${this.formatDate(update.publishedAt)}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="mt-6 flex justify-between items-center">
                <button id="refreshLegalUpdates" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition flex items-center">
                    <i class="fas fa-sync-alt mr-2"></i>
                    Refresh Updates
                </button>
                <button class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition">
                    View All Updates
                </button>
            </div>
        `;

        this.updatesContainer.innerHTML = updatesHTML;
        this.setupRefreshButton();
    }

    showLoadingState() {
        if (!this.updatesContainer) return;

        this.updatesContainer.innerHTML = `
            <h3 class="font-bold text-xl mb-4 text-indigo-800 flex items-center">
                <i class="fas fa-spinner fa-spin mr-2"></i>
                Loading Latest Legal Updates...
            </h3>
            <div class="space-y-4 text-left">
                ${[1, 2, 3].map(() => `
                    <div class="border-b border-gray-200 pb-4 animate-pulse">
                        <div class="h-4 bg-gray-300 rounded mb-2"></div>
                        <div class="h-3 bg-gray-200 rounded mb-2"></div>
                        <div class="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showErrorState(message) {
        if (!this.updatesContainer) return;

        this.updatesContainer.innerHTML = `
            <h3 class="font-bold text-xl mb-4 text-indigo-800 flex items-center">
                <i class="fas fa-exclamation-triangle mr-2 text-yellow-500"></i>
                Legal Updates
            </h3>
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p class="text-gray-600 mb-4">${message}</p>
                <button id="retryLegalUpdates" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition">
                    <i class="fas fa-redo mr-2"></i>
                    Try Again
                </button>
            </div>
        `;

        document.getElementById('retryLegalUpdates')?.addEventListener('click', () => {
            this.fetchLegalUpdates();
        });
    }

    setupRefreshButton() {
        const refreshBtn = document.getElementById('refreshLegalUpdates');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                refreshBtn.disabled = true;
                refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Refreshing...';
                
                await this.fetchLegalUpdates();
                
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>Refresh Updates';
            });
        }
    }

    setupManualRefresh() {
        // Add keyboard shortcut for manual refresh
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'r' && e.target.closest('.legal-updates-section')) {
                e.preventDefault();
                this.fetchLegalUpdates();
            }
        });
    }

    startAutoUpdate() {
        // Auto-refresh every 30 minutes
        setInterval(() => {
            this.fetchLegalUpdates();
        }, this.updateInterval);

        // Also check when user becomes active after being inactive
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                const timeSinceLastUpdate = Date.now() - parseInt(this.lastUpdateTime);
                if (timeSinceLastUpdate > this.updateInterval) {
                    this.fetchLegalUpdates();
                }
            }
        });
    }

    cacheUpdates(updates) {
        try {
            localStorage.setItem('cachedLegalUpdates', JSON.stringify(updates));
            localStorage.setItem('lastLegalUpdate', Date.now().toString());
        } catch (error) {
            console.error('Error caching updates:', error);
        }
    }

    loadCachedUpdates() {
        try {
            const cached = localStorage.getItem('cachedLegalUpdates');
            if (cached) {
                const updates = JSON.parse(cached);
                this.displayUpdates(updates);
            }
        } catch (error) {
            console.error('Error loading cached updates:', error);
        }
    }

    updateLastUpdateTime() {
        this.lastUpdateTime = Date.now();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;
        
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }

    // Method to add custom legal update sources
    addCustomSource(source) {
        if (typeof source === 'object' && source.name && source.url) {
            this.customSources = this.customSources || [];
            this.customSources.push(source);
        }
    }

    // Method to filter updates by category
    filterByCategory(category) {
        const cached = localStorage.getItem('cachedLegalUpdates');
        if (cached) {
            const updates = JSON.parse(cached);
            const filtered = updates.filter(update => 
                update.category.toLowerCase().includes(category.toLowerCase())
            );
            this.displayUpdates(filtered);
        }
    }
}

// Notification System for Legal Updates
class LegalUpdateNotifications {
    constructor() {
        this.permission = null;
        this.init();
    }

    async init() {
        if ('Notification' in window) {
            this.permission = await Notification.requestPermission();
        }
    }

    notify(update) {
        if (this.permission === 'granted') {
            new Notification('New Legal Update - JUSTNEST', {
                body: update.title,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'legal-update',
                requireInteraction: false,
                silent: false
            });
        }
    }

    showInAppNotification(update) {
        // Create in-app notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
        notification.innerHTML = `
            <div class="flex items-start">
                <i class="fas fa-gavel mr-3 mt-1"></i>
                <div class="flex-1">
                    <h4 class="font-semibold text-sm">New Legal Update</h4>
                    <p class="text-xs mt-1">${update.title}</p>
                </div>
                <button class="ml-2 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize the legal updates system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.legalUpdatesManager = new LegalUpdatesManager();
    window.legalNotifications = new LegalUpdateNotifications();
    
    console.log('JUSTNEST Legal Updates System initialized');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LegalUpdatesManager, LegalUpdateNotifications };
}
// E-Learning Module for JUSTNEST
// Add this to your existing script.js file

// E-Learning Data
const eLearningData = {
    courses: [
        {
            id: 1,
            title: "Basic Legal Rights",
            description: "Understanding fundamental legal rights every citizen should know",
            duration: "30 mins",
            lessons: [
                {
                    title: "Constitutional Rights",
                    content: "Every citizen has fundamental rights guaranteed by the Constitution including right to equality, freedom of speech, and right to life.",
                    videoUrl: "#"
                },
                {
                    title: "Consumer Protection",
                    content: "Learn about your rights as a consumer and how to file complaints against defective products or services.",
                    videoUrl: "#"
                }
            ],
            quiz: {
                questions: [
                    {
                        question: "Which article guarantees right to equality?",
                        options: ["Article 14", "Article 15", "Article 16", "Article 17"],
                        correct: 0
                    },
                    {
                        question: "Consumer protection covers which of the following?",
                        options: ["Defective products", "Poor services", "Unfair trade practices", "All of the above"],
                        correct: 3
                    }
                ]
            }
        },
        {
            id: 2,
            title: "Women's Legal Rights",
            description: "Comprehensive guide to women's rights and legal protections",
            duration: "45 mins",
            lessons: [
                {
                    title: "Domestic Violence Laws",
                    content: "Understanding the Domestic Violence Act and how to seek protection and legal remedies.",
                    videoUrl: "#"
                },
                {
                    title: "Workplace Rights",
                    content: "Know your rights in the workplace including equal pay, maternity benefits, and harassment protection.",
                    videoUrl: "#"
                }
            ],
            quiz: {
                questions: [
                    {
                        question: "The Domestic Violence Act was enacted in which year?",
                        options: ["2005", "2006", "2007", "2008"],
                        correct: 0
                    },
                    {
                        question: "Maternity leave duration under law is:",
                        options: ["12 weeks", "16 weeks", "20 weeks", "26 weeks"],
                        correct: 3
                    }
                ]
            }
        },
        {
            id: 3,
            title: "Property and Land Rights",
            description: "Understanding property laws and land ownership rights",
            duration: "40 mins",
            lessons: [
                {
                    title: "Land Registration",
                    content: "Process of land registration, required documents, and how to verify property titles.",
                    videoUrl: "#"
                },
                {
                    title: "Inheritance Rights",
                    content: "Understanding inheritance laws and succession rights for both men and women.",
                    videoUrl: "#"
                }
            ],
            quiz: {
                questions: [
                    {
                        question: "Which document proves ownership of land?",
                        options: ["Sale Deed", "Registry", "Title Deed", "All of the above"],
                        correct: 3
                    },
                    {
                        question: "Hindu Succession Act gives equal rights to:",
                        options: ["Sons only", "Daughters only", "Both sons and daughters", "Only married children"],
                        correct: 2
                    }
                ]
            }
        }
    ]
};

// E-Learning State Management
let currentCourse = null;
let currentLesson = 0;
let currentQuiz = null;
let quizScore = 0;
let currentQuestion = 0;

// Initialize E-Learning Module
function initELearning() {
    // Add event listener to E-Learning nav link
    const eLearningLink = document.querySelector('a[href="#"]:nth-child(4)'); // Adjust selector based on your nav structure
    if (eLearningLink && eLearningLink.textContent.includes('E-Learning')) {
        eLearningLink.addEventListener('click', (e) => {
            e.preventDefault();
            showELearningModal();
        });
    }
}

// Create and show E-Learning Modal
function showELearningModal() {
    // Remove existing modal if present
    const existingModal = document.getElementById('eLearningModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal HTML
    const modalHTML = `
        <div id="eLearningModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
                <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-graduation-cap mr-2 text-blue-600"></i>
                        Legal Education Center
                    </h2>
                    <button id="closeELearningModal" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                    <div id="eLearningContent">
                        ${generateCoursesHTML()}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add event listeners
    document.getElementById('closeELearningModal').addEventListener('click', closeELearningModal);
    
    // Add course click listeners
    document.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('click', () => {
            const courseId = parseInt(card.dataset.courseId);
            showCourse(courseId);
        });
    });
}

// Generate courses HTML
function generateCoursesHTML() {
    return `
        <div class="mb-6">
            <h3 class="text-xl font-semibold mb-4">Available Courses</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${eLearningData.courses.map(course => `
                    <div class="course-card bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer border border-blue-200" data-course-id="${course.id}">
                        <div class="flex items-center mb-3">
                            <i class="fas fa-book text-blue-600 text-2xl mr-3"></i>
                            <div>
                                <h4 class="font-bold text-gray-800">${course.title}</h4>
                                <span class="text-sm text-gray-600">${course.duration}</span>
                            </div>
                        </div>
                        <p class="text-gray-700 text-sm mb-3">${course.description}</p>
                        <div class="flex justify-between items-center">
                            <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${course.lessons.length} Lessons</span>
                            <i class="fas fa-arrow-right text-blue-600"></i>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex items-center mb-2">
                <i class="fas fa-lightbulb text-yellow-600 mr-2"></i>
                <h4 class="font-semibold text-yellow-800">Interactive Learning</h4>
            </div>
            <p class="text-yellow-700 text-sm">
                Each course includes video lessons, interactive content, and quizzes to test your knowledge. 
                Complete courses to earn certificates and track your progress.
            </p>
        </div>
    `;
}

// Show specific course content
function showCourse(courseId) {
    currentCourse = eLearningData.courses.find(course => course.id === courseId);
    currentLesson = 0;
    
    const content = document.getElementById('eLearningContent');
    content.innerHTML = generateCourseHTML();
    
    // Add navigation listeners
    document.getElementById('prevLesson')?.addEventListener('click', prevLesson);
    document.getElementById('nextLesson')?.addEventListener('click', nextLesson);
    document.getElementById('startQuiz')?.addEventListener('click', startQuiz);
    document.getElementById('backToCourses')?.addEventListener('click', () => {
        content.innerHTML = generateCoursesHTML();
        // Re-add course card listeners
        document.querySelectorAll('.course-card').forEach(card => {
            card.addEventListener('click', () => {
                const courseId = parseInt(card.dataset.courseId);
                showCourse(courseId);
            });
        });
    });
}

// Generate course content HTML
function generateCourseHTML() {
    const lesson = currentCourse.lessons[currentLesson];
    
    return `
        <div class="mb-4">
            <button id="backToCourses" class="text-blue-600 hover:text-blue-800 flex items-center mb-4">
                <i class="fas fa-arrow-left mr-2"></i>Back to Courses
            </button>
            
            <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg mb-6">
                <h3 class="text-2xl font-bold mb-2">${currentCourse.title}</h3>
                <p class="opacity-90">${currentCourse.description}</p>
                <div class="mt-4 flex items-center">
                    <span class="bg-white bg-opacity-20 px-3 py-1 rounded text-sm">
                        Lesson ${currentLesson + 1} of ${currentCourse.lessons.length}
                    </span>
                </div>
            </div>
        </div>
        
        <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h4 class="text-xl font-semibold mb-4 flex items-center">
                <i class="fas fa-play-circle text-green-600 mr-2"></i>
                ${lesson.title}
            </h4>
            
            <div class="bg-gray-100 h-48 rounded-lg mb-4 flex items-center justify-center">
                <div class="text-center">
                    <i class="fas fa-video text-4xl text-gray-400 mb-2"></i>
                    <p class="text-gray-600">Video Content</p>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700">
                        <i class="fas fa-play mr-2"></i>Play Video
                    </button>
                </div>
            </div>
            
            <div class="prose max-w-none">
                <p class="text-gray-700 leading-relaxed">${lesson.content}</p>
            </div>
        </div>
        
        <div class="flex justify-between items-center">
            <button id="prevLesson" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ${currentLesson === 0 ? 'opacity-50 cursor-not-allowed' : ''}" ${currentLesson === 0 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left mr-2"></i>Previous
            </button>
            
            <div class="text-center">
                <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div class="bg-blue-600 h-2 rounded-full" style="width: ${((currentLesson + 1) / currentCourse.lessons.length) * 100}%"></div>
                </div>
                <span class="text-sm text-gray-600">Progress: ${Math.round(((currentLesson + 1) / currentCourse.lessons.length) * 100)}%</span>
            </div>
            
            ${currentLesson < currentCourse.lessons.length - 1 ? 
                `<button id="nextLesson" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Next<i class="fas fa-chevron-right ml-2"></i>
                </button>` :
                `<button id="startQuiz" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    <i class="fas fa-quiz mr-2"></i>Take Quiz
                </button>`
            }
        </div>
    `;
}

// Navigation functions
function prevLesson() {
    if (currentLesson > 0) {
        currentLesson--;
        showCourse(currentCourse.id);
    }
}

function nextLesson() {
    if (currentLesson < currentCourse.lessons.length - 1) {
        currentLesson++;
        showCourse(currentCourse.id);
    }
}

// Start quiz
function startQuiz() {
    currentQuiz = currentCourse.quiz;
    currentQuestion = 0;
    quizScore = 0;
    
    const content = document.getElementById('eLearningContent');
    content.innerHTML = generateQuizHTML();
    
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.addEventListener('click', selectQuizOption);
    });
    
    document.getElementById('submitAnswer')?.addEventListener('click', submitQuizAnswer);
}

// Generate quiz HTML
function generateQuizHTML() {
    const question = currentQuiz.questions[currentQuestion];
    
    return `
        <div class="mb-4">
            <div class="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 rounded-lg mb-6">
                <h3 class="text-2xl font-bold mb-2">Quiz: ${currentCourse.title}</h3>
                <div class="flex items-center justify-between">
                    <span>Question ${currentQuestion + 1} of ${currentQuiz.questions.length}</span>
                    <span>Score: ${quizScore}/${currentQuestion}</span>
                </div>
            </div>
        </div>
        
        <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h4 class="text-xl font-semibold mb-6">${question.question}</h4>
            
            <div class="space-y-3">
                ${question.options.map((option, index) => `
                    <div class="quiz-option border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition" data-index="${index}">
                        <div class="flex items-center">
                            <div class="w-6 h-6 border-2 border-gray-300 rounded-full mr-3 flex items-center justify-center">
                                <div class="w-3 h-3 bg-blue-600 rounded-full hidden option-selected"></div>
                            </div>
                            <span>${option}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <button id="submitAnswer" class="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 opacity-50 cursor-not-allowed" disabled>
                Submit Answer
            </button>
        </div>
    `;
}

// Quiz option selection
function selectQuizOption(e) {
    // Remove previous selections
    document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.remove('bg-blue-50', 'border-blue-300');
        opt.querySelector('.option-selected').classList.add('hidden');
    });
    
    // Select current option
    const option = e.currentTarget;
    option.classList.add('bg-blue-50', 'border-blue-300');
    option.querySelector('.option-selected').classList.remove('hidden');
    
    // Enable submit button
    const submitBtn = document.getElementById('submitAnswer');
    submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    submitBtn.disabled = false;
}

// Submit quiz answer
function submitQuizAnswer() {
    const selectedOption = document.querySelector('.quiz-option.bg-blue-50');
    const selectedIndex = parseInt(selectedOption.dataset.index);
    const correctIndex = currentQuiz.questions[currentQuestion].correct;
    
    if (selectedIndex === correctIndex) {
        quizScore++;
        showFeedback(true);
    } else {
        showFeedback(false, currentQuiz.questions[currentQuestion].options[correctIndex]);
    }
    
    setTimeout(() => {
        if (currentQuestion < currentQuiz.questions.length - 1) {
            currentQuestion++;
            const content = document.getElementById('eLearningContent');
            content.innerHTML = generateQuizHTML();
            
            document.querySelectorAll('.quiz-option').forEach(option => {
                option.addEventListener('click', selectQuizOption);
            });
            
            document.getElementById('submitAnswer')?.addEventListener('click', submitQuizAnswer);
        } else {
            showQuizResults();
        }
    }, 2000);
}

// Show feedback
function showFeedback(isCorrect, correctAnswer = null) {
    const content = document.getElementById('eLearningContent');
    content.innerHTML = `
        <div class="text-center p-8">
            <div class="${isCorrect ? 'text-green-600' : 'text-red-600'} text-6xl mb-4">
                <i class="fas ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'}"></i>
            </div>
            <h3 class="text-2xl font-bold mb-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}">
                ${isCorrect ? 'Correct!' : 'Incorrect'}
            </h3>
            ${!isCorrect ? `<p class="text-gray-700">The correct answer is: <strong>${correctAnswer}</strong></p>` : ''}
            <div class="mt-4">
                <i class="fas fa-spinner fa-spin text-gray-400"></i>
                <p class="text-gray-600 mt-2">Loading next question...</p>
            </div>
        </div>
    `;
}

// Show quiz results
function showQuizResults() {
    const percentage = Math.round((quizScore / currentQuiz.questions.length) * 100);
    const passed = percentage >= 70;
    
    const content = document.getElementById('eLearningContent');
    content.innerHTML = `
        <div class="text-center p-8">
            <div class="${passed ? 'text-green-600' : 'text-orange-600'} text-6xl mb-4">
                <i class="fas ${passed ? 'fa-trophy' : 'fa-medal'}"></i>
            </div>
            <h3 class="text-3xl font-bold mb-4">Quiz Complete!</h3>
            <div class="bg-gray-100 rounded-lg p-6 mb-6 max-w-md mx-auto">
                <div class="text-4xl font-bold ${passed ? 'text-green-600' : 'text-orange-600'} mb-2">
                    ${quizScore}/${currentQuiz.questions.length}
                </div>
                <div class="text-xl text-gray-700 mb-2">${percentage}%</div>
                <div class="text-sm text-gray-600">
                    ${passed ? 'Congratulations! You passed!' : 'Good effort! Try again to improve your score.'}
                </div>
            </div>
            
            <div class="flex gap-4 justify-center">
                <button onclick="startQuiz()" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                    <i class="fas fa-redo mr-2"></i>Retake Quiz
                </button>
                <button onclick="showCourse(${currentCourse.id})" class="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700">
                    <i class="fas fa-book mr-2"></i>Review Course
                </button>
                <button onclick="document.getElementById('eLearningContent').innerHTML = generateCoursesHTML(); document.querySelectorAll('.course-card').forEach(card => { card.addEventListener('click', () => { const courseId = parseInt(card.dataset.courseId); showCourse(courseId); }); });" class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                    <i class="fas fa-home mr-2"></i>Back to Courses
                </button>
            </div>
        </div>
    `;
}

// Close modal
function closeELearningModal() {
    const modal = document.getElementById('eLearningModal');
    if (modal) {
        modal.remove();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initELearning);

// Also initialize if script is loaded after DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initELearning);
} else {
    initELearning();
}
// Add this HTML section after the hero section in your HTML file
const problemSectionHTML = `
<section class="py-16 bg-gray-50">
    <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-8">Community Legal Support</h2>
        
        <!-- Post Problem Form -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8 max-w-2xl mx-auto">
            <h3 class="text-xl font-bold mb-4">Post Your Legal Problem</h3>
            <form id="problemForm">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Problem Category</label>
                    <select id="problemCategory" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required>
                        <option value="">Select Category</option>
                        <option value="property">Property/Land Rights</option>
                        <option value="family">Family Law</option>
                        <option value="consumer">Consumer Protection</option>
                        <option value="labor">Labor Rights</option>
                        <option value="domestic">Domestic Violence</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Describe Your Problem</label>
                    <textarea id="problemDescription" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Explain your legal issue in detail..." required></textarea>
                </div>
                <div class="mb-4">
                    <label class="flex items-center">
                        <input type="checkbox" id="postAnonymously" class="mr-2">
                        <span class="text-sm text-gray-600">Post anonymously</span>
                    </label>
                </div>
                <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition">
                    Post Problem
                </button>
            </form>
        </div>
        
        <!-- Problems List -->
        <div id="problemsList" class="space-y-6">
            <!-- Problems will be populated here -->
        </div>
    </div>
</section>`;

// Sample data for demonstration
let problems = [
    {
        id: 1,
        category: "Property",
        title: "Land boundary dispute with neighbor",
        description: "My neighbor is claiming 2 feet of my land. I have documents but they're also showing some papers. Need legal advice urgently.",
        author: "Ramesh K.",
        timeAgo: "2 hours ago",
        solutions: [
            {
                lawyer: "Adv. Priya Sharma",
                specialization: "Property Law",
                rating: 4.8,
                solution: "First, get your land surveyed by a licensed surveyor. Then file a civil suit for declaration of title. Keep all original documents safe.",
                timeAgo: "1 hour ago"
            },
            {
                lawyer: "Adv. Rajesh Kumar",
                specialization: "Civil Law",
                rating: 4.6,
                solution: "Consider mediation first. If documents are clear, send a legal notice. Avoid any confrontation with neighbor.",
                timeAgo: "45 minutes ago"
            }
        ]
    },
    {
        id: 2,
        category: "Consumer",
        title: "Online shopping fraud - money not refunded",
        description: "Ordered items worth ₹15,000 online. Received damaged goods. Company is not responding to refund requests for 3 months.",
        author: "Anonymous",
        timeAgo: "5 hours ago",
        solutions: [
            {
                lawyer: "Adv. Meera Patel",
                specialization: "Consumer Protection",
                rating: 4.9,
                solution: "File complaint with District Consumer Forum. Keep all transaction records, screenshots, and communication as evidence.",
                timeAgo: "3 hours ago"
            }
        ]
    }
];

// JavaScript functionality
function initializeProblemSection() {
    // Insert the HTML section (you'll need to add this manually to your HTML)
    // document.querySelector('.hero-section').insertAdjacentHTML('afterend', problemSectionHTML);
    
    // Handle problem form submission
    document.getElementById('problemForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const category = document.getElementById('problemCategory').value;
        const description = document.getElementById('problemDescription').value;
        const isAnonymous = document.getElementById('postAnonymously').checked;
        
        // Create new problem object
        const newProblem = {
            id: problems.length + 1,
            category: category.charAt(0).toUpperCase() + category.slice(1),
            title: description.substring(0, 50) + "...",
            description: description,
            author: isAnonymous ? "Anonymous" : "Current User",
            timeAgo: "Just now",
            solutions: []
        };
        
        // Add to problems array
        problems.unshift(newProblem);
        
        // Clear form
        this.reset();
        
        // Re-render problems
        renderProblems();
        
        // Show success message
        showNotification("Problem posted successfully!", "success");
    });
    
    // Initial render
    renderProblems();
}

function renderProblems() {
    const problemsList = document.getElementById('problemsList');
    
    problemsList.innerHTML = problems.map(problem => `
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">${problem.category}</span>
                    <h3 class="text-lg font-bold mt-2">${problem.title}</h3>
                    <p class="text-gray-600 mt-2">${problem.description}</p>
                </div>
            </div>
            
            <div class="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>Posted by: ${problem.author}</span>
                <span>${problem.timeAgo}</span>
            </div>
            
            <!-- Solutions Section -->
            <div class="border-t pt-4">
                <h4 class="font-semibold text-gray-800 mb-3">Legal Solutions (${problem.solutions.length})</h4>
                
                ${problem.solutions.map(solution => `
                    <div class="bg-green-50 rounded-lg p-4 mb-3">
                        <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center">
                                <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                                    ${solution.lawyer.split(' ')[1][0]}
                                </div>
                                <div>
                                    <div class="font-semibold text-sm">${solution.lawyer}</div>
                                    <div class="text-xs text-gray-600">${solution.specialization}</div>
                                </div>
                            </div>
                            <div class="flex items-center text-xs">
                                <span class="text-yellow-500 mr-1">★</span>
                                <span>${solution.rating}</span>
                            </div>
                        </div>
                        <p class="text-gray-700 text-sm mb-2">${solution.solution}</p>
                        <div class="text-xs text-gray-500">${solution.timeAgo}</div>
                    </div>
                `).join('')}
                
                <!-- Add Solution Form for Lawyers -->
                <div class="mt-4">
                    <button onclick="toggleSolutionForm(${problem.id})" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition">
                        <i class="fas fa-plus mr-1"></i> Add Legal Solution
                    </button>
                    
                    <div id="solutionForm-${problem.id}" class="hidden mt-3 bg-gray-50 p-4 rounded-md">
                        <textarea id="solutionText-${problem.id}" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="Provide your legal advice..."></textarea>
                        <div class="flex justify-end mt-2 space-x-2">
                            <button onclick="toggleSolutionForm(${problem.id})" class="px-3 py-1 text-gray-600 text-sm">Cancel</button>
                            <button onclick="submitSolution(${problem.id})" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">Submit Solution</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function toggleSolutionForm(problemId) {
    const form = document.getElementById(`solutionForm-${problemId}`);
    form.classList.toggle('hidden');
}

function submitSolution(problemId) {
    const solutionText = document.getElementById(`solutionText-${problemId}`).value.trim();
    
    if (!solutionText) {
        showNotification("Please enter a solution", "error");
        return;
    }
    
    // Find the problem and add solution
    const problem = problems.find(p => p.id === problemId);
    if (problem) {
        const newSolution = {
            lawyer: "Adv. Demo Lawyer", // This would come from logged-in user
            specialization: "General Practice",
            rating: 4.5,
            solution: solutionText,
            timeAgo: "Just now"
        };
        
        problem.solutions.unshift(newSolution);
        
        // Clear form and hide it
        document.getElementById(`solutionText-${problemId}`).value = '';
        toggleSolutionForm(problemId);
        
        // Re-render
        renderProblems();
        
        showNotification("Solution added successfully!", "success");
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded-md text-white z-50 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add this check to ensure the problemForm exists
    if (document.getElementById('problemForm')) {
        initializeProblemSection();
    }
});


// Add CSS for better styling (add this to your CSS file)
const additionalCSS = `
.problem-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.problem-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.solution-card {
    border-left: 4px solid #10b981;
}

@media (max-width: 768px) {
    .problem-form {
        margin: 0 1rem;
    }

`;
document.getElementById('speakBtn').addEventListener('click', function() {
    
});
// Enhanced Speech Recognition and Text-to-Speech Implementation
document.addEventListener('DOMContentLoaded', function() {
    // Speech Recognition Elements
    const startRecognitionBtn = document.getElementById('startRecognition');
    const recognitionStatus = document.getElementById('recognitionStatus');
    const recognizedText = document.getElementById('recognizedText');
    const recognitionLanguage = document.getElementById('recognitionLanguage');
    
    // Text-to-Speech Elements
    const speakTextBtn = document.getElementById('speakText');
    const stopSpeakingBtn = document.getElementById('stopSpeaking');
    const textToSpeak = document.getElementById('textToSpeak');
    const speechLanguage = document.getElementById('speechLanguage');
    const readSampleBtn = document.getElementById('readSample');
    
    // Enhanced language support
    const supportedLanguages = {
        // English variants
        'en-US': 'English (US)',
        'en-GB': 'English (UK)',
        'en-AU': 'English (Australia)',
        'en-CA': 'English (Canada)',
        'en-IN': 'English (India)',
        
        // Indian languages
        'hi-IN': 'Hindi',
        'mr-IN': 'Marathi',
        'bn-IN': 'Bengali',
        'ta-IN': 'Tamil',
        'te-IN': 'Telugu',
        'kn-IN': 'Kannada',
        'ml-IN': 'Malayalam',
        'pa-IN': 'Punjabi',
        'gu-IN': 'Gujarati',
        'or-IN': 'Odia',
        'as-IN': 'Assamese',
        'ur-IN': 'Urdu',
        'ne-NP': 'Nepali',
        'si-LK': 'Sinhala',
        
        // European languages
        'es-ES': 'Spanish (Spain)',
        'es-MX': 'Spanish (Mexico)',
        'fr-FR': 'French',
        'de-DE': 'German',
        'it-IT': 'Italian',
        'pt-PT': 'Portuguese (Portugal)',
        'pt-BR': 'Portuguese (Brazil)',
        'ru-RU': 'Russian',
        'nl-NL': 'Dutch',
        'sv-SE': 'Swedish',
        'no-NO': 'Norwegian',
        'da-DK': 'Danish',
        'fi-FI': 'Finnish',
        'pl-PL': 'Polish',
        'cs-CZ': 'Czech',
        'hu-HU': 'Hungarian',
        'ro-RO': 'Romanian',
        'sk-SK': 'Slovak',
        'bg-BG': 'Bulgarian',
        'hr-HR': 'Croatian',
        'sr-RS': 'Serbian',
        'sl-SI': 'Slovenian',
        'et-EE': 'Estonian',
        'lv-LV': 'Latvian',
        'lt-LT': 'Lithuanian',
        'uk-UA': 'Ukrainian',
        'el-GR': 'Greek',
        
        // Asian languages
        'ja-JP': 'Japanese',
        'ko-KR': 'Korean',
        'zh-CN': 'Chinese (Simplified)',
        'zh-TW': 'Chinese (Traditional)',
        'zh-HK': 'Chinese (Hong Kong)',
        'th-TH': 'Thai',
        'vi-VN': 'Vietnamese',
        'ms-MY': 'Malay',
        'id-ID': 'Indonesian',
        'tl-PH': 'Filipino',
        
        // Middle Eastern & African
        'ar-SA': 'Arabic (Saudi Arabia)',
        'ar-EG': 'Arabic (Egypt)',
        'he-IL': 'Hebrew',
        'tr-TR': 'Turkish',
        'fa-IR': 'Persian',
        'sw-KE': 'Swahili',
        'am-ET': 'Amharic',
        'zu-ZA': 'Zulu',
        'af-ZA': 'Afrikaans'
    };
    
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;
    let isRecognizing = false;
    let recognitionTimeout;
    
    // Initialize Speech Recognition
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 3;
        
        recognition.onstart = function() {
            isRecognizing = true;
            recognitionStatus.textContent = "🎤 Listening... Speak now";
            startRecognitionBtn.textContent = "Stop Recognition";
            startRecognitionBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
            startRecognitionBtn.classList.add('bg-red-600', 'hover:bg-red-700');
            
            // Auto-stop after 30 seconds of inactivity
            recognitionTimeout = setTimeout(() => {
                if (isRecognizing) {
                    recognition.stop();
                }
            }, 30000);
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            let errorMessage = "❌ Error occurred: ";
            
            switch(event.error) {
                case 'network':
                    errorMessage += "Network error. Check your internet connection.";
                    break;
                case 'not-allowed':
                    errorMessage += "Microphone access denied. Please allow microphone access.";
                    break;
                case 'no-speech':
                    errorMessage += "No speech detected. Try speaking louder.";
                    break;
                case 'audio-capture':
                    errorMessage += "Audio capture failed. Check your microphone.";
                    break;
                case 'service-not-allowed':
                    errorMessage += "Speech service not allowed for this language.";
                    break;
                default:
                    errorMessage += event.error + ". Please try again.";
            }
            
            recognitionStatus.textContent = errorMessage;
            resetRecognition();
        };
        
        recognition.onend = function() {
            clearTimeout(recognitionTimeout);
            if (isRecognizing) {
                // Try to restart if it ended unexpectedly
                setTimeout(() => {
                    if (isRecognizing) {
                        try {
                            recognition.start();
                        } catch(e) {
                            console.log('Recognition restart failed:', e);
                            resetRecognition();
                        }
                    }
                }, 100);
            } else {
                resetRecognition();
            }
        };
        
        recognition.onresult = function(event) {
            clearTimeout(recognitionTimeout);
            
            let interimTranscript = '';
            let finalTranscript = recognizedText.value;
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                const confidence = event.results[i][0].confidence;
                
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                    console.log('Final transcript confidence:', confidence);
                } else {
                    interimTranscript += transcript;
                }
            }
            
            recognizedText.value = finalTranscript + interimTranscript;
            recognitionStatus.textContent = `🎤 Listening... (${supportedLanguages[recognition.lang] || recognition.lang})`;
            
            // Reset timeout for continuous listening
            recognitionTimeout = setTimeout(() => {
                if (isRecognizing) {
                    recognition.stop();
                }
            }, 30000);
        };
        
        // Handle speech start
        recognition.onspeechstart = function() {
            recognitionStatus.textContent = "🗣️ Speech detected...";
        };
        
        // Handle speech end
        recognition.onspeechend = function() {
            recognitionStatus.textContent = "🎤 Processing...";
        };
        
    } else {
        startRecognitionBtn.disabled = true;
        startRecognitionBtn.textContent = "Not Supported";
        recognitionStatus.textContent = "❌ Speech recognition not supported in this browser";
        console.warn("Speech recognition not supported. Try Chrome, Edge, or Safari.");
    }
    
    // Speech recognition control
    if (startRecognitionBtn) {
        startRecognitionBtn.addEventListener('click', function() {
            if (!SpeechRecognition) {
                alert("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
                return;
            }
            
            if (isRecognizing) {
                recognition.stop();
                clearTimeout(recognitionTimeout);
                resetRecognition();
            } else {
                // Request microphone permission first
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(function(stream) {
                        stream.getTracks().forEach(track => track.stop()); // Stop the stream
                        
                        recognition.lang = recognitionLanguage.value || 'en-US';
                        console.log('Starting recognition with language:', recognition.lang);
                        
                        try {
                            recognition.start();
                        } catch(e) {
                            console.error('Recognition start failed:', e);
                            recognitionStatus.textContent = "❌ Failed to start recognition. Try again.";
                        }
                    })
                    .catch(function(err) {
                        console.error('Microphone access denied:', err);
                        alert("Please allow microphone access to use speech recognition.");
                    });
            }
        });
    }
    
    function resetRecognition() {
        isRecognizing = false;
        recognitionStatus.textContent = "🎤 Ready to listen";
        startRecognitionBtn.textContent = "Start Recognition";
        startRecognitionBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
        startRecognitionBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        clearTimeout(recognitionTimeout);
    }
    
    // Enhanced Text-to-speech implementation
    let currentUtterance = null;
    let availableVoices = [];
    
    function loadVoices() {
        availableVoices = window.speechSynthesis.getVoices();
        console.log('Available voices:', availableVoices.length);
        
        // Populate voice information for debugging
        availableVoices.forEach(voice => {
            console.log(`Voice: ${voice.name}, Lang: ${voice.lang}, Local: ${voice.localService}`);
        });
    }
    
    function findBestVoice(lang) {
        if (!availableVoices.length) {
            loadVoices();
        }
        
        // Try exact match first
        let voice = availableVoices.find(v => v.lang === lang);
        
        // Try language code match (e.g., 'hi' for 'hi-IN')
        if (!voice) {
            const langCode = lang.split('-')[0];
            voice = availableVoices.find(v => v.lang.startsWith(langCode));
        }
        
        // Prefer local voices over remote ones
        if (voice) {
            const localVoice = availableVoices.find(v => v.lang === lang && v.localService);
            if (localVoice) voice = localVoice;
        }
        
        return voice;
    }
    
    function speak(text, lang, rate = 1, pitch = 1) {
        if (!('speechSynthesis' in window)) {
            alert("Text-to-speech is not supported in your browser.");
            return;
        }
        
        // Stop any current speech
        window.speechSynthesis.cancel();
        
        if (!text.trim()) {
            alert("Please enter some text to speak.");
            return;
        }
        
        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.lang = lang;
        currentUtterance.rate = rate;
        currentUtterance.pitch = pitch;
        currentUtterance.volume = 1;
        
        // Find the best voice for the language
        const bestVoice = findBestVoice(lang);
        if (bestVoice) {
            currentUtterance.voice = bestVoice;
            console.log(`Using voice: ${bestVoice.name} for language: ${lang}`);
        } else {
            console.warn(`No specific voice found for language: ${lang}, using default`);
        }
        
        // Event listeners
        currentUtterance.onstart = function() {
            console.log('Speech started');
            if (speakTextBtn) speakTextBtn.textContent = "🔊 Speaking...";
        };
        
        currentUtterance.onend = function() {
            console.log('Speech ended');
            if (speakTextBtn) speakTextBtn.textContent = "🔊 Speak Text";
            currentUtterance = null;
        };
        
        currentUtterance.onerror = function(event) {
            console.error('Speech error:', event.error);
            if (speakTextBtn) speakTextBtn.textContent = "🔊 Speak Text";
            
            let errorMsg = "Speech error: ";
            switch(event.error) {
                case 'network':
                    errorMsg += "Network error occurred";
                    break;
                case 'synthesis-unavailable':
                    errorMsg += "Speech synthesis unavailable for this language";
                    break;
                case 'synthesis-failed':
                    errorMsg += "Speech synthesis failed";
                    break;
                default:
                    errorMsg += event.error;
            }
            alert(errorMsg);
        };
        
        // Speak the text
        window.speechSynthesis.speak(currentUtterance);
    }
    
    // Speak text button
    if (speakTextBtn) {
        speakTextBtn.addEventListener('click', function() {
            const text = textToSpeak.value.trim();
            const lang = speechLanguage.value || 'en-US';
            speak(text, lang);
        });
    }
    
    // Stop speaking button
    if (stopSpeakingBtn) {
        stopSpeakingBtn.addEventListener('click', function() {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                if (speakTextBtn) speakTextBtn.textContent = "🔊 Speak Text";
                console.log('Speech cancelled');
            }
        });
    }
    
    // Enhanced sample texts in multiple languages
    const legalRightsSamples = {
        'en-US': "You have the right to remain silent. You have the right to legal representation. You are presumed innocent until proven guilty in a court of law.",
        'en-GB': "You have the right to remain silent. You have the right to legal representation. You are presumed innocent until proven guilty in a court of law.",
        'en-IN': "You have the right to remain silent. You have the right to legal representation. You are presumed innocent until proven guilty in a court of law.",
        
        // Indian languages
        'hi-IN': "आपको मौन रहने का अधिकार है। आपको कानूनी प्रतिनिधित्व का अधिकार है। आपको न्यायालय में दोषी साबित होने तक निर्दोष माना जाता है।",
        'mr-IN': "तुम्हाला मौन राहण्याचा अधिकार आहे. तुम्हाला कायदेशीर प्रतिनिधित्वाचा अधिकार आहे. कोर्टात दोषी सिद्ध होईपर्यंत तुम्ही निर्दोष आहात असे समजले जाते.",
        'bn-IN': "আপনার নীরব থাকার অধিকার আছে। আপনার আইনি প্রতিনিধিত্বের অধিকার রয়েছে। আদালতে দোষী প্রমাণিত না হওয়া পর্যন্ত আপনি নির্দোষ বলে গণ্য হন।",
        'ta-IN': "நீங்கள் மௌனமாக இருக்க உரிமை உண்டு. உங்களுக்கு சட்ட பிரதிநிதித்துவம் உரிமை உண்டு. நீதிமன்றத்தில் குற்றவாளி என நிரூபிக்கப்படும் வரை நீங்கள் குற்றமற்றவர் என்று கருதப்படுகிறீர்கள்.",
        'te-IN': "మీరు మౌనంగా ఉండే హక్కు మీకు ఉంది. మీకు చట్టపరమైన ప్రాతినిధ్యం హక్కు ఉంది. కోర్టులో నేరం రుజువు కాకముందు మీరు నిర్దోషిగా భావించబడతారు.",
        'kn-IN': "ನೀವು ಮೌನವಾಗಿರುವ ಹಕ್ಕನ್ನು ಹೊಂದಿದ್ದೀರಿ. ನಿಮಗೆ ಕಾನೂನುಬದ್ಧ ಪ್ರಾತಿನಿಧ್ಯದ ಹಕ್ಕು ಇದೆ. ನ್ಯಾಯಾಲಯದಲ್ಲಿ ಅಪರಾಧಿ ಎಂದು ಸಾಬೀತಾಗುವವರೆಗೆ ನೀವು ನಿರಪರಾಧಿ ಎಂದು ಭಾವಿಸಲಾಗುತ್ತದೆ.",
        'ml-IN': "നിങ്ങൾക്ക് മൗനമായിരിക്കാനുള്ള അവകാശമുണ്ട്. നിങ്ങൾക്ക് നിയമപരമായ പ്രാതിനിധ്യത്തിനുള്ള അവകാശമുണ്ട്. കോടതിയിൽ കുറ്റവാളി എന്ന് തെളിയിക്കപ്പെടുന്നതുവരെ നിങ്ങൾ നിരപരാధിയാണെന്ന് കരുതപ്പെടുന്നു.",
        'pa-IN': "ਤੁਹਾਡੇ ਕੋਲ ਚੁੱਪ ਰਹਿਣ ਦਾ ਅਧਿਕਾਰ ਹੈ। ਤੁਹਾਡੇ ਕੋਲ ਕਾਨੂੰਨੀ ਪ੍ਰਤੀਨਿਧਤਾ ਦਾ ਅਧਿਕਾਰ ਹੈ। ਤੁਹਾਨੂੰ ਅਦਾਲਤ ਵਿੱਚ ਦੋਸ਼ੀ ਸਾਬਤ ਹੋਣ ਤੱਕ ਨਿਰਦੋਸ਼ ਮੰਨਿਆ ਜਾਂਦਾ ਹੈ।",
        'gu-IN': "તમારે મૌન રહેવાનો અધિકાર છે. તમારે કાનૂની પ્રતિનિધિત્વનો અધિકાર છે. તમે કોર્ટમાં દોષિત સાબિત થાય ત્યાં સુધી તમે નિર્દોષ ગણવામાં આવો છો.",
        'ur-IN': "آپ کو خاموش رہنے کا حق ہے۔ آپ کو قانونی نمائندگی کا حق ہے۔ آپ کو عدالت میں مجرم ثابت ہونے تک بے قصور سمجھا جاتا ہے۔",
        
        // European languages
        'es-ES': "Tienes derecho a permanecer en silencio. Tienes derecho a representación legal. Se presume tu inocencia hasta que se demuestre tu culpabilidad en un tribunal.",
        'fr-FR': "Vous avez le droit de garder le silence. Vous avez droit à une représentation légale. Vous êtes présumé innocent jusqu'à ce que votre culpabilité soit prouvée devant un tribunal.",
        'de-DE': "Sie haben das Recht zu schweigen. Sie haben das Recht auf rechtliche Vertretung. Sie gelten als unschuldig, bis Ihre Schuld vor Gericht bewiesen ist.",
        'it-IT': "Hai il diritto di rimanere in silenzio. Hai diritto alla rappresentanza legale. Sei presunto innocente fino a quando la tua colpevolezza non è dimostrata in tribunale.",
        'pt-BR': "Você tem o direito de permanecer em silêncio. Você tem direito à representação legal. Você é considerado inocente até que sua culpa seja provada em tribunal.",
        'ru-RU': "Вы имеете право хранить молчание. Вы имеете право на юридическое представительство. Вы считаются невиновным, пока ваша вина не будет доказана в суде.",
        'nl-NL': "Je hebt het recht om te zwijgen. Je hebt recht op juridische vertegenwoordiging. Je wordt onschuldig geacht totdat je schuld bewezen is in een rechtbank.",
        
        // Asian languages
        'ja-JP': "あなたには黙秘権があります。あなたには法的代理人を立てる権利があります。法廷で有罪が証明されるまで、あなたは無罪と推定されます。",
        'ko-KR': "당신은 묵비권을 가지고 있습니다. 당신은 법적 대리인을 둘 권리가 있습니다. 법정에서 유죄가 입증될 때까지 당신은 무죄로 추정됩니다.",
        'zh-CN': "你有权保持沉默。你有权获得法律代表。在法庭上被证明有罪之前，你被推定为无罪。",
        'th-TH': "คุณมีสิทธิ์ที่จะเงียบ คุณมีสิทธิ์ในการมีตัวแทนทางกฎหมาย คุณถือว่าบริสุทธิ์จนกว่าจะมีการพิสูจน์ความผิดในศาล",
        'vi-VN': "Bạn có quyền giữ im lặng. Bạn có quyền được đại diện pháp lý. Bạn được coi là vô tội cho đến khi tội lỗi được chứng minh tại tòa án.",
        'ar-SA': "لديك الحق في التزام الصمت. لديك الحق في التمثيل القانوني. أنت بريء حتى تثبت إدانتك في المحكمة.",
        'tr-TR': "Sessiz kalma hakkınız var. Yasal temsil hakkınız var. Mahkemede suçunuz kanıtlanana kadar masum sayılırsınız."
    };
    
    // Read sample button
    if (readSampleBtn) {
        readSampleBtn.addEventListener('click', function() {
            const lang = speechLanguage.value || 'en-US';
            const sampleText = legalRightsSamples[lang] || legalRightsSamples['en-US'];
            
            if (textToSpeak) {
                textToSpeak.value = sampleText;
            }
            
            speak(sampleText, lang);
        });
    }
    
    // Load voices when they become available
    if ('speechSynthesis' in window) {
        // Load voices initially
        loadVoices();
        
        // Reload voices when they change (some browsers load them asynchronously)
        speechSynthesis.onvoiceschanged = function() {
            loadVoices();
        };
        
        // Force load voices in some browsers
        setTimeout(loadVoices, 100);
    }
    
    // Utility function to test speech synthesis for a language
    window.testLanguageSupport = function(lang) {
        const voice = findBestVoice(lang);
        console.log(`Language ${lang}:`, voice ? `Supported (${voice.name})` : 'Not supported');
        return !!voice;
    };
    
    // Utility function to list all available languages
    window.listAvailableLanguages = function() {
        const languages = [...new Set(availableVoices.map(v => v.lang))].sort();
        console.log('Available languages:', languages);
        return languages;
    };
    
    console.log('Multilingual Speech Recognition & TTS initialized successfully!');
    console.log('Use testLanguageSupport("lang-code") to test language support');
    console.log('Use listAvailableLanguages() to see all available languages');
});
const apiKey = "15e3970184-b8ad-4928-8f3e-dce72c4ebd81"; // Ideally, store this securely
const text = "Hello, world!";
const targetLanguage = "fr"; // Translate to French

fetch(`https://api.example.com/translate?key=${apiKey}&text=${text}&target=${targetLanguage}`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json"
  }
})
  .then(response => response.json())
  .then(data => console.log("Translated text:", data.translatedText))
  .catch(error => console.error("Error:", error));


// Language selector placeholder
document.getElementById('languageSelect').addEventListener('change', function() {
    alert('Language changed to ' + this.options[this.selectedIndex].text + '! In the actual implementation, this would translate the interface using the BHASHINI API.');
});
