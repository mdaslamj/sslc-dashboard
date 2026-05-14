import { Layout } from "@/components/layout/layout";
import { useMockTests, useAddMockTest, useDeleteMockTest } from "@/hooks/use-storage";
import { SUBJECT_CONFIG, SUBJECTS } from "@/lib/subject-config";
import { Subject } from "@/lib/data-model";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, Trash2, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { useLanguage } from "@/lib/i18n";

export default function MockTests() {
  const { data: tests, isLoading } = useMockTests();
  const addTest = useAddMockTest();
  const deleteTest = useDeleteMockTest();
  const { t, subjectLabel } = useLanguage();

  const [subject, setSubject] = useState<Subject>("mathematics");
  const [score, setScore] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleAdd = () => {
    const s = parseFloat(score);
    const tm = parseFloat(totalMarks);
    if (!s || !tm || s < 0 || s > tm) return;
    addTest.mutate({ subject, score: s, totalMarks: tm, date });
    setScore("");
  };

  const chartData = useMemo(() => {
    if (!tests || tests.length === 0) return [];
    const byDate = [...tests].sort((a, b) => a.date.localeCompare(b.date));
    const dates = [...new Set(byDate.map((t) => t.date))];
    return dates.map((d) => {
      const entry: Record<string, string | number> = { date: d.slice(5) };
      SUBJECTS.forEach((s) => {
        const t = byDate.find((x) => x.date === d && x.subject === s);
        if (t) entry[s] = Math.round((t.score / t.totalMarks) * 100);
      });
      return entry;
    });
  }, [tests]);

  const avgBySubject = useMemo(() => {
    if (!tests) return {};
    return SUBJECTS.reduce((acc, s) => {
      const subTests = tests.filter((t) => t.subject === s);
      if (subTests.length === 0) return acc;
      const avg = subTests.reduce((sum, t) => sum + (t.score / t.totalMarks) * 100, 0) / subTests.length;
      acc[s] = Math.round(avg);
      return acc;
    }, {} as Partial<Record<Subject, number>>);
  }, [tests]);

  const recentTests = useMemo(() => {
    return [...(tests || [])].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
  }, [tests]);

  return (
    <Layout>
      <div className="p-4 space-y-4">
        <div className="pt-2">
          <h1 className="text-2xl font-bold">{t.mockTestsTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.mockTestsSubtitle}</p>
        </div>

        {/* Add test form */}
        <Card className="border shadow-sm">
          <CardContent className="p-4 space-y-3">
            <h2 className="font-semibold text-sm">{t.addScore}</h2>
            <Select value={subject} onValueChange={(v) => setSubject(v as Subject)}>
              <SelectTrigger className="h-9 text-sm" data-testid="select-subject">
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
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="Score"
                className="h-9 text-sm"
                data-testid="input-score"
              />
              <Input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                placeholder="Out of"
                className="h-9 text-sm"
                data-testid="input-total"
              />
            </div>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 text-sm"
              data-testid="input-date"
            />
            <Button
              onClick={handleAdd}
              className="w-full h-9"
              disabled={addTest.isPending}
              data-testid="btn-add-test"
            >
              <Plus className="h-4 w-4 mr-1" />
              {t.addBtn}
            </Button>
          </CardContent>
        </Card>

        {/* Average scores */}
        {Object.keys(avgBySubject).length > 0 && (
          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <h2 className="font-semibold text-sm mb-3">{t.averageScores}</h2>
              <div className="grid grid-cols-5 gap-2">
                {SUBJECTS.map((s) => {
                  const avg = avgBySubject[s];
                  const config = SUBJECT_CONFIG[s];
                  if (avg === undefined) return (
                    <div key={s} className="text-center opacity-30">
                      <div className="text-sm font-bold text-muted-foreground">--</div>
                      <div className="text-[9px] text-muted-foreground">{subjectLabel(config)}</div>
                    </div>
                  );
                  return (
                    <div key={s} className="text-center">
                      <div className="text-sm font-bold" style={{ color: config.color }}>{avg}%</div>
                      <div className="text-[9px] text-muted-foreground">{subjectLabel(config)}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Score trend chart */}
        {chartData.length > 1 && (
          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <h2 className="font-semibold text-sm mb-3">{t.scoreTrend}</h2>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Tooltip formatter={(v, name) => [`${v}%`, SUBJECT_CONFIG[name as Subject]?.label || name]} />
                  {SUBJECTS.map((s) => (
                    <Line
                      key={s}
                      type="monotone"
                      dataKey={s}
                      stroke={SUBJECT_CONFIG[s].color}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Recent tests */}
        <div>
          <h2 className="font-semibold text-sm mb-2">{t.recentTests}</h2>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />)}
            </div>
          ) : recentTests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{t.noTests}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTests.map((test) => {
                const config = SUBJECT_CONFIG[test.subject];
                const pct = Math.round((test.score / test.totalMarks) * 100);
                return (
                  <Card key={test.id} className="border" data-testid={`card-test-${test.id}`}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
                        <div>
                          <div className="text-sm font-medium">{subjectLabel(config)}</div>
                          <div className="text-[10px] text-muted-foreground">{test.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-sm font-bold" style={{ color: pct >= 75 ? "#22c55e" : pct >= 50 ? "#f97316" : "#ef4444" }}>
                            {pct}%
                          </div>
                          <div className="text-[10px] text-muted-foreground">{test.score}/{test.totalMarks}</div>
                        </div>
                        <button
                          onClick={() => deleteTest.mutate(test.id)}
                          className="text-muted-foreground hover:text-destructive"
                          data-testid={`btn-delete-test-${test.id}`}
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
