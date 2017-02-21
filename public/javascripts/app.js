var App = {
  menuLoaded: function() {
    this.menu.view.render();
  },
  fetchMenu: function() {
    this.menu = new MenuItems();
    this.menu.fetch({
      success: this.menuLoaded.bind(this),
    })

    this.menu.view = new MenuView({
      collection: this.menu
    });
  },
  getCurrentItem: function(item) {
    return this.menu.models.filter(function(it) { return it.attributes.item === item; })[0];
  },
  openModal: function(item) {
    this.currentItem = this.getCurrentItem(item);
    this.currentItem.view = new DetailView({
      model: this.currentItem
    });
    this.currentItem.view.render();
  },
  switchModal: function(item) {
    this.currentItem.view.remove();
    this.currentItem = this.getCurrentItem(item);
    this.currentItem.view = new DetailView({
      model: this.currentItem
    });
    this.currentItem.view.render();
  },
  createCart: function() {
    this.cart = new CartCollection();
    this.cart.view = new CartView({
      collection: this.cart
    });
  },
  showCheckoutPage: function() {
    this.cart.view.toggleCart();
    this.menu.view.$el.hide();
    if (this.currentItem) {
      this.currentItem.view.remove();
    }
    this.cart.checkoutView = new CheckoutView({
      collection: this.cart
    });
  },
  resetViews: function() {
    if (this.cart.models.length > 0) {
      this.cart.view.show();
    }

    this.menu.view.$el.toggle();

    if (this.currentItem) {
      this.currentItem.view.remove();
    }

    if (this.cart.checkoutView) {
      this.cart.checkoutView.remove();
    }
  },
  bindEvents: function() {
    _.extend(this, Backbone.Events);
    this.on('add_to_cart', this.cart.addItem.bind(this.cart));
    this.on('remove_item', this.cart.removeItem.bind(this.cart));
    this.on('reset', this.cart.reset.bind(this.cart));
  },
  init: function() {
    this.createCart();
    this.bindEvents();
    this.fetchMenu();
  }
};

Handlebars.registerHelper('toFixed2', function(num) {
  return parseFloat(num).toFixed(2);
});

Handlebars.registerHelper('toFixed4', function(num) {
  return parseFloat(num).toFixed(4);
});

// $('ul').on('mouseover', 'li', function(e) {
//   console.log(e.target);
//   $(e.target).addClass('darken');
// })

var Router = Backbone.Router.extend({
  routes: {
    '': 'resetViews',
    'checkout': 'checkout',
    ':item': 'getItem',
  },
  resetViews: function() {
    App.resetViews();
  },
  getItem: function(item) {
    if ($('.modal').length === 0) {
      App.openModal(item);
    } else {
      App.switchModal(item);
    }
  },
  checkout: function() {
    App.showCheckoutPage();
  },
});

var router = new Router();

Backbone.history.start({
  pushState: true,
  silent: true
});

$('header a').on('click', function(e) {
  e.preventDefault();
  router.navigate('', { trigger: true });
})

$(document).delegate('a.details', 'click', function(e) {
  e.preventDefault();
  router.navigate($(e.target).closest('a').attr('href'), { trigger: true });
});

$(document).delegate('a.prev, a.next', 'click', function(e) {
  e.preventDefault();
  router.navigate($(e.target).closest('a').attr('href'), { trigger: true });
});

$(document).on('click', 'a.checkout', function(e) {
  e.preventDefault();
  router.navigate('checkout', { trigger: true });
});

$(document).on('click', 'a.empty', function(e) {
  e.preventDefault();
  App.cart.reset();
  router.navigate('', { trigger: true })
});