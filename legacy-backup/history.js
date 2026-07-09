// =========================================================================
// 📚 PARENTS DASHBOARD - HISTORY ENGINE (READ ONLY FROM CLOUD)
// =========================================================================

const PROJECT_ID = "my-dashboard-e2eb5"; 

const historyList = document.getElementById('historyList');
const searchInput = document.getElementById('searchInput');

let globalHistoryData = []; // Cloud se aaya data yahan save hoga search ke liye

// Time Format karne ka function
function formatTime(ms) {
    if (!ms || ms === 0) return "00m 00s";
    let totalSeconds = Math.floor(ms / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

// 1. Data UI mein dikhane ka function
function renderHistory(filterText = '') {
    if(!historyList) return;
    historyList.innerHTML = '';
    let found = false;

    globalHistoryData.forEach(item => {
        if (item.date.includes(filterText)) {
            found = true;
            const li = document.createElement('li');
            li.className = 'history-card'; 
            
            // Yahan Tasks ki jagah mene Streak laga diya hai, kyunki History database mein streak save ho rahi hai
                const studyLogsHtml = (item.studyLogs && item.studyLogs.length > 0) ? `
                    <div class="study-logs-section" style="margin-top: 15px; width: 100%; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px;">
                        <span style="font-size: 10px; font-family: monospace; color: #888; text-transform: uppercase; display: block; margin-bottom: 5px;">Lecture Study Logs</span>
                        <div style="display: flex; flex-direction: column; gap: 5px; max-height: 80px; overflow-y: auto;">
                            ${item.studyLogs.map(log => `
                                <div style="font-size: 11px; font-family: monospace; color: #fbbf24; background: rgba(251, 191, 36, 0.05); border: 1px solid rgba(251, 191, 36, 0.1); padding: 6px 10px; border-radius: 8px; text-align: left;">
                                    📖 ${log}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : '';

                li.innerHTML = `
                <div class="card-header">
                    <span class="h-date">${item.date}</span>
                    <span class="h-time">${formatTime(item.timeVal)}</span>
                </div>

                <div class="card-details">
                    <div class="details-columns">
                        <div class="card-left">
                            <div class="stats-row">
                                <span class="stat-badge done">🔥 Streak Maintained: ${item.streak} Days</span>
                            </div>
                            
                            <button class="aesthetic-btn detail-btn" data-date="${item.date}">
                                <span>Detail Analysis</span>
                            </button>
                        </div>
                        
                        <div class="card-right">
                            <div class="subject-line">
                                <span class="subj-name"><div class="subj-color color-p"></div> Physics</span>
                                <span>${formatTime(item.pTime)}</span>
                            </div>
                            <div class="subject-line">
                                <span class="subj-name"><div class="subj-color color-c"></div> Chemistry</span>
                                <span>${formatTime(item.cTime)}</span>
                            </div>
                            <div class="subject-line">
                                <span class="subj-name"><div class="subj-color color-m"></div> Maths</span>
                                <span>${formatTime(item.mTime)}</span>
                            </div>
                            <div class="total-line">
                                <span>Total =</span>
                                <span class="total-box">${formatTime(item.timeVal)}</span>
                            </div>
                        </div>
                    </div>
                    ${studyLogsHtml}
                </div>
            `;
            historyList.appendChild(li);
        }
    });

    if (!found) {
        historyList.innerHTML = `<li style="text-align:center; color:#555; padding: 20px; font-family: var(--font-mono);">No records found.</li>`;
    }
}

// 2. Firebase se data kheenchne wala function
async function loadHistoryFromCloud() {
    if(historyList) historyList.innerHTML = `<li style="text-align:center; color:#4DA8FF; padding: 20px; font-family: var(--font-mono);">Loading Study Vault from Cloud... ⏳</li>`;
    
    let url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/HistoryData`;

    try {
        let response = await fetch(url);
        let data = await response.json();
        
        globalHistoryData = [];
        
        if(data && data.documents) {
            data.documents.forEach(doc => {
                // Firebase URL se Tarikh (Date) nikalna
                let docNameParts = doc.name.split('/');
                let dateStrWithDash = docNameParts[docNameParts.length - 1]; // e.g., "28-02-2026"
                let dateStr = dateStrWithDash.replace(/-/g, '/'); // Wapas "28/02/2026" bana diya

                let fields = doc.fields || {};
                
                let studyLogsVal = [];
                if (fields.studyLogs && fields.studyLogs.arrayValue && fields.studyLogs.arrayValue.values) {
                    studyLogsVal = fields.studyLogs.arrayValue.values.map(val => val.stringValue || "");
                }

                globalHistoryData.push({
                    date: dateStr,
                    timeVal: parseInt(fields.totalTimeMs?.integerValue || 0),
                    streak: parseInt(fields.streak?.integerValue || 0),
                    pTime: parseInt(fields.physicsTime?.integerValue || 0),
                    cTime: parseInt(fields.chemTime?.integerValue || 0),
                    mTime: parseInt(fields.mathsTime?.integerValue || 0),
                    studyLogs: studyLogsVal
                });
            });

            // Tarikh ke hisaab se descending sort (Naya din sabse upar)
            globalHistoryData.sort((a, b) => {
                let [d1, m1, y1] = a.date.split('/');
                let [d2, m2, y2] = b.date.split('/');
                return new Date(`${y2}-${m2}-${d2}`) - new Date(`${y1}-${m1}-${d1}`);
            });
        }
        
        renderHistory(); 
    } catch (error) {
        console.error("Cloud Error:", error);
        if(historyList) historyList.innerHTML = `<li style="text-align:center; color:#f43f5e; padding: 20px;">Failed to connect to Firebase. Retrying...</li>`;
    }
}

// Page load hote hi cloud se data mangwao
loadHistoryFromCloud();

// --- SEARCH BAR LOGIC ---
if(searchInput) {
    searchInput.addEventListener('input', (e) => {
        renderHistory(e.target.value);
    });
}

// --- DETAIL ANALYSIS BUTTON LOGIC (Time Machine) ---
// Yahan event delegation lagaya hai taaki naye elements pe bhi click kaam kare
document.addEventListener('click', (e) => {
    let btn = e.target.closest('.detail-btn');
    if (btn) {
        const selectedDate = btn.getAttribute('data-date');
        window.location.href = `analytics.html?date=${encodeURIComponent(selectedDate)}`;
    }
});

// --- SIDEBAR NAVIGATION ---
const navMap = { 'homeBtn': 'index.html', 'historyBtn': 'history.html', 'tasksBtn': 'tasks.html', 'analyticsBtn': 'analytics.html' };
Object.entries(navMap).forEach(([id, url]) => {
    let btn = document.getElementById(id);
    if(btn) btn.addEventListener('click', () => window.location.href = url);
});