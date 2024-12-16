-- Create the table
CREATE TABLE student_tbl (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL, 
    age INT NOT NULL,
    country TEXT NOT NULL
);

-- Insert a row of dummy data
INSERT INTO student_tbl (first_name, last_name, age, country)
VALUES ('John', 'Doe', 20, 'USA');
