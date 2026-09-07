'use client';

import { useState, useEffect } from 'react';

interface ResultData {
  reg_no: string | number;
  student_name: string;
  college_name?: string;
  session?: string;
  program?: string;
  exam_roll?: string;
  class_roll?: string;
  exam_year?: string;
  publication_date?: string;
  gpa: number | null;
  cgpa: number | null;
  status: string;
  failed_subjects: string[];
  promoted_with_count?: number;
  error?: string;
}

interface ResultTableProps {
  results: ResultData[];
  programName?: string;
  sessionName?: string;
  examName?: string;
}

export default function ResultTable({ results, programName, sessionName, examName }: ResultTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ResultData | null;
    direction: 'ascending' | 'descending';
  }>({ key: null, direction: 'ascending' });
  
  const [sortedResults, setSortedResults] = useState<ResultData[]>([]);

  useEffect(() => {
    setSortedResults([...results]);
  }, [results]);

  const sortResults = (key: keyof ResultData) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    setSortConfig({ key, direction });

    const sorted = [...results].sort((a, b) => {
      if (a[key] === null || a[key] === undefined) return 1;
      if (b[key] === null || b[key] === undefined) return -1;

      if (typeof a[key] === 'string' && typeof b[key] === 'string') {
        return direction === 'ascending' 
          ? (a[key] as string).localeCompare(b[key] as string)
          : (b[key] as string).localeCompare(a[key] as string);
      }

      if (a[key]! < b[key]!) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key]! > b[key]!) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setSortedResults(sorted);
  };

  const getSortIndicator = (key: keyof ResultData) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  const getStatusColor = (status: string) => {
    if (status === 'Promoted') return 'bg-green-100 text-green-800';
    if (status === 'Passed') return 'bg-blue-100 text-blue-800';
    if (status === 'Failed') return 'bg-red-100 text-red-800';
    if (status === 'Conditional') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getGpaColorClass = (gpa: number | null) => {
    if (gpa === null) return 'text-gray-400';
    if (gpa >= 3.5) return 'text-green-600 font-semibold';
    if (gpa >= 2.5) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Table Caption */}
      <div className="px-4 py-3 bg-purple-50 border-b border-purple-200">
        <div className="text-sm font-medium text-purple-800 space-y-1">
          <div><span className="font-bold">Program:</span> {programName || 'N/A'}</div>
          <div><span className="font-bold">Session:</span> {sessionName || 'N/A'}</div>
          <div><span className="font-bold">Exam:</span> {examName || 'N/A'}</div>
          <div className="text-purple-600 text-xs">
            Total Students: <strong>{sortedResults.length}</strong>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => sortResults('reg_no')}
                className="px-3 py-2 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider cursor-pointer hover:bg-purple-100 select-none"
              >
                <span className="flex items-center gap-1">
                  Reg. No {getSortIndicator('reg_no')}
                </span>
              </th>
              <th
                onClick={() => sortResults('student_name')}
                className="px-3 py-2 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider cursor-pointer hover:bg-purple-100 select-none"
              >
                <span className="flex items-center gap-1">
                  Student Name {getSortIndicator('student_name')}
                </span>
              </th>
              <th
                onClick={() => sortResults('gpa')}
                className="px-3 py-2 text-center text-xs font-semibold text-purple-700 uppercase tracking-wider cursor-pointer hover:bg-purple-100 select-none"
              >
                <span className="flex items-center justify-center gap-1">
                  GPA {getSortIndicator('gpa')}
                </span>
              </th>
              <th
                onClick={() => sortResults('cgpa')}
                className="px-3 py-2 text-center text-xs font-semibold text-purple-700 uppercase tracking-wider cursor-pointer hover:bg-purple-100 select-none"
              >
                <span className="flex items-center justify-center gap-1">
                  CGPA {getSortIndicator('cgpa')}
                </span>
              </th>
              <th
                onClick={() => sortResults('status')}
                className="px-3 py-2 text-center text-xs font-semibold text-purple-700 uppercase tracking-wider cursor-pointer hover:bg-purple-100 select-none"
              >
                <span className="flex items-center justify-center gap-1">
                  Status {getSortIndicator('status')}
                </span>
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-purple-700 uppercase tracking-wider">
                Failed Subjects
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedResults.map((result, index) => (
              <tr
                key={`${result.reg_no}-${index}`}
                className={index % 2 === 0 ? 'bg-white hover:bg-purple-50' : 'bg-gray-50 hover:bg-purple-50'}
              >
                <td className="px-3 py-1.5 whitespace-nowrap text-sm font-medium text-gray-900">
                  {result.reg_no}
                </td>
                <td className="px-3 py-1.5 whitespace-nowrap text-sm text-gray-700">
                  {result.student_name}
                </td>
                <td className={`px-3 py-1.5 whitespace-nowrap text-sm text-center font-medium ${getGpaColorClass(result.gpa)}`}>
                  {result.gpa !== null ? result.gpa.toFixed(2) : 'N/A'}
                </td>
                <td className={`px-3 py-1.5 whitespace-nowrap text-sm text-center font-medium ${getGpaColorClass(result.cgpa)}`}>
                  {result.cgpa !== null ? result.cgpa.toFixed(2) : 'N/A'}
                </td>
                <td className="px-3 py-1.5 whitespace-nowrap text-center">
                  <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(result.status)}`}>
                    {result.status}
                    {result.promoted_with_count && result.promoted_with_count > 0 && (
                      <span className="ml-1 text-red-600">({result.promoted_with_count})</span>
                    )}
                  </span>
                </td>
                <td className="px-3 py-1.5 whitespace-nowrap text-center text-xs text-gray-600">
                  {result.failed_subjects.length > 0 ? (
                    <span className="text-red-600 font-medium">
                      {result.failed_subjects.join(', ')}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center text-sm">
        <div className="text-gray-600">
          Showing <strong>{sortedResults.length}</strong> student(s)
        </div>
        <div className="text-gray-400 text-xs hidden sm:block">
          Click column headers to sort ↕
        </div>
      </div>
    </div>
  );
}