import express from 'express';
import routes from './routes'; 
import cors from 'cors';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);
app.use('/icons', express.static(path.resolve(__dirname, '..', 'icons')))


app.listen(333); 