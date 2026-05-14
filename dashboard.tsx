import { Layout } from "@/components/layout/layout";
import { useProfile, useAllSubjectsData, useStudyLogs, useMockTests } from "@/hooks/use-storage";
import { SUBJECT_CONFIG, SUBJECTS, QUOTES } from "@/lib/subject-config";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { BookOpen, Clock, TrendingUp, Bell, ChevronRight, Settings, Calendar, Flame, ListChecks, RotateCcw, CalendarDays, Trophy } from "lucide-react";
import { useMemo } from "react";
import { StudyLog, SubjectData, Subject } from "@/lib/data-model";
import { useLanguage } from "@/lib/i18n";

function calcStreak(logs: StudyLog[], goalHours: number): number {
  if (!logs.length || goalHours <= 0) return 0;
  const byDate: Record<string, number> = {};
  for (const log of logs) {
    byDate[log.date] = (byDate[log.date] || 0) + log.hours;
  }
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const hours = byDate[key] ?? 0;
    if (hours >= goalHours) {
      streak++;
    } else if (i === 0) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}

type PlanItem = {
  subject: Subject;
  chapterName: string;
  difficulty: "easy" | "medium" | "hard";
  action: "study" | "revise";
  urgency: number;
};

function buildStudyPlan(allSubjects: Record<Subject, SubjectData>): PlanItem[] {
  const today = new Date();
  const items: PlanItem[] = [];
  const diffScore = { hard: 3, medium: 2, easy: 1 };

  for (const subject of SUBJECTS) {
    const data = allSubjects[subject];
    if (!data) continue;
    for (const ch of data.chapters) {
      if (!ch.completed) {
        items.push({ subject, chapterName: ch.name, difficulty: ch.difficulty, action: "study", urgency: diffScore[ch.difficulty] * 10 });
      } else if (ch.difficulty !== "easy" && ch.completedDate) {
        const daysSince = Math.floor((today.getTime() - new Date(ch.completedDate + "T12:00:00").getTime()) / 86400000);
        const threshold = ch.difficulty === "hard" ? 7 : 14;
        if (daysSince >= threshold) {
          items.push({ subject, chapterName: ch.name, difficulty: ch.difficulty, action: "revise", urgency: diffScore[ch.difficulty] * 5 + Math.min(daysSince - threshold, 30) });
        }
      }
    }
  }
  return items.sort((a, b) => b.urgency - a.urgency).slice(0, 5);
}

function StudyPlanCard({ allSubjects }: { allSubjects: Record<Subject, SubjectData> }) {
  const plan = useMemo(() => buildStudyPlan(allSubjects), [allSubjects]);
  const { t } = useLanguage();

  const DIFFICULTY_STYLE = {
    hard: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    easy: "bg-green-100 text-green-700",
  };

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm">{t.todaysPlan}</h2>
          </div>
          <span className="text-[10px] text-muted-foreground">{t.studyPlan}</span>
        </div>

        {plan.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <ListChecks className="h-6 w-6 mx-auto mb-1 opacity-30" />
            <p className="text-xs">{t.allChaptersDone}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {plan.map((item, i) => {
              const config = SUBJECT_CONFIG[item.subject];
              return (
                <Link key={i} href={`/subjects/${item.subject}`}>
                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: config.color + "20" }}
                    >
                      {item.action === "revise" ? (
                        <RotateCcw className="h-3.5 w-3.5" style={{ color: config.color }} />
                      ) : (
                        <BookOpen className="h-3.5 w-3.5" style={{ color: config.color }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.chapterName}</p>
                      <p className="text-[10px] text-muted-foreground">{config.label}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge className={`text-[9px] px-1 py-0 ${DIFFICULTY_STYLE[item.difficulty]}`}>
                        {item.difficulty}
                      </Badge>
                      <Badge
                        className={`text-[9px] px-1 py-0 ${
                          item.action === "revise"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {item.action === "revise" ? "Revise" : "Study"}
                      </Badge>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CircularProgress({ value, color, size = 64 }: { value: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
    </svg>
  );
}

function DailyGoalRing({ hoursLogged, goalHours }: { hoursLogged: number; goalHours: number }) {
  const { t } = useLanguage();
  const size = 96;
  const strokeWidth = 8;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(1, hoursLogged / goalHours);
  const offset = circumference - pct * circumference;
  const color = pct >= 1 ? "#16a34a" : pct >= 0.6 ? "#2563eb" : "#f97316";
  const label = pct >= 1 ? t.goalAchieved : `${hoursLogged}h / ${goalHours}h`;

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <svg width={size} height={size} className="rotate-[-90deg]">
              <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
              <circle
                cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
                strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold" style={{ color }}>
                {Math.round(pct * 100)}%
              </span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{t.todayGoal}</h3>
            <p className="text-xs text-muted-foreground mb-2">{t.dailyStudyGoal}</p>
            <p className="text-lg font-bold" style={{ color }}>{label}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {pct >= 1 ? t.bravo : t.hoursRemaining(Math.max(0, goalHours - hoursLogged))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ExamCountdown({ examDate, targetScore }: { examDate?: string; targetScore?: number }) {
  const { t } = useLanguage();
  if (!examDate) return null;
  const daysLeft = Math.ceil((new Date(examDate + "T12:00:00").getTime() - Date.now()) / 86400000);
  if (daysLeft < 0) return null;

  const urgencyColor =
    daysLeft <= 7 ? "from-red-600 to-red-400" : daysLeft <= 30 ? "from-orange-500 to-orange-400" : "from-blue-600 to-blue-400";

  const urgencyMsg =
    daysLeft === 0 ? t.examToday
    : daysLeft <= 7 ? t.lastWeek
    : daysLeft <= 30 ? t.oneMonthLeft
    : t.effortYield;

  return (
    <Link href="/settings">
      <Card className={`border-0 bg-gradient-to-r ${urgencyColor} text-white shadow-md cursor-pointer`}>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/80">{t.examIn}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">{daysLeft}</span>
              <span className="text-sm text-white/80">{t.days}</span>
            </div>
            <p className="text-[10px] text-white/70 mt-0.5">{urgencyMsg}</p>
          </div>
          <div className="text-right space-y-1">
            <Calendar className="h-8 w-8 text-white/60 ml-auto" />
            {targetScore && (
              <div className="text-xs text-white/80">
                {t.goal} <span className="font-bold text-white">{targetScore}%</span>
              </div>
            )}
            <div className="text-[10px] text-white/60">{examDate}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Dashboard() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: allSubjects } = useAllSubjectsData();
  const { data: studyLogs } = useStudyLogs();
  const { data: mockTests } = useMockTests();
  const { t, lang, subjectLabel } = useLanguage();

  const todayStr = new Date().toISOString().split("T")[0];
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const quote = QUOTES[dayOfYear % QUOTES.length];

  const todayHours = useMemo(() => {
    if (!studyLogs) return 0;
    return studyLogs.filter((l) => l.date === todayStr).reduce((sum, l) => sum + l.hours, 0);
  }, [studyLogs, todayStr]);

  const avgScore = useMemo(() => {
    if (!mockTests || mockTests.length === 0) return null;
    const recent = mockTests.slice(-5);
    return Math.round(recent.reduce((s, tt) => s + (tt.score / tt.totalMarks) * 100, 0) / recent.length);
  }, [mockTests]);

  const subjectProgress = useMemo(() => {
    if (!allSubjects) return [];
    return SUBJECTS.map((s) => {
      const data = allSubjects[s];
      const total = data?.chapters.length || 0;
      const done = data?.chapters.filter((c) => c.completed).length || 0;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      return { subject: s, pct, done, total, config: SUBJECT_CONFIG[s] };
    });
  }, [allSubjects]);

  const overallProgress = useMemo(() => {
    if (!subjectProgress.length) return 0;
    return Math.round(subjectProgress.reduce((s, p) => s + p.pct, 0) / subjectProgress.length);
  }, [subjectProgress]);

  const streak = useMemo(
    () => calcStreak(studyLogs ?? [], profile?.dailyGoalHours ?? 4),
    [studyLogs, profile?.dailyGoalHours]
  );

  if (profileLoading) {
    return (
      <Layout>
        <div className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="pt-2 pb-1 flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{t.greeting}</p>
            <h1 className="text-2xl font-bold text-foreground">
              {profile?.name || "Student"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 italic">
              "{lang === "kn" ? quote.kn : quote.en}"
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {streak > 0 && (
              <Link href="/study-log">
                <div className="flex items-center gap-1 bg-orange-50 border border-orange-200 rounded-full px-3 py-1.5 cursor-pointer">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-bold text-orange-600">{streak}</span>
                </div>
              </Link>
            )}
            <Link href="/settings">
              <button className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                <Settings className="h-4 w-4 text-muted-foreground" />
              </button>
            </Link>
          </div>
        </div>

        {/* Exam countdown */}
        <ExamCountdown examDate={profile?.examDate} targetScore={profile?.targetScore} />

        {/* Daily goal ring */}
        <DailyGoalRing hoursLogged={todayHours} goalHours={profile?.dailyGoalHours ?? 4} />

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 bg-blue-50">
            <CardContent className="p-3 text-center">
              <div className="flex justify-center mb-1">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-xl font-bold text-blue-700">{overallProgress}%</div>
              <div className="text-[10px] text-blue-600 font-medium">{t.overallProgressLabel}</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-green-50">
            <CardContent className="p-3 text-center">
              <div className="flex justify-center mb-1">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-xl font-bold text-green-700">{todayHours}h</div>
              <div className="text-[10px] text-green-600 font-medium">{t.todayStudy}</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-orange-50">
            <CardContent className="p-3 text-center">
              <div className="flex justify-center mb-1">
                <BookOpen className="h-4 w-4 text-orange-600" />
              </div>
              <div className="text-xl font-bold text-orange-700">{avgScore ?? "--"}%</div>
              <div className="text-[10px] text-orange-600 font-medium">{t.testScore}</div>
            </CardContent>
          </Card>
        </div>

        {/* Study plan */}
        {allSubjects && <StudyPlanCard allSubjects={allSubjects} />}

        {/* Subject progress circles */}
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-sm">{t.subjectProgress}</h2>
              <Link href="/subjects" className="text-xs text-primary flex items-center gap-1">
                {t.seeAll} <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {subjectProgress.map(({ subject, pct, config }) => (
                <Link key={subject} href={`/subjects/${subject}`}>
                  <div className="flex flex-col items-center gap-1">
                    <div className="relative">
                      <CircularProgress value={pct} color={config.color} size={52} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-bold" style={{ color: config.color }}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] text-center text-muted-foreground leading-tight">
                      {subjectLabel(config)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Overall progress bar */}
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold">{t.overallProgressCard}</span>
              <span className="text-sm font-bold text-primary">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {overallProgress < 30
                ? t.journeyStarted
                : overallProgress < 60
                ? t.studyingWell
                : overallProgress < 90
                ? t.keepGoingMsg
                : t.youAreReady}
            </p>
          </CardContent>
        </Card>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3 pb-2">
          <Link href="/study-log">
            <Card className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold">{t.studyLogLink}</div>
                  <div className="text-[10px] text-muted-foreground">Log hours</div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/mock-tests">
            <Card className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold">{t.mockTestsLink}</div>
                  <div className="text-[10px] text-muted-foreground">Track scores</div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/analytics">
            <Card className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold">{t.analyticsLink}</div>
                  <div className="text-[10px] text-muted-foreground">Performance</div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/reminders">
            <Card className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Bell className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold">{t.remindersLink}</div>
                  <div className="text-[10px] text-muted-foreground">Revision</div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/timetable">
            <Card className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CalendarDays className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-primary">{t.timetableLink}</div>
                  <div className="text-[10px] text-muted-foreground">Study plan</div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/report-card">
            <Card className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer border-yellow-300/60 bg-yellow-50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-yellow-700">{t.reportCardLink}</div>
                  <div className="text-[10px] text-muted-foreground">Progress</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
