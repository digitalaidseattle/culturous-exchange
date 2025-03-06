DROP TABLE IF EXISTS Selection;
DROP TABLE IF EXISTS TimeWindow;
DROP TABLE IF EXISTS Placement;
DROP TABLE IF EXISTS Enrollment;
DROP TABLE IF EXISTS GroupTable;  -- Double quotes needed because 'Group' is a reserved word
DROP TABLE IF EXISTS Plan;
DROP TABLE IF EXISTS Cohort;
-- DROP TABLE IF EXISTS Student;  

-- Cohort Table
CREATE TABLE Cohort (
    id INTEGER PRIMARY KEY,  -- Assuming integer ID, adjust as needed (e.g., UUID)
    name VARCHAR(255) NOT NULL -- Adjust length as needed
);

-- Plan Table
CREATE TABLE Plan (
    id INTEGER PRIMARY KEY,
    cohort_id INTEGER REFERENCES Cohort(id), -- Foreign key referencing Cohort
    name VARCHAR(255) NOT NULL,
    note TEXT -- For longer text descriptions
);

-- Enrollment Table
CREATE TABLE Enrollment (
    cohort_id INTEGER REFERENCES Cohort(id),
    student_id INTEGER REFERENCES Student(id), -- Assuming Student table exists (see below)
    PRIMARY KEY (cohort_id, student_id) -- Composite key to prevent duplicate enrollments
);

-- Placement Table
CREATE TABLE Placement (
    plan_id INTEGER REFERENCES Plan(id),
    student_id INTEGER REFERENCES Student(id),
    anchor BOOLEAN, -- Or appropriate data type for boolean (e.g., TINYINT in MySQL)
    priority INTEGER,
    PRIMARY KEY (plan_id, student_id) -- Composite key for uniqueness
);

-- Student Table (will tackle in next script)
-- CREATE TABLE Student (
--     id INTEGER PRIMARY KEY,
--     email VARCHAR(255) UNIQUE, -- Assuming emails are unique
--     country VARCHAR(255),
--     time_zone VARCHAR(255)
-- );



-- Group Table (Renamed to GroupTable to avoid potential conflicts with SQL keywords)
CREATE TABLE GroupTable (
    id INTEGER PRIMARY KEY,
    plan_id INTEGER REFERENCES Plan(id),
    country_count INTEGER,
    overlap BOOLEAN -- Or appropriate type
);

-- Time_Window Table
CREATE TABLE TimeWindow (
    id INTEGER PRIMARY KEY,
    student_id SERIAL REFERENCES Student(id),
    group_id INTEGER REFERENCES GroupTable(id), -- Assuming GroupTable exists (see below)
    day_in_week VARCHAR(255), -- Or an ENUM if your database supports it
    start_t TIME, -- Or DATETIME if you need date as well
    end_t TIME  -- Or DATETIME
);

-- Selection Table 
CREATE TABLE Selection (
    group_id INTEGER REFERENCES GroupTable(id),
    student_id INTEGER REFERENCES Student(id),
    PRIMARY KEY (group_id, student_id) -- Composite key
);