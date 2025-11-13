const request = require('supertest');
const app = require('../server'); 

describe('Health Check Test: GET /', () => {
    
    // Тест 1: Проверка базового маршрута (Health Check)
    it('should return 200 OK and expected welcome message', async () => {

        const response = await request(app).get('/');
        
        expect(response.statusCode).toBe(200);
        
        expect(response.headers['content-type']).toMatch(/json/);
        
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Test lab 5!');
    });
    
    // Тест 2: Проверка несуществующего маршрута
    it('should return 404 for a non-existent route', async () => {
        const response = await request(app).get('/non-existent-page');
        expect(response.statusCode).toBe(404);
    });

});

afterAll(() => {
    // Закрыть supertest connection
    const server = app.listen(0);
    server.close();
  });