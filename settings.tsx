import { Layout } from "@/components/layout/layout";
import { useProfile, useUpdateProfile } from "@/hooks/use-storage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { User, Target, Calendar, LogOut, CheckCircle2, Clock, Languages } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";

export default function Settings() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t, lang, setLang } = useLanguage();

  const [name, setName] = useState("");
  const [targetScore, setTargetScore] = useState(90);
  const [examDate, setExamDate] = useState("2026-03-28");
  const [dailyGoalHours, setDailyGoalHours] = useState(4);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setTargetScore(profile.targetScore ?? 90);
      setExamDate(profile.examDate || "2026-03-28");
      setDailyGoalHours(profile.dailyGoalHours ?? 4);
    }
  }, [profile]);

  const handleSave = () => {
    if (!name.trim()) return;
    updateProfile.mutate(
      { name: name.trim(), targetScore, examDate, dailyGoalHours },
      {
        onSuccess: () => {
          toast({
            title: t.savedMsg,
            description: "Profile saved successfully.",
          });
        },
      }
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("sslc_local_user_profile");
    setLocation("/");
  };

  const daysLeft = examDate
    ? Math.max(0, Math.ceil((new Date(examDate + "T12:00:00").getTime() - Date.now()) / 86400000))
    : null;

  if (isLoading) {
    return (
      <Layout>
        <div className="p-4 space-y-3">
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
        <div className="pt-2">
          <h1 className="text-2xl font-bold">{t.settingsTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.settingsSubtitle}</p>
        </div>

        {/* Exam countdown banner */}
        {daysLeft !== null && (
          <Card className="border-0 bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-100">{t.examDay}</p>
                <p className="text-3xl font-bold">{daysLeft}</p>
                <p className="text-sm text-blue-100">{t.daysLeft}</p>
              </div>
              <div className="text-right">
                <Calendar className="h-10 w-10 text-blue-200 mb-1 ml-auto" />
                <p className="text-xs text-blue-100">{examDate}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Language toggle */}
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-sm">{t.languageSection}</h2>
              </div>
              <div className="flex items-center gap-1 bg-muted rounded-full p-1">
                <button
                  onClick={() => setLang("en")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    lang === "en"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLang("kn")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    lang === "kn"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  ಕನ್ನಡ
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile */}
        <Card className="border shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm">{t.profileSection}</h2>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs text-muted-foreground">
                {t.nameLabel}
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="h-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Daily study goal */}
        <Card className="border shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-green-600" />
              <h2 className="font-semibold text-sm">{t.dailyGoalSection}</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Hours per day</span>
                <span className="text-2xl font-bold text-green-600">
                  {dailyGoalHours}
                  <span className="text-sm font-normal text-muted-foreground ml-1">hrs</span>
                </span>
              </div>
              <Slider
                value={[dailyGoalHours]}
                onValueChange={([v]) => setDailyGoalHours(v)}
                min={1}
                max={12}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>1 hr</span>
                <span
                  className={`font-medium ${
                    dailyGoalHours >= 8
                      ? "text-red-600"
                      : dailyGoalHours >= 5
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  {dailyGoalHours >= 8
                    ? t.veryIntense
                    : dailyGoalHours >= 5
                    ? t.great
                    : t.goodStart}
                </span>
                <span>12 hrs</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target score */}
        <Card className="border shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-orange-500" />
              <h2 className="font-semibold text-sm">{t.targetScoreSection}</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Target percentage</span>
                <span className="text-2xl font-bold text-orange-500">{targetScore}%</span>
              </div>
              <Slider
                value={[targetScore]}
                onValueChange={([v]) => setTargetScore(v)}
                min={50}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>50%</span>
                <span
                  className={`font-medium ${
                    targetScore >= 90
                      ? "text-green-600"
                      : targetScore >= 75
                      ? "text-blue-600"
                      : "text-orange-600"
                  }`}
                >
                  {targetScore >= 90
                    ? t.distinction
                    : targetScore >= 75
                    ? t.firstClass
                    : t.pass}
                </span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exam date */}
        <Card className="border shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-blue-500" />
              <h2 className="font-semibold text-sm">{t.examDateSection}</h2>
            </div>
            <Input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="h-9"
            />
            {daysLeft !== null && daysLeft > 0 && (
              <p className="text-xs text-muted-foreground">
                {t.examInDays(daysLeft)}
              </p>
            )}
            {daysLeft === 0 && (
              <p className="text-xs text-green-600 font-medium">
                {t.examTodaySettings}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Save */}
        <Button
          onClick={handleSave}
          className="w-full h-10"
          disabled={updateProfile.isPending || !name.trim()}
        >
          {updateProfile.isPending ? (
            t.saving
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t.save}
            </>
          )}
        </Button>

        {/* Logout */}
        <Card className="border border-destructive/20">
          <CardContent className="p-4">
            <h2 className="font-semibold text-sm mb-3 text-destructive">{t.accountSection}</h2>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full h-9 border-destructive/30 text-destructive hover:bg-destructive/5"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t.logout}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
