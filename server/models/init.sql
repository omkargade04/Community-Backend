CREATE TABLE members (
    id BIGINT PRIMARY KEY,
	community_id BIGINT,
	user_id BIGINT,
	role_id BIGINT,
    created_at TIMESTAMP
);

CREATE TABLE communities (
    id BIGINT PRIMARY KEY,
	name VARCHAR(128) NOT NULL,
	slug VARCHAR(255),
    owner_id BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE roles (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    scope VARCHAR(255)[],
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
	password VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE user_token (
    id BIGINT PRIMARY KEY,
    token VARCHAR NOT NULL,
    fk_user BIGINT NOT NULL,
    created_at TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY(fk_user) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE admins (
    id BIGINT PRIMARY KEY,
    username VARCHAR NOT NULL UNIQUE,
    password VARCHAR NOT NULL
);

CREATE TABLE admin_token (
    id BIGINT PRIMARY KEY,
    token VARCHAR NOT NULL,
    fk_admin BIGINT NOT NULL,
    created_at TIMESTAMP,
    CONSTRAINT fk_admin FOREIGN KEY(fk_admin) REFERENCES admins(id) ON DELETE CASCADE ON UPDATE CASCADE
);