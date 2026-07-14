import { type ComponentType } from "react";
import {
  Switch,
  Route,
  Router as WouterRouter,
  Redirect,
} from "wouter";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";

import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Assignments from "@/pages/Assignments";
import Analytics from "@/pages/Analytics";
import WeekView from "@/pages/WeekView";
import LectureView from "@/pages/LectureView";
import AssignmentRunner from "@/pages/AssignmentRunner";
import PracticeAssignment from "@/pages/PracticeAssignment";
import Diagnostics from "@/pages/Diagnostics";
import TopicPractice from "@/pages/TopicPractice";
import Reasoning from "@/pages/Reasoning";
import ReasoningRunner from "@/pages/ReasoningRunner";
import Grades from "@/pages/Grades";
import AdminMode from "@/pages/AdminMode";

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function HomeRedirect() {
  const { authenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (authenticated) return <Redirect to="/dashboard" />;
  return <Landing />;
}

function protectedComponent(Component: ComponentType<any>) {
  return function Guarded(props: any) {
    const { authenticated, isLoading } = useAuth();
    if (isLoading) return <LoadingScreen />;
    if (!authenticated) return <Redirect to="/" />;
    return <Component {...props} />;
  };
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/dashboard" component={protectedComponent(Dashboard)} />
      <Route path="/assignments" component={protectedComponent(Assignments)} />
      <Route
        path="/assignments/:id/practice"
        component={protectedComponent(PracticeAssignment)}
      />
      <Route
        path="/assignments/:id"
        component={protectedComponent(AssignmentRunner)}
      />
      <Route path="/analytics" component={protectedComponent(Analytics)} />
      <Route path="/reasoning" component={protectedComponent(Reasoning)} />
      <Route
        path="/reasoning/:id"
        component={protectedComponent(ReasoningRunner)}
      />
      <Route path="/grades" component={protectedComponent(Grades)} />
      <Route path="/admin" component={protectedComponent(AdminMode)} />
      <Route path="/diagnostics" component={protectedComponent(Diagnostics)} />
      <Route
        path="/weeks/:weekNumber"
        component={protectedComponent(WeekView)}
      />
      <Route
        path="/lectures/:lectureId"
        component={protectedComponent(LectureView)}
      />
      <Route
        path="/practice/topic/:topicId"
        component={protectedComponent(TopicPractice)}
      />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </WouterRouter>
  );
}

export default App;
