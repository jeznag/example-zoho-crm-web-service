import express from 'express';
import path from 'path';
import routes from './routes/main.routes';
import bodyParser from 'body-parser';

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.use('/', routes);
app.use(express.static(path.join(__dirname, 'public')));
app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
//# sourceMappingURL=server.js.map