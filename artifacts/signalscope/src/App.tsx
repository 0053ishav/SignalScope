import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Header from "@/components/ui/Header";
import HomePage from "@/pages/Home";
import TrackPage from "@/pages/TrackPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/track/:id">
        {(params) => <TrackPage id={params.id} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <div className="min-h-screen bg-background text-foreground">
          <div className="fixed inset-0 -z-20 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="absolute left-20 top-40 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="absolute right-20 top-[40%] h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          </div>

          <Header />

          <div className="flex-1">
            <Router />
          </div>
        </div>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
