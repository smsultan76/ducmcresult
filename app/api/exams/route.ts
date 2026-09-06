import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

// The AJAX endpoint from the page
const EXAMS_API_URL = 'https://ducmc.du.ac.bd/ajax/get_program_by_exam.php';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const programId = searchParams.get('program_id');

    if (!programId) {
      return NextResponse.json(
        { success: false, error: 'Program ID is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching exams for program ID: ${programId}`);

    // Call the same AJAX endpoint the page uses
    const response = await axios.post(
      EXAMS_API_URL,
      new URLSearchParams({
        program_id: programId,
        pedata: '99'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Origin': 'https://ducmc.du.ac.bd',
          'Referer': 'https://ducmc.du.ac.bd/result.php',
          'Cookie': process.env.DUCMC_COOKIE || 'PHPSESSID=d5d815feffdf8d5c955eeb7e446ae929'
        },
        timeout: 30000
      }
    );

    console.log('Response status:', response.status);
    console.log('Response data length:', response.data?.length || 0);

    // Check if we got a response
    if (!response.data || response.data.trim() === '') {
      console.log('Empty response received');
      return NextResponse.json({
        success: true,
        exams: []
      });
    }

    // Parse the HTML response from the AJAX call
    const html = response.data;
    const $ = cheerio.load(html);

    // Parse exams from the select options
    const exams: { id: string; name: string }[] = [];
    
    // Try to find options in the response
    $('option').each((_, option) => {
      const value = $(option).attr('value');
      const text = $(option).text().trim();
      if (value && value !== '' && text !== 'Select your Exam Name') {
        exams.push({ id: value, name: text });
      }
    });

    // If no options found, try to parse any select element
    if (exams.length === 0) {
      $('select option').each((_, option) => {
        const value = $(option).attr('value');
        const text = $(option).text().trim();
        if (value && value !== '') {
          exams.push({ id: value, name: text });
        }
      });
    }

    console.log(`Found ${exams.length} exams for program ${programId}`);

    return NextResponse.json({
      success: true,
      exams
    });

  } catch (error: any) {
    console.error('Error fetching exams:', error.message);
    
    // Return empty exams array instead of error
    return NextResponse.json({
      success: true,
      exams: [],
      _debug: error.message
    });
  }
}