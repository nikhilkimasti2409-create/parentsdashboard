// =========================================================================
// 📊 PARENTS DASHBOARD - ANALYTICS ENGINE (READ ONLY)
// =========================================================================

const PROJECT_ID = "my-dashboard-e2eb5"; 

// --- 1. SIDEBAR NAVIGATION ---
const navMap = { 'homeBtn': 'index.html', 'historyBtn': 'history.html', 'tasksBtn': 'tasks.html', 'analyticsBtn': 'analytics.html' };
Object.entries(navMap).forEach(([id, url]) => {
    let btn = document.getElementById(id);
    if(btn) btn.addEventListener('click', () => window.location.href = url);
});

// --- 2. TIME FORMATTER ---
function formatMsToHrsMinsSecs(ms) {
    if (!ms || ms === 0) return "0m 0s";
    let totalSecs = Math.floor(ms / 1000);
    let hrs = Math.floor(totalSecs / 3600);
    let mins = Math.floor((totalSecs % 3600) / 60);
    let secs = totalSecs % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m ${secs}s`; 
}

// --- 3. CLOUD FETCH LOGIC ---
async function loadAnalyticsFromCloud() {
    // Check karo ki History page se kisi specific Date pe click hoke aaya hai kya?
    const urlParams = new URLSearchParams(window.location.search);
    const historyDate = urlParams.get('date');

    let dateDisp = document.getElementById('currentDateDisplay');
    let pTime = 0, cTime = 0, mTime = 0, totalMs = 0;
    let screenTimeData = {};

    try {
        if (historyDate) {
            // 🕰️ MODE 1: TIME MACHINE (HISTORY MODE)
            if(dateDisp) dateDisp.innerText = `⏳ Historical Data: ${historyDate}`;
            
            // Firebase URL ke liye slash (/) ko dash (-) mein badalna padta hai
            let firebaseDateStr = historyDate.replace(/\//g, '-'); 
            let url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/HistoryData/${firebaseDateStr}`;
            
            let res = await fetch(url);
            let data = await res.json();
            
            if (data && data.fields) {
                totalMs = parseInt(data.fields.totalTimeMs?.integerValue || 0);
                pTime = parseInt(data.fields.physicsTime?.integerValue || 0);
                cTime = parseInt(data.fields.chemTime?.integerValue || 0);
                mTime = parseInt(data.fields.mathsTime?.integerValue || 0);
                // Extension History mein abhi app usage save nahi hota, isliye ise khali chhodenge
            }
        } else {
            // 🟢 MODE 2: LIVE MODE (AAJ KA DATA)
            if(dateDisp) dateDisp.innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            
            let url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/LiveStatus/MyData`;
            let res = await fetch(url);
            let data = await res.json();
            
            if (data && data.fields) {
                totalMs = parseInt(data.fields.totalTimeMs?.integerValue || 0);
                pTime = parseInt(data.fields.physicsTime?.integerValue || 0);
                cTime = parseInt(data.fields.chemTime?.integerValue || 0);
                mTime = parseInt(data.fields.mathsTime?.integerValue || 0);
                
                try {
                    // JSON String se wapas Object banaya
                    screenTimeData = JSON.parse(data.fields.screenTimeJson?.stringValue || "{}");
                } catch(e) { console.error("Screen time parse error"); }
            }
        }

        // --- 4. UI UPDATE (SUBJECT BARS) ---
        let pt = document.getElementById('physTime'); if(pt) pt.innerText = formatMsToHrsMinsSecs(pTime);
        let ct = document.getElementById('chemTime'); if(ct) ct.innerText = formatMsToHrsMinsSecs(cTime);
        let mt = document.getElementById('mathTime'); if(mt) mt.innerText = formatMsToHrsMinsSecs(mTime);
        let tt = document.getElementById('totalTimeDisplay'); if(tt) tt.innerText = formatMsToHrsMinsSecs(totalMs);

        // Progress bar smooth animation ke liye
        setTimeout(() => {
            if (totalMs > 0) {
                let pb = document.getElementById('physBar'); if(pb) pb.style.width = `${(pTime / totalMs) * 100}%`;
                let cb = document.getElementById('chemBar'); if(cb) cb.style.width = `${(cTime / totalMs) * 100}%`;
                let mb = document.getElementById('mathBar'); if(mb) mb.style.width = `${(mTime / totalMs) * 100}%`;
            } else {
                let pb = document.getElementById('physBar'); if(pb) pb.style.width = `0%`; 
                let cb = document.getElementById('chemBar'); if(cb) cb.style.width = `0%`; 
                let mb = document.getElementById('mathBar'); if(mb) mb.style.width = `0%`;
            }
        }, 100);

        // --- 5. SCREEN TIME UI UPDATE ---
        let stList = document.getElementById('screenTimeList');
        if(stList) {
            let entries = Object.entries(screenTimeData);
            
            if(entries.length === 0) {
                stList.innerHTML = `<div style="color:#888; text-align:center; padding: 20px;">Is din ka koi tracked screen time record nahi hai.</div>`;
                document.getElementById('platformTotals').innerHTML = ''; 
            } else {
                let platformTotals = { "YouTube": 0, "Physics Wallah": 0, "Instagram": 0, "Gemini AI": 0, "Movies/Series": 0, "Other": 0 };
                
                // Sabse zyada time wale upar dikhenge
                entries.sort((a, b) => b[1].time - a[1].time);
                
                let listHtml = ""; 
                entries.forEach(([title, info]) => {
                    let u = (info.url || "").toLowerCase();
                    if (u.includes("youtube.com")) platformTotals["YouTube"] += info.time;
                    else if (u.includes("pw.live")) platformTotals["Physics Wallah"] += info.time;
                    else if (u.includes("instagram.com")) platformTotals["Instagram"] += info.time;
                    else if (u.includes("gemini.google")) platformTotals["Gemini AI"] += info.time;
                    else if (u.includes("netmirror") || u.includes("tmovies") || u.includes("cineby")) platformTotals["Movies/Series"] += info.time;
                    else platformTotals["Other"] += info.time;

                    let timeStr = formatMsToHrsMinsSecs(info.time);
                    
                    // Parents ke yahan edit button (✏️) hata diya gaya hai!
                    let notesHtml = info.notes ? `<div style="font-size: 11px; color: #fbbf24; font-family: monospace; font-style: italic; margin-top: 4px;">📝 Study Notes: ${info.notes}</div>` : '';
                    listHtml += `
                        <div class="st-item" title="${title}\nURL: ${info.url}" style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px; padding: 12px 15px;">
                            <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                                <span class="st-name">${title}</span>
                                <span class="st-time">${timeStr}</span>
                            </div>
                            ${notesHtml}
                        </div>
                    `;
                });

                stList.innerHTML = listHtml;

                let pTotalsHtml = "";
                for(let plat in platformTotals) {
                    if(platformTotals[plat] > 0) {
                        pTotalsHtml += `
                        <div style="background: rgba(0,0,0,0.4); padding: 12px 20px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); min-width: 120px; text-align: center;">
                            <span style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 5px;">${plat}</span>
                            <strong style="color: #fff; font-size: 18px; font-family: var(--font-mono);">${formatMsToHrsMinsSecs(platformTotals[plat])}</strong>
                        </div>`;
                    }
                }
                let platDiv = document.getElementById('platformTotals');
                if(platDiv) platDiv.innerHTML = pTotalsHtml;
            }
        }
    } catch(err) {
        console.error("Cloud Analytics Error:", err);
    }
}

// Ek baar load hone par run karega
loadAnalyticsFromCloud();

// Agar Live mode mein hai, toh har 5 second mein apne aap refresh karega
const isHistoryMode = new URLSearchParams(window.location.search).get('date');
if (!isHistoryMode) {
    setInterval(loadAnalyticsFromCloud, 5000); 
}