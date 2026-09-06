import { NextRequest, NextResponse } from 'next/server';

const EXAMS_API_URL = process.env.DUCMC_API_URL || '';
const USER_AGENT = process.env.DUCMC_USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

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

    let exams: { id: string; name: string }[] = [];
    
    try {
      const response = await fetch(`${EXAMS_API_URL}?program_id=${programId}&pedata=99`, {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'User-Agent': USER_AGENT,
          'Accept': 'text/html, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Origin': new URL(EXAMS_API_URL).origin,
          'Referer': process.env.DUCMC_RESULT_PAGE || 'https://ducmc.du.ac.bd/result.php',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });

      const html = await response.text();
      console.log(`GET response length: ${html.length}`);
      
      const optionRegex = /<option\s+value="([^"]+)"[^>]*>([^<]+)<\/option>/g;
      let match;
      while ((match = optionRegex.exec(html)) !== null) {
        const value = match[1].trim();
        const text = match[2].trim();
        if (value && value !== '' && text && text !== 'Select your Exam Name' && text !== 'Select Exam') {
          exams.push({ id: value, name: text });
        }
      }
    } catch (error) {
      console.log('GET method failed, trying POST...');
    }

    if (exams.length === 0) {
      try {
        const postResponse = await fetch(EXAMS_API_URL, {
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
            program_id: programId,
            pedata: '99'
          }),
          cache: 'no-store'
        });

        const postHtml = await postResponse.text();
        console.log(`POST response length: ${postHtml.length}`);
        
        const postOptionRegex = /<option\s+value="([^"]+)"[^>]*>([^<]+)<\/option>/g;
        let match;
        while ((match = postOptionRegex.exec(postHtml)) !== null) {
          const value = match[1].trim();
          const text = match[2].trim();
          if (value && value !== '' && text && text !== 'Select your Exam Name' && text !== 'Select Exam') {
            exams.push({ id: value, name: text });
          }
        }
      } catch (error) {
        console.log('POST method also failed');
      }
    }

    if (exams.length === 0) {
      console.log('Trying to extract from main page...');
      
      try {
        const mainResponse = await fetch(process.env.DUCMC_RESULT_PAGE || 'https://ducmc.du.ac.bd/result.php', {
          headers: {
            'User-Agent': USER_AGENT
          }
        });
        
        const mainHtml = await mainResponse.text();
        
        const selectRegex = /<select[^>]*id="exam_id"[^>]*>([\s\S]*?)<\/select>/;
        const selectMatch = mainHtml.match(selectRegex);
        
        if (selectMatch) {
          const selectHtml = selectMatch[1];
          const mainOptionRegex = /<option\s+value="([^"]+)"[^>]*>([^<]+)<\/option>/g;
          let match;
          while ((match = mainOptionRegex.exec(selectHtml)) !== null) {
            const value = match[1].trim();
            const text = match[2].trim();
            if (value && value !== '' && text && text !== 'Select your Exam Name' && text !== 'Select Exam') {
              exams.push({ id: value, name: text });
            }
          }
          console.log(`Found ${exams.length} exams from main page`);
        }
      } catch (error) {
        console.log('Main page extraction failed');
      }
    }

    console.log(`Returning ${exams.length} exams for program ${programId}`);

    return NextResponse.json({
      success: true,
      exams,
      _debug: {
        examsFound: exams.length
      }
    });

  } catch (error: any) {
    console.error('Error fetching exams:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch exams',
        exams: []
      },
      { status: 500 }
    );
  }
}