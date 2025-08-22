-- SQL Test Queries for Database Structure Check
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';