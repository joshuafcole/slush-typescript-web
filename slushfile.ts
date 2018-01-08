import * as childProcess from "child_process";
import * as path from "path";
import * as gulp from "gulp";
import * as inquirer from "inquirer";
import template = require("gulp-template");
import conflict = require("gulp-conflict");
import install = require("gulp-install");
import filter = require("gulp-filter");

import {getPackage, getPackageAttribute, extend} from "./utils";
import {mergePackage} from "./merge-package";

gulp.task("default", function(done) {
  let pkg = getPackage();
  return inquirer.prompt([
    {type: "input", name: "name", message: "App name: ", default: getNameProposal(), when: !pkg},
    {type: "input", name: "description", message: "Description: ", default: "N/A", when: !pkg}
  ]).then((answers) => {

    return generateScaffold(`${__dirname}/templates/app/**`, extend(pkg, answers));
  });
});

gulp.task("api", function(done) {
  let pkg = getPackage();
  return inquirer.prompt([
    {type: "input", name: "name", message: "App name: ", default: getNameProposal(), when: !pkg},
    {type: "input", name: "description", message: "Description: ", default: "N/A", when: !pkg},
    {type: "input", name: "port", message: "Port: ", default: 3000},
    {type: "input", name: "host", message: "Host: ", default: "localhost"}
  ]).then((answers) => {
    return generateScaffold(`${__dirname}/templates/api/**`, extend(pkg, answers));
  });

  // gulp.src(__dirname + "/templates/api/**")
  //   .pipe(conflict("./"))
  //   .pipe(gulp.dest("./"))
  //   .on("end", () => {
  //     childProcess.exec("npm i hapi@16", (err) => {
  //       if(err) done(err);
  //       childProcess.exec("npm i --save-dev @types/hapi@16", (err) => done(err));
  //     });
  //   });
});

function getNameProposal() {
  return getPackageAttribute("name") || path.basename(process.cwd());
}

function generateScaffold(globs:string|string[], answers:object = {}) {
  let onlyPackage = filter(["**/package.json"], {restore: true});

  return gulp.src(globs)
    .pipe(template(answers, {
      escape: /<%-([\s\S]+?)%>/g,
      evaluate: /<%([\s\S]+?)%>/g,
      interpolate: /<%=([\s\S]+?)%>/g
    }))
    .pipe(onlyPackage)
    .pipe(mergePackage("./"))
    .pipe(onlyPackage.restore)
    .pipe(conflict("./"))
    .pipe(gulp.dest("./"))
    .pipe(install({"package.json": "npm"}));
}
