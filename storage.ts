import {
  StudentProfile,
  SubjectData,
  StudyLog,
  MockTest,
  WeakTopic,
  Reminder,
  INITIAL_CHAPTERS,
  Subject,
} from "./data-model";
import { isFirebaseConfigured, db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  QueryDocumentSnapshot,
} from "firebase/firestore";

const PREFIX = "sslc_";

const getLocal = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(`${PREFIX}${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setLocal = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // ignore
  }
};

// Synchronous helpers — used as React Query initialData so the UI renders
// instantly from the localStorage cache while Firebase fetches in the background.
export const storageSync = {
  getProfile(userId: string): StudentProfile | null {
    return getLocal<StudentProfile | null>(`${userId}_profile`, null);
  },
  getSubjectData(userId: string, subject: Subject): SubjectData {
    const defaultData: SubjectData = {
      subject,
      chapters: INITIAL_CHAPTERS[subject].map((c) => ({
        ...c,
        completed: false,
        difficulty: "medium" as const,
        notes: "",
      })),
    };
    return getLocal<SubjectData>(`${userId}_subject_${subject}`, defaultData);
  },
  getStudyLogs(userId: string): StudyLog[] {
    return getLocal<StudyLog[]>(`${userId}_studylogs`, []);
  },
  getMockTests(userId: string): MockTest[] {
    return getLocal<MockTest[]>(`${userId}_mocktests`, []);
  },
  getWeakTopics(userId: string): WeakTopic[] {
    return getLocal<WeakTopic[]>(`${userId}_weaktopics`, []);
  },
  getReminders(userId: string): Reminder[] {
    return getLocal<Reminder[]>(`${userId}_reminders`, []);
  },
};

// Wrap any Firebase promise with a timeout — falls back to the fallback fn if
// Firebase doesn't respond within `ms` milliseconds.
async function withTimeout<T>(
  firebasePromise: Promise<T>,
  fallback: () => T | Promise<T>,
  ms = 2000
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Firebase timeout")), ms);
  });
  try {
    const result = await Promise.race([firebasePromise, timeout]);
    clearTimeout(timer!);
    return result;
  } catch {
    clearTimeout(timer!);
    return fallback();
  }
}

export const storage = {
  // ─── Profile ──────────────────────────────────────────────────────────────

  async getProfile(userId: string): Promise<StudentProfile | null> {
    if (isFirebaseConfigured && db) {
      return withTimeout(
        (async () => {
          const snap = await getDoc(doc(db!, "users", userId));
          return snap.exists() ? (snap.data() as StudentProfile) : null;
        })(),
        () => getLocal<StudentProfile | null>(`${userId}_profile`, null)
      );
    }
    return getLocal<StudentProfile | null>(`${userId}_profile`, null);
  },

  async saveProfile(userId: string, profile: StudentProfile): Promise<void> {
    if (isFirebaseConfigured && db) {
      await withTimeout(
        setDoc(doc(db!, "users", userId), profile, { merge: true }),
        () => { setLocal(`${userId}_profile`, profile); }
      );
    } else {
      setLocal(`${userId}_profile`, profile);
    }
    // Always mirror to localStorage so the app works offline too
    setLocal(`${userId}_profile`, profile);
  },

  // ─── Subject data ─────────────────────────────────────────────────────────

  async getSubjectData(userId: string, subject: Subject): Promise<SubjectData> {
    const defaultData: SubjectData = {
      subject,
      chapters: INITIAL_CHAPTERS[subject].map((c) => ({
        ...c,
        completed: false,
        difficulty: "medium" as const,
        notes: "",
      })),
    };
    if (isFirebaseConfigured && db) {
      return withTimeout(
        (async () => {
          const snap = await getDoc(doc(db!, `users/${userId}/subjects`, subject));
          return snap.exists() ? (snap.data() as SubjectData) : defaultData;
        })(),
        () => getLocal<SubjectData>(`${userId}_subject_${subject}`, defaultData)
      );
    }
    return getLocal<SubjectData>(`${userId}_subject_${subject}`, defaultData);
  },

  async saveSubjectData(userId: string, data: SubjectData): Promise<void> {
    if (isFirebaseConfigured && db) {
      await withTimeout(
        setDoc(doc(db!, `users/${userId}/subjects`, data.subject), data, { merge: true }),
        () => { setLocal(`${userId}_subject_${data.subject}`, data); }
      );
    } else {
      setLocal(`${userId}_subject_${data.subject}`, data);
    }
    setLocal(`${userId}_subject_${data.subject}`, data);
  },

  // ─── Study logs ───────────────────────────────────────────────────────────

  async getStudyLogs(userId: string): Promise<StudyLog[]> {
    if (isFirebaseConfigured && db) {
      return withTimeout(
        (async () => {
          const snap = await getDocs(collection(db!, `users/${userId}/studyLogs`));
          return snap.docs.map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() } as StudyLog));
        })(),
        () => getLocal<StudyLog[]>(`${userId}_studylogs`, [])
      );
    }
    return getLocal<StudyLog[]>(`${userId}_studylogs`, []);
  },

  async addStudyLog(userId: string, log: Omit<StudyLog, "id">): Promise<StudyLog> {
    if (isFirebaseConfigured && db) {
      return withTimeout(
        (async () => {
          const ref = await addDoc(collection(db!, `users/${userId}/studyLogs`), log);
          const newLog = { id: ref.id, ...log };
          const logs = getLocal<StudyLog[]>(`${userId}_studylogs`, []);
          setLocal(`${userId}_studylogs`, [...logs, newLog]);
          return newLog;
        })(),
        () => {
          const logs = getLocal<StudyLog[]>(`${userId}_studylogs`, []);
          const newLog: StudyLog = { id: Date.now().toString(), ...log };
          setLocal(`${userId}_studylogs`, [...logs, newLog]);
          return newLog;
        }
      );
    }
    const logs = getLocal<StudyLog[]>(`${userId}_studylogs`, []);
    const newLog: StudyLog = { id: Date.now().toString(), ...log };
    setLocal(`${userId}_studylogs`, [...logs, newLog]);
    return newLog;
  },

  async deleteStudyLog(userId: string, logId: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      await withTimeout(
        deleteDoc(doc(db!, `users/${userId}/studyLogs`, logId)),
        () => {}
      );
    }
    const logs = getLocal<StudyLog[]>(`${userId}_studylogs`, []);
    setLocal(`${userId}_studylogs`, logs.filter((l) => l.id !== logId));
  },

  // ─── Mock tests ───────────────────────────────────────────────────────────

  async getMockTests(userId: string): Promise<MockTest[]> {
    if (isFirebaseConfigured && db) {
      return withTimeout(
        (async () => {
          const snap = await getDocs(collection(db!, `users/${userId}/mockTests`));
          return snap.docs.map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() } as MockTest));
        })(),
        () => getLocal<MockTest[]>(`${userId}_mocktests`, [])
      );
    }
    return getLocal<MockTest[]>(`${userId}_mocktests`, []);
  },

  async addMockTest(userId: string, test: Omit<MockTest, "id">): Promise<MockTest> {
    if (isFirebaseConfigured && db) {
      return withTimeout(
        (async () => {
          const ref = await addDoc(collection(db!, `users/${userId}/mockTests`), test);
          const newTest = { id: ref.id, ...test };
          const tests = getLocal<MockTest[]>(`${userId}_mocktests`, []);
          setLocal(`${userId}_mocktests`, [...tests, newTest]);
          return newTest;
        })(),
        () => {
          const tests = getLocal<MockTest[]>(`${userId}_mocktests`, []);
          const newTest: MockTest = { id: Date.now().toString(), ...test };
          setLocal(`${userId}_mocktests`, [...tests, newTest]);
          return newTest;
        }
      );
    }
    const tests = getLocal<MockTest[]>(`${userId}_mocktests`, []);
    const newTest: MockTest = { id: Date.now().toString(), ...test };
    setLocal(`${userId}_mocktests`, [...tests, newTest]);
    return newTest;
  },

  async deleteMockTest(userId: string, testId: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      await withTimeout(
        deleteDoc(doc(db!, `users/${userId}/mockTests`, testId)),
        () => {}
      );
    }
    const tests = getLocal<MockTest[]>(`${userId}_mocktests`, []);
    setLocal(`${userId}_mocktests`, tests.filter((t) => t.id !== testId));
  },

  // ─── Weak topics ──────────────────────────────────────────────────────────

  async getWeakTopics(userId: string): Promise<WeakTopic[]> {
    if (isFirebaseConfigured && db) {
      return withTimeout(
        (async () => {
          const snap = await getDocs(collection(db!, `users/${userId}/weakTopics`));
          return snap.docs.map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() } as WeakTopic));
        })(),
        () => getLocal<WeakTopic[]>(`${userId}_weaktopics`, [])
      );
    }
    return getLocal<WeakTopic[]>(`${userId}_weaktopics`, []);
  },

  async addWeakTopic(userId: string, topic: Omit<WeakTopic, "id">): Promise<WeakTopic> {
    if (isFirebaseConfigured && db) {
      return withTimeout(
        (async () => {
          const ref = await addDoc(collection(db!, `users/${userId}/weakTopics`), topic);
          return { id: ref.id, ...topic };
        })(),
        () => {
          const topics = getLocal<WeakTopic[]>(`${userId}_weaktopics`, []);
          const newTopic: WeakTopic = { id: Date.now().toString(), ...topic };
          setLocal(`${userId}_weaktopics`, [...topics, newTopic]);
          return newTopic;
        }
      );
    }
    const topics = getLocal<WeakTopic[]>(`${userId}_weaktopics`, []);
    const newTopic: WeakTopic = { id: Date.now().toString(), ...topic };
    setLocal(`${userId}_weaktopics`, [...topics, newTopic]);
    return newTopic;
  },

  async updateWeakTopic(userId: string, topicId: string, updates: Partial<WeakTopic>): Promise<void> {
    if (isFirebaseConfigured && db) {
      await withTimeout(
        updateDoc(doc(db!, `users/${userId}/weakTopics`, topicId), updates as Record<string, unknown>),
        () => {}
      );
    }
    const topics = getLocal<WeakTopic[]>(`${userId}_weaktopics`, []);
    setLocal(`${userId}_weaktopics`, topics.map((t) => (t.id === topicId ? { ...t, ...updates } : t)));
  },

  async deleteWeakTopic(userId: string, topicId: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      await withTimeout(
        deleteDoc(doc(db!, `users/${userId}/weakTopics`, topicId)),
        () => {}
      );
    }
    const topics = getLocal<WeakTopic[]>(`${userId}_weaktopics`, []);
    setLocal(`${userId}_weaktopics`, topics.filter((t) => t.id !== topicId));
  },

  // ─── Reminders ────────────────────────────────────────────────────────────

  async getReminders(userId: string): Promise<Reminder[]> {
    if (isFirebaseConfigured && db) {
      return withTimeout(
        (async () => {
          const snap = await getDocs(collection(db!, `users/${userId}/reminders`));
          return snap.docs.map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() } as Reminder));
        })(),
        () => getLocal<Reminder[]>(`${userId}_reminders`, [])
      );
    }
    return getLocal<Reminder[]>(`${userId}_reminders`, []);
  },

  async addReminder(userId: string, reminder: Omit<Reminder, "id">): Promise<Reminder> {
    if (isFirebaseConfigured && db) {
      return withTimeout(
        (async () => {
          const ref = await addDoc(collection(db!, `users/${userId}/reminders`), reminder);
          return { id: ref.id, ...reminder };
        })(),
        () => {
          const reminders = getLocal<Reminder[]>(`${userId}_reminders`, []);
          const newReminder: Reminder = { id: Date.now().toString(), ...reminder };
          setLocal(`${userId}_reminders`, [...reminders, newReminder]);
          return newReminder;
        }
      );
    }
    const reminders = getLocal<Reminder[]>(`${userId}_reminders`, []);
    const newReminder: Reminder = { id: Date.now().toString(), ...reminder };
    setLocal(`${userId}_reminders`, [...reminders, newReminder]);
    return newReminder;
  },

  async updateReminder(userId: string, reminderId: string, updates: Partial<Reminder>): Promise<void> {
    if (isFirebaseConfigured && db) {
      await withTimeout(
        updateDoc(doc(db!, `users/${userId}/reminders`, reminderId), updates as Record<string, unknown>),
        () => {}
      );
    }
    const reminders = getLocal<Reminder[]>(`${userId}_reminders`, []);
    setLocal(`${userId}_reminders`, reminders.map((r) => (r.id === reminderId ? { ...r, ...updates } : r)));
  },

  async deleteReminder(userId: string, reminderId: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      await withTimeout(
        deleteDoc(doc(db!, `users/${userId}/reminders`, reminderId)),
        () => {}
      );
    }
    const reminders = getLocal<Reminder[]>(`${userId}_reminders`, []);
    setLocal(`${userId}_reminders`, reminders.filter((r) => r.id !== reminderId));
  },
};
