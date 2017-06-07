# Intro
This is a progressive web application for students in Chongqing University of Posts and Telecommunications, for class schedules.

这是一个简单的PWA应用，重邮课表.
[在线预览](https://cqupt.heitaov.cn)

This project now contains browser-side code and server-side code, considering to separate this repo to two.

# Folders && Files
```
app.js  -- server-side, Express app.js
classtools/  -- server-side, Express api dependency
index.html   -- browser-side, site index page
node_modules/
README.md
static/     --  browser-side, for static files,
bin/        --  server-side, launch the Express
config/     --  browser-side, webpack config
LICENSE
package.json
routes/    -- server-side, Express route
build/     --  browser-side, webpack config
cykb.json   -- server-side, pm2 config
manifest.json  -- browser-side, make browser to take your web page as a application
public/      -- server-side, browser-side builded folder
src/       -- browser-side, the vue source code
views/    -- server-side, the Express views
```
# Bug report
Just open an issue.

# Develop

1. Clone this repo.
2. Change path to this project root folder & run `npm install` in CLI.
3. Run `npm run dev` , wirte your code .
4. Run `npm run build` to build this app to public folder.
5. Run `npm run start` to serer public serve this poject at `localhost:3000`.

# Production Deploy

1. Run `npm run build` to generate dist files at `public` folder.
2. If you are using pm2, just run `pm2 start cykb` in CLI. You could modify environment's prameters in `cykb.json` file, such as `PORT`.
3. Otherwise, do it yourself.

# Contact ME

(Email)[mailto:mr.taokai@foxmail.com]
