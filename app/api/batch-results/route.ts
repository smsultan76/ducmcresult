import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

const TARGET_URL = process.env.DUCMC_API_URL || '';
const COOKIE = process.env.DUCMC_COOKIE || '';
const USER_AGENT = process.env.DUCMC_USER_AGENT || '';
const REQUEST_DELAY = parseInt(process.env.DUCMC_REQUEST_DELAY || '500');
const MAX_REGISTRATIONS = parseInt(process.env.DUCMC_MAX_REGISTRATIONS || '60');

const HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'X-Requested-With': 'XMLHttpRequest',
  'User-Agent': USER_AGENT,
  'Cookie': COOKIE
};

interface ResultData {
  reg_no: string | number;
  student_name: string;
  gpa: number | null;
  cgpa: number | null;
  error?: string;
}

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

    const validResults = results.filter(result => {
      const hasData = !result.error && 
                      result.student_name !== 'No data' &&
                      result.student_name !== 'Error fetching' &&
                      result.student_name !== 'Error' &&
                      result.student_name !== 'Not found' &&
                      result.student_name !== 'Unknown' &&
                      (result.gpa !== null || result.cgpa !== null);
      
      return hasData;
    });

    const notFoundCount = results.length - validResults.length;

    return NextResponse.json({
      success: true,
      data: validResults,
      total: results.length,
      successCount: validResults.length,
      failedCount: notFoundCount
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
      
      // Add delay between requests to avoid server overload
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
        error: 'Failed to fetch'
      });
    }
  }

  return results;
}

// Fetch single student result
async function fetchSingleResult(
  regNo: number,
  programId: number,
  sessionId: number,
  examId: number
): Promise<ResultData> {
  const payload = new URLSearchParams({
    pro_id: programId.toString(),
    sess_id: sessionId.toString(),
    exam_id: examId.toString(),
    reg_no: regNo.toString(),
    gdata: '99'
  });

  try {
    const response = await axios.post(TARGET_URL, payload.toString(), {
      headers: HEADERS,
      timeout: 30000
    });

    if (response.status !== 200 || !response.data || response.data.trim() === '') {
      return {
        reg_no: regNo,
        student_name: 'No data',
        gpa: null,
        cgpa: null,
        error: 'No response'
      };
    }

    // Parse the HTML response
    const $ = cheerio.load(response.data);
    
    // Check if the response contains "No result found" or similar messages
    const responseText = $('body').text();
    if (responseText.includes('No result found') || 
        responseText.includes('not found') ||
        responseText.includes('Invalid') ||
        responseText.includes('No data')) {
      return {
        reg_no: regNo,
        student_name: 'Not found',
        gpa: null,
        cgpa: null,
        error: 'No result found'
      };
    }
    
    // Extract student name - try multiple selectors
    let studentName = 'Not found';
    const nameSelectors = [
      'th:contains("Student")',
      'th:contains("Name")', 
      'th:contains("student")',
      'th:contains("NAME")'
    ];
    
    for (const selector of nameSelectors) {
      const nameTh = $(selector);
      if (nameTh.length > 0) {
        const nameTd = nameTh.next('td');
        if (nameTd.length > 0) {
          studentName = nameTd.text().trim();
          break;
        }
      }
    }

    // If not found with th/td, try to find in table rows
    if (studentName === 'Not found') {
      $('table tr').each((_, row) => {
        const rowText = $(row).text();
        if (rowText.includes('Student') || rowText.includes('Name')) {
          const td = $(row).find('td:last-child');
          if (td.length > 0) {
            const name = td.text().trim();
            if (name && name.length > 0 && !name.includes('Student') && !name.includes('Name')) {
              studentName = name;
            }
          }
        }
      });
    }

    // Extract GPA
    let gpa: number | null = null;
    const gpaMatch = responseText.match(/GPA:\s*([\d.]+)/i);
    if (gpaMatch) {
      gpa = parseFloat(gpaMatch[1]);
    }

    // Extract CGPA
    let cgpa: number | null = null;
    const cgpaMatch = responseText.match(/CGPA:\s*([\d.]+)/i);
    if (cgpaMatch) {
      cgpa = parseFloat(cgpaMatch[1]);
    }

    // If GPA or CGPA not found, try alternative patterns in table
    if (gpa === null || cgpa === null) {
      $('table tr').each((_, row) => {
        const rowText = $(row).text();
        if (rowText.includes('GPA') && !rowText.includes('CGPA')) {
          const td = $(row).find('td:last-child');
          if (td.length > 0) {
            const value = parseFloat(td.text().trim());
            if (!isNaN(value)) gpa = value;
          }
        }
        if (rowText.includes('CGPA')) {
          const td = $(row).find('td:last-child');
          if (td.length > 0) {
            const value = parseFloat(td.text().trim());
            if (!isNaN(value)) cgpa = value;
          }
        }
      });
    }

    // Check if we have valid data
    if (studentName === 'Not found' && gpa === null && cgpa === null) {
      return {
        reg_no: regNo,
        student_name: 'Not found',
        gpa: null,
        cgpa: null,
        error: 'No result data'
      };
    }

    return {
      reg_no: regNo,
      student_name: studentName || 'Unknown',
      gpa: gpa,
      cgpa: cgpa
    };

  } catch (error) {
    console.error(`Error fetching registration ${regNo}:`, error);
    return {
      reg_no: regNo,
      student_name: 'Error',
      gpa: null,
      cgpa: null,
      error: 'Request failed'
    };
  }
}