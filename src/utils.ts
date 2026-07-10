// ==========================================
// 🛠️ PARENTS DASHBOARD UTILITIES & API CLIENT
// ==========================================

import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export const FIREBASE_PROJECT_ID = "my-dashboard-e2eb5";

export interface LiveStatusData {
  totalTimeMs: number;
  streak: number;
  isStudying: string;
  screenTimeData: Record<string, { time: number; url: string; notes?: string }>;
  tasks: Array<{ text: string; completed: boolean }>;
  extensionActive?: string;
  lastHeartbeatTime?: number;
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

// 1. Fetch live status of today (Firestore SDK)
export async function fetchLiveStatus(): Promise<LiveStatusData> {
  try {
    const docRef = doc(db, "LiveStatus", "MyData");
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return {
        totalTimeMs: 0,
        streak: 0,
        isStudying: "None",
        screenTimeData: {},
        tasks: []
      };
    }

    const data = docSnap.data();
    let screenTimeData = {};
    try {
      screenTimeData = JSON.parse(data.screenTimeJson || "{}");
    } catch {}

    let tasks = [];
    try {
      tasks = JSON.parse(data.tasksJson || "[]");
    } catch {}

    return {
      totalTimeMs: Number(data.totalTimeMs || 0),
      streak: Number(data.streak || 0),
      isStudying: data.isStudying || "None",
      screenTimeData,
      tasks,
      extensionActive: data.extensionActive || "disabled",
      lastHeartbeatTime: Number(data.lastHeartbeatTime || 0)
    };
  } catch (e) {
    console.error("fetchLiveStatus error:", e);
    throw e;
  }
}

// 2. Fetch all historical focus records (Firestore SDK)
export async function fetchHistory(): Promise<HistoryRecord[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "HistoryData"));
    const records: HistoryRecord[] = querySnapshot.docs.map((docSnap) => {
      const dateId = docSnap.id; // e.g. 09-07-2026
      const dateStr = dateId.replace(/-/g, '/'); // e.g. 09/07/2026
      const data = docSnap.data();

      return {
        date: dateStr,
        totalTimeMs: Number(data.totalTimeMs || 0),
        streak: Number(data.streak || 0),
        physicsTime: Number(data.physicsTime || 0),
        chemTime: Number(data.chemTime || 0),
        mathsTime: Number(data.mathsTime || 0),
        studyLogs: data.studyLogs || []
      };
    });

    // Sort descending by date
    return records.sort((a, b) => {
      const [d1, m1, y1] = a.date.split('/');
      const [d2, m2, y2] = b.date.split('/');
      return new Date(`${y2}-${m2}-${d2}`).getTime() - new Date(`${y1}-${m1}-${d1}`).getTime();
    });
  } catch (e) {
    console.error("fetchHistory error:", e);
    return [];
  }
}

// 3. Fetch distraction history logs (browser clean history logs) for a date (Firestore SDK)
export async function fetchDistractionLogs(dateKey: string): Promise<DistractionLog[]> {
  try {
    const normalized = dateKey.replace(/\//g, '-');
    const docRef = doc(db, "DistractionHistory", normalized);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return [];
    
    const data = docSnap.data();
    return JSON.parse(data.historyJson || "[]");
  } catch (e) {
    console.error("fetchDistractionLogs error:", e);
    return [];
  }
}

// 4. Fetch all security violations (Firestore SDK)
export async function fetchSecurityViolations(): Promise<SecurityViolation[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "SecurityViolations"));
    const violations: SecurityViolation[] = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        type: data.type || "security_violation",
        details: data.details || "Unknown safety warning.",
        timestamp: data.timestamp || new Date().toISOString(),
        dateStr: data.dateStr || ""
      };
    });

    // Sort descending by timestamp
    return violations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (e) {
    console.error("fetchSecurityViolations error:", e);
    return [];
  }
}
