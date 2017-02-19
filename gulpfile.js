const path = require("path");
const gulp = require('gulp');
const webpack = require('gulp-webpack');
const ts = require("gulp-typescript");
const clean = require("gulp-clean");
const yargs = require("yargs");
const exec = require('child_process').exec;
const rename = require('gulp-rename');

const args =  yargs.argv;

const entryPoints = ['registerPage'];
const jsFolder = 'js';
const contentFolder = 'dist';

const tsProject = ts.createProject('tsconfig.json', {
    typescript: require('typescript')
});
gulp.task('clean', () => {
    return gulp.src([contentFolder, jsFolder, '*.vsix'])
        .pipe(clean());
})

gulp.task('fix-vss', () => {
    // These duplicate type files mess up the build
    return gulp.src([`node_modules/vss-web-extension-sdk/node_modules`], {read: false})
        .pipe(clean());
});

gulp.task('build', ['fix-vss', 'clean'], () => {
    var tsResult = gulp.src(['scripts/**/*.tsx', 'scripts/**/*.ts'])
        .pipe(tsProject());

    return tsResult.js.pipe(gulp.dest(jsFolder));
});


gulp.task('copy', ['build'], () => {
    gulp.src('node_modules/vss-web-extension-sdk/lib/VSS.SDK.min.js')
        .pipe(gulp.dest(contentFolder + '/scripts'));
    gulp.src('img/*').pipe(gulp.dest(`${contentFolder}/img`));

    return gulp.src([
        'node_modules/office-ui-fabric-react/dist/*css/*.min.css',
        '*css/**/*.css',
        'html/**/*html',
        '*.md',
        ])
        .pipe(gulp.dest(contentFolder));
});


gulp.task('webpack', ['copy'], () => {
    let stream;
    for (let fileName of entryPoints) {
        stream = gulp.src(`./${jsFolder}/${fileName}.js`)
            .pipe(webpack(require('./webpack.config.js')))
            .pipe(rename(`${fileName}.js`))
            .pipe(gulp.dest(`${contentFolder}/scripts`));
    }
    return stream;
});

gulp.task('package', ['webpack'], () => {
    const overrides = {}
    if (yargs.argv.release) {
        overrides.public = true;
    } else {
        const manifest = require('./vss-extension.json');
        overrides.name = manifest.name + ": Development Edition";
        overrides.id = manifest.id + "-dev";
    }
    const overridesArg = `--override "${JSON.stringify(overrides).replace(/"/g, '\\"')}"`;
    const rootArg = `--root ${contentFolder}`;
    const manifestsArg = `--manifests ..\\vss-extension.json`;

    exec(`${path.join(__dirname, "node_modules", ".bin", "tfx.cmd")} extension create ${rootArg} ${overridesArg} ${manifestsArg} --rev-version`,
        (err, stdout, stderr) => {
            if (err) {
                console.log(err);
            }

            console.log(stdout);
            console.log(stderr);
            
        });

});

gulp.task('default', ['package']);
