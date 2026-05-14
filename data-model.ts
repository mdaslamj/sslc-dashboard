import { z } from "zod";

export const SubjectSchema = z.enum(["mathematics", "science", "socialScience", "kannada", "english"]);
export type Subject = z.infer<typeof SubjectSchema>;

export const DifficultySchema = z.enum(["easy", "medium", "hard"]);
export type Difficulty = z.infer<typeof DifficultySchema>;

export const PrioritySchema = z.enum(["high", "medium", "low"]);
export type Priority = z.infer<typeof PrioritySchema>;

export interface StudentProfile {
  name: string;
  targetScore: number;
  examDate: string;
  dailyGoalHours: number;
}

export interface Chapter {
  id: string;
  name: string;
  completed: boolean;
  difficulty: Difficulty;
  notes: string;
  completedDate?: string; // YYYY-MM-DD
}

export interface SubjectData {
  subject: Subject;
  chapters: Chapter[];
}

export interface StudyLog {
  id: string;
  date: string; // YYYY-MM-DD
  subject: Subject;
  hours: number;
}

export interface MockTest {
  id: string;
  date: string; // YYYY-MM-DD
  subject: Subject;
  score: number;
  totalMarks: number;
}

export interface WeakTopic {
  id: string;
  subject: Subject;
  topic: string;
  priority: Priority;
  revised: boolean;
}

export interface Reminder {
  id: string;
  topic: string;
  subject: Subject;
  dueDate: string; // YYYY-MM-DD
  done: boolean;
}

export const INITIAL_CHAPTERS: Record<Subject, Omit<Chapter, "completed" | "difficulty" | "notes">[]> = {
  mathematics: [
    { id: "m1", name: "Number Systems" },
    { id: "m2", name: "Algebra" },
    { id: "m3", name: "Coordinate Geometry" },
    { id: "m4", name: "Triangles" },
    { id: "m5", name: "Circles" },
    { id: "m6", name: "Constructions" },
    { id: "m7", name: "Trigonometry" },
    { id: "m8", name: "Statistics" },
    { id: "m9", name: "Probability" },
    { id: "m10", name: "Quadratic Equations" },
  ],
  science: [
    { id: "sc1", name: "Chemical Reactions" },
    { id: "sc2", name: "Acids & Bases" },
    { id: "sc3", name: "Metals & Non-metals" },
    { id: "sc4", name: "Carbon Compounds" },
    { id: "sc5", name: "Periodic Table" },
    { id: "sc6", name: "Life Processes" },
    { id: "sc7", name: "Control & Coordination" },
    { id: "sc8", name: "Heredity" },
    { id: "sc9", name: "Light" },
    { id: "sc10", name: "Electricity" },
  ],
  socialScience: [
    { id: "ss1", name: "History-India" },
    { id: "ss2", name: "History-World" },
    { id: "ss3", name: "Geography" },
    { id: "ss4", name: "Political Science" },
    { id: "ss5", name: "Economics" },
  ],
  kannada: [
    { id: "k1", name: "ಗದ್ಯಭಾಗ (Prose)" },
    { id: "k2", name: "ಪದ್ಯಭಾಗ (Poetry)" },
    { id: "k3", name: "ಪ್ರಬಂಧ (Essay)" },
    { id: "k4", name: "ವ್ಯಾಕರಣ (Grammar)" },
    { id: "k5", name: "ಪತ್ರ ಲೇಖನ (Letter Writing)" },
  ],
  english: [
    { id: "e1", name: "Reading" },
    { id: "e2", name: "Writing" },
    { id: "e3", name: "Grammar" },
    { id: "e4", name: "Literature" },
    { id: "e5", name: "Speaking" },
  ]
};
