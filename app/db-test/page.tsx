import { Suspense } from 'react';
import { DatabaseInitializer } from '../components/DatabaseInitializer';

export default function DbTestPage() {
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Database Initialization</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Database Status</h2>
        <Suspense fallback={<div>Loading database info...</div>}>
          <DatabaseInitializer />
        </Suspense>
      </div>
    </div>
  );
} 