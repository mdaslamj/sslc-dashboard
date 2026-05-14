import { Layout } from "@/components/layout/layout";
import { useProfile, useAllSubjectsData, useMockTests, useStudyLogs } from "@/hooks/use-storage";
import { SUBJECT_CONFIG, SUBJECTS } from "@/lib/subject-config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Printer, Share2, Trophy, Flame, Target, BookOpen } from "lucide-react";
import { useMemo, useRef } from "react";
import { StudyLog } from "@/lib/data-model";
import { useLanguage, Translations } from "@/lib/i18n";

function calcStreak(logs: StudyLog[], goalHours: number): number {
  if (!logs.length || goalHours <= 0) return 0;
  const byDate: Record<string, number> = {};
  for (const log of logs) byDate[log.date] = (byDate[log.date] || 0) + log.hours;
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if ((byDate[key] ?? 0) >= goalHours) streak++;
    else if (i === 0) continue;
    else break;
  }
  return streak;
}

function gradeLabel(pct: number, t: Translations) {
  if (pct >= 90) return { grade: "A+", label: t.distinction, color: "text-green-700" };
  if (pct >= 75) return { grade: "A", label: t.firstClass, color: "text-blue-700" };
  if (pct >= 60) return { grade: "B", label: t.secondClass, color: "text-yellow-700" };
  if (pct >= 35) return { grade: "C", label: t.pass, color: "text-orange-700" };
  return { grade: "D", label: t.keepTrying, color: "text-red-700" };
}

export default function ReportCard() {
  const { data: profile } = useProfile();
  const { data: allSubjects } = useAllSubjectsData();
  const { data: mockTests } = useMockTests();
  const { data: studyLogs } = useStudyLogs();
  const { t, subjectLabel } = useLanguage();
  const printRef = useRef<HTMLDivElement>(null);

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const subjectStats = useMemo(() => {
    return SUBJECTS.map((s) => {
      const data = allSubjects?.[s];
      const total = data?.chapters.length ?? 0;
      const done = data?.chapters.filter((c) => c.completed).length ?? 0;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      const tests = (mockTests ?? []).filter((t) => t.subject === s);
      const avgScore =
        tests.length > 0
          ? Math.round(tests.reduce((sum, tt) => sum + (tt.score / tt.totalMarks) * 100, 0) / tests.length)
          : null;
      return { subject: s, done, total, pct, avgScore, config: SUBJECT_CONFIG[s] };
    });
  }, [allSubjects, mockTests]);

  const overallProgress = useMemo(() => {
    if (!subjectStats.length) return 0;
    return Math.round(subjectStats.reduce((s, p) => s + p.pct, 0) / subjectStats.length);
  }, [subjectStats]);

  const overallScore = useMemo(() => {
    const withScores = subjectStats.filter((s) => s.avgScore !== null);
    if (!withScores.length) return null;
    return Math.round(withScores.reduce((s, p) => s + (p.avgScore ?? 0), 0) / withScores.length);
  }, [subjectStats]);

  const streak = useMemo(
    () => calcStreak(studyLogs ?? [], profile?.dailyGoalHours ?? 4),
    [studyLogs, profile?.dailyGoalHours]
  );

  const totalHours = useMemo(
    () => (studyLogs ?? []).reduce((s, l) => s + l.hours, 0),
    [studyLogs]
  );

  const gradeInfo = gradeLabel(overallScore ?? overallProgress, t);
  const initials = (profile?.name ?? "S")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const daysLeft = profile?.examDate
    ? Math.max(0, Math.ceil((new Date(profile.examDate + "T12:00:00").getTime() - Date.now()) / 86400000))
    : null;

  const handlePrint = () => window.print();

  const handleShare = async () => {
    const text = `📚 SSLC Progress Report\n👤 ${profile?.name ?? "Student"}\n📈 Overall Progress: ${overallProgress}%\n${overallScore !== null ? `🎯 Avg Mock Score: ${overallScore}%\n` : ""}🔥 Study Streak: ${streak} days\n⏱ Total Study: ${totalHours.toFixed(1)}h\n\nPrepared using SSLC Dashboard`;
    if (navigator.share) {
      await navigator.share({ title: "My SSLC Progress Report", text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <Layout>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #report-print, #report-print * { visibility: visible !important; }
          #report-print { position: fixed; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="pt-2 flex items-start justify-between no-print">
          <div>
            <h1 className="text-2xl font-bold">{t.reportCardTitle}</h1>
            <p className="text-sm text-muted-foreground">{t.reportCardSubtitle}</p>
          </div>
          <div className="flex gap-2 mt-1">
            <Button variant="outline" size="sm" onClick={handleShare} className="h-8 px-3 gap-1">
              <Share2 className="h-3.5 w-3.5" />
              <span className="text-xs">Share</span>
            </Button>
            <Button size="sm" onClick={handlePrint} className="h-8 px-3 gap-1">
              <Printer className="h-3.5 w-3.5" />
              <span className="text-xs">Print</span>
            </Button>
          </div>
        </div>

        {/* THE REPORT CARD */}
        <div id="report-print" ref={printRef}>
          <Card className="border-2 border-gray-200 overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-[#FF6B35] via-[#F7C59F] to-[#FF6B35] h-2" />

            <div className="bg-gradient-to-b from-blue-900 to-blue-800 text-white px-4 py-4 text-center">
              <p className="text-[10px] tracking-widest text-blue-200 uppercase mb-0.5">
                Karnataka Secondary Education Examination Board
              </p>
              <h2 className="text-base font-bold">ಎಸ್.ಎಸ್.ಎಲ್.ಸಿ. ಪ್ರಗತಿ ವರದಿ</h2>
              <p className="text-xs text-blue-200">SSLC Progress Report Card · {today}</p>
            </div>

            <div className="bg-[#FF9933] h-1.5" />

            <CardContent className="p-4 space-y-4">
              {/* Student info row */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-900 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 ring-2 ring-[#FF9933]">
                  {initials}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold leading-tight">{profile?.name ?? "Student"}</p>
                  <p className="text-xs text-muted-foreground">Class X · SSLC</p>
                  {daysLeft !== null && (
                    <p className="text-xs text-blue-700 font-medium mt-0.5">
                      {t.daysToExam(daysLeft)}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold text-lg ring-2 ring-[#FF9933]">
                    {gradeInfo.grade}
                  </div>
                  <p className={`text-[9px] font-semibold mt-1 ${gradeInfo.color}`}>
                    {gradeInfo.label}
                  </p>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-200" />

              {/* Overall stats row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-blue-50 rounded-xl p-2">
                  <BookOpen className="h-4 w-4 text-blue-600 mx-auto mb-0.5" />
                  <p className="text-lg font-bold text-blue-700">{overallProgress}%</p>
                  <p className="text-[9px] text-blue-600">{t.progressLabel}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-2">
                  <Target className="h-4 w-4 text-green-600 mx-auto mb-0.5" />
                  <p className="text-lg font-bold text-green-700">
                    {overallScore !== null ? `${overallScore}%` : "—"}
                  </p>
                  <p className="text-[9px] text-green-600">{t.scoreLabel}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-2">
                  <Flame className="h-4 w-4 text-orange-500 mx-auto mb-0.5" />
                  <p className="text-lg font-bold text-orange-600">{streak}</p>
                  <p className="text-[9px] text-orange-500">Streak</p>
                </div>
              </div>

              {/* Subject table */}
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {t.subjectWisePerformance}
                </p>
                <div className="space-y-2">
                  {subjectStats.map(({ subject, done, total, pct, avgScore, config }) => (
                    <div key={subject}>
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                          <span className="text-xs font-medium">{subjectLabel(config)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">
                            {done}/{total} ch
                          </span>
                          {avgScore !== null && (
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                              style={{ color: config.color, backgroundColor: config.color + "18" }}
                            >
                              {avgScore}%
                            </span>
                          )}
                          <span className="text-xs font-bold w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                      <Progress
                        value={pct}
                        className="h-1.5"
                        style={{ "--progress-color": config.color } as React.CSSProperties}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Study hours + target */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <p className="text-base font-bold">{totalHours.toFixed(1)}h</p>
                  <p className="text-[9px] text-muted-foreground">{t.totalStudyLabel}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <p className="text-base font-bold">{profile?.targetScore ?? 90}%</p>
                  <p className="text-[9px] text-muted-foreground">{t.targetScoreLabel}</p>
                </div>
              </div>

              {/* Motivational footer */}
              <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-3 text-center text-white">
                <Trophy className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-xs font-bold text-yellow-300">
                  {t.motivational(overallProgress)}
                </p>
                <p className="text-[9px] text-blue-200 mt-0.5">
                  {t.motivationalSub(overallProgress)}
                </p>
              </div>

              {/* Bottom stripe */}
              <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-1">
                <span>SSLC Dashboard · {t.karnataka}</span>
                <span>{today}</span>
              </div>
            </CardContent>

            <div className="bg-gradient-to-r from-[#FF6B35] via-[#F7C59F] to-[#FF6B35] h-2" />
          </Card>

          <p className="text-center text-[11px] text-muted-foreground mt-2 no-print">
            📸 Take a screenshot to share your progress!
          </p>
        </div>
      </div>
    </Layout>
  );
}
