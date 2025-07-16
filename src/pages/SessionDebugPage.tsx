import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { debugSession } from '../lib/sessionDebug';
import { clearAuthStorage } from '../lib/authUtils';

const SessionDebugPage = () => {
  const { user, session, loading, refreshSession } = useAuth();
  const [debugOutput, setDebugOutput] = useState<string>('');

  const addToDebug = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugOutput(prev => `${prev}\n[${timestamp}] ${message}`);
  };

  const testSession = async () => {
    addToDebug('🔍 Testing current session...');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        addToDebug(`❌ Session error: ${error.message}`);
      } else if (session) {
        addToDebug(`✅ Session found: ${session.user?.email}`);
        addToDebug(`🕐 Expires: ${new Date(session.expires_at! * 1000)}`);
        addToDebug(`🔑 Access token (first 20 chars): ${session.access_token.substring(0, 20)}...`);
      } else {
        addToDebug('❌ No session found');
      }
    } catch (err) {
      addToDebug(`💥 Exception: ${err}`);
    }
  };

  const testRefresh = async () => {
    addToDebug('🔄 Testing session refresh...');
    try {
      await refreshSession();
      addToDebug('✅ Session refresh completed');
    } catch (err) {
      addToDebug(`❌ Session refresh failed: ${err}`);
    }
  };

  const runDebugSession = () => {
    addToDebug('🔍 Running storage debug...');
    debugSession();
  };

  const clearStorage = () => {
    addToDebug('🧹 Clearing auth storage...');
    clearAuthStorage();
    addToDebug('✅ Storage cleared - please refresh page');
  };

  const testDatabaseConnection = async () => {
    addToDebug('🔗 Testing database connection...');
    try {
      const { error } = await supabase.from('posts').select('count', { count: 'exact', head: true });
      if (error) {
        addToDebug(`❌ Database error: ${error.message}`);
      } else {
        addToDebug('✅ Database connection successful');
      }
    } catch (err) {
      addToDebug(`💥 Database exception: ${err}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Session Debug Tool</h1>
        
        {/* Current State */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? user.email : 'None'}</p>
            <p><strong>Session:</strong> {session ? 'Active' : 'None'}</p>
            {session && (
              <p><strong>Expires:</strong> {new Date(session.expires_at! * 1000).toLocaleString()}</p>
            )}
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Debug Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={testSession}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Session
            </button>
            <button
              onClick={testRefresh}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Refresh Session
            </button>
            <button
              onClick={runDebugSession}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Debug Storage
            </button>
            <button
              onClick={clearStorage}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Clear Storage
            </button>
            <button
              onClick={testDatabaseConnection}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Test Database
            </button>
            <button
              onClick={() => setDebugOutput('')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear Output
            </button>
          </div>
        </div>

        {/* Debug Output */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Output</h2>
          <textarea
            value={debugOutput}
            readOnly
            rows={20}
            className="w-full p-4 bg-gray-100 border rounded font-mono text-sm"
            placeholder="Debug output will appear here..."
          />
        </div>
      </div>
    </div>
  );
};

export default SessionDebugPage;
