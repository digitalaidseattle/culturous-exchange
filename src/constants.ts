import { StudentField } from "./api/types";

const TIME_SLOTS: string[] = [
  "Friday morning (7am-12pm)",
  "Friday afternoon (12pm-5pm)",
  "Friday evening (5pm-10pm)",
  "Saturday morning (7am-12pm)",
  "Saturday afternoon (12pm-5pm)",
  "Saturday evening (5pm-10pm)",
  "Sunday morning (7am-12pm)",
  "Sunday afternoon (12pm-5pm)",
  "Sunday evening (5pm-10pm)",
  "All options work for me"
]

const STUDENT_FIELD: StudentField[] = [
  { key: 'name', label: 'Full Name', type: 'string', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'age', label: 'Age', type: 'number', required: true },
  { key: 'gender', label: 'Gender', type: 'string', required: true },
  { key: 'country', label: 'Country', type: 'string', required: true },
];

const GENDER_OPTION = ['female', 'male', 'other']



export { TIME_SLOTS, STUDENT_FIELD, GENDER_OPTION }