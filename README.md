# pwa-cqupt
This is a simple(or newbie's >_<) progressive web application for students in Chongqing University of Posts and Telecommunications, for class schedule.There are many Chinese characters, and you may need google translate.

这是一个简单的PWA应用，重邮课表.
[在线预览](https://cqupt.heitaov.cn)

# Develop
1. Clone this repo.
2. Enter this project root folder & run  `npm install` in CLI
3. Run `gulp dep` in CLI, to solve dependent resources.
4. Run `npm start` to serve this poject at `localhost:3000`
5. Run `gulp watch` to watch `*.styl` in `stylus` folder, compiling them into `public/css`.(No matter what you want to use ,eg:`less` or `sass`, just compile them into `public/css`)

# Production Deploy
1. If you are using pm2, just run `pm2 start cykb` in CLI. You could modify environment's prameters in `cykb.json` file, such as `PORT`.
2. Otherwise, do it yourself.
