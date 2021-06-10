module.exports = function Cart(initItems) {
  this.items = initItems.items || {};
  this.totalQ = initItems.totalQ || 0;
  this.totalP = initItems.totalP || 0;

  this.add = function (item, id) {
    var stored = this.items[id];

    if (!stored) {
      stored = this.items[id] = { item: item, qty: 0, price: 0 };
    }
    stored.qty++;
    stored.price = JSON.parse(JSON.stringify(stored.item)).price * stored.qty;
    this.totalP += JSON.parse(JSON.stringify(stored.item)).price;
    this.totalQ++;
  };

  this.generate = function () {
    var arr = [];
    for (var id in this.items) {
      arr.push(this.items[id]);
    }
    return arr;
  };
};
