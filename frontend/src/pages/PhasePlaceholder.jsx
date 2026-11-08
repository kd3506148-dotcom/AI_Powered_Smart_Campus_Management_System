/**
 * Phase Feature Placeholder Component
 * Informs the user of the upcoming phase milestone while preserving navigation
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function PhasePlaceholder({ title, phase, description }) {
  return (
    <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-500 mb-4 border border-cyan-500/20">
        <Sparkles className="w-7 h-7" />
      </div>

      <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 mb-3 border border-cyan-500/30">
        {phase} Milestone
      </div>

      <h2 className="text-2xl font-extrabold text-navy-900 dark:text-white mb-2">
        {title} Module
      </h2>

      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
        {description}
      </p>

      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/60 dark:border-navy-700/60 text-xs text-slate-500 dark:text-slate-400 mb-6 text-left space-y-1">
        <p className="font-semibold text-slate-700 dark:text-slate-300">Phase 0 & 1 Status:</p>
        <p>✓ All Mongoose schemas and indexes compiled and verified.</p>
        <p>✓ Multi-role JWT authentication and role-based dashboards active.</p>
        <p>• {phase} will be implemented immediately upon your "continue".</p>
      </div>

      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-md shadow-cyan-500/20"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}

