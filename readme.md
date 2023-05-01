docker run --name mysql -p 3308:3306 -e MYSQL_ROOT_PASSWORD=khoikhoi -d mysql
npx prisma migrate dev --name init

update
-add relation "Attachment" in schema at 66 and 36

-add relation "recipient" in schema at 19 and 53
