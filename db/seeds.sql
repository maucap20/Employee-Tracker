INSERT INTO department (name)
VALUES ('Dep A'),
       ('Dep B'),
       ('Dep C');


INSERT INTO role (title, salary, department_id)
VALUES ('Role1', 10000, 1),
        ('Role2', 20000, 2),
        ('Role3', 30000, 3),
        ('Role4', 40000, 3);

            
       
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Adam', 'Mauch', 1, NULL),
        ('John', 'Smith', 1, 1),
        ('Danny', 'Money', 2, 1),
        ('Luke', 'Skywalker', 2, NULL),
        ('Jane', 'Doe', 3,3);