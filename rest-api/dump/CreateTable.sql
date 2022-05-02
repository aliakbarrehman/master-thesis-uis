CREATE DATABASE thesis;

USE thesis;

CREATE USER rest_sa IDENTIFIED BY 'rest_sa_pwd';  

CREATE TABLE key_mappings (
  id varchar(255) not null,
  crypto_key varchar(255) not null,
  iv varchar(255) not null
);

GRANT ALL PRIVILEGES ON thesis.* TO 'rest_sa'@'%';