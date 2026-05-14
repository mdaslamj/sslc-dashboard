import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/i18n";
import NotFound from "@/pages/not-found";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Subjects from "@/pages/subjects";
import SubjectDetail from "@/pages/subject-detail";
import StudyLog from "@/pages/study-log";
import MockTests from "@/pages/mock-tests";
import Analytics from "@/pages/analytics";
import Reminders from "@/pages/reminders";
import Settings from "@/pages/settings";
import Timetable from "@/pages/timetable";
import ReportCard from "@/pages/report-card";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/subjects" component={Subjects} />
      <Route path="/subjects/:subject" component={SubjectDetail} />
      <Route path="/study-log" component={StudyLog} />
      <Route path="/mock-tests" component={MockTests} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/reminders" component={Reminders} />
      <Route path="/settings" component={Settings} />
      <Route path="/timetable" component={Timetable} />
      <Route path="/report-card" component={ReportCard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
