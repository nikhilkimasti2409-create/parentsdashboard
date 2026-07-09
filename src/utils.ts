// ==========================================
// 🛠️ PARENTS DASHBOARD UTILITIES & API CLIENT
// ==========================================

export const FIREBASE_PROJECT_ID = "my-dashboard-e2eb5";

export interface LiveStatusData {
  totalTimeMs: number;
  streak: number;
  isStudying: string;
  screenTimeData: Record<string, { time: number; url: string; notes?: string }>;
  tasks: Array<{ text: string; completed: boolean }>;
}

export interface HistoryRecord {
  date: string;
  totalTimeMs: number;
  streak: number;
  physicsTime: number;
  chemTime: number;
  mathsTime: number;
  studyLogs: string[];
}

export interface SecurityViolation {
  id: string;
  type: string;
  details: string;
  timestamp: string;
  dateStr: string;
}

export interface DistractionLog {
  title: string;
  url: string;
  lastVisitTime: string;
  visitCount: number;
}

// Format duration
export function formatMsToHrsMinsSecs(ms: number): string {
  if (!ms || ms === 0) return "0h 0m 0s";
  let totalSecs = Math.floor(ms / 1000);
  let hrs = Math.floor(totalSecs / 3600);
  let mins = Math.floor((totalSecs % 3600) / 60);
  let secs = totalSecs % 60;
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  return `${mins}m ${secs}s`;
}

// Format duration to classic stopwatch format (MM:SS)
export function formatToStopwatch(ms: number): string {
  if (!ms || ms === 0) return "00:00.00";
  let totalSecs = Math.floor(ms / 1000);
  let mins = Math.floor(totalSecs / 60);
  let secs = totalSecs % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.00`;
}

// 1. Fetch live status of today
export async function fetchLiveStatus(): Promise<LiveStatusData> {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/LiveStatus/MyData`;
  const res = await fetch(url);
  const data = await res.json();
  
  if (!data || !data.fields) {
    return {
      totalTimeMs: 0,
      streak: 0,
      isStudying: "None",
      screenTimeData: {},
      tasks: []
    };
  }

  const fields = data.fields;
  let screenTimeData = {};
  try {
    screenTimeData = JSON.parse(fields.screenTimeJson?.stringValue || "{}");
  } catch {}

  let tasks = [];
  try {
    tasks = JSON.parse(fields.tasksJson?.stringValue || "[]");
  } catch {}

  return {
    totalTimeMs: parseInt(fields.totalTimeMs?.integerValue || "0"),
    streak: parseInt(fields.streak?.integerValue || "0"),
    isStudying: fields.isStudying?.stringValue || "None",
    screenTimeData,
    tasks
  };
}

// 2. Fetch all historical focus records
export async function fetchHistory(): Promise<HistoryRecord[]> {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/HistoryData`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data || !data.documents) return [];

  const records: HistoryRecord[] = data.documents.map((doc: any) => {
    const docNameParts = doc.name.split('/');
    const dateStrWithDash = docNameParts[docNameParts.length - 1]; // e.g. 09-07-2026
    const dateStr = dateStrWithDash.replace(/-/g, '/'); // e.g. 09/07/2026

    const fields = doc.fields || {};

    let studyLogs: string[] = [];
    if (fields.studyLogs && fields.studyLogs.arrayValue && fields.studyLogs.arrayValue.values) {
      studyLogs = fields.studyLogs.arrayValue.values.map((v: any) => v.stringValue || "");
    }

    return {
      date: dateStr,
      totalTimeMs: parseInt(fields.totalTimeMs?.integerValue || "0"),
      streak: parseInt(fields.streak?.integerValue || "0"),
      physicsTime: parseInt(fields.physicsTime?.integerValue || "0"),
      chemTime: parseInt(fields.chemTime?.integerValue || "0"),
      mathsTime: parseInt(fields.mathsTime?.integerValue || "0"),
      studyLogs
    };
  });

  // Sort descending by date
  return records.sort((a, b) => {
    const [d1, m1, y1] = a.date.split('/');
    const [d2, m2, y2] = b.date.split('/');
    return new Date(`${y2}-${m2}-${d2}`).getTime() - new Date(`${y1}-${m1}-${d1}`).getTime();
  });
}

// 3. Fetch distraction history logs (browser clean history logs) for a date
export async function fetchDistractionLogs(dateKey: string): Promise<DistractionLog[]> {
  const normalized = dateKey.replace(/\//g, '-');
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/DistractionHistory/${normalized}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data || !data.fields) return [];

  try {
    const logs = JSON.parse(data.fields.historyJson?.stringValue || "[]");
    return logs;
  } catch {
    return [];
  }
}

// 4. Fetch all security violations
export async function fetchSecurityViolations(): Promise<SecurityViolation[]> {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/SecurityViolations`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data || !data.documents) return [];

  const violations: SecurityViolation[] = data.documents.map((doc: any) => {
    const docNameParts = doc.name.split('/');
    const id = docNameParts[docNameParts.length - 1];

    const fields = doc.fields || {};
    return {
      id,
      type: fields.type?.stringValue || "security_violation",
      details: fields.details?.stringValue || "Unknown safety warning.",
      timestamp: fields.timestamp?.stringValue || new Date().toISOString(),
      dateStr: fields.dateStr?.stringValue || ""
    };
  });

  // Sort descending by timestamp
  return violations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
