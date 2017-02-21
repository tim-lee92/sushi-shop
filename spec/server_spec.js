var request = require('request');
var root = 'http://localhost:3000/';
var menu;

describe('JSON routes', function() {

  describe('/menu.json', function() {
    it('returns an array of menu items', function(done) {
      request(root + 'menu.json', function(error, response, body) {
        menu = JSON.parse(body);
        console.log(menu);
        expect(menu[0].item).toBeDefined();
        expect(menu.length).toBeGreaterThan(0);
        expect(menu[0].item).toBe('Sashimi salad');
        done();
      })
    });
  });
})