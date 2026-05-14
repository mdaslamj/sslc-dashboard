import { Layout } from "@/components/layout/layout";
import { useReminders, useAddReminder, useUpdateReminder, useDeleteReminder } from "@/hooks/use-storage";
import { SUBJECT_CONFIG, SUBJECTS } from "@/lib/subject-config";
import { Subject } from "@/lib/data-model";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Bell, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { format, isToday, isPast, parseISO } from "date-fns";
import { useLanguage } from "@/lib/i18n";

export default function Reminders() {
  const { data: reminders, isLoading } = useReminders();
  const addReminder = useAddReminder();
  const updateReminder = useUpdateReminder();
  const deleteReminder = useDeleteReminder();
  const { t, subjectLabel } = useLanguage();

  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState<Subject>("mathematics");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);

  const handleAdd = () => {
    if (!topic.trim()) return;
    addReminder.mutate({ topic: topic.trim(), subject, dueDate, done: false });
    setTopic("");
  };

  const sorted = useMemo(() => {
    return [...(reminders || [])].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [reminders]);

  const pending = sorted.filter((r) => !r.done);
  const done = sorted.filter((r) => r.done);

  const getDueBadge = (dateStr: string, isDone: boolean) => {
    if (isDone) return { label: t.completedLabel, className: "text-green-600 bg-green-50" };
    const d = parseISO(dateStr + "T12:00:00");
    if (isToday(d)) return { label: t.todayBadge, className: "text-orange-600 bg-orange-50 font-bold" };
    if (isPast(d)) return { label: t.overdue, className: "text-red-600 bg-red-50 font-bold" };
    return { label: format(d, "MMM d"), className: "text-blue-600 bg-blue-50" };
  };

  return (
    <Layout>
      <div className="p-4 space-y-4">
        <div className="pt-2">
          <h1 className="text-2xl font-bold">{t.remindersTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.remindersSubtitle}</p>
        </div>

        {/* Add reminder */}
        <Card className="border shadow-sm">
          <CardContent className="p-4 space-y-3">
            <h2 className="font-semibold text-sm">{t.addReminderTitle}</h2>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t.topicPlaceholder}
              className="h-9 text-sm"
              data-testid="input-topic"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <div className="grid grid-cols-2 gap-2">
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
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-9 text-sm"
                data-testid="input-due-date"
              />
            </div>
            <Button
              onClick={handleAdd}
              className="w-full h-9"
              disabled={addReminder.isPending}
              data-testid="btn-add-reminder"
            >
              <Plus className="h-4 w-4 mr-1" />
              {t.addReminderBtn}
            </Button>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">{t.noReminders}</p>
            <p className="text-xs mt-1 text-muted-foreground">{t.noRemindersHint}</p>
          </div>
        ) : (
          <>
            {/* Pending */}
            {pending.length > 0 && (
              <div>
                <h2 className="font-semibold text-sm mb-2">{t.pendingLabel} ({pending.length})</h2>
                <div className="space-y-2">
                  {pending.map((reminder) => {
                    const config = SUBJECT_CONFIG[reminder.subject];
                    const badge = getDueBadge(reminder.dueDate, reminder.done);
                    return (
                      <Card key={reminder.id} className="border" data-testid={`card-reminder-${reminder.id}`}>
                        <CardContent className="p-3 flex items-start gap-3">
                          <Checkbox
                            checked={reminder.done}
                            onCheckedChange={(checked) =>
                              updateReminder.mutate({ id: reminder.id, updates: { done: !!checked } })
                            }
                            className="mt-0.5"
                            data-testid={`checkbox-reminder-${reminder.id}`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{reminder.topic}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                              <span className="text-[10px] text-muted-foreground">{subjectLabel(config)}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${badge.className}`}>
                                {badge.label}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteReminder.mutate(reminder.id)}
                            className="text-muted-foreground hover:text-destructive"
                            data-testid={`btn-delete-reminder-${reminder.id}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed */}
            {done.length > 0 && (
              <div>
                <h2 className="font-semibold text-sm mb-2 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  {t.completedLabel} ({done.length})
                </h2>
                <div className="space-y-2">
                  {done.map((reminder) => {
                    const config = SUBJECT_CONFIG[reminder.subject];
                    return (
                      <Card key={reminder.id} className="border bg-green-50 border-green-200 opacity-70">
                        <CardContent className="p-3 flex items-start gap-3">
                          <Checkbox
                            checked
                            onCheckedChange={() =>
                              updateReminder.mutate({ id: reminder.id, updates: { done: false } })
                            }
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="text-sm line-through text-muted-foreground">{reminder.topic}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                              <span className="text-[10px] text-muted-foreground">{subjectLabel(config)}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteReminder.mutate(reminder.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
