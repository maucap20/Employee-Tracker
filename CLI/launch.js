// Dependencies
const inquirer = require("inquirer");
const { Pool } = require("pg");

// Action list
const ACTIONS = {
  VIEW_DEPARTMENTS: 1,
  VIEW_ROLES: 2,
  VIEW_EMPLOYEES: 3,
  ADD_DEPARTMENT: 4,
  ADD_ROLE: 5,
  ADD_EMPLOYEE: 6,
  UPDATE_EMPLOYEE_ROLE: 7,
  UPDATE_EMPLOYEE_MANAGER: 8,
  VIEW_BUDGET: 9,
  EXIT: 10,
};

// Prompt to ask questions.
const actionPrompt = [
  {
    type: "list",
    name: "action",
    message: "What action would you like to perform?",
    choices: [
      { name: "View all departments", value: ACTIONS.VIEW_DEPARTMENTS },
      { name: "View all roles", value: ACTIONS.VIEW_ROLES },
      { name: "View all employees", value: ACTIONS.VIEW_EMPLOYEES },
      { name: "Add a department", value: ACTIONS.ADD_DEPARTMENT },
      { name: "Add a role", value: ACTIONS.ADD_ROLE },
      { name: "Add an employee", value: ACTIONS.ADD_EMPLOYEE },
      { name: "Update an employee role", value: ACTIONS.UPDATE_EMPLOYEE_ROLE },
      {
        name: "Update an employee manager",
        value: ACTIONS.UPDATE_EMPLOYEE_MANAGER,
      },
      {
        name: "View the total utilized budget of a department",
        value: ACTIONS.VIEW_BUDGET,
      },
      { name: "Exit", value: ACTIONS.EXIT },
    ],
  },
];

// Pool to connect to the database
const pool = new Pool(
  {
    user: "postgres",
    password: "Password0",
    host: "localhost",
    database: "company_db",
  },
  console.log(`Connected to the company_db database.`)
);

// Single-time call prompt
function callPrompt() {
  return new Promise((resolve, reject) => {
    inquirer
      .prompt(actionPrompt)
      .then(async (answers) => {
        switch (answers.action) {
          case ACTIONS.EXIT:
            resolve(false); // Return false if user selects EXIT
            break;
          case ACTIONS.VIEW_DEPARTMENTS:
            await showDepartments();
            resolve(true);
            break;
          case ACTIONS.VIEW_ROLES:
            await viewRoles();
            resolve(true);
            break;
          case ACTIONS.VIEW_EMPLOYEES:
            await viewEmployees();
            resolve(true);
            break;
          case ACTIONS.ADD_DEPARTMENT:
            await addDepartment();
            resolve(true);
            break;
          case ACTIONS.ADD_ROLE:
            await addRole();
            resolve(true);
            break;
          case ACTIONS.ADD_EMPLOYEE:
            await addEmployee();
            resolve(true);
            break;
          case ACTIONS.UPDATE_EMPLOYEE_ROLE:
            await updateEmployeeRole();
            resolve(true);
            break;
          case ACTIONS.UPDATE_EMPLOYEE_MANAGER:
            await updateEmployeeManager();
            resolve(true);
            break;
          case ACTIONS.VIEW_BUDGET:
            await viewBudget();
            resolve(true);
            break;
          default:
            resolve(true);
            break;
        }
      })
      .catch((error) => {
        reject(error); // Reject with error if prompt fails
      });
  });
}

// View departments
async function showDepartments() {
  try {
    const query = await pool.query(
      "SELECT department.id, department.name FROM department"
    );
    console.table(query.rows);
  } catch (error) {
    console.error("Error fetching departments:", error);
  }
}

// View roles
async function viewRoles() {
  try {
    const query = await pool.query(`
            SELECT role.id, role.title, role.salary, department.name AS department 
            FROM role 
            JOIN department ON role.department_id = department.id`);
    console.table(query.rows);
  } catch (error) {
    console.error("Error fetching roles:", error);
  }
}

// View employees
async function viewEmployees() {
  try {
    const query = await pool.query(`
            SELECT employee.id, employee.first_name, employee.last_name, role.title, 
            department.name AS department, role.salary, 
            CONCAT(manager.first_name ,' ', manager.last_name) AS manager 
            FROM employee 
            JOIN role ON employee.role_id = role.id 
            JOIN department ON role.department_id = department.id 
            LEFT JOIN employee manager ON employee.manager_id = manager.id`);
    console.table(query.rows);
  } catch (error) {
    console.error("Error fetching employees:", error);
  }
}

// Add department
async function addDepartment() {
  try {
    const department = await inquirer.prompt([
      { type: "input", name: "name", message: "Enter department name" },
    ]);
    await pool.query("INSERT INTO department (name) VALUES ($1)", [
      department.name,
    ]);
    console.log("Department added successfully.");
  } catch (error) {
    console.error("Error adding department:", error);
  }
}

// Add role
async function addRole() {
  try {
    const departments = await pool.query("SELECT * FROM department");
    const role = await inquirer.prompt([
      { type: "input", name: "title", message: "Enter role title" },
      { type: "input", name: "salary", message: "Enter role salary" },
      {
        type: "list",
        name: "department",
        message: "Select role department",
        choices: departments.rows.map((department) => department.name),
      },
    ]);
    const depQuery = await pool.query(
      "SELECT id FROM department WHERE name = $1",
      [role.department]
    );
    const depId = depQuery.rows[0].id;
    await pool.query(
      `INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)`,
      [role.title, role.salary, depId]
    );
    console.log("Role added successfully.");
  } catch (error) {
    console.error("Error adding role:", error);
  }
}

// Add employee
async function addEmployee() {
  try {
    const roles = await pool.query("SELECT * FROM role");
    const managers = await pool.query("SELECT * FROM employee");
    const employee = await inquirer.prompt([
      {
        type: "input",
        name: "first_name",
        message: "Enter employee first name",
      },
      { type: "input", name: "last_name", message: "Enter employee last name" },
      {
        type: "list",
        name: "role",
        message: "Select employee role",
        choices: roles.rows.map((role) => ({
          name: role.title,
          value: role.id,
        })),
      },
      {
        type: "list",
        name: "manager",
        message: "Select employee manager",
        choices: [
          { name: "No Manager", value: null },
          ...managers.rows.map((employee) => ({
            name: employee.last_name + " " + employee.first_name,
            value: employee.id,
          })),
        ],
      },
    ]);
    await pool.query(
      `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)`,
      [employee.first_name, employee.last_name, employee.role, employee.manager]
    );
    console.log("Employee added successfully.");
  } catch (error) {
    console.error("Error adding employee:", error);
  }
}

// Update employee role
async function updateEmployeeRole() {
  try {
    const targetEmployee = await pool.query("SELECT * FROM employee");
    const roleList = await pool.query("SELECT * FROM role");

    const rolePrompt = await inquirer.prompt([
      {
        type: "list",
        name: "employee",
        message: "Select employee to change",
        choices: targetEmployee.rows.map((employee) => ({
          name: employee.last_name + " " + employee.first_name,
          value: employee.id,
        })),
      },
      {
        type: "list",
        name: "role",
        message: "Select updated role",
        choices: roleList.rows.map((role) => ({
          name: role.title,
          value: role.id,
        })),
      },
    ]);

    await pool.query(`UPDATE employee SET role_id = $1 WHERE id = $2`, [
      rolePrompt.role,
      rolePrompt.employee,
    ]);
    console.log("Employee role updated successfully.");
  } catch (error) {
    console.error("Error updating employee role:", error);
  }
}

// Update employee manager
async function updateEmployeeManager() {
  try {
    const targetEmployee = await pool.query("SELECT * FROM employee");
    const managerList = await pool.query("SELECT * FROM employee");

    const managerPrompt = await inquirer.prompt([
      {
        type: "list",
        name: "employee",
        message: "Select employee to change",
        choices: targetEmployee.rows.map((employee) => ({
          name: employee.last_name + " " + employee.first_name,
          value: employee.id,
        })),
      },
      {
        type: "list",
        name: "manager",
        message: "Select updated manager",
        choices: [
          { name: "No Manager", value: null },
          ...managerList.rows.map((employee) => ({
            name: employee.last_name + " " + employee.first_name,
            value: employee.id,
          })),
        ],
      },
    ]);

    if (managerPrompt.employee === managerPrompt.manager) {
      console.log("An employee cannot be their own manager.");
      return;
    }

    await pool.query(`UPDATE employee SET manager_id = $1 WHERE id = $2`, [
      managerPrompt.manager,
      managerPrompt.employee,
    ]);
    console.log("Employee manager updated successfully.");
  } catch (error) {
    console.error("Error updating employee manager:", error);
  }
}

// View total utilized budget
async function viewBudget() {
  try {
    const departments = await pool.query("SELECT * FROM department");
    const departmentPrompt = await inquirer.prompt([
      {
        type: "list",
        name: "department_id",
        message: "Select the department",
        choices: departments.rows.map((department) => ({
          name: department.name,
          value: department.id,
        })),
      },
    ]);

    const query = await pool.query(
      `
            SELECT SUM(role.salary) AS total_salary
            FROM employee
            JOIN role ON employee.role_id = role.id
            JOIN department ON role.department_id = department.id
            WHERE department.id = $1`,
      [departmentPrompt.department_id]
    );

    console.table(query.rows);
  } catch (error) {
    console.error("Error viewing budget:", error);
  }
}

// Init function
async function init() {
  try {
    await pool.connect();

    let iterate = true;
    while (iterate) {
      iterate = await callPrompt();
    }

    await pool.end(); // Close connection pool before exiting
    console.log("Connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing the application:", error);
    await pool.end();
    process.exit(1);
  }
}

module.exports = { init };
