-- Create the table
CREATE TABLE test_table (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Drop the table if it exists
DROP TABLE IF EXISTS test_table;