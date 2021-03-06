import knex from 'knex';
import path from 'path';

const connect = knex({
    client: 'sqlite3',
    connection: {
        filename: path.resolve(__dirname, 'db.sqlite')
    },
    useNullAsDefault: true,
});

export default connect;