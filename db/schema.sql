-- Drop database if it exists, then create a new one
DROP DATABASE IF EXISTS company_db;
CREATE DATABASE company_db;

-- Connect to the new database
\c company_db;

-- Create 'department' table
CREATE TABLE department (
  id SERIAL PRIMARY KEY,
  name VARCHAR(30) UNIQUE NOT NULL
);

-- Create 'role' table with foreign key to 'department'
CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    title VARCHAR(30) UNIQUE NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INTEGER NOT NULL,
    FOREIGN KEY (department_id)
    REFERENCES department(id)
    ON DELETE SET NULL -- Setting department_id to NULL if the department is deleted
);

-- Create 'employee' table with foreign key references to 'role' and 'employee' (for manager)
CREATE TABLE employee (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INTEGER NOT NULL,
    manager_id INTEGER,
    FOREIGN KEY (role_id) 
    REFERENCES role(id)
    ON DELETE SET NULL, -- Setting role_id to NULL if the role is deleted
    FOREIGN KEY (manager_id) 
    REFERENCES employee(id)
    ON DELETE SET NULL -- Setting manager_id to NULL if the manager is deleted
);
