import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import RSPWorks from "./pages/RSPWorks";
import IRSPWorks from "./pages/IRSPWorks";
import AddWorks from "./pages/AddWorks";
import UnitCost from "./pages/UnitCost";
import Reviews from "./pages/Reviews";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <main className="min-h-screen pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rsp-works" element={<RSPWorks />} />
              <Route path="/irsp-works" element={<IRSPWorks />} />
              <Route path="/add-works" element={<AddWorks />} />
              <Route path="/unit-cost" element={<UnitCost />} />
              <Route path="/reviews" element={<Reviews />} />
            </Routes>
          </main>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;