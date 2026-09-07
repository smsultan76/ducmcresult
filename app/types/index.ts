export interface ResultData {
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
  status: string; // 'Promoted', 'Passed', 'Failed', etc.
  failed_subjects: string[];
  promoted_with_count?: number;
  error?: string;
}

export interface PrintData {
  results: ResultData[];
  program: string;
  session: string;
  exam: string;
}

export interface Option {
  id: string;
  name: string;
}