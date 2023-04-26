docker run --name mysql -p 3308:3306 -e MYSQL_ROOT_PASSWORD=khoikhoi -d mysql
npx prisma migrate dev --name init
