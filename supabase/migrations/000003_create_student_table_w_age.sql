-- Drop the table if it already exists
DROP TABLE IF EXISTS student_tbl;

-- Create the table with the updated schema
CREATE TABLE student_tbl (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    age INT NOT NULL,
    email TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    country TEXT NOT NULL,
    availabilities JSONB DEFAULT '[]' -- Storing availabilities as a JSON array
);

-- Insert the first student
INSERT INTO student_tbl (first_name, last_name, age, email, city, state, country, availabilities)
VALUES ('Student', '1', 17, 's1@gmail.com', 'Seattle', 'Washington', 'US', '[]');

-- Insert the second student
INSERT INTO student_tbl (first_name, last_name, age, email, city, state, country, availabilities)
VALUES ('Student', '1', 15, 's2@gmail.com', 'Essen', '', 'Germany', '[]');
