ALTER TABLE Student RENAME TO Student_legacy;

CREATE TABLE Student ( -- TODO: add UUID here and check.
    id INTEGER PRIMARY KEY,
    email VARCHAR(255) UNIQUE, -- Assuming emails are unique
    country VARCHAR(255),
    time_zone VARCHAR(255)
);