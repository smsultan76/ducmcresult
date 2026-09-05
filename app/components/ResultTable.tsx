'use client';

import { useState } from 'react';

interface ResultData {
  reg_no: string | number;
  student_name: string;
  gpa: number | null;
  cgpa: number | null;
  error?: string;
}

interface ResultTableProps {
  results: ResultData[];
}

export default function ResultTable({ results }: ResultTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ResultData | null;
    direction: 'ascending' | 'descending';
  }>({ key: null, direction: 'ascending' });

  const sortResults = (key: keyof ResultData) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    setSortConfig({ key, direction });

    // Sort the results - we need to return a new sorted array
    results.sort((a, b) => {
      // Handle null/undefined values
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
  };

  const getSortIndicator = (key: keyof ResultData) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-purple-50">
            <tr>
              <th
                onClick={() => sortResults('reg_no')}
                className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider cursor-pointer hover:bg-purple-100 select-none"
              >
                Registration {getSortIndicator('reg_no')}
              </th>
              <th
                onClick={() => sortResults('student_name')}
                className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider cursor-pointer hover:bg-purple-100 select-none"
              >
                Student Name {getSortIndicator('student_name')}
              </th>
              <th
                onClick={() => sortResults('gpa')}
                className="px-6 py-3 text-center text-xs font-medium text-purple-700 uppercase tracking-wider cursor-pointer hover:bg-purple-100 select-none"
              >
                GPA {getSortIndicator('gpa')}
              </th>
              <th
                onClick={() => sortResults('cgpa')}
                className="px-6 py-3 text-center text-xs font-medium text-purple-700 uppercase tracking-wider cursor-pointer hover:bg-purple-100 select-none"
              >
                CGPA {getSortIndicator('cgpa')}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-purple-700 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((result, index) => (
              <tr
                key={`${result.reg_no}-${index}`}
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {result.reg_no}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {result.student_name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
                  {result.gpa !== null ? (
                    <span className={result.gpa >= 3.5 ? 'text-green-600' : result.gpa >= 2.5 ? 'text-yellow-600' : 'text-red-600'}>
                      {result.gpa.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
                  {result.cgpa !== null ? (
                    <span className={result.cgpa >= 3.5 ? 'text-green-600' : result.cgpa >= 2.5 ? 'text-yellow-600' : 'text-red-600'}>
                      {result.cgpa.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {result.error ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Failed
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Success
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Showing <strong>{results.length}</strong> results
          {results.filter(r => !r.error).length < results.length && (
            <span className="ml-2 text-red-600">
              ({results.filter(r => r.error).length} failed)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}