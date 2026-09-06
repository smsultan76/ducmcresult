'use client';

import { useEffect, useState } from 'react';

interface ResultData {
  reg_no: string | number;
  student_name: string;
  gpa: number | null;
  cgpa: number | null;
  error?: string;
}

interface PrintData {
  results: ResultData[];
  program: string;
  session: string;
  exam: string;
}

export default function PrintPage() {
  const [data, setData] = useState<PrintData | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('printData');
    if (storedData) {
      setData(JSON.parse(storedData));
    }

    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl mb-4">📄</div>
          <p>Loading print data...</p>
        </div>
      </div>
    );
  }

  const { results, program, session, exam } = data;

  return (
    <div className="print-container">
      <div className="print-header">
        <h1>DU CMC Result System</h1>
        <h2>Batch Result Report</h2>
        <div className="print-info">
          <p><strong>Program:</strong> {program}</p>
          <p><strong>Session:</strong> {session}</p>
          <p><strong>Exam:</strong> {exam}</p>
          <p><strong>Total Students:</strong> {results.length}</p>
          <p><strong>Generated:</strong> {new Date().toLocaleString()}</p>
        </div>
      </div>

      <table className="print-table">
        <thead>
          <tr>
            <th>Registration</th>
            <th>Student Name</th>
            <th>GPA</th>
            <th>CGPA</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={index}>
              <td>{result.reg_no}</td>
              <td>{result.student_name}</td>
              <td>{result.gpa !== null ? result.gpa.toFixed(2) : 'N/A'}</td>
              <td>{result.cgpa !== null ? result.cgpa.toFixed(2) : 'N/A'}</td>
              <td>Found</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="print-footer">
        <p>© {new Date().getFullYear()} University of Dhaka. All Rights Reserved.</p>
        <p>Developed by: <a href="https://sultanum-mobin.vercel.app/" target="_blank" className="text-blue-600">Sultanum Mobin</a></p>
      </div>

      <style jsx>{`
        .print-container {
          max-width: 100%;
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        .print-header {
          text-align: center;
          border-bottom: 3px solid #7c3aed;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }

        .print-header h1 {
          color: #4c1d95;
          font-size: 24px;
          margin: 0 0 5px 0;
        }

        .print-header h2 {
          color: #6d28d9;
          font-size: 18px;
          margin: 0 0 10px 0;
        }

        .print-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5px 30px;
          max-width: 600px;
          margin: 10px auto 0;
          font-size: 13px;
          text-align: left;
        }

        .print-info p {
          margin: 2px 0;
        }

        .print-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          margin: 15px 0;
        }

        .print-table thead {
          display: table-header-group;
        }

        .print-table th {
          background-color: #f3e8ff;
          border: 1px solid #ccc;
          padding: 8px 10px;
          text-align: left;
          font-weight: bold;
          font-size: 11px;
          text-transform: uppercase;
        }

        .print-table td {
          border: 1px solid #ddd;
          padding: 6px 10px;
          font-size: 11px;
        }

        .print-table tr:nth-child(even) {
          background-color: #f9fafb;
        }

        .print-table tr {
          page-break-inside: avoid;
        }

        .print-footer {
          text-align: center;
          border-top: 2px solid #7c3aed;
          padding-top: 15px;
          margin-top: 20px;
          font-size: 11px;
          color: #666;
        }

        .print-footer p {
          margin: 2px 0;
        }

        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }

          .print-container {
            padding: 15px 20px;
          }

          .print-header {
            padding-bottom: 12px;
            margin-bottom: 15px;
          }

          .print-header h1 {
            font-size: 20px;
          }

          .print-header h2 {
            font-size: 16px;
          }

          .print-info {
            font-size: 11px;
            gap: 3px 25px;
          }

          .print-table {
            font-size: 10px;
          }

          .print-table th {
            font-size: 9px;
            padding: 6px 8px;
          }

          .print-table td {
            font-size: 9px;
            padding: 4px 8px;
          }

          .print-footer {
            font-size: 9px;
            padding-top: 10px;
            margin-top: 15px;
          }

          .print-table {
            page-break-after: auto;
          }

          .print-table thead {
            display: table-header-group;
          }

          .print-table tbody {
            display: table-row-group;
          }

          .print-table tr {
            page-break-inside: avoid;
          }
        }

        @media screen and (max-width: 600px) {
          .print-info {
            grid-template-columns: 1fr;
          }

          .print-table {
            font-size: 10px;
          }

          .print-table th,
          .print-table td {
            padding: 4px 6px;
          }
        }
      `}</style>
    </div>
  );
}