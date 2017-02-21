var MenuItem = Backbone.Model.extend({

});

var MenuItems = Backbone.Collection.extend({
  model: MenuItem,
  url: '/menu.json',
});

var MenuView = Backbone.View.extend({
  el: $('#menu')[0],
  events: {
    'click a.add': 'addToCart',
    // 'mouseenter a.details': 'darken'
  },
  addToCart: function(e) {
    e.preventDefault();
    var item = $(e.currentTarget).attr('data-name');
    var model = this.collection.models.filter(function(food) {
      return food.attributes.item === item;
    });

    App.trigger('add_to_cart', model[0]);
  },
  template: Handlebars.compile($('#menu_template').html()),
  render: function() {
    this.$el.html(this.template({ food: this.collection.toJSON() }))
  },
  initialize: function() {
    this.$el = $('#menu');
    this.render();
  }
});

// MVC for cart
var CartCollection = Backbone.Collection.extend({
  total: 0,
  addItem: function(item) {
    item = item.clone();
    var name = item.get('item');

    if(this.models.length === 0) {
      this.trigger('reveal_cart');
    }

    var existing = [];

    this.models.forEach(function(food) {
      existing.push(food.attributes.item);
    });

    if (existing.indexOf(name) === -1) {
      item.set('quantity', 1);
      this.add(item);
    } else {
      var model = this.models.filter(function(food) { return food.attributes.item === name })[0];
      var quantity = model.get('quantity') + 1;
      model.set('quantity', quantity);
    }
    this.updateTotal();
    this.trigger('cart_updated');
  },
  removeItem: function(item) {
    this.remove(item);
    if(this.models.length === 0) {
      this.trigger('reveal_cart');
    }
    this.updateTotal();
    this.trigger('cart_updated');
  },
  updateTotal: function() {
    var total = 0
    var numberOfItems = 0;
    this.models.forEach(function(food) {
      var subtotal = food.attributes.price * food.attributes.quantity;
      total += subtotal;
      numberOfItems += food.attributes.quantity
    })

    this.total = total;
    this.trigger('update_total', total, numberOfItems)
  },
  reset: function() {
    this.models = [];
    this.trigger('hide_cart');
    this.trigger('cart_updated');
    this.trigger('update_total', 0, 0);
  }
});

var CartView = Backbone.View.extend({
  el: $('#cart')[0],
  events: {
    'click a.delete': 'deleteItem',
  },
  hideCart: function() {
    $('#cart').hide();
  },
  toggleCart: function() {
    $('#cart').slideToggle();
  },
  show: function() {
    $('#cart').show();
  },
  deleteItem: function(e) {
    e.preventDefault();
    var name = $(e.target).closest('a').attr('data-name');
    var model = this.collection.findWhere({item: name});

    App.trigger('remove_item', model);
  },
  template: Handlebars.compile($('#cart_template').html()),
  render: function() {
    this.$el.html(this.template({ cart: this.collection.toJSON() }));
  },
  renderTotal: function(total, numberOfItems) {
    $('#cart_interact span').html(total.toFixed(2));
    $('header span').html(numberOfItems);
  },
  initialize: function() {
    this.$el = $('#cart ul');
    this.listenTo(this.collection, 'hide_cart', this.hideCart);
    this.listenTo(this.collection, 'reveal_cart', this.toggleCart);
    this.listenTo(this.collection, 'cart_updated', this.render);
    this.listenTo(this.collection, 'update_total', this.renderTotal);
  },
});

var DetailView = Backbone.View.extend({
  el: $('body').get(0),
  events: {
    'click a.add_button': 'addItem',
  },
  addItem: function(e) {
    e.preventDefault();
    App.trigger('add_to_cart', this.model);
  },
  template: Handlebars.compile($('#detail_template').html()),
  remove: function() {
    this.undelegateEvents();
    // $('div.modal').animate({
    //   "margin-left": '-=1000',
    //   easing: 'linear'
    // }, function() { $(this).remove() });
    $('div.modal').remove();
  },
  render: function() {
    $('#menu').hide();
    // var content = this.template(this.model.toJSON());
    $('body').append(this.template(this.model.toJSON()));
  },
});

var CheckoutView = Backbone.View.extend({
  template: Handlebars.compile($('#checkout_template').html()),
  render: function() {
    $('body').append(this.template({ 
      checkout: this.collection.toJSON(),
      total: this.collection.total
    }));
  },
  remove: function() {
    $('#checkout').remove();
  },
  initialize: function() {
    this.render();
  }
});