const mysql = require('promise-mysql');
const logger = require('winston');

class OrderBook {
  async init() {
    this.pool = await mysql.createPool({
      host: 'localhost',
      user: 'xunion',
      database: 'xunion',
    });

    // validate our connection and initialize schema if necessary
    const tables = await this.pool.query("SHOW TABLES LIKE 'orders'");
    if (tables.length === 0) {
      this.pool.query(`CREATE TABLE orders (
        id INT NOT NULL,
        quantity DECIMAL(14,8),
        price DECIMAL(9, 8),
        PRIMARY KEY (id)
        )`);
    }

    logger.info('connected to database');
  }

  async getOrders() {
    const [bids, asks] = await Promise.all([
      this.pool.query('SELECT `price`, `quantity`, FROM orders WHERE `quantity` > 0 ORDER BY `price` DESC'),
      this.pool.query('SELECT `price`, `quantity`, FROM orders WHERE `quantity` < 0 ORDER BY `price` ASC'),
    ]);
    return {
      bids,
      asks,
    };
  }

  async placeOrder(order) {
    const result = await this.pool.query('INSERT INTO orders SET ?', order);
    logger.info(`placed order: ${order}`);
    return result;
  }
}

module.exports = OrderBook;
