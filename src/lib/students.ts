import type { PublicStudent, Student } from "@/types";

/**
 * Strips private student fields before data crosses the server/client boundary
 * or is rendered on a public page. This mirrors the future Supabase RLS policy.
 */
export function toPublicStudent(student: Student): PublicStudent {
  const { privateInfo: _privateInfo, ...publicStudent } = student;
  return publicStudent;
}

export function toPublicStudents(students: Student[]): PublicStudent[] {
  return students.map(toPublicStudent);
}
