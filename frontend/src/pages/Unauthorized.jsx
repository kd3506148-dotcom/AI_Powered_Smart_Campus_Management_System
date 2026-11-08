/**
 * 403 Access Forbidden Page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Unauthorized() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex flex-col justify-center items-center px-4 text-center">
      <div className="max-w-md w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-8 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white mb-2">
          Access Restricted (403)
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          Your current account role (
          <span className="font-semibold text-cyan-600 dark:text-cyan-400">
            {user?.role || 'Guest'}
          </span>
          ) does not have authorization to view this resource.
        </p>

        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-lg shadow-cyan-500/20 text-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to My Dashboard</span>
        </Link>
      </div>
    </div>
  );
}

