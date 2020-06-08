import express from 'express';
import multer  from 'multer';
import { celebrate, Joi } from 'celebrate';

import configMulter from './config/multer';
import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';

const routers = express.Router();
const uploads = multer(configMulter);

const pointsController = new PointsController();
const itemsController = new ItemsController();

routers.get('/items', itemsController.index);
routers.get('/points', pointsController.index);
routers.post(
    '/points', 
    uploads.single('image'),
    celebrate({
      body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        whatsapp: Joi.number().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        city: Joi.number().required(),
        uf: Joi.number().required().max(2),
        items: Joi.string().required()
      })
    }, {
      abortEarly: false
    }), 
    pointsController.insert
  );
routers.get('/points/:id', pointsController.show);



// const users = [
//     'Paulo',
//     'Barra',
//     'Michael',
//     'Luiza'
// ]
// routers.get('/users', (request, response)=>{
//     const search = request.query.search?.toString();
//     const filteredUsers = search ? users.filter(user => user.includes(search)) : users;
//     return response.json(filteredUsers);
// });

// routers.get('/users/:id', (request, response)=>{
//      const id = Number(request.params.id);
//      const user = users[id];
//      return response.json(user);
// });
// routers.post('/users', (request, response) =>{
//     const data = request.body;
//     const user = {
//         name: data.name,
//         email: data.email
//     };
// });

export default routers;