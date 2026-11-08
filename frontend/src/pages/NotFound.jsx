/**
 * 404 Not Found Page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex flex-col justify-center items-center px-4 text-center">
      <div className="max-w-md w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-8 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
          <Compass className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-navy-900 dark:text-white mb-2">
          Page Not Found (404)
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          The campus resource or page you requested could not be located.
        </p>

        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-lg shadow-cyan-500/20 text-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campus Dashboard</span>
        </Link>
      </div>
    </div>
  );
}

