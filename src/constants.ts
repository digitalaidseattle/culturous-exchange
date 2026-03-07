
const GENDER_OPTION = ['Female', 'Male', 'Other']

export { GENDER_OPTION };

export const UI_STRINGS = {
  // Buttons & actions
  OPEN: 'Open',
  REMOVE: 'Remove...',
  CANCEL: 'Cancel',
  SUBMIT: 'Submit',
  DUPLICATE: 'Duplicate',
  DELETE_WITH_ELLIPSIS: 'Delete...',
  NEW: 'New',
  EDIT: 'Edit',
  NEW_PLAN: 'New Plan',
  ADD_STUDENT: 'Add Student',
  REMOVE_STUDENT: 'Remove student',
  UPLOAD: 'Upload',
  UPLOAD_STUDENT: 'Upload Student',
  CLOSE: 'Close',
  ADD_FACILITATOR: 'Add Facilitator',
  CHANGE_FACILITATOR: 'Change Facilitator',
  REMOVE_FACILITATOR: 'Remove Facilitator',

  // Generic labels
  SETTINGS: 'Settings',
  GROUP_SIZE: 'Group Size:',
  COUNTRIES: 'Countries: ',
  DURATION: 'Duration (hr): ',
  NOT_AVAILABLE: 'N/A',
  TIME_WINDOWS: 'Time Windows',
  CURRENT_COHORT: 'Current Cohort:',
  STUDENTS_LABEL: 'Students',
  STUDENTS_WITH_COLON: 'Students :',
  PLANS_LABEL: 'Plans',
  PLANS_WITH_COLON: 'Plans :',
  NOTES_LABEL: 'Notes',
  NOTES_WITH_COLON: 'Notes :',
  GROUPS_LABEL: 'Groups',
  GROUPS_WITH_COLON: 'Groups :',
  GROUP: 'Group',
  NAME: 'Name',
  FULL_NAME: 'Full Name',
  EMAIL: 'Email',
  CITY: 'City',
  COUNTRY: 'Country',
  AGE: 'Age',
  GENDER: 'Gender',
  TIME_SLOTS: 'Time Slot(s)',
  TIME_ZONES: 'Time Zones',
  COHORTS: 'Cohorts',
  ANCHOR: 'Anchor',
  AVAILABILITIES: 'Availabilities',
  TIME_ZONE: 'Time Zone',
  TIME_SLOTS_LABEL: 'Time Slots',
  NOT_ASSIGNED_COHORT: 'Not assigned to any cohort',
  DETAILS: 'Details',
  FACILITATORS_PAGE_TITLE: 'Facilitators',
  STUDENTS_PAGE_TITLE: 'Students',
  STUDENT_PAGE_TITLE: 'Student Page',
  STUDENTS_ATTENTION: 'Profiles that require attention:',
  DELETE_SELECTED_STUDENTS_CONFIRM: 'Delete selected students?',
  ARE_YOU_SURE_DELETE_STUDENT: 'Are you sure you want to delete this student?',
  LOCAL_TIME: 'Local Time',
  STUDENT_TIME: 'Student Time',

  // Tooltips
  EXPORT_PLAN: 'Export plan',
  TOGGLE_GROUP_DETAILS: 'Toggle group details',
  TOGGLE_STUDENT_DETAILS: 'Toggle student details',
  SHOW_PLAN_SETTINGS: 'Show plan settings',

  // Breadcrumbs & navigation
  HOME: 'Home',
  COHORT_PREFIX: 'Cohort:',
  PLAN_PREFIX: 'Plan:',

  // Notifications & messages
  PLAN_DELETED: 'Plan deleted.',
  PLAN_UPDATED: 'Plan updated.',
  PLAN_EXPORT_FAILED: 'Plan export failed',
  STUDENTS_ADDED: 'Students added.',
  ERROR_ADDING_STUDENTS: 'Error adding students.',
  STUDENTS_REMOVED: 'Students removed.',
  FAILED_UPDATE_ANCHOR: 'Failed to update student anchor status',
  UNABLE_TO_CREATE_COHORT: 'Unable to create new cohort',
  CANNOT_MOVE_FACILITATOR_TO_WAITLIST: 'Cannot move facilitator to waitlist',
  CANNOT_MOVE_STUDENT_TO_FACILITATORS: 'Cannot move student to facilitators',

  // File uploader & lists
  DRAG_STUDENT_FILE: 'Drag the upload file here, or click to select the file',
  NAME_FIELD: 'Name:',
  ERROR: 'Error:',
  CURRENT_TIME_SLOT_SELECTIONS: 'Current Time Slot Selections',
  NONE: 'none',
  NOT_ASSIGNED: 'not assigned',
  AVAILABILITY: 'Availability',
  NAME_AT_LEAST: 'Name must be at least',
  CHARACTERS: 'characters',
  INVALID_EMAIL_FORMAT: 'Invalid email format',
  CITY_REQUIRED: 'City is required',
  STUDENT_AGE_REQUIRED: 'Student age is required.',
  AGE_MUST_BETWEEN_PREFIX: 'Age must between',
  COUNTRY_REQUIRED: 'Country is required',
  TIME_WINDOW_REQUIRED: 'A time window is required.',
  DAY_OF_WEEK_MUST_BE: 'Day of week must be "Friday", "Saturday", or "Sunday"',
  START_TIME_INVALID: 'Start time invalid',
  END_TIME_INVALID: 'End time invalid',
  TIMEZONE_REQUIRED: 'A time zone is required.',

  // Facilitators labels and related text
  FACILITATORS: 'Facilitators',

  // Waitlist labels and related text
  WAITLIST: 'Waitlist',
  WAITLISTED: 'Waitlisted',

  // Application branding
  APP_NAME: 'Culturous Exchange',

  // Misc labels and messages not previously centralised
  GROUP_SIZE_LABEL: 'Group size',
  GROUP_PLACEMENTS_SHEET: 'Group Placements',
  GROUP_TIMES: 'Group Times',
  GROUP_TIMES_PST: 'Group Times (PST)',
  GROUP_TIMES_STUDENT_TZ: 'Group Times (Student TZ)',
  STUDENT_TIMES: 'Student Times',
  TIME_ZONE_SELECTION: 'Time zone selection',
  ALL_OPTIONS_WORK: 'All options work for me',

  // Confirmation and deletion messages used across pages
  CANNOT_DELETE_STUDENT_PREFIX: 'Cannot delete student',
  CANNOT_DELETE_STUDENT_SUFFIX: 'as they are enrolled in cohorts.',
  CONFIRM_DELETE_STUDENT_PREFIX: 'Are you sure you want to delete student',
  DELETION_SUCCESS_PREFIX: 'Student',
  DELETION_SUCCESS_SUFFIX: 'deleted successfully',
  DELETION_FAILED_PREFIX: 'Deletion failed:',
  UNEXPECTED_ERROR_PREFIX: 'Unexpected Error:',
  UNEXPECTED_ERROR_GENERIC: 'Unexpected error:',
} as const;

export const SERVICE_ERRORS = {
  ERROR_UPDATING_ENTITY: 'Error updating entity:',
  FAILED_UPDATE_ENTITY: 'Failed to update entity',
  ERROR_INSERTING_ENTITY: 'Error inserting entity:',
  FAILED_INSERT_ENTITY: 'Failed to insert entity',
  FAILED_INSERT_ENTITY_PREFIX: 'Failed to insert entity: ',
  ERROR_DELETING_ENTITY: 'Error deleting entity:',
  FAILED_DELETE_ENTITY: 'Failed to delete entity',
  UNEXPECTED_ERROR_UPDATE: 'Unexpected error during update:',
  UNEXPECTED_ERROR_DELETION: 'Unexpected error during deletion:',
  UNEXPECTED_ERROR_INSERTION: 'Unexpected error during insertion:',
  UNEXPECTED_ERROR_SELECT: 'Unexpected error during select:',
  UNEXPECTED_TIME_WINDOW_INTERSECTION: 'Unexpected time window intersection:',
  ERROR_TOGGLING_ANCHOR: 'Error toggling anchor:',
  ERROR_PARSING_EXCEL_FILE: 'Error parsing Excel file:',
  FAILED_PARSE_EXCEL_FILE: 'Failed to parse Excel file',
  ERROR_PROCESSING_EXCEL_FILE: 'Error processing Excel file:',
  FAILED_INSERT_STUDENTS_FROM_EXCEL_FILE: 'Failed to insert students from Excel file'
} as const;


// Maximum number of students per group when generating plans
export const MAX_GROUP_SIZE = 10;

// Offset between UTC and Pacific Standard Time used when exporting plans
export const PST_OFFSET = 8;

// Minimum lengths for student attributes
export const MIN_NAME_LENGTH = 4;
export const MIN_CITY_LENGTH = 1;
export const MIN_COUNTRY_LENGTH = 1;

// Minimum and maximum allowable ages for students
export const MIN_STUDENT_AGE = 13;
export const MAX_STUDENT_AGE = 19;

// Identifier used to denote the waitlist group in the plan timeline
export const WAITLIST_ID = 'WAITLIST';
// Identifier used to denote the waitlist group in the plan timeline
export const FACILITATOR_ID = 'FACILITATOR';

// Start and end hour for the plan timeline (inclusive)
export const STARTING_HOUR = 7;
export const ENDING_HOUR = 22;

// Pre-computed array of office hours used by the plan timeline for rendering slots
export const OFFICE_HOURS = Array.from({ length: ENDING_HOUR - STARTING_HOUR + 1 }, (_, i) => STARTING_HOUR + i);

// Default number of rows per page in tables
export const DEFAULT_TABLE_PAGE_SIZE = 25;
