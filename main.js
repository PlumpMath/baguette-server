var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var colors     = require('colors');
var isRoot     = require('is-root');

const mongoServerHost = "mongodb://localhost/test";

console.log("---------------------------------------------------------------------------------------------".rainbow);
console.log(" ");console.log(" ");
console.log(".########....###....######..##.....#.#######.#######.#######.########".bold);
console.log(".##.....#...##.##..##....##.##.....#.##.........##......##...##......".bold);
console.log(".##.....#..##...##.##.......##.....#.##.........##......##...##......".bold);
console.log(".########.##.....#.##...###.##.....#.######.....##......##...######..".bold);
console.log(".##.....#.########.##....##.##.....#.##.........##......##...##......".bold);
console.log(".##.....#.##.....#.##....##.##.....#.##.........##......##...##......".bold);
console.log(".########.##.....#..######...#######.#######....##......##...########".bold);
console.log(" ");
console.log("  Server Side Application v0.1   @StudioDotH    ");
console.log(" ");
console.log("---------------------------------------------------------------------------------------------".rainbow);

if (!isRoot()) {
	console.error("Not running as root, quitting");
	process.exit();
}

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var port = process.env.PORT || 921;
var router = require('./routes')(app);

var server = app.listen(port, function()  {
 console.log(colors.green("Express server started on port " + port));
});

var db = mongoose.connection;
db.on('error', function(error) {
  console.error("Error while connecting to MongoDB server".red.bold);
  console.error(error.message);
  process.exit(1);
});

db.once('open', function() {
  console.log("Connected to MongoDB server".green);
  console.log("---------------------------------------------------------------------------------------------".rainbow);
});

console.log("Connecting to MongoDB server..");
mongoose.connect(mongoServerHost);

var stdin = process.openStdin();

stdin.addListener("data", function(d) {
  console.log(d.toString().trim().blue);
});
