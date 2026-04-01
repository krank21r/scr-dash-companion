import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
const HomePage = lazy(() => import('./pages/Home'));
const RSPWorks = lazy(() => import('./pages/RSPWorks'));
const IRSPWorks = lazy(() => import('./pages/IRSPWorks'));
const Contingencies = lazy(() => import('./pages/Contingencies'));
const AddContingency = lazy(() => import('./pages/AddContingency'));
const AddWorks = lazy(() => import('./pages/AddWorks'));
const UnitCost = lazy(() => import('./pages/UnitCost'));
const AddNote = lazy(() => import('./pages/AddNote'));
const EditNote = lazy(() => import('./pages/EditNote'));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Toaster />
        <Sonner />
          <Navbar />
          <main className="min-h-screen pt-16">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/rsp-works" element={<RSPWorks />} />
                <Route path="/irsp-works" element={<IRSPWorks />} />
                <Route path="/contingencies" element={<Contingencies />} />
                <Route path="/add-contingency" element={<AddContingency />} />
                <Route path="/add-works" element={<AddWorks />} />
                <Route path="/unit-cost" element={<UnitCost />} />
                <Route path="/add-note" element={<AddNote />} />
                <Route path="/edit-note/:id" element={<EditNote />} />
              </Routes>
            </Suspense>
          </main>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
