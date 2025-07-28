-- Insert sample data for leave management system

-- Insert leave types
INSERT INTO leave_types (name, code, annual_allocation, carry_forward_allowed, max_carry_forward, requires_medical_certificate, min_advance_days) VALUES
('Annual Leave', 'AL', 21, TRUE, 5, FALSE, 3),
('Sick Leave', 'SL', 12, FALSE, 0, TRUE, 0),
('Casual Leave', 'CL', 12, FALSE, 0, FALSE, 1),
('Maternity Leave', 'ML', 180, FALSE, 0, TRUE, 30),
('Paternity Leave', 'PL', 15, FALSE, 0, FALSE, 7),
('Bereavement Leave', 'BL', 5, FALSE, 0, FALSE, 0),
('Emergency Leave', 'EL', 3, FALSE, 0, FALSE, 0);

-- Insert sample employees
INSERT INTO employees (id, name, email, role, department, manager_id, join_date) VALUES
('EMP001', 'John Doe', 'john.doe@company.com', 'Software Engineer', 'Engineering', 'MGR001', '2022-01-15'),
('MGR001', 'Jane Smith', 'jane.smith@company.com', 'Engineering Manager', 'Engineering', 'DIR001', '2020-03-10'),
('DIR001', 'Robert Johnson', 'robert.johnson@company.com', 'Engineering Director', 'Engineering', NULL, '2018-06-01'),
('EMP002', 'Alice Brown', 'alice.brown@company.com', 'HR Executive', 'Human Resources', 'MGR002', '2021-08-20'),
('MGR002', 'Sarah Wilson', 'sarah.wilson@company.com', 'HR Manager', 'Human Resources', 'DIR001', '2019-11-15');

-- Insert leave balances for current year (2024)
INSERT INTO employee_leave_balances (employee_id, leave_type_id, year, allocated_days, used_days, pending_days) VALUES
-- John Doe (EMP001)
('EMP001', 1, 2024, 21, 3, 0), -- Annual Leave: 21 allocated, 3 used, 18 remaining
('EMP001', 2, 2024, 12, 0, 0), -- Sick Leave: 12 allocated, 0 used, 12 remaining
('EMP001', 3, 2024, 12, 4, 0), -- Casual Leave: 12 allocated, 4 used, 8 remaining
('EMP001', 5, 2024, 15, 10, 0), -- Paternity Leave: 15 allocated, 10 used, 5 remaining

-- Jane Smith (MGR001)
('MGR001', 1, 2024, 21, 8, 2), -- Annual Leave: 21 allocated, 8 used, 2 pending, 11 remaining
('MGR001', 2, 2024, 12, 3, 0), -- Sick Leave: 12 allocated, 3 used, 9 remaining
('MGR001', 3, 2024, 12, 6, 0), -- Casual Leave: 12 allocated, 6 used, 6 remaining

-- Alice Brown (EMP002)
('EMP002', 1, 2024, 21, 5, 3), -- Annual Leave: 21 allocated, 5 used, 3 pending, 13 remaining
('EMP002', 2, 2024, 12, 2, 0), -- Sick Leave: 12 allocated, 2 used, 10 remaining
('EMP002', 3, 2024, 12, 1, 0); -- Casual Leave: 12 allocated, 1 used, 11 remaining

-- Insert sample company holidays for 2024
INSERT INTO company_holidays (name, date, is_optional, description) VALUES
('New Year Day', '2024-01-01', FALSE, 'New Year celebration'),
('Republic Day', '2024-01-26', FALSE, 'Indian Republic Day'),
('Holi', '2024-03-08', TRUE, 'Festival of Colors'),
('Good Friday', '2024-03-29', TRUE, 'Christian holiday'),
('Independence Day', '2024-08-15', FALSE, 'Indian Independence Day'),
('Gandhi Jayanti', '2024-10-02', FALSE, 'Mahatma Gandhi Birthday'),
('Diwali', '2024-11-01', TRUE, 'Festival of Lights'),
('Christmas', '2024-12-25', FALSE, 'Christmas Day');

-- Insert sample leave applications
INSERT INTO leave_applications (employee_id, leave_type_id, start_date, end_date, total_days, reason, status, applied_date, approved_by, approved_date) VALUES
('EMP001', 1, '2024-12-23', '2024-12-27', 3, 'Christmas vacation with family', 'approved', '2024-12-01 10:30:00', 'MGR001', '2024-12-02 14:15:00'),
('EMP001', 3, '2024-11-15', '2024-11-15', 1, 'Personal work', 'approved', '2024-11-12 09:45:00', 'MGR001', '2024-11-12 16:20:00'),
('EMP002', 1, '2024-12-30', '2025-01-03', 3, 'New Year break', 'pending', '2024-12-15 11:20:00', NULL, NULL),
('MGR001', 2, '2024-11-20', '2024-11-22', 3, 'Flu and fever', 'approved', '2024-11-19 08:30:00', 'DIR001', '2024-11-19 09:15:00');

-- Insert workflow entries for the applications
INSERT INTO leave_application_workflow (application_id, action, performed_by, comments) VALUES
(1, 'submitted', 'EMP001', 'Leave application submitted'),
(1, 'approved', 'MGR001', 'Approved for Christmas vacation'),
(2, 'submitted', 'EMP001', 'Leave application submitted'),
(2, 'approved', 'MGR001', 'Approved for personal work'),
(3, 'submitted', 'EMP002', 'Leave application submitted'),
(4, 'submitted', 'MGR001', 'Leave application submitted'),
(4, 'approved', 'DIR001', 'Approved for sick leave');

-- Insert sample attendance records
INSERT INTO attendance (employee_id, date, check_in_time, check_out_time, total_hours, status) VALUES
('EMP001', '2024-12-16', '09:15:00', '18:30:00', 8.25, 'present'),
('EMP001', '2024-12-17', '09:00:00', '18:15:00', 8.25, 'present'),
('EMP001', '2024-12-18', '09:30:00', '18:45:00', 8.25, 'present'),
('EMP002', '2024-12-16', '09:45:00', '18:00:  '2024-12-18', '09:30:00', '18:45:00', 8.25, 'present'),
('EMP002', '2024-12-16', '09:45:00', '18:00:00', 8.25, 'present'),
('EMP002', '2024-12-17', '10:00:00', '18:30:00', 8.5, 'present'),
('EMP002', '2024-12-18', '09:15:00', '17:45:00', 8.5, 'present'),
('MGR001', '2024-12-16', '08:45:00', '17:30:00', 8.75, 'present'),
('MGR001', '2024-12-17', '09:00:00', '18:00:00', 9.0, 'present'),
('MGR001', '2024-12-18', '08:30:00', '17:15:00', 8.75, 'present');
