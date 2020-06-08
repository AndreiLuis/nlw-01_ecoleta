import {Request, Response} from 'express';
import knex from '../data/connection';

export default class ItemsController
{
    async index (request: Request, response: Response) {
        const items = await knex('items').select('*');
        var serializeItems = items.map(item => {
            return{
                id: item.id,
                title: item.title,  
                image_url: `http://192.168.0.48:333/icons/${item.image}`,
            };
        });
        return response.json(serializeItems);
    }
}