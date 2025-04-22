-- Drop tables if they exist
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS admin CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Create tables
CREATE TABLE clients (
                         id SERIAL PRIMARY KEY NOT NULL,
                         firstName VARCHAR(255),
                         lastName VARCHAR(255),
                         contactNumber BIGINT,
                         email VARCHAR(255),
                         address VARCHAR(255),
                         username VARCHAR(255),
                         password VARCHAR(255)
);

CREATE TABLE admin (
                       id SERIAL PRIMARY KEY NOT NULL,
                       firstName VARCHAR(255),
                       lastName VARCHAR(255),
                       contactNumber BIGINT,
                       email VARCHAR(255),
                       address VARCHAR(255),
                       password VARCHAR(255),
                       username VARCHAR(255)
);

CREATE TABLE loans (
                       id SERIAL PRIMARY KEY NOT NULL,
                       client_id INT REFERENCES clients(id),
                       balance NUMERIC(12,2),
                       gross_loan NUMERIC(12,2),
                       amort NUMERIC(12,2),
                       terms INT,
                       date_released TIMESTAMP WITHOUT TIME ZONE,
                       maturity_date DATE,
                       type VARCHAR(255),
                       status VARCHAR(255)
);

CREATE TABLE payments (
                          id SERIAL PRIMARY KEY NOT NULL,
                          client_id INT REFERENCES clients(id),
                          loan_id INT REFERENCES loans(id),
                          amount NUMERIC(12,2),
                          new_balance NUMERIC(12,2),
                          collection_date TIMESTAMP WITHOUT TIME ZONE,
                          collected_by VARCHAR(255),
                          method VARCHAR(255)
);

-- Seed data
INSERT INTO admin (firstname, lastname, contactnumber, email, address, username, password)
VALUES ('Ken', 'Calvins', 712345678, 'ken@example.com', 'Nairobi, Kenya', 'admin', 'admin123');


INSERT INTO clients (firstname, lastname, contactnumber, email, address, username, password)
VALUES
    ('Elon', 'Musk', 444333, 'elonmusk@gmail.com', 'Boca Chica, Texas', 'notElonMusk', 'pass123'),
    ('Peter', 'Parker', 555666, 'peterparker@gmail.com', 'New York', 'notPeterParker', 'pass123'),
    ('Tony', 'Stark', 777888, 'tonystark@gmail.com', 'New York', 'notTonyStark', 'pass123'),
    ('Bruce', 'Banner', 999000, 'bruce@gmail.com', 'New York', 'notHulk', 'pass123'),
    ('Stephen', 'Strange', 111222, 'stephen@gmail.com', 'New York', 'notStrange', 'pass123');

-- Optional client update (now referencing valid ID = 1)
UPDATE clients
SET firstname = 'Ian Czar', lastname = 'Dino', contactNumber = 112233,
    address = 'Daraga Albay', email = 'ianczar@gmail.com',
    username = 'ian2', password = '12345'
WHERE id = 1
    RETURNING *;

-- Loan data for client_id = 1
INSERT INTO loans (client_id, balance, gross_loan, amort, terms, date_released, maturity_date, type, status)
VALUES (1, 5000, 5000, 2500, 1, '2023-02-04 05:30:01', '2023-03-04', 'Personal Loan', 'Pending');

-- Update the loan just inserted (id = 1)
UPDATE loans
SET type = 'Salary Loan', balance = 0, gross_loan = 5000, amort = 2500, terms = 1,
    date_released = '2023-02-04', maturity_date = '2023-03-04', status = 'Disbursed'
WHERE id = 1
    RETURNING *;

-- Insert payment for loan_id = 1
INSERT INTO payments (client_id, loan_id, amount, new_balance, collection_date, collected_by, method)
VALUES (1, 1, 5000, 0, '2023-03-04', 'admin', 'ATM');

-- Join example
SELECT * FROM clients INNER JOIN loans ON clients.id = loans.client_id;

-- View a specific client and their loan
SELECT *
FROM clients AS c
         LEFT JOIN loans AS l ON c.id = l.client_id
WHERE c.id = 1;
