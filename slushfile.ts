import * as childProcess from "child_process";
import * as path from "path";
import gulp from "gulp";
import * as inquirer from "inquirer";
import template = require("gulp-template");
import conflict = require("gulp-conflict");
import install = require("gulp-install");
import filter = require("gulp-filter");

import {getPackage, getPackageAttribute, extend} from "./utils";
import {mergePackage} from "./merge-package";

interface  TaskDescriptor {
  prompts: inquirer.Question[],
  deps:(keyof typeof tasks)[],
  blobs: string[],
}

type Without<T, K> = Pick<T, Exclude<keyof T, K>>;
function omit<T, K extends keyof T>(x:T, exclude:K[]):Without<T, K> {
  let neue:any = {};
  for(let k in x) {
    if(exclude.indexOf(k as any) !== -1) continue;
    neue[k] = x[k];
  }
  return neue;
}

function copy_attributes<T>(x:T):T {
  let neue:any = {};
  for(let k in x) {
    let v = x[k];
    if(v instanceof Array) neue[k] = v.slice();
    else if(v instanceof Object) neue[k] = {...(v as Object)};
    else neue[k] = v;
  }
  return neue;
}

function as_task_descriptors<T>(x:T):Record<keyof T, Partial<TaskDescriptor>> {
  return x;
}

let tasks = as_task_descriptors({
  base: {
    prompts: [
      {type: "input", name: "name", message: "App name: ", default: getNameProposal()},
      {type: "input", name: "description", message: "Description: ", default: "N/A"}
    ]
  },
  app: {
    deps: ["base"],
    prompts: [
      {type: "input", name: "port", message: "Port: ", default: 8080},
      {type: "input", name: "host", message: "Host: ", default: "localhost"}
    ],
  },
  api: {
    deps: ["base"],
    prompts: [
      {type: "input", name: "port", message: "Port: ", default: 8090},
      {type: "input", name: "host", message: "Host: ", default: "localhost"}
    ]
  },
  lib: {
    deps: ["base"],
  },
  cli: {
    deps: ["lib"],
  },
  test: {
    deps: ["base"]
  }
});

function pipeline_to_promise(stream:NodeJS.ReadWriteStream|undefined) {
  return new Promise((accept, reject) => {
    if(!stream) return accept();

    stream.on("end", accept);
    stream.on("error", reject);
  });
}

function _inline_dep(task_name:keyof typeof tasks, neue:TaskDescriptor, capabilities:string[], visited:string[] = []) {
  if(capabilities.indexOf(task_name) !== -1) return neue;
  let task_descriptor = tasks[task_name];
  if(task_descriptor.prompts) neue.prompts.unshift(...task_descriptor.prompts);
  neue.blobs.unshift(templateBlob(task_name));
  if(task_descriptor.blobs) neue.blobs.unshift(...task_descriptor.blobs);
  if(task_descriptor.deps) {
    for(let dep of task_descriptor.deps) {
      if(visited.indexOf(dep) !== -1) continue;
      visited.push(dep);
      _inline_dep(dep, neue, capabilities, visited);
    }
  }
  return neue;
}

function inline_deps(task_name:keyof typeof tasks, capabilities:string[] = []):TaskDescriptor {
  let neue:TaskDescriptor = {deps: [], prompts: [], blobs: []};
  return _inline_dep(task_name, neue, capabilities);
}

function make_task_for(name:keyof typeof tasks) {
  let task = () => {
    let pkg = getPackage();
    let task_descriptor = inline_deps(name, pkg && pkg.capabilities);
    console.log("USING BLOBS", task_descriptor.blobs);
    let needs_scaffolded = !pkg || !pkg.capabilities || pkg.capabilities.indexOf(name) === -1;
    if(!needs_scaffolded) {
      console.info(`Refusing to regenerate already scaffolded '${name}'. To regenerate, remove '${name}' from 'capabilities' in your package.json.`);
    } else {
      return inquirer.prompt(task_descriptor.prompts || []).then((answers) => {
        return generateScaffold(task_descriptor.blobs, extend(pkg, answers));
      });
    }
  }
  Object.defineProperty(task, "name", {value: name});
  return task;
}

for(let task_name of Object.keys(tasks) as (keyof typeof tasks)[]) {
  gulp.task(task_name, make_task_for(task_name));
}


function getNameProposal() {
  return getPackageAttribute("name") || path.basename(process.cwd());
}

function templateBlob(name:string) {
  return `${__dirname}/templates/${name}/**`;
}

function generateScaffold(globs:string|string[], answers:object = {}) {
  let onlyPackage = filter(["**/package.json"], {restore: true});
  return gulp.src(globs)
    .pipe(template(answers, {
      escape: /<%-([\s\S]+?)%>/g,
      evaluate: /<%([\s\S]+?)%>/g,
      interpolate: /<%=([\s\S]+?)%>/g
    }))
    //.pipe(onlyPackage)
    .pipe(mergePackage("./"))
    //.pipe(onlyPackage.restore)
    .pipe(conflict("./"))
    .pipe(gulp.dest("./"))
    .pipe(install({"package.json": "npm"}));
}
