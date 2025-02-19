CREATE DATABASE optiplus_internal_db;
CREATE USER 'optiplus_user'@'localhost' IDENTIFIED BY 'kali';
GRANT ALL PRIVILEGES ON optiplus_internal_db.* TO 'optiplus_user'@'localhost';
FLUSH PRIVILEGES;