import { Toaster } from './components/ui/toaster';
import { TooltipProvider } from './components/ui/tooltip';
import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Layout } from './components/Layout';
import { ThemeProvider } from 'next-themes';
import { ErrorBoundary } from './components/ErrorBoundary';
import NotFound from './pages/NotFound';

const HomePage = lazy(() => import('./pages/Home'));
const RSPWorks = lazy(() => import('./pages/RSPWorks'));
const IRSPWorks = lazy(() => import('./pages/IRSPWorks'));
const Contingencies = lazy(() => import('./pages/Contingencies'));
const AddContingency = lazy(() => import('./pages/AddContingency'));
const AddWorks = lazy(() => import('./pages/AddWorks'));
const UnitCost = lazy(() => import('./pages/UnitCost'));
const AddNote = lazy(() => import('./pages/AddNote'));
const EditNote = lazy(() => import('./pages/EditNote'));
const Info = lazy(() => import('./pages/Info'));
const Holidays = lazy(() => import('./pages/Holidays'));
const Weblinks = lazy(() => import('./pages/Weblinks'));

const PageLoader = () => (
  <div className="h-full w-full flex items-center justify-center p-20">
    <div className="w-8 h-8 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
  </div>
);

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
    <TooltipProvider>
      <Layout>
        <Toaster />
        <ErrorBoundary>
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
              <Route path="/info" element={<Info />} />
              <Route path="/holidays" element={<Holidays />} />
              <Route path="/weblinks" element={<Weblinks />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
