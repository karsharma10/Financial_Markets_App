DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

INSERT INTO users (firstName, lastName, email, password) VALUES ('John', 'Doe', 'johnDoe@gmail.com', '123');
INSERT INTO users (firstName, lastName, email, password) VALUES ('Jerry', 'John', 'jerryjohn', '123');