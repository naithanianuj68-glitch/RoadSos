import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export default function AccidentGuide() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <div className="flex items-center space-x-3">
          <AlertTriangle className="text-yellow-500" />
          <span className="font-bold text-gray-900 dark:text-white">What to do in an accident</span>
        </div>
        {expanded ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
      </button>

      {expanded && (
        <div className="p-4 space-y-4">
          <div className="flex space-x-3">
            <div className="bg-yellow-100 text-yellow-700 p-2 rounded-lg h-10 w-10 flex items-center justify-center font-bold">1</div>
            <div>
              <h4 className="font-bold dark:text-white">Secure the Area</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Turn on hazard lights. Do not move injured people unless they are in immediate danger.</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <div className="bg-yellow-100 text-yellow-700 p-2 rounded-lg h-10 w-10 flex items-center justify-center font-bold">2</div>
            <div>
              <h4 className="font-bold dark:text-white">Call for Help</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Use the SOS Button above or call emergency services immediately.</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <div className="bg-yellow-100 text-yellow-700 p-2 rounded-lg h-10 w-10 flex items-center justify-center font-bold">3</div>
            <div>
              <h4 className="font-bold dark:text-white">Document (If Safe)</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Take photos of the vehicles, license plates, and surrounding area.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
