describe('Menu Items', function() {
  it('Creates menu models from the JSON file', function(done) {
    var menuLoaded = App.menuLoaded;

    App.menuLoaded = function() {
      menuLoaded.call(App);
      expect(App.menu).toBeDefined();
      expect(App.menu.models.length).toBe(19);
      expect(typeof App.menu.models[0].attributes.item).toBe('string');
      done();
    };

    App.init();
  });
});

describe('Cart', function() {
  var cart;
  it('Creates an empty cart collection', function() {
    cart = new CartCollection();
    expect(cart.models.length).toBe(0);
  });

});