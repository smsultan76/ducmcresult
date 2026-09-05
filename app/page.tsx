'use client';

import { useState } from 'react';
import ResultTable from './components/ResultTable';

// Types
interface ResultData {
  reg_no: string | number;
  student_name: string;
  gpa: number | null;
  cgpa: number | null;
  error?: string;
}

// Mock data - In production, fetch from API
const PROGRAMS = [
  { id: '1', name: 'M.B.B.S.' },
  { id: '2', name: 'Basic B.Sc. in Nursing' },
  { id: '3', name: 'Post basic B.Sc. in Nursing' },
  { id: '4', name: 'B.D.S.' },
  { id: '5', name: 'B.Sc. in Health Technology (Laboratory)' },
  { id: '6', name: 'B.Sc. in Health Technology (Dental)' },
  { id: '7', name: 'B.Sc.(Public Health Nursing)' },
  { id: '8', name: 'M.Sc. in Physiotherapy' },
  { id: '9', name: 'M.Sc. in Rehabilitation Science' },
  { id: '10', name: 'B.Sc. in Physiotherapy' },
  { id: '11', name: 'B.Sc. in Textile Engineering' },
  { id: '12', name: 'B.Sc. in Civil Engineering' },
  { id: '13', name: 'B.Sc. in Electrical and Electronic Engineering' },
  { id: '14', name: 'B.Sc. in Computer Science and Engineering' },
  { id: '15', name: 'B.Sc. in Speech & Language Therapy' },
  { id: '16', name: 'B.Sc. in Occupational Therapy' },
  { id: '17', name: 'B.Sc. in Fashion Design and Apparel Engineering' },
  { id: '18', name: 'B.Sc. in Industrial and Production Engineering' },
  { id: '19', name: 'B.Sc. in Health Technology (Radiology and Imaging)' },
  { id: '20', name: 'M.Sc. in Textile Engineering' },
  { id: '21', name: 'B.H.M.S.' },
  { id: '22', name: 'B.A.M.S' },
  { id: '23', name: 'B.U.M.S.' },
  { id: '24', name: 'MAFCM' },
  { id: '25', name: 'Post Graduate Diploma in Film and Television' },
  { id: '26', name: 'Bachelor of Photography' },
  { id: '27', name: 'MSc. in Applied Epidemiology' },
  { id: '28', name: 'MBA in Textile and Apparel Value Chain' },
  { id: '29', name: 'B.Sc. in Health Technology (Food Safety)' },
  { id: '30', name: 'Food and Nutrition' },
  { id: '31', name: 'Resource Management and Entrepreneurship' },
  { id: '32', name: 'Child Development and Social Relationship' },
  { id: '33', name: 'Art and Creative Studies' },
  { id: '34', name: 'Clothing and Textile' },
  { id: '35', name: 'Civil Engineering' },
  { id: '36', name: 'Electrical and Electronics Engineering' },
  { id: '37', name: 'Mechanical Engineering' },
  { id: '38', name: 'Post Graduate Diploma in Broadcast Journalism' },
  { id: '39', name: 'Master in Human Security' },
  { id: '40', name: 'Master of Economics (Environmental Economics)' },
  { id: '41', name: 'Master of Economics (MEcon) in Development Economics' },
  { id: '42', name: 'Master of Economics (Entrepreneurship Economics)' },
  { id: '43', name: 'Post Graduate Diploma in Enterprise Development' },
  { id: '44', name: 'Post Graduate Diploma in Economics' },
  { id: '45', name: 'Bachelor of Social Sciences (Honours) in Environmental and Resource Economics' },
  { id: '46', name: 'Bachelor of Social Sciences (Honours) in Entrepreneurial Economics' },
  { id: '47', name: 'Bachelor of Social Sciences (Honours) in Development Economics' },
  { id: '48', name: 'Masters in Bank Management' },
  { id: '49', name: 'Evening Masters in Bank Management' },
  { id: '50', name: 'M.Sc. in Home Economics (Child Development and Family Relations)' },
  { id: '51', name: 'B.Sc (Pass) in Home Economics' },
  { id: '52', name: 'B.Sc. in Prosthetics & Orthotics' },
  { id: '53', name: 'Master of Science in Nursing' },
  { id: '54', name: 'Master of Environmental and Resource Economics' },
  { id: '55', name: 'B.Sc. in Mechanical Engineering' },
  { id: '56', name: 'B.Sc. in Midwifery' },
  { id: '57', name: 'MS in Home Economics (Child Development and Social Relationship)' },
  { id: '58', name: 'MS in Home Economics (Food and Nutrition)' },
  { id: '59', name: 'MS in Home Economics (Resource Management and Entrepreneurship)' },
  { id: '60', name: 'MS in Home Economics (Art and Creative Studies)' },
  { id: '61', name: 'MS in Home Economics (Clothing and Textile)' },
  { id: '62', name: 'M.Sc. in Occupational Therapy' },
  { id: '63', name: 'Professional Masters in Information and Cyber Security(PMICS)' },
  { id: '64', name: 'Master of Development Economics' },
];

const SESSIONS = [
  { id: '26', name: '2025-2026' },
  { id: '25', name: '2024-2025' },
  { id: '24', name: '2023-2024' },
  { id: '23', name: '2022-2023' },
  { id: '22', name: '2021-2022' },
  { id: '21', name: '2020-2021' },
  { id: '20', name: '2019-2020' },
  { id: '19', name: '2018-2019' },
  { id: '18', name: '2017-2018' },
  { id: '17', name: '2016-2017' },
  { id: '16', name: '2015-2016' },
  { id: '15', name: '2014-2015' },
  { id: '14', name: '2013-2014' },
  { id: '13', name: '2012-2013' },
  { id: '12', name: '2011-2012' },
  { id: '11', name: '2010-2011' },
  { id: '10', name: '2009-2010' },
  { id: '9', name: '2008-2009' },
  { id: '8', name: '2007-2008' },
  { id: '7', name: '2006-2007' },
  { id: '6', name: '2005-2006' },
  { id: '5', name: '2004-2005' },
  { id: '4', name: '2003-2004' },
  { id: '3', name: '2002-2003' },
  { id: '2', name: '2001-2002' },
  { id: '1', name: '2000-2001' },
  { id: '100', name: '1999-2000' },
  { id: '99', name: '1998-1999' },
  { id: '98', name: '1997-1998' },
  { id: '97', name: '1996-1997' },
  { id: '96', name: '1995-1996' },
  { id: '95', name: '1994-1995' },
  { id: '94', name: '1993-1994' },
  { id: '93', name: '1992-1993' },
  { id: '92', name: '1991-1992' },
  { id: '91', name: '1990-1991' },
  { id: '90', name: '1989-1990' },
  { id: '89', name: '1988-1989' },
  { id: '88', name: '1987-1988' },
  { id: '87', name: '1986-1987' },
  { id: '86', name: '1985-1986' },
  { id: '85', name: '1984-1985' },
  { id: '84', name: '1983-1984' },
];

// This would be fetched from API in production
const EXAMS: { [key: string]: { id: string; name: string }[] } = {
  '14': [
    { id: '1387', name: 'Final Year' },
    { id: '1386', name: 'Third Year' },
    { id: '1385', name: 'Second Year' },
  ],
  '1': [
    { id: '1387', name: 'Final Professional' },
    { id: '1386', name: 'Third Professional' },
  ],
  // Add more exams for each program
};

export default function Home() {
  const [registrationInput, setRegistrationInput] = useState('');
  const [programId, setProgramId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [examId, setExamId] = useState('');
  const [results, setResults] = useState<ResultData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchProgress, setFetchProgress] = useState<{ current: number; total: number } | null>(null);

  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProgramId(e.target.value);
    setExamId(''); // Reset exam when program changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registrationInput || !programId || !sessionId || !examId) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setFetchProgress(null);

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
        setResults(data.data || []);
        setFetchProgress({ current: data.data?.length || 0, total: data.data?.length || 0 });
        if (data.failedCount > 0) {
          setError(`${data.failedCount} registrations failed to fetch`);
        }
      }
    } catch (err) {
      setError('An error occurred while fetching results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResults([]);
    setRegistrationInput('');
    setProgramId('');
    setSessionId('');
    setExamId('');
    setError(null);
    setFetchProgress(null);
  };

  const getExams = () => {
    if (!programId) return [];
    return EXAMS[programId] || [];
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-2">
            DU CMC Result System
          </h1>
          <p className="text-gray-600">
            Dhaka University Constituent Medical College - Batch Result Lookup
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Registration Number Input */}
              <div className="md:col-span-2">
                <label htmlFor="registrationInput" className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Numbers <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="registrationInput"
                  value={registrationInput}
                  onChange={(e) => setRegistrationInput(e.target.value)}
                  placeholder="e.g., 10,11,12, 20-25,27,40-47 (Max 60)"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2.5 border"
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
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2.5 border"
                  disabled={loading}
                >
                  <option value="">Select your Program Name</option>
                  {PROGRAMS.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
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
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2.5 border"
                  disabled={loading}
                >
                  <option value="">Select your Session</option>
                  {SESSIONS.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exam Selection */}
              <div className="md:col-span-2">
                <label htmlFor="examId" className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Name <span className="text-red-500">*</span>
                </label>
                <select
                  id="examId"
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2.5 border"
                  disabled={loading || !programId}
                >
                  <option value="">Select your Exam Name</option>
                  {getExams().map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name}
                    </option>
                  ))}
                </select>
                {programId && getExams().length === 0 && (
                  <p className="mt-1 text-xs text-yellow-600">
                    No exams available for this program
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-purple-600 text-white px-4 py-2.5 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⟳</span>
                    Fetching Results...
                  </>
                ) : (
                  'Fetch Results'
                )}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="bg-gray-600 text-white px-4 py-2.5 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                disabled={loading}
              >
                Clear All
              </button>
            </div>

            {/* Progress Indicator */}
            {loading && fetchProgress && (
              <div className="mt-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Fetching results...</span>
                  <span>{fetchProgress.current} / {fetchProgress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: fetchProgress.total > 0 
                        ? `${(fetchProgress.current / fetchProgress.total) * 100}%` 
                        : '0%' 
                    }}
                  />
                </div>
              </div>
            )}
          </form>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Results Summary */}
          {results.length > 0 && !loading && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded flex flex-wrap justify-between items-center">
              <span>
                Total: <strong>{results.length}</strong> | 
                Successful: <strong className="text-green-600">{results.filter(r => !r.error).length}</strong> | 
                Failed: <strong className="text-red-600">{results.filter(r => r.error).length}</strong>
              </span>
              <button
                onClick={() => window.print()}
                className="bg-green-600 text-white px-4 py-1.5 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm"
              >
                🖨️ Print Results
              </button>
            </div>
          )}
        </div>

        {/* Results Table */}
        {results.length > 0 && (
          <ResultTable results={results} />
        )}
      </div>
    </main>
  );
}