import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "en" | "kn";

export interface Translations {
  // Navigation
  navHome: string;
  navSubjects: string;
  navLog: string;
  navTests: string;
  navAnalytics: string;
  navSettings: string;
  // Login
  welcome: string;
  enterNamePlaceholder: string;
  letsGo: string;
  // Dashboard – greeting & quote
  greeting: string;
  // Dashboard – daily goal ring
  todayGoal: string;
  dailyStudyGoal: string;
  goalAchieved: string;
  bravo: string;
  hoursRemaining: (h: number) => string;
  // Dashboard – exam countdown
  examToday: string;
  lastWeek: string;
  oneMonthLeft: string;
  effortYield: string;
  examIn: string;
  days: string;
  goal: string;
  // Dashboard – study plan card
  todaysPlan: string;
  studyPlan: string;
  allChaptersDone: string;
  // Dashboard – quick stats
  overallProgressLabel: string;
  todayStudy: string;
  testScore: string;
  // Dashboard – subject progress section
  subjectProgress: string;
  overallProgressCard: string;
  seeAll: string;
  // Dashboard – progress messages
  journeyStarted: string;
  studyingWell: string;
  keepGoingMsg: string;
  youAreReady: string;
  // Dashboard – quick link labels
  studyLogLink: string;
  mockTestsLink: string;
  analyticsLink: string;
  remindersLink: string;
  timetableLink: string;
  reportCardLink: string;
  // Subjects page
  subjectsTitle: string;
  subjectsSubtitle: string;
  begin: string;
  keepGoing: string;
  excellent: string;
  // Subject detail
  chaptersSection: string;
  chaptersCompleteCount: string;
  mockTestScoresSection: string;
  weakTopicsSection: string;
  noWeakTopics: string;
  // Study log
  studyLogTitle: string;
  studyLogSubtitle: string;
  today: string;
  total: string;
  dayStreak: string;
  goalAchievementTitle: string;
  goalMetDays: (n: number, goal: number) => string;
  logStudyHoursTitle: string;
  addBtn: string;
  thisWeek: string;
  recentLogs: string;
  noLogs: string;
  calendar28: string;
  calendarSubtitle: string;
  // Mock tests
  mockTestsTitle: string;
  mockTestsSubtitle: string;
  addScore: string;
  averageScores: string;
  scoreTrend: string;
  recentTests: string;
  noTests: string;
  // Analytics
  analyticsTitle: string;
  analyticsSubtitle: string;
  overallProgressStat: string;
  avgScore: string;
  totalStudy: string;
  subjectProgressChart: string;
  testScores: string;
  studyTimeBreakdown: string;
  weakTopicAnalysis: string;
  noWeakTopicsAnalytics: string;
  topicCount: (n: number) => string;
  // Reminders
  remindersTitle: string;
  remindersSubtitle: string;
  addReminderTitle: string;
  topicPlaceholder: string;
  addReminderBtn: string;
  noReminders: string;
  noRemindersHint: string;
  pendingLabel: string;
  completedLabel: string;
  todayBadge: string;
  overdue: string;
  // Settings
  settingsTitle: string;
  settingsSubtitle: string;
  profileSection: string;
  nameLabel: string;
  dailyGoalSection: string;
  targetScoreSection: string;
  examDateSection: string;
  saving: string;
  save: string;
  accountSection: string;
  logout: string;
  savedMsg: string;
  veryIntense: string;
  great: string;
  goodStart: string;
  examDay: string;
  daysLeft: string;
  examInDays: (n: number) => string;
  examTodaySettings: string;
  languageSection: string;
  // Timetable
  timetableTitle: string;
  timetableSubtitle: string;
  examDateLabel: string;
  daysRemainingLabel: string;
  finalStage: string;
  lastWeeks: string;
  plentyOfTime: string;
  subjectDifficultyTitle: string;
  subjectDifficultyHint: string;
  generateBtn: string;
  yourTimetable: (n: number) => string;
  // Report card
  reportCardTitle: string;
  reportCardSubtitle: string;
  progressLabel: string;
  scoreLabel: string;
  subjectWisePerformance: string;
  totalStudyLabel: string;
  targetScoreLabel: string;
  motivational: (progress: number) => string;
  motivationalSub: (progress: number) => string;
  daysToExam: (n: number) => string;
  karnataka: string;
  // Grade labels
  distinction: string;
  firstClass: string;
  secondClass: string;
  pass: string;
  keepTrying: string;
}

const en: Translations = {
  navHome: "Home",
  navSubjects: "Subjects",
  navLog: "Log",
  navTests: "Tests",
  navAnalytics: "Analytics",
  navSettings: "Settings",
  welcome: "Welcome",
  enterNamePlaceholder: "Enter your name",
  letsGo: "Let's Go",
  greeting: "Hello",
  todayGoal: "Today's Goal",
  dailyStudyGoal: "Daily Study Goal",
  goalAchieved: "Goal Achieved! 🎉",
  bravo: "Great job! You met today's goal!",
  hoursRemaining: (h) => `${h.toFixed(1)}h remaining`,
  examToday: "Exam today! Good luck!",
  lastWeek: "Last week — study well!",
  oneMonthLeft: "One month left — keep going!",
  effortYield: "Today's effort is tomorrow's success",
  examIn: "Exam in",
  days: "days",
  goal: "Goal:",
  todaysPlan: "Today's Study Plan",
  studyPlan: "Study Plan",
  allChaptersDone: "All chapters up to date",
  overallProgressLabel: "Progress",
  todayStudy: "Today's Study",
  testScore: "Test Score",
  subjectProgress: "Subject Progress",
  overallProgressCard: "Overall Progress",
  seeAll: "See all",
  journeyStarted: "Your journey has started!",
  studyingWell: "You are studying well!",
  keepGoingMsg: "Very good, keep going!",
  youAreReady: "Excellent! You are ready!",
  studyLogLink: "Study Log",
  mockTestsLink: "Mock Tests",
  analyticsLink: "Analytics",
  remindersLink: "Reminders",
  timetableLink: "Timetable",
  reportCardLink: "Report Card",
  subjectsTitle: "Subjects",
  subjectsSubtitle: "Track chapter progress",
  begin: "Begin",
  keepGoing: "Keep going",
  excellent: "Excellent!",
  chaptersSection: "Chapters",
  chaptersCompleteCount: "chapters complete",
  mockTestScoresSection: "Mock Test Scores",
  weakTopicsSection: "Weak Topics",
  noWeakTopics: "No weak topics added yet",
  studyLogTitle: "Study Log",
  studyLogSubtitle: "Track your daily study hours",
  today: "Today",
  total: "Total",
  dayStreak: "day streak",
  goalAchievementTitle: "Goal Achievement",
  goalMetDays: (n, goal) => `${n} days met your ${goal}h goal`,
  logStudyHoursTitle: "Log Study Hours",
  addBtn: "Add",
  thisWeek: "This Week",
  recentLogs: "Recent Logs",
  noLogs: "No study sessions logged yet",
  calendar28: "28-Day Calendar",
  calendarSubtitle: "4-week view",
  mockTestsTitle: "Mock Tests",
  mockTestsSubtitle: "Track your practice scores",
  addScore: "Add Score",
  averageScores: "Average Scores",
  scoreTrend: "Score Trend",
  recentTests: "Recent Tests",
  noTests: "No test scores added yet",
  analyticsTitle: "Analytics",
  analyticsSubtitle: "Your performance overview",
  overallProgressStat: "Overall Progress",
  avgScore: "Avg Score",
  totalStudy: "Total Study",
  subjectProgressChart: "Subject Progress",
  testScores: "Test Scores",
  studyTimeBreakdown: "Study Time Breakdown",
  weakTopicAnalysis: "Weak Topic Analysis",
  noWeakTopicsAnalytics: "No unrevised weak topics!",
  topicCount: (n) => `${n} topic${n !== 1 ? "s" : ""}`,
  remindersTitle: "Reminders",
  remindersSubtitle: "Revision Reminders",
  addReminderTitle: "Add Reminder",
  topicPlaceholder: "Topic to revise...",
  addReminderBtn: "Add",
  noReminders: "No reminders yet",
  noRemindersHint: "Add a revision reminder to get started",
  pendingLabel: "Pending",
  completedLabel: "Completed",
  todayBadge: "Today!",
  overdue: "Overdue",
  settingsTitle: "Settings",
  settingsSubtitle: "Profile Settings",
  profileSection: "Profile",
  nameLabel: "Name",
  dailyGoalSection: "Daily Study Goal",
  targetScoreSection: "Target Score",
  examDateSection: "Exam Date",
  saving: "Saving...",
  save: "Save",
  accountSection: "Account",
  logout: "Log Out",
  savedMsg: "Saved!",
  veryIntense: "Very intense",
  great: "Great",
  goodStart: "Good start",
  examDay: "Exam day",
  daysLeft: "days left",
  examInDays: (n) => `Exam in ${n} days — prepare well!`,
  examTodaySettings: "Exam today! Good luck!",
  languageSection: "Language",
  timetableTitle: "Study Timetable",
  timetableSubtitle: "Timetable Generator",
  examDateLabel: "Exam Date",
  daysRemainingLabel: "days remaining",
  finalStage: "Final stage!",
  lastWeeks: "Last few weeks!",
  plentyOfTime: "Plenty of time",
  subjectDifficultyTitle: "Subject Difficulty",
  subjectDifficultyHint: "Rate how hard each subject feels — harder subjects get more study days",
  generateBtn: "Generate Timetable",
  yourTimetable: (n) => `Your Timetable (${n} days)`,
  reportCardTitle: "Report Card",
  reportCardSubtitle: "Progress Report Card",
  progressLabel: "Progress",
  scoreLabel: "Score",
  subjectWisePerformance: "Subject-wise Performance",
  totalStudyLabel: "Total Study",
  targetScoreLabel: "Target Score",
  motivational: (p) =>
    p >= 80 ? "Excellent! You are ready!" : p >= 50 ? "Doing well — keep going!" : "One step every day — you can do it!",
  motivationalSub: (p) =>
    p >= 80 ? "Keep this momentum!" : p >= 50 ? "Stay consistent!" : "Every day counts!",
  daysToExam: (n) => `${n} days to exam`,
  karnataka: "Karnataka",
  distinction: "Distinction",
  firstClass: "First Class",
  secondClass: "Second Class",
  pass: "Pass",
  keepTrying: "Keep Trying",
};

const kn: Translations = {
  navHome: "ಮುಖ್ಯ ಪುಟ",
  navSubjects: "ವಿಷಯಗಳು",
  navLog: "ದಾಖಲೆ",
  navTests: "ಪರೀಕ್ಷೆ",
  navAnalytics: "ವಿಶ್ಲೇಷಣೆ",
  navSettings: "ಸೆಟ್ಟಿಂಗ್",
  welcome: "ಸ್ವಾಗತ",
  enterNamePlaceholder: "ನಿಮ್ಮ ಹೆಸರು ನಮೂದಿಸಿ",
  letsGo: "ಪ್ರವೇಶ",
  greeting: "ನಮಸ್ಕಾರ",
  todayGoal: "ಇಂದಿನ ಗುರಿ",
  dailyStudyGoal: "ದೈನಂದಿನ ಅಭ್ಯಾಸ ಗುರಿ",
  goalAchieved: "ಗುರಿ ಸಾಧಿಸಿದೆ! 🎉",
  bravo: "ಶಾಬಾಶ್! ನೀನು ಇಂದು ಗುರಿ ಮುಟ್ಟಿದೆ!",
  hoursRemaining: (h) => `ಇನ್ನೂ ${h.toFixed(1)}h ಬಾಕಿ ಇದೆ`,
  examToday: "ಇಂದೇ ಪರೀಕ್ಷೆ! ಶುಭವಾಗಲಿ!",
  lastWeek: "ಕೊನೆಯ ವಾರ — ಚೆನ್ನಾಗಿ ಓದು!",
  oneMonthLeft: "ಒಂದು ತಿಂಗಳು ಬಾಕಿ — ಮುಂದುವರಿ!",
  effortYield: "ಇಂದಿನ ಪ್ರಯತ್ನ ನಾಳಿನ ಯಶಸ್ಸು",
  examIn: "ಪರೀಕ್ಷೆಗೆ",
  days: "ದಿನ",
  goal: "ಗುರಿ:",
  todaysPlan: "ಇಂದಿನ ಅಭ್ಯಾಸ ಯೋಜನೆ",
  studyPlan: "ಅಭ್ಯಾಸ ಯೋಜನೆ",
  allChaptersDone: "ಎಲ್ಲ ಅಧ್ಯಾಯಗಳು ಪೂರ್ಣ!",
  overallProgressLabel: "ಪ್ರಗತಿ",
  todayStudy: "ಇಂದು ಅಭ್ಯಾಸ",
  testScore: "ಪರೀಕ್ಷೆ ಸ್ಕೋರ್",
  subjectProgress: "ವಿಷಯ ಪ್ರಗತಿ",
  overallProgressCard: "ಒಟ್ಟಾರೆ ಪ್ರಗತಿ",
  seeAll: "ಎಲ್ಲ ನೋಡಿ",
  journeyStarted: "ಪ್ರಯಾಣ ಶುರುವಾಗಿದೆ!",
  studyingWell: "ಚೆನ್ನಾಗಿ ಅಭ್ಯಾಸ ಮಾಡುತ್ತಿರುವಿ!",
  keepGoingMsg: "ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ, ಮುಂದುವರಿ!",
  youAreReady: "ಅದ್ಭುತ! ನೀನು ಸಿದ್ಧ!",
  studyLogLink: "ಅಭ್ಯಾಸ ದಾಖಲಿಸಿ",
  mockTestsLink: "ಪರೀಕ್ಷೆ ಸ್ಕೋರ್",
  analyticsLink: "ವಿಶ್ಲೇಷಣೆ",
  remindersLink: "ಜ್ಞಾಪನೆ",
  timetableLink: "ವೇಳಾಪಟ್ಟಿ",
  reportCardLink: "ವರದಿ ಪಟ್ಟಿ",
  subjectsTitle: "ವಿಷಯಗಳು",
  subjectsSubtitle: "ಅಧ್ಯಾಯ ಪ್ರಗತಿ ಟ್ರ್ಯಾಕ್",
  begin: "ಶುರು ಮಾಡು",
  keepGoing: "ಮುಂದುವರಿ",
  excellent: "ಬಹತ್ ಚೆನ್ನಾಗಿದೆ!",
  chaptersSection: "ಅಧ್ಯಾಯಗಳು",
  chaptersCompleteCount: "ಅಧ್ಯಾಯಗಳು ಪೂರ್ಣ",
  mockTestScoresSection: "ಅಭ್ಯಾಸ ಪರೀಕ್ಷೆ ಸ್ಕೋರ್",
  weakTopicsSection: "ದುರ್ಬಲ ವಿಷಯಗಳು",
  noWeakTopics: "ದುರ್ಬಲ ವಿಷಯಗಳಿಲ್ಲ",
  studyLogTitle: "ಅಭ್ಯಾಸ ದಾಖಲೆ",
  studyLogSubtitle: "ದೈನಂದಿನ ಅಭ್ಯಾಸ ಸಮಯ ದಾಖಲಿಸಿ",
  today: "ಇಂದು",
  total: "ಒಟ್ಟು",
  dayStreak: "ದಿನ streak",
  goalAchievementTitle: "ಗುರಿ ಸಾಧನೆ",
  goalMetDays: (n, goal) => `${n} ದಿನ ${goal}h ಗುರಿ ತಲುಪಿದೆ`,
  logStudyHoursTitle: "ಅಭ್ಯಾಸ ದಾಖಲಿಸಿ",
  addBtn: "ದಾಖಲಿಸಿ",
  thisWeek: "ಈ ವಾರ",
  recentLogs: "ಇತ್ತೀಚಿನ ದಾಖಲೆಗಳು",
  noLogs: "ಅಭ್ಯಾಸ ದಾಖಲೆ ಇಲ್ಲ",
  calendar28: "28 ದಿನಗಳ ಕ್ಯಾಲೆಂಡರ್",
  calendarSubtitle: "4 ವಾರಗಳ ದೃಶ್ಯ",
  mockTestsTitle: "ಅಭ್ಯಾಸ ಪರೀಕ್ಷೆ",
  mockTestsSubtitle: "ನಿಮ್ಮ ಅಭ್ಯಾಸ ಸ್ಕೋರ್ ದಾಖಲಿಸಿ",
  addScore: "ಸ್ಕೋರ್ ದಾಖಲಿಸಿ",
  averageScores: "ಸರಾಸರಿ ಸ್ಕೋರ್",
  scoreTrend: "ಸ್ಕೋರ್ ಗ್ರಾಫ್",
  recentTests: "ಇತ್ತೀಚಿನ ಪರೀಕ್ಷೆಗಳು",
  noTests: "ಯಾವುದೇ ಪರೀಕ್ಷೆ ದಾಖಲಾಗಿಲ್ಲ",
  analyticsTitle: "ವಿಶ್ಲೇಷಣೆ",
  analyticsSubtitle: "ನಿಮ್ಮ ಕಾರ್ಯಕ್ಷಮತೆ ವಿಶ್ಲೇಷಣೆ",
  overallProgressStat: "ಒಟ್ಟು ಪ್ರಗತಿ",
  avgScore: "ಸರಾಸರಿ ಸ್ಕೋರ್",
  totalStudy: "ಒಟ್ಟು ಅಭ್ಯಾಸ",
  subjectProgressChart: "ವಿಷಯ ಪ್ರಗತಿ",
  testScores: "ಪರೀಕ್ಷೆ ಸ್ಕೋರ್",
  studyTimeBreakdown: "ಅಭ್ಯಾಸ ಸಮಯ ಹಂಚಿಕೆ",
  weakTopicAnalysis: "ದುರ್ಬಲ ವಿಷಯಗಳ ವಿಶ್ಲೇಷಣೆ",
  noWeakTopicsAnalytics: "ದುರ್ಬಲ ವಿಷಯಗಳಿಲ್ಲ!",
  topicCount: (n) => `${n} ವಿಷಯ`,
  remindersTitle: "ಜ್ಞಾಪನೆ",
  remindersSubtitle: "ಪರಿಷ್ಕರಣೆ ಜ್ಞಾಪನೆಗಳು",
  addReminderTitle: "ಜ್ಞಾಪನೆ ಸೇರಿಸಿ",
  topicPlaceholder: "ಪರಿಷ್ಕರಿಸಬೇಕಾದ ವಿಷಯ...",
  addReminderBtn: "ಸೇರಿಸಿ",
  noReminders: "ಜ್ಞಾಪನೆ ಇಲ್ಲ",
  noRemindersHint: "ಪರಿಷ್ಕರಣೆ ಜ್ಞಾಪನೆ ಸೇರಿಸಿ",
  pendingLabel: "ಬಾಕಿ",
  completedLabel: "ಪೂರ್ಣ",
  todayBadge: "ಇಂದು!",
  overdue: "ತಡ",
  settingsTitle: "ಸೆಟ್ಟಿಂಗ್ಸ್",
  settingsSubtitle: "ಪ್ರೊಫೈಲ್ ಸೆಟ್ಟಿಂಗ್ಸ್",
  profileSection: "ವ್ಯಕ್ತಿಗತ ಮಾಹಿತಿ",
  nameLabel: "ಹೆಸರು",
  dailyGoalSection: "ದೈನಂದಿನ ಗುರಿ",
  targetScoreSection: "ಗುರಿ ಅಂಕ",
  examDateSection: "ಪರೀಕ್ಷೆ ದಿನಾಂಕ",
  saving: "ಉಳಿಸುತ್ತಿದೆ...",
  save: "ಉಳಿಸಿ",
  accountSection: "ಖಾತೆ",
  logout: "ಹೊರಗೆ ಹೋಗಿ",
  savedMsg: "ಉಳಿಸಲಾಗಿದೆ!",
  veryIntense: "ತುಂಬಾ ಕಷ್ಟ!",
  great: "ಚೆನ್ನಾಗಿದೆ",
  goodStart: "ಶುರುವಾತಿಗೆ ಒಳ್ಳೆಯದು",
  examDay: "ಪರೀಕ್ಷೆ ದಿನ",
  daysLeft: "ದಿನಗಳು ಬಾಕಿ",
  examInDays: (n) => `${n} ದಿನಗಳಲ್ಲಿ ಪರೀಕ್ಷೆ — ಚೆನ್ನಾಗಿ ತಯಾರಾಗು!`,
  examTodaySettings: "ಇಂದೇ ಪರೀಕ್ಷೆ! ಶುಭವಾಗಲಿ!",
  languageSection: "ಭಾಷೆ",
  timetableTitle: "ಅಭ್ಯಾಸ ವೇಳಾಪಟ್ಟಿ",
  timetableSubtitle: "ವೇಳಾಪಟ್ಟಿ ತಯಾರಕ",
  examDateLabel: "ಪರೀಕ್ಷೆ ದಿನಾಂಕ",
  daysRemainingLabel: "ದಿನಗಳು ಬಾಕಿ",
  finalStage: "ಅಂತಿಮ ಹಂತ!",
  lastWeeks: "ಕೊನೆಯ ವಾರಗಳು!",
  plentyOfTime: "ಸಾಕಷ್ಟು ಸಮಯ ಇದೆ",
  subjectDifficultyTitle: "ವಿಷಯದ ತೊಂದರೆ ಮಟ್ಟ",
  subjectDifficultyHint: "ಪ್ರತಿ ವಿಷಯ ಎಷ್ಟು ಕಷ್ಟ ಎಂದು ನಿರ್ಧರಿಸಿ",
  generateBtn: "ವೇಳಾಪಟ್ಟಿ ತಯಾರಿಸಿ",
  yourTimetable: (n) => `ನಿಮ್ಮ ವೇಳಾಪಟ್ಟಿ (${n} ದಿನ)`,
  reportCardTitle: "ವರದಿ ಪಟ್ಟಿ",
  reportCardSubtitle: "ಪ್ರಗತಿ ವರದಿ ಪಟ್ಟಿ",
  progressLabel: "ಪ್ರಗತಿ",
  scoreLabel: "ಸ್ಕೋರ್",
  subjectWisePerformance: "ವಿಷಯವಾರು ಪ್ರಗತಿ · Subject-wise Performance",
  totalStudyLabel: "ಒಟ್ಟು ಅಭ್ಯಾಸ",
  targetScoreLabel: "ಗುರಿ ಅಂಕ",
  motivational: (p) =>
    p >= 80 ? "ಅದ್ಭುತ! ನೀನು ತಯಾರಾಗಿದ್ದೀ!" : p >= 50 ? "ಚೆನ್ನಾಗಿ ಮಾಡುತ್ತಿದ್ದೀ — ಮುಂದುವರಿ!" : "ಪ್ರತಿ ದಿನ ಒಂದು ಹೆಜ್ಜೆ — ನಿನ್ನಿಂದ ಸಾಧ್ಯ!",
  motivationalSub: (p) =>
    p >= 80 ? "Excellent! You are ready!" : p >= 50 ? "Doing well — keep going!" : "One step every day — you can do it!",
  daysToExam: (n) => `ಪರೀಕ್ಷೆಗೆ ${n} ದಿನ ಬಾಕಿ`,
  karnataka: "ಕರ್ನಾಟಕ",
  distinction: "ವಿಶಿಷ್ಟ",
  firstClass: "ಪ್ರಥಮ ದರ್ಜೆ",
  secondClass: "ದ್ವಿತೀಯ ದರ್ಜೆ",
  pass: "ಉತ್ತೀರ್ಣ",
  keepTrying: "ಇನ್ನಷ್ಟು ಪ್ರಯತ್ನ",
};

const LANG_KEY = "sslc_lang";

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
  subjectLabel: (cfg: { label: string; labelKn: string }) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: en,
  subjectLabel: (c) => c.label,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      return saved === "kn" ? "kn" : "en";
    } catch {
      return "en";
    }
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(LANG_KEY, l); } catch { /* ignore */ }
  };

  const t = lang === "kn" ? kn : en;
  const subjectLabel = (cfg: { label: string; labelKn: string }) =>
    lang === "kn" ? cfg.labelKn : cfg.label;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, subjectLabel }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
