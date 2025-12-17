// KarmaLoop System Core - Strict State Manager

// State
let currentStep = 1;
let userData = {
    identity: { name: '', email: '', key: '' },
    academic: { institution: '', qualification: '', field: '', year: '' },
    career: { interests: [], clarity: 50 },
    timestamp: null
};

// Constants
const STORAGE_KEY = 'karmaloop_user_data';
const RESULT_KEY = 'karmaloop_result';
const SESSION_KEY = 'karmaloop_active_session';

// --- SYSTEM INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // 1. Hide ALL Modules
    document.getElementById('auth-module').classList.add('hidden');
    document.getElementById('success-module').classList.add('hidden');
    document.getElementById('dashboard-module').classList.add('hidden');
    document.getElementById('scan-overlay').classList.add('hidden');
    document.getElementById('detail-modal').classList.add('hidden');
    document.getElementById('level-up-overlay').classList.add('hidden');

    // Explicitly attach event listener to ensure it works
    const triggerBtn = document.getElementById('trigger-scan');
    if (triggerBtn) {
        triggerBtn.onclick = initiateScan; // Direct assignment
        console.log("Scan Trigger Attached");
    }

    // 2. Check User State
    const session = localStorage.getItem(SESSION_KEY);

    if (!session) {
        // STATE A: GUEST -> Show Auth Module
        document.getElementById('auth-module').classList.remove('hidden');
        showRegistration(); // Default to Registration
    } else {
        // STATE B: USER -> Show Dashboard Module
        userData = JSON.parse(session);
        document.getElementById('dashboard-module').classList.remove('hidden');

        // Populate Header
        document.getElementById('dash-name').innerText = userData.identity.name;
        document.getElementById('dash-key').innerText = userData.identity.key;
        document.getElementById('dash-avatar').innerText = userData.identity.name.charAt(0).toUpperCase();

        // Check Scan Result
        const result = localStorage.getItem(RESULT_KEY);
        if (result) {
            // SUB-STATE B2: UNLOCKED
            const resData = JSON.parse(result);
            updateGamificationUI(resData.xp_earned);
            unlockDashboard(resData);
        } else {
            // SUB-STATE B1: LOCKED
            updateGamificationUI(0);
            lockDashboard();
        }
    }
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(RESULT_KEY);
    location.reload();
}

// --- MODULE 1: AUTHENTICATION ---
function showLogin() {
    document.querySelectorAll('.form-step').forEach(s => s.classList.add('hidden'));
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('progress-container').classList.add('hidden');
}

function showRegistration() {
    document.querySelectorAll('.form-step').forEach(s => s.classList.add('hidden'));
    document.getElementById('step-1').classList.remove('hidden');
    document.getElementById('progress-container').classList.remove('hidden');
    currentStep = 1;
    updateProgress();
}

function nextStep(step) {
    if (!validateStep(currentStep)) return;
    saveStepData(currentStep);
    document.querySelectorAll('.form-step').forEach(s => s.classList.add('hidden'));
    document.getElementById(`step-${step}`).classList.remove('hidden');
    currentStep = step;
    updateProgress();
}

function prevStep(step) {
    document.querySelectorAll('.form-step').forEach(s => s.classList.add('hidden'));
    document.getElementById(`step-${step}`).classList.remove('hidden');
    currentStep = step;
    updateProgress();
}

function updateProgress() {
    const percent = (currentStep / 4) * 100;
    document.getElementById('progress-fill').style.width = `${percent}%`;
    const labels = document.querySelectorAll('.step-labels span');
    labels.forEach((lbl, idx) => {
        if (idx + 1 === currentStep) lbl.classList.add('active');
        else lbl.classList.remove('active');
    });
}

function validateStep(step) {
    if (step === 1) {
        const name = document.getElementById('full-name').value;
        if (name.length < 2) return false;
        if (!userData.identity.key) return false;
    }
    if (step === 2) {
        const inst = document.getElementById('institution').value;
        const qual = document.getElementById('qualification').value;
        const field = document.getElementById('field').value;
        if (!inst || !qual || !field) return false;
    }
    return true;
}

function saveStepData(step) {
    if (step === 1) {
        userData.identity.name = document.getElementById('full-name').value;
        userData.identity.email = document.getElementById('email').value;
    }
    if (step === 2) {
        userData.academic.institution = document.getElementById('institution').value;
        userData.academic.qualification = document.getElementById('qualification').value;
        userData.academic.field = document.getElementById('field').value;
        userData.academic.year = document.getElementById('year').value;
    }
    if (step === 3) {
        userData.career.clarity = document.getElementById('clarity-range').value;
    }
}

function verifyEmail() {
    const emailInput = document.getElementById('email');
    const status = document.getElementById('email-status');
    const btn = document.getElementById('verify-btn');
    const nextBtn = document.getElementById('btn-step-1');
    const scanBar = document.getElementById('scan-bar');
    const email = emailInput.value;

    if (!email.includes('@') || !email.includes('.')) {
        status.innerText = "Invalid email format.";
        status.className = "status-text error-text";
        return;
    }

    const allUsers = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (allUsers.some(u => u.identity.email === email)) {
        status.innerText = "User already exists. Please log in.";
        status.className = "status-text error-text";
        return;
    }

    btn.disabled = true;
    btn.innerText = "Scanning...";
    scanBar.classList.remove('hidden');
    setTimeout(() => scanBar.classList.add('scanning'), 50);

    setTimeout(() => {
        btn.innerText = "Verified";
        status.innerText = "IDENTITY VERIFIED.";
        status.className = "status-text success-text";
        scanBar.classList.add('hidden');

        const key = generateKey();
        document.getElementById('access-key-display').innerText = key;
        document.getElementById('access-key-group').classList.remove('hidden');

        userData.identity.key = key;
        nextBtn.disabled = false;
    }, 2000);
}

function generateKey() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let random = "";
    for (let i = 0; i < 4; i++) {
        random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `KL-2025-${random}`;
}

function attemptLogin() {
    const email = document.getElementById('login-email').value;
    const key = document.getElementById('login-key').value;
    const status = document.getElementById('login-status');

    const allUsers = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const user = allUsers.find(u => u.identity.email === email && u.identity.key === key);

    if (user) {
        status.innerText = "Credentials Verified. Connecting...";
        status.className = "status-text success-text";
        setTimeout(() => {
            localStorage.setItem(SESSION_KEY, JSON.stringify(user));
            initApp();
        }, 1000);
    } else {
        status.innerText = "Access Denied. Invalid Email or Key.";
        status.className = "status-text error-text";
    }
}

function submitRegistration() {
    saveStepData(3);
    userData.timestamp = new Date().toISOString();
    saveUser();

    // Show Success Module
    document.getElementById('auth-module').classList.add('hidden');
    document.getElementById('success-module').classList.remove('hidden');
    document.getElementById('success-name').innerText = userData.identity.name;
    document.getElementById('success-key').innerText = userData.identity.key;
}

function enterSystem() {
    document.getElementById('success-module').classList.add('hidden');
    initApp();
}

function saveUser() {
    const allUsers = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const idx = allUsers.findIndex(u => u.identity.email === userData.identity.email);
    if (idx > -1) allUsers[idx] = userData;
    else allUsers.push(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allUsers));
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
}

function toggleInterest(btn, interest) {
    btn.classList.toggle('selected');
    const idx = userData.career.interests.indexOf(interest);
    if (idx > -1) userData.career.interests.splice(idx, 1);
    else userData.career.interests.push(interest);
}

// --- MODULE 2: DASHBOARD ---
function updateGamificationUI(xp) {
    document.getElementById('karma-points').innerText = xp;
    document.getElementById('xp-level').innerText = xp >= 1000 ? 2 : 1;
    const badgeContainer = document.getElementById('badges-container');

    // Badge Logic
    const badges = [
        { id: 'pioneer', name: 'NEURAL PIONEER', icon: '🧬', threshold: 500, class: 'pioneer' },
        { id: 'oracle', name: 'NEURAL LINK', icon: '🤖', threshold: 600, class: 'analyst' }, // New Badge
        { id: 'analyst', name: 'SECTOR ANALYST', icon: '👁️', threshold: 1000, class: 'analyst' },
        { id: 'walker', name: 'VOID WALKER', icon: '🔒', threshold: 2000, class: 'walker' }
    ];

    let html = '<div class="badge-deck">';
    badges.forEach(b => {
        const isUnlocked = xp >= b.threshold;
        const statusClass = isUnlocked ? b.class : 'locked';
        const icon = isUnlocked ? b.icon : '🔒';
        const title = isUnlocked ? b.name : 'LOCKED';

        html += `<div class="holo-badge ${statusClass}" title="${title}">${icon}</div>`;
    });
    html += '</div>';

    badgeContainer.innerHTML = html;

    // Check Oracle Access
    checkOracleAccess(xp);
}

function lockDashboard() {
    document.querySelectorAll('.quadrant').forEach(q => q.classList.add('locked'));
    document.querySelectorAll('.quadrant').forEach(q => q.classList.remove('unlocked'));
    document.getElementById('scan-btn').style.display = 'flex';
}

function unlockDashboard(result) {
    document.querySelectorAll('.quadrant').forEach(q => {
        q.classList.remove('locked');
        q.classList.add('unlocked');
    });

    // Keep button visible for Re-Test
    const scanContainer = document.getElementById('scan-btn');
    scanContainer.style.display = 'flex';

    const btn = document.getElementById('trigger-scan');
    btn.innerHTML = "RE-CALIBRATE<br>SYSTEM";

    renderQuad('quad-s', result.strength, "Primary Operating Mode", "UPGRADE PROTOCOLS", () => openModal('strength', result));
    renderQuad('quad-w', result.weakness, "System Vulnerability Detected", "PATCH BUG", () => openModal('weakness', result));
    renderQuad('quad-o', result.opportunity, "Optimal Market Fit", "ACCESS DATA", () => openModal('opportunity', result));
    renderQuad('quad-t', result.threat, "External Risk Factor", "ACTIVATE SHIELD", () => openModal('threat', result));
}

function renderQuad(id, title, subtext, btnText, onClick) {
    const q = document.getElementById(id);
    q.querySelector('.data-list').innerHTML = `<li class="result-title">${title}</li><li class="result-subtext">${subtext}</li>`;
    q.querySelector('.data-list').classList.remove('hidden');
    const btn = q.querySelector('.action-btn');
    btn.innerText = btnText;
    btn.classList.remove('hidden');
    btn.onclick = onClick;
}

// --- MODULE 3: SCAN OVERLAY ---
const questions = [
    // --- SECTOR A: STRENGTHS (Determines Archetype) ---
    {
        id: "s1", text: "When a project fails, your instinct is:", type: "mcq",
        options: [
            { text: "Analyze the data to find the bug", tag: "Analytical" },
            { text: "Rally the team to keep morale high", tag: "Leader" },
            { text: "Brainstorm a completely new solution", tag: "Creative" },
            { text: "Create a checklist to fix it step-by-step", tag: "Operational" }
        ]
    },
    { id: "s2", text: "I can explain complex ideas simply to people who don't understand them.", type: "slider", min: 1, max: 5 },
    {
        id: "s3", text: "In a hackathon team, you function best as:", type: "mcq",
        options: [
            { text: "The Architect (Planning & Structure)", tag: "Operational" },
            { text: "The Pitcher (Presentation & Selling)", tag: "Leader" },
            { text: "The Hacker (Execution & Building)", tag: "Analytical" },
            { text: "The Designer (UX & Vision)", tag: "Creative" }
        ]
    },
    { id: "s4", text: "I lose track of time when I am solving a difficult problem.", type: "slider", min: 1, max: 5 },
    {
        id: "s5", text: "Which output makes you proudest?", type: "mcq",
        options: [
            { text: "A perfectly optimized algorithm", tag: "Analytical" },
            { text: "A team that works smoothly together", tag: "Leader" },
            { text: "A beautiful, unique user interface", tag: "Creative" },
            { text: "A completed project delivered on time", tag: "Operational" }
        ]
    },

    // --- SECTOR B: WEAKNESSES (Identifies Blocker) ---
    {
        id: "w1", text: "What stops you from starting a new skill?", type: "mcq",
        options: [
            { text: "I don't know where to start", tag: "Clarity Gap" },
            { text: "I'm afraid I'll be bad at it", tag: "Confidence Gap" },
            { text: "I get bored too quickly", tag: "Consistency Gap" },
            { text: "I don't have enough time", tag: "Discipline Gap" }
        ]
    },
    { id: "w2", text: "I tend to procrastinate until the deadline is very close.", type: "slider", min: 1, max: 5 },
    {
        id: "w3", text: "When you make a mistake, you usually:", type: "mcq",
        options: [
            { text: "Hide it and try to fix it silently", tag: "Fear" },
            { text: "Overthink it for days", tag: "Anxiety" },
            { text: "Blame the situation", tag: "Deflection" },
            { text: "Ask for help immediately", tag: "Growth" }
        ]
    },
    { id: "w4", text: "Public speaking or presenting my work makes me anxious.", type: "slider", min: 1, max: 5 },
    {
        id: "w5", text: "Your biggest academic struggle is:", type: "mcq",
        options: [
            { text: "Understanding abstract concepts", tag: "Logic" },
            { text: "Memorizing theory", tag: "Memory" },
            { text: "Applying theory to practicals", tag: "Application" },
            { text: "Staying interested in the syllabus", tag: "Engagement" }
        ]
    },

    // --- SECTOR C: OPPORTUNITIES (Identifies Path) ---
    {
        id: "o1", text: "If you could intern anywhere tomorrow, you'd pick:", type: "mcq",
        options: [
            { text: "A Tech Giant (Google/Microsoft)", tag: "Corporate" },
            { text: "A Fast-paced Startup", tag: "Startup" },
            { text: "A Creative Studio", tag: "Design" },
            { text: "A Research Lab", tag: "R&D" }
        ]
    },
    { id: "o2", text: "I actively read news about tech trends and market shifts.", type: "slider", min: 1, max: 5 },
    {
        id: "o3", text: "How do you view your current degree?", type: "mcq",
        options: [
            { text: "It's exactly what I want to do", tag: "Aligned" },
            { text: "It's a foundation, but I'll pivot", tag: "Pivot" },
            { text: "It's just a backup plan", tag: "Backup" },
            { text: "I have no idea why I'm here", tag: "Lost" }
        ]
    },
    { id: "o4", text: "I am willing to learn a skill completely outside my field.", type: "slider", min: 1, max: 5 },
    {
        id: "o5", text: "The 'Dream Job' for you offers:", type: "mcq",
        options: [
            { text: "High Stability & Pay", tag: "Security" },
            { text: "Freedom & Creativity", tag: "Freedom" },
            { text: "Power & Influence", tag: "Power" },
            { text: "Impact & Solving Problems", tag: "Impact" }
        ]
    },

    // --- SECTOR D: THREATS (Identifies Risk) ---
    { id: "t1", text: "I feel like my peers are moving much faster than I am.", type: "slider", min: 1, max: 5 },
    {
        id: "t2", text: "What is your biggest career fear?", type: "mcq",
        options: [
            { text: "Being replaced by AI/Automation", tag: "AI Obsolescence" },
            { text: "Choosing the wrong career path", tag: "Direction Error" },
            { text: "Burning out before I hit 30", tag: "Burnout" },
            { text: "Not making enough money", tag: "Financial Instability" }
        ]
    },
    { id: "t3", text: "I feel pressure from family/society to follow a specific path.", type: "slider", min: 1, max: 5 },
    {
        id: "t4", text: "How prepared are you for a job interview right now?", type: "mcq",
        options: [
            { text: "I'd crush it", tag: "High" },
            { text: "I'd survive", tag: "Med" },
            { text: "I'd freeze up", tag: "Low" },
            { text: "I have nothing to show", tag: "Zero" }
        ]
    },
    {
        id: "t5", text: "The biggest barrier to your success is:", type: "mcq",
        options: [
            { text: "Lack of Guidance/Mentors", tag: "Guidance" },
            { text: "Lack of Financial Resources", tag: "Money" },
            { text: "Lack of Motivation", tag: "Drive" },
            { text: "Distractions (Phone/Games/Socials)", tag: "Focus" }
        ]
    }
];

let currentQIndex = 0;
let scanAnswers = [];

let userAnswers = {};

window.initiateScan = initiateScan; // Ensure global access

function initiateScan() {
    console.log("Initiating Neural Scan...");
    try {
        const dash = document.getElementById('dashboard-module');
        const overlay = document.getElementById('scan-overlay');

        if (!dash || !overlay) {
            console.error("Modules not found!");
            return;
        }

        dash.classList.add('hidden');
        overlay.classList.remove('hidden');

        currentQIndex = 0;
        userAnswers = {};
        renderQuestion(currentQIndex);
    } catch (e) {
        console.error("Scan Error:", e);
        alert("Neural Link Error: " + e.message);
    }
}

// ... (renderQuestion and handleAnswer remain the same) ...

function calculateSWOT(answers) {
    // 1. Determine Archetype (Strength) - Based on S1, S3, S5
    const sTags = [answers['s1'], answers['s3'], answers['s5']];
    const sCounts = {};
    sTags.forEach(tag => sCounts[tag] = (sCounts[tag] || 0) + 1);

    let archetype = "System Architect"; // Default
    let max = 0;
    for (const [tag, count] of Object.entries(sCounts)) {
        if (count > max) { max = count; archetype = tag; }
    }

    // Map Tags to Titles
    const strengthMap = {
        "Analytical": "SYSTEM ARCHITECT",
        "Leader": "FACTION LEADER",
        "Creative": "NEURAL ARTIST",
        "Operational": "OPERATIONS PRIME"
    };

    // 2. Identify Blocker (Weakness) - Based on W1
    const wTag = answers['w1'];
    const weaknessMap = {
        "Clarity Gap": "CLARITY VOID",
        "Confidence Gap": "CONFIDENCE GLITCH",
        "Consistency Gap": "CONSISTENCY LAG",
        "Discipline Gap": "TIME DILATION"
    };

    // 3. Identify Path (Opportunity) - Based on O1
    const oTag = answers['o1'];
    const opportunityMap = {
        "Corporate": "CORPORATE NEXUS",
        "Startup": "STARTUP FRONTIER",
        "Design": "DESIGN SYNDICATE",
        "R&D": "R&D LABS"
    };

    // 4. Identify Risk (Threat) - Based on T2
    const tTag = answers['t2'];
    // Direct mapping for threats as they are already descriptive

    return {
        strength: strengthMap[archetype] || "SYSTEM ARCHITECT",
        weakness: weaknessMap[wTag] || "CLARITY VOID",
        opportunity: opportunityMap[oTag] || "STARTUP FRONTIER",
        threat: tTag ? tTag.toUpperCase() : "AI OBSOLESCENCE",
        xp_earned: 500,
        timestamp: new Date().toISOString()
    };
}

function renderQuestion(index) {
    const q = questions[index];
    const container = document.getElementById('question-container');
    const qText = document.getElementById('q-text');
    const optionsGrid = document.getElementById('q-options');
    const progressBar = document.getElementById('scan-progress-fill');

    // Fade Out
    qText.style.opacity = 0;
    optionsGrid.style.opacity = 0;

    setTimeout(() => {
        // Update Content
        qText.innerText = q.text;
        optionsGrid.innerHTML = '';

        // Progress Bar
        const progress = ((index) / questions.length) * 100;
        progressBar.style.width = `${progress}%`;

        // Render Options
        if (q.type === 'mcq') {
            q.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'scan-tile glass-tile';
                btn.innerText = opt.text;
                btn.onclick = () => handleAnswer(q.id, opt.tag);
                optionsGrid.appendChild(btn);
            });
        } else if (q.type === 'slider') {
            const sliderWrapper = document.createElement('div');
            sliderWrapper.className = 'slider-wrapper';

            const slider = document.createElement('input');
            slider.type = 'range';
            slider.min = q.min;
            slider.max = q.max;
            slider.value = 3;
            slider.className = 'scan-slider';

            const valDisplay = document.createElement('div');
            valDisplay.className = 'slider-value';
            valDisplay.innerText = "3";

            slider.oninput = (e) => valDisplay.innerText = e.target.value;

            const nextBtn = document.createElement('button');
            nextBtn.className = 'btn-primary btn-next';
            nextBtn.innerText = "CONFIRM";
            nextBtn.onclick = () => handleAnswer(q.id, slider.value);

            sliderWrapper.appendChild(valDisplay);
            sliderWrapper.appendChild(slider);
            sliderWrapper.appendChild(nextBtn);
            optionsGrid.appendChild(sliderWrapper);
        }

        // Fade In
        qText.style.opacity = 1;
        optionsGrid.style.opacity = 1;
    }, 300);
}

function handleAnswer(questionId, value) {
    userAnswers[questionId] = value;
    currentQIndex++;

    if (currentQIndex < questions.length) {
        renderQuestion(currentQIndex);
    } else {
        finishScan();
    }
}

function finishScan() {
    document.getElementById('scan-overlay').classList.add('hidden');
    // Mock Result Calculation for now - preserving existing flow
    const result = calculateSWOT(userAnswers);
    localStorage.setItem(RESULT_KEY, JSON.stringify(result));
    triggerLevelUp();
}



function triggerLevelUp() {
    const overlay = document.getElementById('level-up-overlay');
    overlay.classList.remove('hidden');
    setTimeout(() => {
        overlay.classList.add('hidden');
        initApp(); // Refresh Dashboard State
    }, 2500);
}

// --- MODULE 4: DETAIL MODAL ---
function openModal(typeChar, result) {
    const modal = document.getElementById('detail-modal');
    const title = document.getElementById('modal-title');
    const grid = document.getElementById('modal-content-grid');
    const summaryText = document.getElementById('ai-summary-text');

    // Map char to full type
    const typeMap = { 's': 'strength', 'w': 'weakness', 'o': 'opportunity', 't': 'threat' };
    const type = typeMap[typeChar] || typeChar;

    modal.classList.remove('hidden');
    modal.className = `analysis-modal modal-${type.charAt(0)}`;

    let content = {};
    if (type === 'strength') content = getStrengthContent(result.strength);
    if (type === 'weakness') content = getWeaknessContent(result.weakness);
    if (type === 'opportunity') content = getOpportunityContent(result.opportunity);
    if (type === 'threat') content = getThreatContent(result.threat);

    title.innerText = `${type.toUpperCase()} ANALYSIS // ${content.title}`;

    // Use HTML-Aware Typewriter
    typeWriterHTML(summaryText, content.summary, 10);

    grid.innerHTML = content.cards;
}

function closeModal() {
    document.getElementById('detail-modal').classList.add('hidden');
    document.getElementById('ai-summary-text').innerHTML = '';
}

// HTML-Aware Typewriter Effect
function typeWriterHTML(element, html, speed = 10) {
    let i = 0;
    element.innerHTML = '';

    function type() {
        if (i < html.length) {
            let char = html.charAt(i);

            if (char === '<') {
                // Find closing '>'
                let tagEnd = html.indexOf('>', i);
                if (tagEnd !== -1) {
                    // Append entire tag instantly
                    element.innerHTML += html.substring(i, tagEnd + 1);
                    i = tagEnd + 1;
                    setTimeout(type, speed); // Continue typing
                } else {
                    // Malformed tag, just print char
                    element.innerHTML += char;
                    i++;
                    setTimeout(type, speed);
                }
            } else {
                // Normal character
                element.innerHTML += char;
                i++;
                setTimeout(type, speed);
            }
        }
    }
    type();
}

// Content Engines (Expanded)
function getStrengthContent(archetype) {
    return {
        title: archetype,
        summary: `
            <p><strong>NEURAL SCAN COMPLETE:</strong> Your cognitive architecture is heavily optimized for <strong>${archetype}</strong>.</p>
            <p><strong>ANALYSIS:</strong> You possess a rare ability to deconstruct complex chaotic systems into linear, executable logic. This trait is found in only 4% of the developer population. Your code isn't just functional; it's structural art. You see patterns where others see noise.</p>
            <p><strong>OPTIMIZATION PROTOCOL:</strong> To maximize this trait, you must move beyond syntax. Stop writing code; start designing systems. Focus on Scalability, Microservices Architecture, and High-Level System Design. Your brain is a blueprint engine—feed it bigger problems.</p>
        `,
        cards: `
            <div class="content-card yt-card"><div><span class="source">YOUTUBE</span><h4>Advanced System Design Patterns</h4></div><button class="btn-sm">Watch Now</button></div>
            <div class="content-card yt-card"><div><span class="source">YOUTUBE</span><h4>Mastering Data Structures</h4></div><button class="btn-sm">Watch Now</button></div>
            <div class="content-card yt-card"><div><span class="source">YOUTUBE</span><h4>The Art of Scalable Code</h4></div><button class="btn-sm">Watch Now</button></div>
        `
    };
}
function getWeaknessContent(blocker) {
    return {
        title: blocker,
        summary: `
            <p><strong>SYSTEM ALERT:</strong> Critical vulnerability detected in sector <strong>'${blocker}'</strong>.</p>
            <p><strong>DIAGNOSTIC:</strong> While your technical core is operating at peak efficiency, your external interface layer is lagging. You are likely under-selling your value by 40-60%. In the current market, "Quiet Competence" is often mistaken for "Lack of Initiative".</p>
            <p><strong>PATCH REQUIRED:</strong> This is not a personality flaw; it is a missing skill module. You need to treat 'Communication' as an API. Learn to document your wins, speak in meetings, and articulate your architectural decisions. If you don't broadcast your signal, no one will tune in.</p>
        `,
        cards: `
            <div class="content-card yt-card"><div><span class="source">YOUTUBE</span><h4>Public Speaking for Introverts</h4></div><button class="btn-sm">Watch Now</button></div>
            <div class="content-card yt-card"><div><span class="source">YOUTUBE</span><h4>Building Confidence in 5 Mins</h4></div><button class="btn-sm">Watch Now</button></div>
            <div class="content-card yt-card"><div><span class="source">YOUTUBE</span><h4>Imposter Syndrome Guide</h4></div><button class="btn-sm">Watch Now</button></div>
        `
    };
}
function getOpportunityContent(path) {
    return {
        title: path,
        summary: `
            <p><strong>MARKET SCAN:</strong> The algorithm has identified a high-probability trajectory: <strong>${path}</strong>.</p>
            <p><strong>DATA MATCH:</strong> Your skill matrix aligns 85% with the current demands of the Tier-1 Tech Ecosystem (Pune, Bangalore, Remote). The market is shifting away from generic coding towards 'Specialized Problem Solving'. You are positioned perfectly to ride this wave.</p>
            <p><strong>EXECUTION STRATEGY:</strong> Do not apply for 'Junior' roles. Your profile signals 'Mid-Level Potential'. Target companies building high-scale products (FinTech, AI, Cloud Infra). Update your portfolio to showcase <em>solutions</em>, not just projects.</p>
        `,
        cards: `
            <div class="content-card job-card"><div><span class="role">Jr. React Developer</span><span class="company">NeuralNet AI</span><span class="location-badge">Remote</span></div><button class="btn-sm">Apply Now</button></div>
            <div class="content-card job-card"><div><span class="role">Growth Hacker</span><span class="company">FinTech Flow</span><span class="location-badge">Pune</span></div><button class="btn-sm">Apply Now</button></div>
            <div class="content-card job-card"><div><span class="role">Product Intern</span><span class="company">Stratos</span><span class="location-badge">Mumbai</span></div><button class="btn-sm">Apply Now</button></div>
        `
    };
}
function getThreatContent(risk) {
    return {
        title: risk,
        summary: `
            <p><strong>RISK FACTOR:</strong> <strong>'${risk}'</strong> identified in long-term projection.</p>
            <p><strong>FORECAST:</strong> The era of 'Routine Coding' is ending. By 2026, AI agents will handle 90% of boilerplate generation. If your value proposition is solely "I write code," you are at risk of obsolescence.</p>
            <p><strong>MITIGATION:</strong> You must pivot up the value chain. Move from 'Builder' to 'Architect'. Focus on the human-centric skills that AI cannot replicate: Empathy, Complex Decision Making, and Leadership. Become the one who <em>directs</em> the AI, not the one replaced by it.</p>
        `,
        cards: `
            <div class="content-card mentor-card"><div class="mentor-avatar">🧠</div><h4>Dr. Arjun V.</h4><p>Career Psychologist</p><button class="btn-sm">Request Chat</button></div>
            <div class="content-card mentor-card"><div class="mentor-avatar">🚀</div><h4>Sarah J.</h4><p>Industry Veteran</p><button class="btn-sm">Book Session</button></div>
        `
    };
}

// --- THE ORACLE (CHATBOT) ---
function checkOracleAccess(xp) {
    const fab = document.getElementById('oracle-fab');
    if (xp >= 500) {
        fab.classList.remove('hidden');
    } else {
        fab.classList.add('hidden');
    }
}

function toggleOracle() {
    const win = document.getElementById('oracle-window');
    const isHidden = win.classList.contains('hidden');

    if (isHidden) {
        win.classList.remove('hidden');
        initOracleChat();
    } else {
        win.classList.add('hidden');
    }
}

let oracleInitialized = false;
function initOracleChat() {
    // 1. Check for First Interaction Bonus
    const resultStr = localStorage.getItem(RESULT_KEY);
    if (resultStr) {
        const result = JSON.parse(resultStr);
        if (!result.oracle_visited) {
            // Award XP
            result.oracle_visited = true;
            result.xp_earned = (result.xp_earned || 500) + 100;
            localStorage.setItem(RESULT_KEY, JSON.stringify(result));

            // Update UI
            updateGamificationUI(result.xp_earned);
            addOracleMessage("SYSTEM ALERT: Neural Link Established. +100 XP Awarded. New Badge Unlocked.");
        }
    }

    if (oracleInitialized) return;
    oracleInitialized = true;

    const result = JSON.parse(localStorage.getItem(RESULT_KEY));
    const archetype = result ? result.strength : "User";

    addOracleMessage(`Greetings, ${archetype}. My logic cores are online. How can I assist your optimization today?`);
}
// --- MODULE 5: USER PROFILE & AVATAR ---
function toggleProfile() {
    const dash = document.getElementById('dashboard-module');
    const profile = document.getElementById('view-profile');

    if (profile.classList.contains('hidden')) {
        dash.classList.add('hidden');
        profile.classList.remove('hidden');
        loadProfileData();
        initAvatar();
    } else {
        profile.classList.add('hidden');
        dash.classList.remove('hidden');
        initApp(); // Refresh dashboard data
    }
}

function loadProfileData() {
    document.getElementById('edit-name').value = userData.identity.name;
    document.getElementById('edit-field').value = userData.academic.field;
    // Assuming 'interest' is the first one or a string
    document.getElementById('edit-interest').value = userData.career.interests[0] || '';
}

function saveProfile() {
    userData.identity.name = document.getElementById('edit-name').value;
    userData.academic.field = document.getElementById('edit-field').value;
    const interest = document.getElementById('edit-interest').value;
    if (interest) userData.career.interests[0] = interest;

    saveUser();
    alert("IDENTITY REWRITTEN. PROFILE UPDATED.");
}

// --- RIVE AVATAR INTEGRATION ---
let riveInstance = null;
let avatarInputs = {};

function initAvatar() {
    if (riveInstance) return; // Already loaded

    const canvas = document.getElementById('rive-canvas');
    if (!canvas) {
        console.error("Rive Canvas not found!");
        return;
    }

    // Wait for visibility
    setTimeout(() => {
        try {
            riveInstance = new rive.Rive({
                src: 'avatar.riv',
                canvas: canvas,
                autoplay: true,
                stateMachines: 'State Machine 1', // Default assumption
                onLoad: () => {
                    console.log('Avatar Loaded Successfully');
                    riveInstance.resizeDrawingSurfaceToCanvas();

                    // Auto-Detect Inputs
                    const inputs = riveInstance.stateMachineInputs('State Machine 1');
                    console.log("Detected Rive Inputs:", inputs);

                    if (inputs) {
                        inputs.forEach(input => {
                            avatarInputs[input.name] = input;
                        });
                    }
                },
                onError: (err) => {
                    console.error("Rive Load Error:", err);
                }
            });
        } catch (e) {
            console.error("Rive Init Exception:", e);
        }
    }, 100);
}

function updateAvatarInput(name, value) {
    document.getElementById('exp-val').innerText = `(${value})`;
    // Map to Rive Input (Developer needs to check console for exact name)
    // Example: If input is named "Expression"
    if (avatarInputs[name]) {
        avatarInputs[name].value = parseFloat(value);
    } else {
        // Fallback: Try to find a number input
        const numInput = Object.values(avatarInputs).find(i => i.type === 56); // 56 is Number type
        if (numInput) numInput.value = parseFloat(value);
    }
}

function toggleAvatarTheme() {
    // Example: Toggle a boolean input named "Theme" or "Skin"
    // Fallback: Find a boolean input
    const boolInput = Object.values(avatarInputs).find(i => i.type === 59); // 59 is Boolean
    if (boolInput) {
        boolInput.value = !boolInput.value;
        console.log("Toggled Theme:", boolInput.name, boolInput.value);
    } else {
        console.warn("No Boolean input found for Theme toggle.");
    }
}
function addOracleMessage(text, isUser = false) {
    const container = document.getElementById('oracle-messages');
    const msg = document.createElement('div');
    msg.className = `msg ${isUser ? 'user' : 'bot'}`;
    msg.innerText = text;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}

function sendOracleMessage() {
    const input = document.getElementById('oracle-input');
    const text = input.value.trim();
    if (!text) return;

    addOracleMessage(text, true);
    input.value = '';

    // Simple Mock Response
    setTimeout(() => {
        addOracleMessage("I am processing your query. My neural link to the main server is currently limited to diagnostic mode. Please proceed with the dashboard modules.");
    }, 1000);
}

// --- MODULE 6: INTERVIEW SIMULATOR ---
function toggleInterview() {
    const dash = document.getElementById('dashboard-module');
    const interview = document.getElementById('interview-module');

    if (interview.classList.contains('hidden')) {
        dash.classList.add('hidden');
        interview.classList.remove('hidden');

        // Unlock Badge on First Visit
        unlockInterviewBadge();
    } else {
        interview.classList.add('hidden');
        dash.classList.remove('hidden');
        initApp(); // Refresh dashboard
    }
}

function unlockInterviewBadge() {
    const resultStr = localStorage.getItem(RESULT_KEY);
    if (resultStr) {
        const result = JSON.parse(resultStr);
        if (!result.interview_unlocked) {
            result.interview_unlocked = true;
            result.xp_earned = (result.xp_earned || 0) + 200; // Bonus XP
            localStorage.setItem(RESULT_KEY, JSON.stringify(result));

            updateGamificationUI(result.xp_earned);
            alert("NEW BADGE UNLOCKED: COMMUNICATOR (+200 XP)");
        }
    }
}

// Override updateGamificationUI to include new badge
function updateGamificationUI(xp) {
    const result = JSON.parse(localStorage.getItem(RESULT_KEY) || '{}');

    // Calculate Level based on Milestones
    let level = 1;
    if (result.oracle_visited) level = Math.max(level, 2);
    if (result.interview_unlocked) level = Math.max(level, 3);

    document.getElementById('karma-points').innerText = xp;
    document.getElementById('xp-level').innerText = level;

    const badgeContainer = document.getElementById('badges-container');
    const hasInterviewBadge = result.interview_unlocked;

    // Badge Logic
    const badges = [
        { id: 'pioneer', name: 'NEURAL PIONEER', icon: '🧬', threshold: 500, class: 'pioneer' },
        { id: 'oracle', name: 'NEURAL LINK', icon: '🤖', threshold: 600, class: 'analyst' },
        { id: 'communicator', name: 'COMMUNICATOR', icon: '🎙️', threshold: 0, class: 'analyst', special: true, unlocked: hasInterviewBadge },
        { id: 'analyst', name: 'SECTOR ANALYST', icon: '👁️', threshold: 1000, class: 'analyst' },
        { id: 'walker', name: 'VOID WALKER', icon: '🔒', threshold: 2000, class: 'walker' }
    ];

    let html = '<div class="badge-deck">';
    badges.forEach(b => {
        let isUnlocked = xp >= b.threshold;
        if (b.special) isUnlocked = b.unlocked; // Override for special badges

        const statusClass = isUnlocked ? b.class : 'locked';
        const icon = isUnlocked ? b.icon : '🔒';
        const title = isUnlocked ? b.name : 'LOCKED';

        html += `<div class="holo-badge ${statusClass}" title="${title}">${icon}</div>`;
    });
    html += '</div>';

    badgeContainer.innerHTML = html;

    // Check Oracle Access
    checkOracleAccess(xp);
}
