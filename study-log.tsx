import { Layout } from "@/components/layout/layout";
import { useStudyLogs, useAddStudyLog, useDeleteStudyLog, useProfile } from "@/hooks/use-storage";
import { SUBJECT_CONFIG, SUBJECTS } from "@/lib/subject-config";
import { Subject } from "@/lib/data-model";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, Trash2, Clock, Flame } from "lucide-react";
import { useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import { useLanguage } from "@/lib/i18n";

function WeeklyHeatmap({
  logsByDate,
  goalHours,
}: {
  logsByDate: Record<string, number>;
  goalHours: number;
}) {
  const { t } = useLanguage();

  const days = Array.from({ length: 28 }, (_, i) => {
    const d = subDays(new Date(), 27 - i);
    const key = format(d, "yyyy-MM-dd");
    const hours = logsByDate[key] ?? 0;
    const pct = goalHours > 0 ? hours / goalHours : 0;
    return {
      key,
      label: format(new Date(key + "T12:00:00"), "d"),
      dayName: format(new Date(key + "T12:00:00"), "EEE"),
      hours,
      pct,
      isToday: key === format(new Date(), "yyyy-MM-dd"),
    };
  });

  const getCellColor = (pct: number, hours: number) => {
    if (hours === 0) return "bg-muted";
    if (pct >= 1) return "bg-green-500";
    if (pct >= 0.6) return "bg-blue-400";
    return "bg-orange-300";
  };

  const weeks = [days.slice(0, 7), days.slice(7, 14), days.slice(14, 21), days.slice(21, 28)];
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">{t.calendar28}</h2>
          <p className="text-xs text-muted-foreground">{t.calendarSubtitle}</p>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayLabels.map((d) => (
            <div key={d} className="text-[9px] text-center text-muted-foreground font-medium">
              {d}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((day) => (
                <div
                  key={day.key}
                  title={`${day.key}: ${day.hours}h`}
                  className={`
                    relative h-8 rounded-md flex flex-col items-center justify-center
                    ${getCellColor(day.pct, day.hours)}
                    ${day.isToday ? "ring-2 ring-primary ring-offset-1" : ""}
                    transition-colors
                  `}
                >
                  <span
                    className={`text-[10px] font-semibold ${
                      day.hours > 0 ? "text-white" : "text-muted-foreground"
                    }`}
                  >
                    {day.label}
                  </span>
                  {day.hours > 0 && (
                    <span className="text-[8px] text-white/80 leading-none">
                      {day.hours % 1 === 0 ? day.hours : day.hours.toFixed(1)}h
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-muted" />
            <span className="text-[10px] text-muted-foreground">No study</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-orange-300" />
            <span className="text-[10px] text-muted-foreground">&lt;60% goal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-blue-400" />
            <span className="text-[10px] text-muted-foreground">60–99%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <span className="text-[10px] text-muted-foreground">Goal met!</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudyLog() {
  const { data: logs, isLoading } = useStudyLogs();
  const { data: profile } = useProfile();
  const addLog = useAddStudyLog();
  const deleteLog = useDeleteStudyLog();
  const { t, subjectLabel } = useLanguage();

  const [subject, setSubject] = useState<Subject>("mathematics");
  const [hours, setHours] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const goalHours = profile?.dailyGoalHours ?? 4;

  const handleAdd = () => {
    const h = parseFloat(hours);
    if (!h || h <= 0 || h > 24) return;
    addLog.mutate({ subject, hours: h, date });
    setHours("");
  };

  const logsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const log of logs ?? []) {
      map[log.date] = (map[log.date] ?? 0) + log.hours;
    }
    return map;
  }, [logs]);

  const weeklyData = useMemo(() => {
    if (!logs) return [];
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return format(d, "yyyy-MM-dd");
    });
    return days.map((day) => {
      const dayLogs = logs.filter((l) => l.date === day);
      const entry: Record<string, string | number> = {
        day: format(new Date(day + "T12:00:00"), "EEE"),
      };
      SUBJECTS.forEach((s) => {
        entry[s] = dayLogs.filter((l) => l.subject === s).reduce((sum, l) => sum + l.hours, 0);
      });
      return entry;
    });
  }, [logs]);

  const totalToday = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return (logs || []).filter((l) => l.date === today).reduce((s, l) => s + l.hours, 0);
  }, [logs]);

  const totalWeek = useMemo(() => {
    return (logs || []).reduce((s, l) => s + l.hours, 0);
  }, [logs]);

  const streak = useMemo(() => {
    let s = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = format(d, "yyyy-MM-dd");
      const h = logsByDate[key] ?? 0;
      if (h >= goalHours) {
        s++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }
    return s;
  }, [logsByDate, goalHours]);

  const daysGoalMet = useMemo(
    () => Object.values(logsByDate).filter((h) => h >= goalHours).length,
    [logsByDate, goalHours]
  );

  const recentLogs = useMemo(() => {
    return [...(logs || [])].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
  }, [logs]);

  return (
    <Layout>
      <div className="p-4 space-y-4">
        <div className="pt-2">
          <h1 className="text-2xl font-bold">{t.studyLogTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.studyLogSubtitle}</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="border-0 bg-green-50">
            <CardContent className="p-3 text-center">
              <Clock className="h-3.5 w-3.5 text-green-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-green-700">{totalToday}h</div>
              <div className="text-[10px] text-green-600">{t.today}</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-blue-50">
            <CardContent className="p-3 text-center">
              <Clock className="h-3.5 w-3.5 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-blue-700">{totalWeek.toFixed(1)}h</div>
              <div className="text-[10px] text-blue-600">{t.total}</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-orange-50">
            <CardContent className="p-3 text-center">
              <Flame className="h-3.5 w-3.5 text-orange-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-orange-600">{streak}</div>
              <div className="text-[10px] text-orange-500">{t.dayStreak}</div>
            </CardContent>
          </Card>
        </div>

        {/* 28-day heatmap calendar */}
        <WeeklyHeatmap logsByDate={logsByDate} goalHours={goalHours} />

        {/* Goal progress summary */}
        <Card className="border shadow-sm">
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold">{t.goalAchievementTitle}</p>
              <p className="text-[10px] text-muted-foreground">
                {t.goalMetDays(daysGoalMet, goalHours)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-green-600">{daysGoalMet}</p>
              <p className="text-[10px] text-muted-foreground">days</p>
            </div>
          </CardContent>
        </Card>

        {/* Add log form */}
        <Card className="border shadow-sm">
          <CardContent className="p-4 space-y-3">
            <h2 className="font-semibold text-sm">{t.logStudyHoursTitle}</h2>
            <div className="grid grid-cols-2 gap-2">
              <Select value={subject} onValueChange={(v) => setSubject(v as Subject)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {subjectLabel(SUBJECT_CONFIG[s])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="Hours (e.g. 1.5)"
                className="h-9 text-sm"
                min="0.1"
                max="24"
                step="0.5"
              />
            </div>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 text-sm"
            />
            <Button
              onClick={handleAdd}
              className="w-full h-9"
              disabled={addLog.isPending}
            >
              <Plus className="h-4 w-4 mr-1" />
              {t.addBtn}
            </Button>
          </CardContent>
        </Card>

        {/* Weekly stacked bar chart */}
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <h2 className="font-semibold text-sm mb-3">{t.thisWeek}</h2>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value, name) => [
                    `${value}h`,
                    SUBJECT_CONFIG[name as Subject]?.label || name,
                  ]}
                />
                {SUBJECTS.map((s) => (
                  <Bar
                    key={s}
                    dataKey={s}
                    stackId="a"
                    fill={SUBJECT_CONFIG[s].color}
                    radius={s === "english" ? [2, 2, 0, 0] : undefined}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent logs */}
        <div>
          <h2 className="font-semibold text-sm mb-2">{t.recentLogs}</h2>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{t.noLogs}</p>
            </div>
          ) : (
            <div className="space-y-2 pb-4">
              {recentLogs.map((log) => {
                const config = SUBJECT_CONFIG[log.subject];
                return (
                  <Card key={log.id} className="border">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: config.color }}
                        />
                        <div>
                          <div className="text-sm font-medium">{subjectLabel(config)}</div>
                          <div className="text-[10px] text-muted-foreground">{log.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-bold"
                          style={{ color: config.color }}
                        >
                          {log.hours}h
                        </span>
                        <button
                          onClick={() => deleteLog.mutate(log.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
