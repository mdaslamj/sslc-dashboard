import { Layout } from "@/components/layout/layout";
import { useAllSubjectsData, useStudyLogs, useMockTests, useWeakTopics } from "@/hooks/use-storage";
import { SUBJECT_CONFIG, SUBJECTS } from "@/lib/subject-config";
import { Subject } from "@/lib/data-model";
import { Card, CardContent } from "@/components/ui/card";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { TrendingUp, AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import { useLanguage } from "@/lib/i18n";

export default function Analytics() {
  const { data: allSubjects } = useAllSubjectsData();
  const { data: studyLogs } = useStudyLogs();
  const { data: mockTests } = useMockTests();
  const { data: weakTopics } = useWeakTopics();
  const { t, subjectLabel, lang } = useLanguage();

  const subjectProgress = useMemo(() => {
    if (!allSubjects) return [];
    return SUBJECTS.map((s) => {
      const data = allSubjects[s];
      const total = data?.chapters.length || 0;
      const done = data?.chapters.filter((c) => c.completed).length || 0;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      return { subject: s, name: subjectLabel(SUBJECT_CONFIG[s]), pct, done, total, color: SUBJECT_CONFIG[s].color };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSubjects, lang]);

  const radarData = useMemo(() => {
    return subjectProgress.map((p) => ({
      subject: subjectLabel(SUBJECT_CONFIG[p.subject as Subject]),
      progress: p.pct,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectProgress, lang]);

  const studyTimeBySubject = useMemo(() => {
    if (!studyLogs || studyLogs.length === 0) return [];
    const totals = SUBJECTS.reduce((acc, s) => {
      acc[s] = studyLogs.filter((l) => l.subject === s).reduce((sum, l) => sum + l.hours, 0);
      return acc;
    }, {} as Record<Subject, number>);
    return SUBJECTS.filter((s) => totals[s] > 0).map((s) => ({
      name: subjectLabel(SUBJECT_CONFIG[s]),
      value: totals[s],
      color: SUBJECT_CONFIG[s].color,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studyLogs, lang]);

  const mockTestScores = useMemo(() => {
    if (!mockTests) return [];
    return SUBJECTS.map((s) => {
      const subTests = mockTests.filter((t) => t.subject === s);
      const label = subjectLabel(SUBJECT_CONFIG[s]);
      if (subTests.length === 0) return { subject: label, avg: 0, count: 0, color: SUBJECT_CONFIG[s].color };
      const avg = subTests.reduce((sum, t) => sum + (t.score / t.totalMarks) * 100, 0) / subTests.length;
      return { subject: label, avg: Math.round(avg), count: subTests.length, color: SUBJECT_CONFIG[s].color };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mockTests, lang]);

  const weakTopicsBySubject = useMemo(() => {
    if (!weakTopics) return [];
    return SUBJECTS.map((s) => {
      const topics = weakTopics.filter((t) => t.subject === s && !t.revised);
      return { subject: subjectLabel(SUBJECT_CONFIG[s]), count: topics.length, color: SUBJECT_CONFIG[s].color };
    }).filter((x) => x.count > 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weakTopics, lang]);

  const overallProgress = useMemo(() => {
    if (!subjectProgress.length) return 0;
    return Math.round(subjectProgress.reduce((s, p) => s + p.pct, 0) / subjectProgress.length);
  }, [subjectProgress]);

  const overallAvgScore = useMemo(() => {
    if (!mockTests || mockTests.length === 0) return null;
    return Math.round(mockTests.reduce((s, tt) => s + (tt.score / tt.totalMarks) * 100, 0) / mockTests.length);
  }, [mockTests]);

  const totalStudyHours = useMemo(() => {
    return (studyLogs || []).reduce((s, l) => s + l.hours, 0);
  }, [studyLogs]);

  return (
    <Layout>
      <div className="p-4 space-y-4">
        <div className="pt-2">
          <h1 className="text-2xl font-bold">{t.analyticsTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.analyticsSubtitle}</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 bg-blue-50">
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-blue-700">{overallProgress}%</div>
              <div className="text-[10px] text-blue-600">{t.overallProgressStat}</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-green-50">
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-green-700">{overallAvgScore ?? "--"}%</div>
              <div className="text-[10px] text-green-600">{t.avgScore}</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-purple-50">
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-purple-700">{totalStudyHours.toFixed(0)}h</div>
              <div className="text-[10px] text-purple-600">{t.totalStudy}</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress radar */}
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <h2 className="font-semibold text-sm mb-2">{t.subjectProgressChart}</h2>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
                <Radar
                  dataKey="progress"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Mock test bar chart */}
        {mockTestScores.some((s) => s.avg > 0) && (
          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <h2 className="font-semibold text-sm mb-2">{t.testScores}</h2>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={mockTestScores} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="subject" tick={{ fontSize: 9 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Tooltip formatter={(v) => [`${v}%`]} />
                  <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                    {mockTestScores.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Study time pie chart */}
        {studyTimeBySubject.length > 0 && (
          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <h2 className="font-semibold text-sm mb-2">{t.studyTimeBreakdown}</h2>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={studyTimeBySubject} dataKey="value" innerRadius={30} outerRadius={55} paddingAngle={2}>
                      {studyTimeBySubject.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, name) => [`${v}h`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {studyTimeBySubject.map((entry) => (
                    <div key={entry.name} className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-[10px]">{entry.name}</span>
                      </div>
                      <span className="text-[10px] font-medium">{entry.value}h</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weak topics analysis */}
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <h2 className="font-semibold text-sm">{t.weakTopicAnalysis}</h2>
            </div>
            {weakTopicsBySubject.length === 0 ? (
              <div className="text-center py-4">
                <TrendingUp className="h-6 w-6 mx-auto mb-1 text-green-500" />
                <p className="text-xs text-muted-foreground">{t.noWeakTopicsAnalytics}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {weakTopicsBySubject.map((item) => (
                  <div key={item.subject} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs">{item.subject}</span>
                    </div>
                    <span className="text-xs font-bold text-orange-600">{t.topicCount(item.count)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
