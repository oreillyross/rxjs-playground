

var gulp = require("gulp"),
    $ = require("gulp-load-plugins")(),
    source = require("vinyl-source-stream"),
    browserify = require("browserify"),
    watchify = require("watchify"),
    babelify = require("babelify"),
    path = require("path"),
    fs = require("fs");

gulp.task("scripts:server", function() {
  return gulp.src("./src-server/**/*.js")
      .pipe($.cached("server"))
      .pipe($.babel())
      .pipe(gulp.dest("./build"));
});

gulp.task("watch:scripts:server", gulp.series("scripts:server", function() {
    return gulp.watch("./src-server/**/*.js", gulp.series("scripts:server"));
}));

gulp.task("watch:scripts:client", function() {
  const files = fs.readdirSync("./src-client");
  for (var i = 0; i < files.length; i++) {
    const file = files[i];
    if (path.extname(file) !== "./js")
      continue;

    initBundlerWatch(path.join("src-client", file));
  }

  return gulp.watch("./src-client/**/*.js")
    .on("change", initBundlerWatch);
});

gulp.task("watch:scripts", gulp.parallel(
  "watch:scripts:client",
  "watch:scripts:server" ));

var bundlers = {};
function initBundlerWatch(file) {
  if (bundlers.hasOwnProperty(file))
    return;

  const bundler = createBundler(file);
  bundlers[file] = bundler;
  const watcher = watchify(bundler);
  const filename = path.basename(file);

  function bundle() {
    return bundler
        .bundle()
        .on("error", function(error) {  console.error(error)})
        .pipe(source(filename))
        .pipe(gulp.dest("./public/build"));
  }

  watcher.on("update", bundle);
  watcher.on("time", function(time) {
    console.log('Built client in '  + time + 'ms')});
  bundle();
}

function createBundler(file) {
  const bundler = browserify(file);
  bundler.transform(babelify);
  return bundler;
}
