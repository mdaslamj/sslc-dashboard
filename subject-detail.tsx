import { Layout } from "@/components/layout/layout";
import { useSubjectData, useUpdateSubjectData, useMockTests, useWeakTopics, useAddWeakTopic, useDeleteWeakTopic, useUpdateWeakTopic } from "@/hooks/use-storage";
import { SUBJECT_CONFIG, SUBJECTS } from "@/lib/subject-config";
import { Subject, Chapter } from "@/lib/data-model";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useLanguage } from "@/lib/i18n";

const DIFFICULTY_COLORS = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

export default function SubjectDetail() {
  const [, params] = useRoute("/subjects/:subject");
  const [, setLocation] = useLocation();
  const subject = params?.subject as Subject;
  const { t, subjectLabel } = useLanguage();

  const isValidSubject = SUBJECTS.includes(subject);

  const { data: subjectData, isLoading } = useSubjectData(isValidSubject ? subject : "mathematics");
  const updateSubject = useUpdateSubjectData();
  const { data: mockTests } = useMockTests();
  const { data: weakTopics } = useWeakTopics();
  const addWeakTopic = useAddWeakTopic();
  const updateWeakTopic = useUpdateWeakTopic();
  const deleteWeakTopic = useDeleteWeakTopic();

  const [newTopic, setNewTopic] = useState("");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("medium");

  if (!isValidSubject) {
    setLocation("/subjects");
    return null;
  }

  const config = SUBJECT_CONFIG[subject];

  const subjectTests = useMemo(
    () => (mockTests || []).filter((t) => t.subject === subject).sort((a, b) => a.date.localeCompare(b.date)),
    [mockTests, subject]
  );

  const subjectWeakTopics = useMemo(
    () => (weakTopics || []).filter((t) => t.subject === subject),
    [weakTopics, subject]
  );

  const progress = useMemo(() => {
    if (!subjectData) return { pct: 0, done: 0, total: 0 };
    const total = subjectData.chapters.length;
    const done = subjectData.chapters.filter((c) => c.completed).length;
    return { pct: total > 0 ? Math.round((done / total) * 100) : 0, done, total };
  }, [subjectData]);

  const toggleChapter = (chapterId: string, completed: boolean) => {
    if (!subjectData) return;
    const today = new Date().toISOString().split("T")[0];
    const updated = {
      ...subjectData,
      chapters: subjectData.chapters.map((c) =>
        c.id === chapterId
          ? { ...c, completed, completedDate: completed ? today : undefined }
          : c
      ),
    };
    updateSubject.mutate(updated);
  };

  const setDifficulty = (chapterId: string, difficulty: Chapter["difficulty"]) => {
    if (!subjectData) return;
    const updated = {
      ...subjectData,
      chapters: subjectData.chapters.map((c) =>
        c.id === chapterId ? { ...c, difficulty } : c
      ),
    };
    updateSubject.mutate(updated);
  };

  const handleAddWeakTopic = () => {
    if (!newTopic.trim()) return;
    addWeakTopic.mutate({
      subject,
      topic: newTopic.trim(),
      priority: newPriority,
      revised: false,
    });
    setNewTopic("");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 pt-2">
          <button onClick={() => setLocation("/subjects")} data-testid="btn-back">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
            <div>
              <h1 className="text-xl font-bold">{subjectLabel(config)}</h1>
            </div>
          </div>
          <div className="ml-auto">
            <span className="text-2xl font-bold" style={{ color: config.color }}>
              {progress.pct}%
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {progress.done} / {progress.total} {t.chaptersCompleteCount}
        </p>

        {/* Chapters */}
        <div>
          <h2 className="font-semibold text-sm mb-2">{t.chaptersSection}</h2>
          <div className="space-y-2">
            {subjectData?.chapters.map((chapter) => (
              <Card key={chapter.id} className={`border ${chapter.completed ? "bg-green-50 border-green-200" : "bg-white"}`}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={chapter.id}
                      checked={chapter.completed}
                      onCheckedChange={(checked) => toggleChapter(chapter.id, !!checked)}
                      className="mt-0.5"
                      data-testid={`checkbox-chapter-${chapter.id}`}
                      style={{ "--checkbox-color": config.color } as React.CSSProperties}
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={chapter.id}
                        className={`text-sm font-medium cursor-pointer ${chapter.completed ? "line-through text-muted-foreground" : ""}`}
                      >
                        {chapter.name}
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        {chapter.completed && (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        )}
                        <Select
                          value={chapter.difficulty}
                          onValueChange={(v) => setDifficulty(chapter.id, v as Chapter["difficulty"])}
                        >
                          <SelectTrigger className="h-6 text-[10px] w-24 border-0 p-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        <Badge className={`text-[9px] px-1 py-0 ${DIFFICULTY_COLORS[chapter.difficulty]}`}>
                          {chapter.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mock test scores */}
        {subjectTests.length > 0 && (
          <div>
            <h2 className="font-semibold text-sm mb-2">{t.mockTestScoresSection}</h2>
            <div className="space-y-2">
              {subjectTests.slice(-5).reverse().map((test) => (
                <Card key={test.id} className="border">
                  <CardContent className="p-3 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{test.date}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: config.color }}>
                        {test.score}/{test.totalMarks}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({Math.round((test.score / test.totalMarks) * 100)}%)
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Weak topics */}
        <div>
          <h2 className="font-semibold text-sm mb-2">{t.weakTopicsSection}</h2>
          <div className="flex gap-2 mb-3">
            <Input
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Add weak topic..."
              className="text-sm h-9"
              data-testid="input-weak-topic"
              onKeyDown={(e) => e.key === "Enter" && handleAddWeakTopic()}
            />
            <Select value={newPriority} onValueChange={(v) => setNewPriority(v as "high" | "medium" | "low")}>
              <SelectTrigger className="h-9 w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={handleAddWeakTopic}
              className="h-9"
              data-testid="btn-add-weak-topic"
              style={{ backgroundColor: config.color }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {subjectWeakTopics.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">{t.noWeakTopics}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {subjectWeakTopics.map((topic) => (
                <Card key={topic.id} className={`border ${topic.revised ? "bg-green-50 border-green-200" : ""}`}>
                  <CardContent className="p-3 flex items-center gap-2">
                    <Checkbox
                      checked={topic.revised}
                      onCheckedChange={(checked) =>
                        updateWeakTopic.mutate({ id: topic.id, updates: { revised: !!checked } })
                      }
                      data-testid={`checkbox-weak-topic-${topic.id}`}
                    />
                    <span className={`flex-1 text-sm ${topic.revised ? "line-through text-muted-foreground" : ""}`}>
                      {topic.topic}
                    </span>
                    <Badge
                      className={`text-[9px] ${
                        topic.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : topic.priority === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {topic.priority}
                    </Badge>
                    <button
                      onClick={() => deleteWeakTopic.mutate(topic.id)}
                      className="text-muted-foreground hover:text-destructive"
                      data-testid={`btn-delete-weak-topic-${topic.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
