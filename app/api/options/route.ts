import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

const RESULT_PAGE_URL = 'https://ducmc.du.ac.bd/result.php';

export async function GET() {
  try {
    // Fetch the result page
    const response = await axios.get(RESULT_PAGE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Parse Programs from the select element with id="pro_id"
    const programs: { id: string; name: string }[] = [];
    $('#pro_id option').each((_, option) => {
      const value = $(option).attr('value');
      const text = $(option).text().trim();
      if (value && value !== '' && text !== 'Select your Program Name') {
        programs.push({ id: value, name: text });
      }
    });

    // Parse Sessions from the select element with id="sess_id"
    const sessions: { id: string; name: string }[] = [];
    $('#sess_id option').each((_, option) => {
      const value = $(option).attr('value');
      const text = $(option).text().trim();
      if (value && value !== '' && text !== 'Select your Session') {
        sessions.push({ id: value, name: text });
      }
    });

    return NextResponse.json({
      success: true,
      programs,
      sessions
    });

  } catch (error) {
    console.error('Error fetching options:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch options' },
      { status: 500 }
    );
  }
}