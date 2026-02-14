import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import TicTacToe from "@/pages/TicTacToe";
import Snake from "@/pages/Snake";
import RockPaperScissors from "@/pages/RockPaperScissors";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tictactoe" component={TicTacToe} />
      <Route path="/snake" component={Snake} />
      <Route path="/rps" component={RockPaperScissors} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
