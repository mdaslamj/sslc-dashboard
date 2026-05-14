import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useLocation } from "wouter";
import { storage } from "@/lib/storage";
import { useLanguage } from "@/lib/i18n";

export default function Login() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const { t, lang, setLang } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    await storage.saveProfile("local_user", {
      name,
      targetScore: 90,
      examDate: "2026-03-28",
      dailyGoalHours: 4,
    });
    
    setLocation("/dashboard");
  };

  return (
    <Layout showNav={false}>
      <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">SSLC Dashboard</h1>
        <p className="text-xl mb-8">{t.welcome}</p>
        
        <form onSubmit={handleLogin} className="w-full space-y-4">
          <Input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.enterNamePlaceholder}
            className="w-full"
          />
          <Button type="submit" className="w-full">
            {t.letsGo}
          </Button>
        </form>

        <button
          onClick={() => setLang(lang === "en" ? "kn" : "en")}
          className="mt-8 text-xs text-muted-foreground underline underline-offset-2"
        >
          {lang === "en" ? "ಕನ್ನಡದಲ್ಲಿ ನೋಡಿ" : "View in English"}
        </button>
      </div>
    </Layout>
  );
}
