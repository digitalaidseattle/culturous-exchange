-- Moving out of migration, because it is not properly tested
ALTER TABLE student ADD CONSTRAINT unique_email UNIQUE (email)