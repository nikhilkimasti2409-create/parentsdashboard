// =========================================================================
// ✅ PARENTS DASHBOARD - TASKS ENGINE (READ ONLY)
// =========================================================================

const PROJECT_ID = "my-dashboard-e2eb5"; 

// 1. Parents ke liye "Add Task" wala box chhupa do
const taskInputGroup = document.querySelector('.task-input-group');
if (taskInputGroup) taskInputGroup.style.display = 'none';

// 2. Cloud se Tasks laane ka function
function loadTasksFromCloud() {
    let url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/LiveStatus/MyData`;
    
    fetch(url)
    .then(r => r.json())
    .then(data => {
        if(data && data.fields && data.fields.tasksJson) {
            try {
                let tasks = JSON.parse(data.fields.tasksJson.stringValue || "[]");
                renderTasks(tasks);
            } catch(e) { console.error("Task parsing error"); }
        }
    })
    .catch(e => console.error("Tasks Fetch Error:", e));
}

// 3. Screen par Tasks dikhane ka function
function renderTasks(tasks) {
    const taskList = document.getElementById('taskList');
    if (!taskList) return;
    taskList.innerHTML = '';

    if(tasks.length === 0) {
        taskList.innerHTML = '<li style="text-align:center; color:#888; padding: 20px;">Aaj koi task add nahi kiya gaya hai.</li>';
        return;
    }

    tasks.forEach((task) => {
        const li = document.createElement('li');
        // Agar task poora ho gaya hai toh 'completed' class lag jayegi (kat jayega)
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        // Parents yahan click karke task delete ya tick nahi kar sakte, sirf dekh sakte hain
        li.innerHTML = `
            <div class="task-content" style="cursor: default;">
                <span class="checkbox"></span>
                <span class="task-text">${task.text}</span>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// Har 5 second mein tasks update hote rahenge
setInterval(loadTasksFromCloud, 5000);
loadTasksFromCloud();

// --- 4. SIDEBAR NAVIGATION ---
const navMap = { 'homeBtn': 'index.html', 'historyBtn': 'history.html', 'tasksBtn': 'tasks.html', 'analyticsBtn': 'analytics.html' };
Object.entries(navMap).forEach(([id, url]) => {
    let btn = document.getElementById(id);
    if(btn) btn.addEventListener('click', () => window.location.href = url);
});