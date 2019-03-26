# Auth

Auth is a Node JS template for authenticating users.

## MYSQL

```bash
docker run --name mysql -v /Users/owenschwartz/Desktop/mysql:/var/lib/mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.6
```

```mysql
docker exec -it mysql bash

create database users;

use users;

create table google (google_id varchar(50), name varchar(50), user_id varchar(100));

create table data1 (text varchar(50), textarea MEDIUMTEXT, dropdown varchar(20), user_id varchar(100));

SELECT 
    *
FROM
    data1
INTO OUTFILE '/var/lib/mysql-files/data.csv'
FIELDS ENCLOSED BY '"'
TERMINATED BY ';'
ESCAPED BY '"'
LINES TERMINATED BY '\r\n';
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.
