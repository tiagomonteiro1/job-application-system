import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Usuarios from "./pages/Usuarios";
import Curriculo from "./pages/Curriculo";
import Historico from "./pages/Historico";
import Planos from "./pages/Planos";
import Assinantes from "./pages/Assinantes";
import Notificacoes from "@/pages/Notificacoes";
import Admin from "@/pages/Admin";
import Automacoes from "./pages/Automacoes";
import Integracoes from "./pages/Integracoes";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/usuarios"} component={Usuarios} />
      <Route path={"/curriculo"} component={Curriculo} />
      <Route path={"/historico"} component={Historico} />
      <Route path={"/planos"} component={Planos} />
      <Route path={"/assinantes"} component={Assinantes} />
      <Route path={"/notificacoes"} component={Notificacoes} />
      <Route path={"/automacoes"} component={Automacoes} />
      <Route path={"/integracoes"} component={Integracoes} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
