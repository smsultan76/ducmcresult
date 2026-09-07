'use client';

import { useState, useEffect, useRef } from 'react';
import ResultTable from './components/ResultTable';
import type { ResultData, Option } from '@/app/types';

export default function Home() {
  const [registrationInput, setRegistrationInput] = useState('');
  const [programId, setProgramId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [examId, setExamId] = useState('');
  const [results, setResults] = useState<ResultData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentRegistration, setCurrentRegistration] = useState('');
  const [notFoundRegistrations, setNotFoundRegistrations] = useState<number[]>([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [printData, setPrintData] = useState<{
    results: ResultData[];
    program: string;
    session: string;
    exam: string;
  } | null>(null);
  
  const [programs, setPrograms] = useState<Option[]>([]);
  const [sessions, setSessions] = useState<Option[]>([]);
  const [exams, setExams] = useState<Option[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingExams, setLoadingExams] = useState(false);
  const [examError, setExamError] = useState<string | null>(null);
  
  const tableRef = useRef<HTMLDivElement>(null);

  // Fetch programs and sessions on component mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch('/api/options');
        const data = await response.json();
        
        if (data.success) {
          setPrograms(data.programs);
          setSessions(data.sessions);
        } else {
          setError('Failed to load programs and sessions');
        }
      } catch (err) {
        console.error('Error fetching options:', err);
        setError('Failed to load options');
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  // Fetch exams when program changes
  useEffect(() => {
    const fetchExams = async () => {
      if (!programId) {
        setExams([]);
        setExamError(null);
        return;
      }

      setLoadingExams(true);
      setExamError(null);
      setExamId(''); // Reset selected exam
      
      try {
        console.log(`Fetching exams for program: ${programId}`);
        const response = await fetch(`/api/exams?program_id=${programId}`);
        const data = await response.json();
        
        console.log('Exams response:', data);
        
        if (data.success) {
          if (data.exams && data.exams.length > 0) {
            setExams(data.exams);
            console.log(`Loaded ${data.exams.length} exams`);
            setExamError(null);
          } else {
            setExams([]);
            setExamError(data.message || 'No exams available for this program');
            console.log('No exams found for this program');
          }
        } else {
          setExamError(data.error || 'Failed to load exams');
          setExams([]);
        }
      } catch (err) {
        console.error('Error fetching exams:', err);
        setExamError('Network error while loading exams');
        setExams([]);
      } finally {
        setLoadingExams(false);
      }
    };

    // Add a small delay to avoid rapid requests
    const timeoutId = setTimeout(() => {
      fetchExams();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [programId]);

  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProgramId(e.target.value);
    setExamId(''); // Reset exam when program changes
    setExamError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registrationInput || !programId || !sessionId || !examId) {
      setError('All fields are required');
      return;
    }

    // Get selected names for caption
    const program = programs.find(p => p.id === programId);
    const session = sessions.find(s => s.id === sessionId);
    const exam = exams.find(e => e.id === examId);
    
    setSelectedProgram(program?.name || '');
    setSelectedSession(session?.name || '');
    setSelectedExam(exam?.name || '');

    setLoading(true);
    setError(null);
    setResults([]);
    setProgress(0);
    setCurrentRegistration('');
    setNotFoundRegistrations([]);
    setPrintData(null);

    try {
      const response = await fetch('/api/batch-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationInput,
          programId,
          sessionId,
          examId
        })
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to fetch results');
      } else {
        // Filter out results with errors or missing data
        const validResults = data.data.filter((result: ResultData) => {
          const hasError = result.error || 
                          (result.gpa === null && result.cgpa === null) ||
                          result.student_name === 'No data' ||
                          result.student_name === 'Error fetching' ||
                          result.student_name === 'Error' ||
                          result.student_name === 'Not found' ||
                          result.student_name === 'Unknown';
          
          if (hasError) {
            setNotFoundRegistrations(prev => [...prev, Number(result.reg_no)]);
          }
          return !hasError;
        });

        setResults(validResults);
        setPrintData({
          results: validResults,
          program: program?.name || '',
          session: session?.name || '',
          exam: exam?.name || ''
        });
        setProgress(100);
        
        if (validResults.length === 0 && data.data.length > 0) {
          setError('No valid results found for the provided registrations');
        } else if (data.failedCount > 0) {
          setError(`${data.failedCount} registrations failed to fetch`);
        }
      }
    } catch (err) {
      setError('An error occurred while fetching results');
      console.error(err);
    } finally {
      setLoading(false);
      setCurrentRegistration('');
    }
  };

  const handleClear = () => {
    setResults([]);
    setRegistrationInput('');
    setProgramId('');
    setSessionId('');
    setExamId('');
    setError(null);
    setProgress(0);
    setCurrentRegistration('');
    setNotFoundRegistrations([]);
    setSelectedProgram('');
    setSelectedSession('');
    setSelectedExam('');
    setPrintData(null);
    setExamError(null);
  };

  const handlePrint = () => {
    if (printData) {
      localStorage.setItem('printData', JSON.stringify(printData));
      window.open('/print', '_blank');
    }
  };

  // Simulate progress updates from API
  useEffect(() => {
    if (loading) {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 10;
        if (currentProgress > 90) {
          currentProgress = 90;
        }
        setProgress(Math.min(currentProgress, 90));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  return (
    <main className="min-h-screen bg-gray-50 sm:py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-8 no-print">
          <img src="/ducmc.png" alt="DU CMC Logo" className="mx-auto max-w-xs sm:max-w-md"/>
        </div>

        {/* Input Form - Hidden when printing */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-8 no-print">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Registration Number Input */}
              <div className="sm:col-span-2">
                <label htmlFor="registrationInput" className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Numbers <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="registrationInput"
                  value={registrationInput}
                  onChange={(e) => setRegistrationInput(e.target.value)}
                  placeholder="e.g., 10,11,12, 20-25,27,40-47 (Max 60)"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm p-2 border"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter single numbers, comma-separated, or ranges (e.g., 10,11,12, 20-25,27)
                </p>
              </div>

              {/* Program Selection */}
              <div>
                <label htmlFor="programId" className="block text-sm font-medium text-gray-700 mb-1">
                  Program Name <span className="text-red-500">*</span>
                </label>
                <select
                  id="programId"
                  value={programId}
                  onChange={handleProgramChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm p-2 border"
                  disabled={loading || loadingOptions}
                >
                  <option value="">Select your Program Name</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
                {loadingOptions && (
                  <p className="mt-1 text-xs text-blue-600">
                    <span className="inline-block animate-spin mr-1">⟳</span>
                    Loading programs...
                  </p>
                )}
              </div>

              {/* Session Selection */}
              <div>
                <label htmlFor="sessionId" className="block text-sm font-medium text-gray-700 mb-1">
                  Session <span className="text-red-500">*</span>
                </label>
                <select
                  id="sessionId"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm p-2 border"
                  disabled={loading || loadingOptions}
                >
                  <option value="">Select your Session</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.name}
                    </option>
                  ))}
                </select>
                {loadingOptions && (
                  <p className="mt-1 text-xs text-blue-600">
                    <span className="inline-block animate-spin mr-1">⟳</span>
                    Loading sessions...
                  </p>
                )}
              </div>

              {/* Exam Selection */}
              <div className="sm:col-span-2">
                <label htmlFor="examId" className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Name <span className="text-red-500">*</span>
                </label>
                <select
                  id="examId"
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm p-2 border"
                  disabled={loading || !programId || loadingExams || exams.length === 0}
                >
                  <option value="">Select your Exam Name</option>
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name}
                    </option>
                  ))}
                </select>
                
                {/* Loading state */}
                {loadingExams && (
                  <p className="mt-1 text-xs text-blue-600">
                    <span className="inline-block animate-spin mr-1">⟳</span>
                    Loading exams...
                  </p>
                )}
                
                {/* Error/Info states */}
                {!loadingExams && programId && exams.length === 0 && (
                  <p className="mt-1 text-xs text-yellow-600">
                    ⚠️ {examError || 'No exams available for this program. Please try another program.'}
                  </p>
                )}
                
                {!programId && (
                  <p className="mt-1 text-xs text-gray-400">
                    Please select a program first
                  </p>
                )}
                
                {/* Success state */}
                {!loadingExams && programId && exams.length > 0 && (
                  <p className="mt-1 text-xs text-green-600">
                    ✓ {exams.length} exam(s) available
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3 pt-1 sm:pt-2">
              <button
                type="submit"
                disabled={loading || loadingOptions || loadingExams || !examId || exams.length === 0}
                className="flex-1 bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⟳</span>
                    Fetching...
                  </>
                ) : (
                  'Fetch Results'
                )}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm sm:text-base"
                disabled={loading}
              >
                Clear
              </button>
            </div>

            {/* Progress Bar */}
            {loading && (
              <div className="mt-3 sm:mt-4">
                <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
                  <span>Fetching results...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-400 via-purple-600 to-purple-800 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {currentRegistration ? `Processing: ${currentRegistration}` : 'Starting...'}
                </p>
              </div>
            )}

            {/* Not Found Registrations */}
            {!loading && notFoundRegistrations.length > 0 && (
              <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs sm:text-sm text-yellow-800">
                  <strong>⚠️ {notFoundRegistrations.length} registration(s) not found:</strong>
                </p>
                <p className="text-xs text-yellow-700 mt-1 break-all">
                  {notFoundRegistrations.join(', ')}
                </p>
              </div>
            )}
          </form>

          {/* Error Display */}
          {error && (
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {/* Results Summary */}
          {results.length > 0 && !loading && (
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-green-50 border border-green-200 text-green-700 rounded flex flex-wrap justify-between items-center text-sm">
              <span>
                ✅ Found <strong>{results.length}</strong> result(s)
                {notFoundRegistrations.length > 0 && (
                  <span className="ml-2 text-yellow-600">
                    ({notFoundRegistrations.length} not found)
                  </span>
                )}
              </span>
              <button
                onClick={handlePrint}
                className="bg-green-600 text-white px-3 sm:px-4 py-1 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-xs sm:text-sm"
              >
                🖨️ Print All
              </button>
            </div>
          )}
        </div>

        {/* Results Table */}
        {results.length > 0 && (
          <div ref={tableRef}>
            <ResultTable 
              results={results} 
              programName={selectedProgram}
              sessionName={selectedSession}
              examName={selectedExam}
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && !error && !loadingOptions && (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow no-print">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
            <h3 className="text-lg sm:text-xl font-medium text-gray-700 mb-1 sm:mb-2">No Results Yet</h3>
            <p className="text-xs sm:text-sm text-gray-500 px-4">
              Enter registration numbers and select program details to fetch results
            </p>
          </div>
        )}
      </div>
    </main>
  );
}