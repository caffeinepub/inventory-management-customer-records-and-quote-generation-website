import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type ProductId = Text;
  type CustomerId = Text;
  type QuoteId = Nat;

  type Product = {
    id : ProductId;
    name : Text;
    description : Text;
    price : Float;
    quantity : Nat;
  };

  type Customer = {
    id : CustomerId;
    name : Text;
    email : Text;
    phone : Text;
    address : Text;
  };

  type QuoteLineItem = {
    productId : ProductId;
    productName : Text;
    quantity : Nat;
    unitPrice : Float;
    total : Float;
  };

  type Quote = {
    id : QuoteId;
    customerId : CustomerId;
    customerName : Text;
    lineItems : [QuoteLineItem];
    subtotal : Float;
    tax : Float;
    total : Float;
    created : Int;
  };

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Text.compare(product1.id, product2.id);
    };
  };

  module Customer {
    public func compare(customer1 : Customer, customer2 : Customer) : Order.Order {
      Text.compare(customer1.id, customer2.id);
    };
  };

  module Quote {
    public func compare(quote1 : Quote, quote2 : Quote) : Order.Order {
      Nat.compare(quote1.id, quote2.id);
    };
  };

  let products = Map.empty<ProductId, Product>();
  let customers = Map.empty<CustomerId, Customer>();
  let quotes = Map.empty<QuoteId, Quote>();
  var nextQuoteId = 1;

  // Product Management
  public shared ({ caller }) func createProduct(product : Product) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };

    if (products.containsKey(product.id)) {
      Runtime.trap("Product with id " # product.id # " already exists");
    };

    products.add(product.id, product);
  };

  public query ({ caller }) func getProduct(id : ProductId) : async Product {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view products");
    };

    switch (products.get(id)) {
      case (null) { Runtime.trap("Product with id " # id # " does not exist") };
      case (?product) { product };
    };
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    if (not products.containsKey(product.id)) {
      Runtime.trap("Product with id " # product.id # " does not exist");
    };

    products.add(product.id, product);
  };

  public shared ({ caller }) func deleteProduct(id : ProductId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    if (not products.containsKey(id)) {
      Runtime.trap("Product with id " # id # " does not exist");
    };

    products.remove(id);
  };

  public query ({ caller }) func listProducts() : async [Product] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view products");
    };

    products.values().toArray().sort();
  };

  public shared ({ caller }) func adjustProductStock(id : ProductId, quantity : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can adjust stock");
    };

    switch (products.get(id)) {
      case (null) { Runtime.trap("Product with id " # id # " does not exist") };
      case (?product) {
        let updatedProduct = { product with quantity };
        products.add(id, updatedProduct);
      };
    };
  };

  // Customer Management
  public shared ({ caller }) func createCustomer(customer : Customer) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create customers");
    };

    if (customers.containsKey(customer.id)) {
      Runtime.trap("Customer with id " # customer.id # " already exists");
    };

    customers.add(customer.id, customer);
  };

  public query ({ caller }) func getCustomer(id : CustomerId) : async Customer {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view customers");
    };

    switch (customers.get(id)) {
      case (null) { Runtime.trap("Customer with id " # id # " does not exist") };
      case (?customer) { customer };
    };
  };

  public shared ({ caller }) func updateCustomer(customer : Customer) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update customers");
    };

    if (not customers.containsKey(customer.id)) {
      Runtime.trap("Customer with id " # customer.id # " does not exist");
    };

    customers.add(customer.id, customer);
  };

  public shared ({ caller }) func deleteCustomer(id : CustomerId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete customers");
    };

    if (not customers.containsKey(id)) {
      Runtime.trap("Customer with id " # id # " does not exist");
    };

    customers.remove(id);
  };

  public query ({ caller }) func listCustomers() : async [Customer] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view customers");
    };

    customers.values().toArray().sort();
  };

  // Quote Management
  public shared ({ caller }) func createQuote(customerId : CustomerId, lineItems : [QuoteLineItem]) : async Quote {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create quotes");
    };

    var customerName : Text = "";
    switch (customers.get(customerId)) {
      case (null) { Runtime.trap("Customer with id " # customerId # " does not exist") };
      case (?customer) { customerName := customer.name };
    };

    let subtotal = lineItems.values().map(func(item) { item.total }).foldLeft(
      0.0,
      func(acc, total) { acc + total },
    );
    let tax = subtotal * 0.22; // 22% VAT
    let total = subtotal + tax;

    let quote : Quote = {
      id = nextQuoteId;
      customerId;
      customerName;
      lineItems;
      subtotal;
      tax;
      total;
      created = Time.now();
    };

    quotes.add(nextQuoteId, quote);
    nextQuoteId += 1;
    quote;
  };

  public query ({ caller }) func getQuote(id : QuoteId) : async Quote {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view quotes");
    };

    switch (quotes.get(id)) {
      case (null) { Runtime.trap("Quote with id " # id.toText() # " does not exist") };
      case (?quote) { quote };
    };
  };

  public query ({ caller }) func listQuotes() : async [Quote] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view quotes");
    };

    quotes.values().toArray().sort();
  };

  public query ({ caller }) func listQuotesByCustomer(customerId : CustomerId) : async [Quote] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view quotes");
    };

    quotes.values().filter(func(quote) { quote.customerId == customerId }).toArray();
  };
};
