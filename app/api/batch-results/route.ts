import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import type { ResultData } from '@/app/types';

const EXAMS_API_URL = process.env.DUCMC_API_URL || '';
const USER_AGENT = process.env.DUCMC_USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const REQUEST_DELAY = parseInt(process.env.DUCMC_REQUEST_DELAY || '500');
const MAX_REGISTRATIONS = parseInt(process.env.DUCMC_MAX_REGISTRATIONS || '60');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { registrationInput, programId, sessionId, examId } = body;

    if (!registrationInput || !programId || !sessionId || !examId) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    const registrations = parseRegistrationInput(registrationInput);
    
    if (registrations.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid registration numbers found' },
        { status: 400 }
      );
    }

    if (registrations.length > MAX_REGISTRATIONS) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_REGISTRATIONS} registrations allowed` },
        { status: 400 }
      );
    }

    const results = await fetchBatchResults(
      registrations,
      parseInt(programId),
      parseInt(sessionId),
      parseInt(examId)
    );

    const validResults = results.filter(result => !result.error);

    return NextResponse.json({
      success: true,
      data: validResults,
      total: results.length,
      successCount: validResults.length,
      failedCount: results.length - validResults.length
    });

  } catch (error) {
    console.error('Batch result error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}

function parseRegistrationInput(input: string): number[] {
  if (!input || input.trim() === '') return [];
  
  const parts = input.replace(/\s/g, '').split(',');
  const registrations: number[] = [];

  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          registrations.push(i);
        }
      }
    } else {
      const num = Number(part);
      if (!isNaN(num) && num > 0) {
        registrations.push(num);
      }
    }
  }

  return [...new Set(registrations)].sort((a, b) => a - b);
}

async function fetchBatchResults(
  registrations: number[],
  programId: number,
  sessionId: number,
  examId: number
): Promise<ResultData[]> {
  const results: ResultData[] = [];
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  for (let i = 0; i < registrations.length; i++) {
    const regNo = registrations[i];
    
    try {
      console.log(`Fetching result for registration: ${regNo} (${i + 1}/${registrations.length})`);
      
      let adjustedSessionId = sessionId;
      if (regNo < 900) {
        adjustedSessionId = 19;
      } else if (regNo > 2000) {
        adjustedSessionId = 20;
      }

      const result = await fetchSingleResult(regNo, programId, adjustedSessionId, examId);
      results.push(result);
      
      if (i < registrations.length - 1) {
        await delay(REQUEST_DELAY);
      }
      
    } catch (error) {
      console.error(`Failed to fetch registration ${regNo}:`, error);
      results.push({
        reg_no: regNo,
        student_name: 'Error fetching',
        gpa: null,
        cgpa: null,
        status: 'Error',
        failed_subjects: [],
        error: 'Failed to fetch'
      });
    }
  }

  return results;
}

async function fetchSingleResult(
  regNo: number,
  programId: number,
  sessionId: number,
  examId: number
): Promise<ResultData> {
  try {
    const response = await fetch(EXAMS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': USER_AGENT,
        'Accept': 'text/html, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': new URL(EXAMS_API_URL).origin,
        'Referer': process.env.DUCMC_RESULT_PAGE || 'https://ducmc.du.ac.bd/result.php',
      },
      body: new URLSearchParams({
        reg_no: regNo.toString(),
        pro_id: programId.toString(),
        sess_id: sessionId.toString(),
        exam_id: examId.toString(),
        gdata: '99'
      }),
      cache: 'no-store'
    });

    const html = await response.text();

    if (response.status !== 200 || !html || html.trim() === '') {
      return {
        reg_no: regNo,
        student_name: 'No data',
        gpa: null,
        cgpa: null,
        status: 'Not Found',
        failed_subjects: [],
        error: 'No response'
      };
    }

    // Parse the HTML response
    const $ = cheerio.load(html);
    
    const responseText = $('body').text();
    if (responseText.includes('No result found') || 
        responseText.includes('not found') ||
        responseText.includes('Invalid')) {
      return {
        reg_no: regNo,
        student_name: 'Not found',
        gpa: null,
        cgpa: null,
        status: 'Not Found',
        failed_subjects: [],
        error: 'No result found'
      };
    }
    
    let studentName = '';
    let collegeName = '';
    let session = '';
    let program = '';
    let examRoll = '';
    let classRoll = '';
    let examYear = '';
    let publicationDate = '';
    
    $('table tr').each((_, row) => {
      const th = $(row).find('th');
      const td = $(row).find('td');
      if (th.length > 0 && td.length > 0) {
        const label = th.text().trim();
        const value = td.text().trim();
        if (label.includes('Student\'s Name') || label.includes('Student Name')) {
          studentName = value;
        } else if (label.includes('College Name')) {
          collegeName = value;
        } else if (label.includes('Session')) {
          session = value;
        } else if (label.includes('Program')) {
          program = value;
        } else if (label.includes('Exam Roll')) {
          examRoll = value;
        } else if (label.includes('Class Roll')) {
          classRoll = value;
        } else if (label.includes('Exam Year')) {
          examYear = value;
        } else if (label.includes('Result Publication Date')) {
          publicationDate = value;
        }
      }
    });

    // Extract GPA and CGPA from the HTML
    let gpa: number | null = null;
    let cgpa: number | null = null;
    
    // Try to find CGPA in the status div
    const cgpaMatch = responseText.match(/CGPA:\s*([\d.]+)/i);
    if (cgpaMatch) {
      cgpa = parseFloat(cgpaMatch[1]);
    }

    // Try to find GPA
    const gpaMatch = responseText.match(/GPA:\s*([\d.]+)/i);
    if (gpaMatch) {
      gpa = parseFloat(gpaMatch[1]);
    }

    // Extract status and failed subjects
    let status = '';
    let failedSubjects: string[] = [];
    let promotedWithCount = 0;
    
    // Find the status div
    const statusDiv = $('td div[style*="font-weight: bold;font-size: 25px;"]');
    if (statusDiv.length > 0) {
      const statusText = statusDiv.text().trim();
      
      // Check for Promoted with failed subjects
      if (statusText.includes('Promoted')) {
        status = 'Promoted';
        // Extract failed subjects if any
        const failedMatch = statusText.match(/Promoted\s*\(([^)]+)\)/);
        if (failedMatch) {
          const subjects = failedMatch[1].split(',').map(s => s.trim());
          failedSubjects = subjects.filter(s => s.length > 0);
          promotedWithCount = failedSubjects.length;
        }
      } else if (statusText.includes('Passed')) {
        status = 'Passed';
        const failedMatch = statusText.match(/Passed\s*\(([^)]+)\)/);
        if (failedMatch) {
          const subjects = failedMatch[1].split(',').map(s => s.trim());
          failedSubjects = subjects.filter(s => s.length > 0);
          promotedWithCount = failedSubjects.length;
        }
      } else if (statusText.includes('Failed')) {
        status = 'Failed';
        const failedMatch = statusText.match(/Failed\s*\(([^)]+)\)/);
        if (failedMatch) {
          const subjects = failedMatch[1].split(',').map(s => s.trim());
          failedSubjects = subjects.filter(s => s.length > 0);
          promotedWithCount = failedSubjects.length;
        }
      } else if (statusText.includes('Conditional')) {
        status = 'Conditional';
        const failedMatch = statusText.match(/Conditional\s*\(([^)]+)\)/);
        if (failedMatch) {
          const subjects = failedMatch[1].split(',').map(s => s.trim());
          failedSubjects = subjects.filter(s => s.length > 0);
          promotedWithCount = failedSubjects.length;
        }
      } else {
        // Try to extract from the div content
        const lines = statusText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
        if (lines.length > 0) {
          status = lines[0];
          // Check if there are failed subjects mentioned
          if (lines.length > 1 && lines[1].includes(',')) {
            const subjects = lines[1].split(',').map(s => s.trim());
            failedSubjects = subjects.filter(s => s.length > 0);
            promotedWithCount = failedSubjects.length;
          }
        }
      }
    } else {
      $('table tr').each((_, row) => {
        const td = $(row).find('td');
        if (td.length > 0 && (td.text().includes('Promoted') || td.text().includes('Passed') || td.text().includes('Failed'))) {
          const text = td.text().trim();
          if (text.includes('Promoted')) {
            status = 'Promoted';
            const failedMatch = text.match(/Promoted\s*\(([^)]+)\)/);
            if (failedMatch) {
              const subjects = failedMatch[1].split(',').map(s => s.trim());
              failedSubjects = subjects.filter(s => s.length > 0);
              promotedWithCount = failedSubjects.length;
            }
          } else if (text.includes('Passed')) {
            status = 'Passed';
            const failedMatch = text.match(/Passed\s*\(([^)]+)\)/);
            if (failedMatch) {
              const subjects = failedMatch[1].split(',').map(s => s.trim());
              failedSubjects = subjects.filter(s => s.length > 0);
              promotedWithCount = failedSubjects.length;
            }
          } else if (text.includes('Failed')) {
            status = 'Failed';
            const failedMatch = text.match(/Failed\s*\(([^)]+)\)/);
            if (failedMatch) {
              const subjects = failedMatch[1].split(',').map(s => s.trim());
              failedSubjects = subjects.filter(s => s.length > 0);
              promotedWithCount = failedSubjects.length;
            }
          }
        }
      });
    }

    if (!status) {
      let hasF = false;
      $('table tr').each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 5) {
          const grade = $(cells[3]).text().trim();
          if (grade === 'F' || grade === 'F*' || grade === 'F+') {
            hasF = true;
          }
        }
      });
      
      if (hasF) {
        status = 'Failed';
        $('table tr').each((_, row) => {
          const cells = $(row).find('td');
          if (cells.length >= 5) {
            const grade = $(cells[3]).text().trim();
            if (grade === 'F' || grade === 'F*' || grade === 'F+') {
              const subjectCode = $(cells[1]).text().trim();
              if (subjectCode) {
                failedSubjects.push(subjectCode);
              }
            }
          }
        });
        promotedWithCount = failedSubjects.length;
      } else {
        status = 'Passed';
      }
    }

    if (!studentName) {
      $('table tr').each((_, row) => {
        const th = $(row).find('th');
        const td = $(row).find('td');
        if (th.length > 0 && td.length > 0 && th.text().includes('Student')) {
          studentName = td.text().trim();
        }
      });
    }

    if (!studentName && !cgpa && !gpa && status === '') {
      return {
        reg_no: regNo,
        student_name: 'Not found',
        gpa: null,
        cgpa: null,
        status: 'Not Found',
        failed_subjects: [],
        error: 'No result data'
      };
    }

    return {
      reg_no: regNo,
      student_name: studentName || 'Unknown',
      college_name: collegeName,
      session: session,
      program: program,
      exam_roll: examRoll,
      class_roll: classRoll,
      exam_year: examYear,
      publication_date: publicationDate,
      gpa: gpa,
      cgpa: cgpa,
      status: status || 'Unknown',
      failed_subjects: failedSubjects,
      promoted_with_count: promotedWithCount
    };

  } catch (error) {
    console.error(`Error fetching registration ${regNo}:`, error);
    return {
      reg_no: regNo,
      student_name: 'Error',
      gpa: null,
      cgpa: null,
      status: 'Error',
      failed_subjects: [],
      error: 'Request failed'
    };
  }
}