ALTER TABLE "Student"
  ALTER COLUMN "sessionYear" TYPE INTEGER
  USING ("sessionYear"::integer);
