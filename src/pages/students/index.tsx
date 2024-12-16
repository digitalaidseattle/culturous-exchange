
// material-ui

// project import
import { Typography } from '@mui/material';
import MainCard from '../../components/MainCard';
import { useState, useEffect } from 'react';
import { supabaseClient } from '../../services/supabaseClient';

interface Student {
  id: number; // Adjust based on your database schema
  first_name: string; // Example field, replace with your schema fields
  last_name: string;
  age: number;
  country: string;
}

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const getTodos = async () => {
      try {
        const { data: students, error } = await supabaseClient.from('student_tbl').select();

        if (error) {
          console.error('Error fetching students:', error.message);
        } else if (students) {
          setStudents(students);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    getTodos();
  }, []);

  return (
    <MainCard title="Students Page">
      <Typography>List/Table of students enrolled in the program.</Typography>
      <Typography>Should include method to upload a spreadsheet</Typography>
      <Typography>Investigate integration with Google Docs to obtain data</Typography>
      <div>
        {students.map((student) => (
          <li key={student.id}>{student.first_name}</li>
        ))}
      </div>
    </MainCard>
  );
};

export default StudentsPage;
