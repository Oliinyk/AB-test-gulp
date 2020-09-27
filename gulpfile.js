const gulp    = require('gulp');
const sass    = require("gulp-sass");
const useref  = require("gulp-useref");
const fs      = require('fs');
const uglify  = require('gulp-uglify');
const cssnano = require('gulp-cssnano');
const gulpif  = require('gulp-if');
const path_info = {
  src           : 'src/',
  css           : 'src/css/',
  sass          : 'src/scss/',
  js            : 'src/js/',
  build         : 'build/',
  pre_build_css : 'tpl/css/',
  pre_build     : 'tpl/',
  pre_build_js  : 'tpl/js/',
  pre_build_templ  : 'tpl/pre_build/',
}
const create_tpl_folders = function (dirPath) {
  try{
    fs.mkdirSync(path_info.pre_build);
    fs.mkdirSync(path_info.pre_build_js);
    fs.mkdirSync(path_info.pre_build_css);
    fs.mkdirSync(path_info.pre_build_templ);
  }catch (e) {}
}
async function asyncAwaitTask() {
  removeDir(path_info.pre_build_templ);
  const { languages } = JSON.parse(fs.readFileSync(path_info.src+'langs.json', 'utf8'));
  for(language in languages){
    var cong_out   = JSON.stringify(languages[language]);
    var out_string = "window.language_abtest = "+cong_out+";\n";
    var out_file   = fs.readFileSync(path_info.src+'index.js', 'utf8');
    var style_css  = "";
    try{
      style_css    = fs.readFileSync(path_info.pre_build_css+'style.css', 'utf8');
    }catch (e) {}
    var script_js  = "";
    try{
      script_js    += fs.readFileSync(path_info.pre_build_js+'global.variables.js', 'utf8');
      script_js    += "\n";
    }catch (e) {}
    try{
      script_js    += fs.readFileSync(path_info.pre_build_js+'func.js', 'utf8');
      script_js    += "\n";
    }catch (e) {}
    try{
      script_js    += fs.readFileSync(path_info.pre_build_js+'events.js', 'utf8');
      script_js    += "\n";
    }catch (e) {}
    try{
      script_js    += fs.readFileSync(path_info.pre_build_js+'script.js', 'utf8');
      script_js    += "\n";
    }catch (e) {}
    out_file       = out_file.replace('@@style@@',style_css);
    out_file       = out_file.replace('@@scriptjs@@',script_js);
    var script_out_path = path_info.pre_build_templ+language+'-build.js';
    if(language == ''){
      script_out_path = path_info.pre_build_templ+'build.js';
    }
    fs.writeFile(script_out_path, out_string+out_file, function (err) {
      if (err) {
        return console.log(err);
      }
    });
  }
  await Promise.resolve('');
}
const removeDir = function(path) {
  if (fs.existsSync(path)) {
    const files = fs.readdirSync(path)
    if (files.length > 0) {
      files.forEach(function(filename) {
        var remove_obj = path + "/" + filename;
        remove_obj = remove_obj.replace(new RegExp('//','g'),'/');
        if (!fs.statSync(remove_obj).isDirectory()) {
          console.log(remove_obj);
          fs.unlinkSync(remove_obj);
        }
      })
    }
    console.log("Directory removed.");
  } else {
    console.log("Directory path not found.");
  }
}
function build_js_and_minify() {
  removeDir(path_info.build);
  return gulp.src(path_info.pre_build_templ+"*.js")
      .pipe(uglify())
      .pipe(gulp.dest(path_info.build));
}
function scss_task() {
  return (
      gulp.src(path_info.sass+"*.scss")
      .pipe(sass())
      .on("error", sass.logError)
      .pipe(gulp.dest(path_info.css))
  );
}
function css_task() {
  return gulp.src(path_info.css+"*.css")
      .pipe(cssnano({zindex: false}))
      .pipe(gulp.dest(path_info.pre_build_css));
}
function js_task() {
  return gulp.src(path_info.js+"*.js")
      .pipe(uglify())
      .pipe(gulp.dest(path_info.pre_build_js));
}
function watch_tasks(){
  gulp.watch(path_info.sass+'*.scss', scss_task);
  gulp.watch(path_info.css+'*.css', css_task);
  gulp.watch(path_info.js+'*.js', js_task);
  gulp.watch(path_info.src+'langs.json', asyncAwaitTask);
  gulp.watch(path_info.src+'langs.json', build_js_and_minify);
  gulp.watch(path_info.pre_build_js+'*.js', asyncAwaitTask);
  gulp.watch(path_info.pre_build_css+'*.css', asyncAwaitTask);
  gulp.watch(path_info.pre_build_templ+'*.js', build_js_and_minify);
}
// exports.watch = watch_tasks;
exports.prebuild = asyncAwaitTask;
exports.build    = build_js_and_minify;
exports.style    = scss_task;
exports.default  = gulp.parallel(create_tpl_folders,watch_tasks);