import { Layout } from "@/components/layout/layout";
import { useProfile, useAllSubjectsData } from "@/hooks/use-storage";
import { SUBJECT_CONFIG, SUBJECTS } from "@/lib/subject-config";
import { Subject } from "@/lib/data-model";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Sparkles, ChevronRight, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { format, addDays } from "date-fns";
import { useLanguage } from "@/lib/i18n";

type DayEntry = {
  date: string;
  label: string;
  subjects: Subject[];
  isRevision: boolean;
  isRest: boolean;
};

function generateTimetable(
  examDate: string,
  weakness: Record<Subject, number>,
  incompleteCount: Record<Subject, number>,
  dailyGoal: number
): DayEntry[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(examDate + "T00:00:00");
  const totalDays = Math.max(1, Math.ceil((exam.getTime() - today.getTime()) / 86400000));

  const restDays = Math.min(3, totalDays);
  const studyDays = totalDays - restDays;

  const weights: Record<Subject, number> = {} as Record<Subject, number>;
  let totalWeight = 0;
  for (const s of SUBJECTS) {
    const w = (weakness[s] ?? 3) * 2 + (incompleteCount[s] ?? 0);
    weights[s] = Math.max(w, 1);
    totalWeight += weights[s];
  }

  const slotsPerDay = dailyGoal >= 6 ? 2 : 1;
  const totalSlots = studyDays * slotsPerDay;

  const slotAlloc: Record<Subject, number> = {} as Record<Subject, number>;
  let allocated = 0;
  for (let i = 0; i < SUBJECTS.length; i++) {
    const s = SUBJECTS[i];
    if (i === SUBJECTS.length - 1) {
      slotAlloc[s] = totalSlots - allocated;
    } else {
      slotAlloc[s] = Math.max(1, Math.round((weights[s] / totalWeight) * totalSlots));
      allocated += slotAlloc[s];
    }
  }

  const subjectQueue: Subject[] = [];
  const remaining = { ...slotAlloc };
  let added = true;
  while (added) {
    added = false;
    for (const s of SUBJECTS) {
      if (remaining[s] > 0) {
        subjectQueue.push(s);
        remaining[s]--;
        added = true;
      }
    }
  }

  const entries: DayEntry[] = [];
  let slotIdx = 0;

  for (let d = 0; d < totalDays; d++) {
    const date = addDays(today, d);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayLabel = format(date, "EEE, MMM d");
    const isRevision = d >= studyDays && d < totalDays - 1;
    const isRest = d === totalDays - 1;

    if (isRevision) {
      entries.push({ date: dateStr, label: dayLabel, subjects: SUBJECTS, isRevision: true, isRest: false });
    } else if (isRest) {
      entries.push({ date: dateStr, label: dayLabel, subjects: [], isRevision: false, isRest: true });
    } else {
      const daySubjects: Subject[] = [];
      for (let s = 0; s < slotsPerDay && slotIdx < subjectQueue.length; s++, slotIdx++) {
        daySubjects.push(subjectQueue[slotIdx]);
      }
      entries.push({ date: dateStr, label: dayLabel, subjects: daySubjects, isRevision: false, isRest: false });
    }
  }

  return entries;
}

export default function Timetable() {
  const { data: profile } = useProfile();
  const { data: allSubjects } = useAllSubjectsData();
  const { t, subjectLabel } = useLanguage();

  const defaultExamDate = profile?.examDate || format(addDays(new Date(), 30), "yyyy-MM-dd");

  const [examDate, setExamDate] = useState(defaultExamDate);
  const [weakness, setWeakness] = useState<Record<Subject, number>>(() => {
    const w = {} as Record<Subject, number>;
    for (const s of SUBJECTS) w[s] = 3;
    return w;
  });
  const [generated, setGenerated] = useState(false);

  const incompleteCount = useMemo(() => {
    const counts = {} as Record<Subject, number>;
    for (const s of SUBJECTS) {
      const data = allSubjects?.[s];
      counts[s] = data ? data.chapters.filter((c) => !c.completed).length : 0;
    }
    return counts;
  }, [allSubjects]);

  const daysLeft = useMemo(() => {
    return Math.max(
      0,
      Math.ceil(
        (new Date(examDate + "T00:00:00").getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000
      )
    );
  }, [examDate]);

  const timetable = useMemo(() => {
    if (!generated) return [];
    return generateTimetable(examDate, weakness, incompleteCount, profile?.dailyGoalHours ?? 4);
  }, [generated, examDate, weakness, incompleteCount, profile?.dailyGoalHours]);

  const WEAKNESS_LABELS = ["", "Very Easy", "Easy", "Medium", "Hard", "Very Hard"];
  const WEAKNESS_COLOR = [
    "", "text-green-600", "text-green-500", "text-yellow-600", "text-orange-500", "text-red-600",
  ];

  return (
    <Layout>
      <div className="p-4 space-y-4">
        <div className="pt-2">
          <h1 className="text-2xl font-bold">{t.timetableTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.timetableSubtitle}</p>
        </div>

        {/* Exam date */}
        <Card className="border shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              <h2 className="font-semibold text-sm">{t.examDateLabel}</h2>
            </div>
            <input
              type="date"
              value={examDate}
              onChange={(e) => { setExamDate(e.target.value); setGenerated(false); }}
              className="w-full h-9 px-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {daysLeft > 0 && (
              <p className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground">{daysLeft}</span> {t.daysRemainingLabel} ·{" "}
                {daysLeft <= 3 ? t.finalStage : daysLeft <= 14 ? t.lastWeeks : t.plentyOfTime}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Weakness rating per subject */}
        <Card className="border shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">{t.subjectDifficultyTitle}</h2>
            </div>
            <p className="text-[10px] text-muted-foreground -mt-2">
              {t.subjectDifficultyHint}
            </p>
            <div className="space-y-4">
              {SUBJECTS.map((s) => {
                const config = SUBJECT_CONFIG[s];
                const val = weakness[s] ?? 3;
                return (
                  <div key={s} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="text-xs font-medium">{subjectLabel(config)}</span>
                      </div>
                      <span className={`text-xs font-semibold ${WEAKNESS_COLOR[val]}`}>
                        {WEAKNESS_LABELS[val]}
                      </span>
                    </div>
                    <Slider
                      value={[val]}
                      onValueChange={([v]) => {
                        setWeakness((prev) => ({ ...prev, [s]: v }));
                        setGenerated(false);
                      }}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[9px] text-muted-foreground">
                      <span>Easy</span>
                      {incompleteCount[s] > 0 && (
                        <span className="text-orange-500">
                          {incompleteCount[s]} chapters pending
                        </span>
                      )}
                      <span>Hard</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Generate button */}
        <Button
          className="w-full h-11 text-base"
          onClick={() => setGenerated(true)}
          disabled={daysLeft <= 0}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {t.generateBtn}
        </Button>

        {/* Generated timetable */}
        {generated && timetable.length > 0 && (
          <div className="space-y-3 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">{t.yourTimetable(timetable.length)}</h2>
              <button
                onClick={() => setGenerated(false)}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>

            {timetable.map((day, i) => {
              const isToday = day.date === format(new Date(), "yyyy-MM-dd");

              if (day.isRest) {
                return (
                  <Card
                    key={day.date}
                    className={`border ${isToday ? "border-primary ring-1 ring-primary" : "border-gray-100"} bg-gray-50`}
                  >
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm">😴</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500">{day.label}</p>
                          {isToday && <span className="text-[9px] text-primary font-bold">TODAY</span>}
                        </div>
                      </div>
                      <Badge className="bg-gray-100 text-gray-600 text-[10px]">
                        Rest & Light Review
                      </Badge>
                    </CardContent>
                  </Card>
                );
              }

              if (day.isRevision) {
                return (
                  <Card
                    key={day.date}
                    className={`border ${isToday ? "border-primary ring-1 ring-primary" : "border-yellow-200"} bg-yellow-50`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-yellow-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm">📖</span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-yellow-800">{day.label}</p>
                            {isToday && <span className="text-[9px] text-primary font-bold">TODAY</span>}
                          </div>
                        </div>
                        <Badge className="bg-yellow-200 text-yellow-800 text-[10px]">
                          Full Revision
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {SUBJECTS.map((s) => (
                          <span
                            key={s}
                            className="text-[9px] px-2 py-0.5 rounded-full text-white font-medium"
                            style={{ backgroundColor: SUBJECT_CONFIG[s].color }}
                          >
                            {subjectLabel(SUBJECT_CONFIG[s])}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <Card
                  key={day.date}
                  className={`border ${isToday ? "border-primary ring-1 ring-primary" : ""}`}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                      style={{ backgroundColor: day.subjects[0] ? SUBJECT_CONFIG[day.subjects[0]].color : "#94a3b8" }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <p className="text-xs font-semibold">{day.label}</p>
                        {isToday && (
                          <span className="text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-full font-bold">
                            TODAY
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {day.subjects.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] px-2 py-0.5 rounded-full text-white font-medium"
                            style={{ backgroundColor: SUBJECT_CONFIG[s].color }}
                          >
                            {subjectLabel(SUBJECT_CONFIG[s])}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
