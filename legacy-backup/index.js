import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAHJte4EBZDE22L6RpDqn3qm3DUrY5Tkss", // 🚨 Apni API Key daal
    projectId: "my-dashboard-e2eb5",
    authDomain: "my-dashboard-e2eb5.firebaseapp.com"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 🔥 YAHAN WO EMAIL IDs DAAL JISSE LOGIN ALLOW KARNA HAI
const ALLOWED_EMAILS = ["dimplerjoshi2409@gmail.com", "tjangir2010@gmail.com", "nikhilkimasti2409@gmail.com"];

const loginScreen = document.getElementById('loginScreen');
const loginBtn = document.getElementById('googleLoginBtn');
const loginError = document.getElementById('loginErrorMsg');

onAuthStateChanged(auth, (user) => {
    if (user) {
        // Email Check karo (YAHAN CHANGE KIYA HAI)
        if (ALLOWED_EMAILS.includes(user.email)) {
            console.log("Welcome Approved User:", user.email);
            if(loginScreen) loginScreen.style.display = 'none';
            fetchEverything(); // Tera main data load function
        } else {
            // Agar galat email se aaye, toh laat maar ke bahar nikalo
            signOut(auth).then(() => {
                loginError.innerText = `Access Denied! ${user.email} is not authorized.`;
                loginError.style.display = 'block';
            });
        }
    } else {
        if(loginScreen) loginScreen.style.display = 'flex';
    }
});

if(loginBtn) {
    loginBtn.addEventListener('click', () => {
        signInWithPopup(auth, provider).catch(e => {
            loginError.innerText = "Login Failed: " + e.message;
            loginError.style.display = 'block';
        });
    });
}

// --- 2. CLOUD READ ENGINE (FIREBASE) ---
const PROJECT_ID = "my-dashboard-e2eb5"; 
const goalMs = 43200000; // 12 Hours

function formatTime(ms) {
    if (!ms || ms === 0) return "00:00.00";
    let totalSeconds = Math.floor(ms / 1000);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.00`;
}

async function fetchEverything() {
    try {
        // A. Live Data Fetch
        let liveUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/LiveStatus/MyData`;
        let liveRes = await fetch(liveUrl);
        let liveData = await liveRes.json();

        if (liveData.fields) {
            let tMs = parseInt(liveData.fields.totalTimeMs?.integerValue || 0);
            let streak = parseInt(liveData.fields.streak?.integerValue || 0);
            let status = liveData.fields.isStudying?.stringValue || "";

            let display = document.getElementById('display');
            if(display) display.innerText = formatTime(tMs);

            let streakCountDisplay = document.getElementById('streakCountDisplay');
            if(streakCountDisplay) streakCountDisplay.innerText = streak;

            let popoverStreakNumBig = document.getElementById('popoverStreakNumBig');
            if(popoverStreakNumBig) popoverStreakNumBig.innerText = streak;

            let progress = Math.min(tMs / goalMs, 1);
            let popoverBarFill = document.getElementById('popoverBarFill');
            if(popoverBarFill) popoverBarFill.style.width = `${progress * 100}%`;

            let dynamicFire = document.getElementById('dynamicFire');
            if(dynamicFire) dynamicFire.style.transform = `scaleY(${0.3 + (0.7 * progress)})`;

            let popoverTimeText = document.getElementById('popoverTimeText');
            if(popoverTimeText) {
                let hrs = Math.floor(tMs / 3600000);
                let mins = Math.floor((tMs % 3600000) / 60000);
                popoverTimeText.innerHTML = `${hrs}h ${String(mins).padStart(2, '0')}m <span style="color:#888;">/ 12h</span>`;
            }

            document.querySelectorAll('.subject-btn').forEach(btn => {
                btn.classList.remove('active');
                if (status.includes(btn.getAttribute('data-subject'))) btn.classList.add('active');
            });
        }

        // B. History Data Fetch (Gole/Circles ke liye)
        let histUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/HistoryData`;
        let histRes = await fetch(histUrl);
        let histData = await histRes.json();
        updateCircles(histData.documents || []);

    } catch (e) {
        console.error("Cloud Error:", e);
    }
}

function updateCircles(historyDocs) {
    const circles = document.querySelectorAll('.day-circle');
    let today = new Date();
    let jsDay = today.getDay();
    let todayIndex = jsDay === 0 ? 6 : jsDay - 1;

    let historyMap = {};
    historyDocs.forEach(doc => {
        let dateKey = doc.name.split('/').pop().replace(/-/g, '/');
        historyMap[dateKey] = parseInt(doc.fields.totalTimeMs?.integerValue || 0);
    });

    circles.forEach((circle, i) => {
        circle.className = 'day-circle';
        circle.innerHTML = '';

        let loopDate = new Date(today);
        loopDate.setDate(today.getDate() - todayIndex + i);
        let loopStr = loopDate.toLocaleDateString();

        if (i < todayIndex) {
            if (historyMap[loopStr] >= goalMs) {
                circle.classList.add('fire-active');
                circle.innerHTML = '<span class="fire-emoji">🔥</span>';
            } else {
                circle.classList.add('missed-day');
            }
        } else if (i === todayIndex) {
            circle.classList.add('current-day');
        }
    });
}

// --- 3. FIRE ANIMATION ENGINE ---
const fireRed = document.querySelector("#red");
const fireYellow = document.querySelector("#yellow");
let fireFrame = 1;

setInterval(() => {
    fireFrame = fireFrame === 10 ? 1 : fireFrame + 1;
    const frameStr = fireFrame.toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
    if(fireRed) fireRed.style.backgroundImage = `url('https://assets.codepen.io/11339822/RED-${frameStr}.png')`;
    if(fireYellow) fireYellow.style.backgroundImage = `url('https://assets.codepen.io/11339822/YELLOW-${frameStr}.png')`;
}, 140);

// --- 4. SIDEBAR NAVIGATION ---
const navMap = { 'homeBtn': 'index.html', 'historyBtn': 'history.html', 'tasksBtn': 'tasks.html', 'analyticsBtn': 'analytics.html' };
Object.entries(navMap).forEach(([id, url]) => {
    let btn = document.getElementById(id);
    if(btn) btn.addEventListener('click', () => window.location.href = url);
});