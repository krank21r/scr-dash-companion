import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
        <Compass className="w-6 h-6 text-slate-400" aria-hidden="true" />
      </div>
      <div>
        <p className="text-4xl font-bold text-slate-900">404</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-700">Page not found</h2>
        <p className="mt-1 max-w-md text-sm text-slate-500">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <Button asChild>
        <Link to="/">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
