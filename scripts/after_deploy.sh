REPOSITORY=/home/ubuntu/Omo-Web-Server

cd $REPOSITORY

sudo npm install -g yarn
sudo yarn install
sudo npx prisma migrate deploy
yarn start