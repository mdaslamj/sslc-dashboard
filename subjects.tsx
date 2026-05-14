import { Layout } from "@/components/layout/layout";
import { useAllSubjectsData } from "@/hooks/use-storage";
import { SUBJECT_CONFIG, SUBJECTS } from "@/lib/subject-config";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { Subject } from "@/lib/data-model";
import { useLanguage } from "@/lib/i18n";

export default function Subjects() {
  const { data: allSubjects, isLoading } = useAllSubjectsData();
  const { t, subjectLabel } = useLanguage();

  const getProgress = (subject: Subject) => {
    const data = allSubjects?.[subject];
    if (!data) return { pct: 0, done: 0, total: 0 };
    const total = data.chapters.length;
    const done = data.chapters.filter((c) => c.completed).length;
    return { pct: total > 0 ? Math.round((done / total) * 100) : 0, done, total };
  };

  return (
    <Layout>
      <div className="p-4">
        <div className="pt-2 pb-4">
          <h1 className="text-2xl font-bold">{t.subjectsTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.subjectsSubtitle}</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {SUBJECTS.map((subject) => {
              const config = SUBJECT_CONFIG[subject];
              const { pct, done, total } = getProgress(subject);
              return (
                <Link key={subject} href={`/subjects/${subject}`}>
                  <Card
                    className="border shadow-sm hover:shadow-md transition-all cursor-pointer"
                    data-testid={`card-subject-${subject}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: config.color }}
                          />
                          <div>
                            <div className="font-semibold text-sm">{subjectLabel(config)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold" style={{ color: config.color }}>
                            {pct}%
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <Progress
                        value={pct}
                        className="h-2"
                        style={{ "--progress-color": config.color } as React.CSSProperties}
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground">
                          {done} of {total} chapters done
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {pct < 30 ? t.begin : pct < 70 ? t.keepGoing : t.excellent}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
