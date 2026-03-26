import Text "mo:core/Text";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Blob "mo:core/Blob";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Store "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Profile Type
  public type UserProfile = {
    name : Text;
    email : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) { return null };
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return null;
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Type definitions
  type ProductCategory = {
    #electronics;
    #fashion;
    #home;
    #beauty;
    #sports;
    #books;
    #other;
  };

  module ProductCategory {
    func toNat(category : ProductCategory) : Nat {
      switch (category) {
        case (#electronics) { 0 };
        case (#fashion) { 1 };
        case (#home) { 2 };
        case (#beauty) { 3 };
        case (#sports) { 4 };
        case (#books) { 5 };
        case (#other) { 6 };
      };
    };
    public func compare(category1 : ProductCategory, category2 : ProductCategory) : Order.Order {
      compareById(category1, category2);
    };
    public func compareById(category1 : ProductCategory, category2 : ProductCategory) : Order.Order {
      Nat.compare(toNat(category1), toNat(category2));
    };
    public func toText(category : ProductCategory) : Text {
      switch (category) {
        case (#electronics) { "electronics" };
        case (#fashion) { "fashion" };
        case (#home) { "home" };
        case (#beauty) { "beauty" };
        case (#sports) { "sports" };
        case (#books) { "books" };
        case (#other) { "other" };
      };
    };
  };

  // Products
  type Product = {
    id : Text;
    name : Text;
    price : Nat;
    category : ProductCategory;
    description : Text;
    image : ?Store.ExternalBlob;
    founderId : Principal;
    createdAt : Int;
  };

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      compareById(product1, product2);
    };
    public func compareByPrice(product1 : Product, product2 : Product) : Order.Order {
      Nat.compare(product1.price, product2.price);
    };
    public func compareById(product1 : Product, product2 : Product) : Order.Order {
      Text.compare(product1.id, product2.id);
    };
    public func toText(product : Product) : Text {
      product.name;
    };
  };

  // Founder Offers
  type FounderOffer = {
    id : Text;
    title : Text;
    description : Text;
    image : ?Store.ExternalBlob;
    discount : Nat;
    productId : ?Text;
    createdAt : Int;
  };

  // Customer Offers
  type CustomerOffer = {
    id : Text;
    title : Text;
    description : Text;
    image : ?Store.ExternalBlob;
    price : Nat;
    customerId : Principal;
    customerName : Text;
    createdAt : Int;
  };

  // Cart Item
  type CartItem = {
    productId : Text;
    quantity : Nat;
  };

  module CartItem {
    public func compare(cartItem1 : CartItem, cartItem2 : CartItem) : Order.Order {
      compareById(cartItem1, cartItem2);
    };
    public func compareByQuantity(cartItem1 : CartItem, cartItem2 : CartItem) : Order.Order {
      Nat.compare(cartItem1.quantity, cartItem2.quantity);
    };
    public func compareById(cartItem1 : CartItem, cartItem2 : CartItem) : Order.Order {
      Text.compare(cartItem1.productId, cartItem2.productId);
    };
    public func toText(cartItem : CartItem) : Text {
      cartItem.productId;
    };
  };

  // Order Status
  type OrderStatus = {
    #pending;
    #confirmed;
    #delivered;
  };

  // Order
  type Order = {
    id : Text;
    customerId : Principal;
    customerName : Text;
    customerEmail : Text;
    items : [ProductOrderItem];
    totalAmount : Nat;
    deliveryAddress : Text;
    paymentMethod : Text;
    status : OrderStatus;
    createdAt : Int;
  };

  type ProductOrderItem = {
    productId : Text;
    name : Text;
    price : Nat;
    quantity : Nat;
  };

  // App settings
  type AppSettings = {
    appName : Text;
    logo : ?Store.ExternalBlob;
  };

  // Persistent actor state
  let products = Map.empty<Text, Product>();
  let founderOffers = Map.empty<Text, FounderOffer>();
  let customerOffers = Map.empty<Text, CustomerOffer>();
  let carts = Map.empty<Principal, List.List<CartItem>>();
  let orders = Map.empty<Text, Order>();
  let appSettings = Map.empty<Text, AppSettings>();

  // Helper Functions
  func getProductById(productId : Text) : Product {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  // Initialize app settings (founder only)
  public shared ({ caller }) func initializeAppSettings(appName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only founders can initialize app settings");
    };
    if (appSettings.containsKey("settings")) {
      Runtime.trap("App settings already initialized");
    };
    appSettings.add("settings", { appName; logo = null });
  };

  // Update app name (founder only)
  public shared ({ caller }) func updateAppName(appName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only founders can update app name");
    };
    switch (appSettings.get("settings")) {
      case (null) {
        appSettings.add("settings", { appName; logo = null });
      };
      case (?settings) {
        appSettings.add("settings", { settings with appName });
      };
    };
  };

  // Get app settings - returns default if not initialized
  public query ({ caller }) func getAppSettings() : async AppSettings {
    switch (appSettings.get("settings")) {
      case (null) { { appName = "Shopping Deal"; logo = null } };
      case (?settings) { settings };
    };
  };

  // Create product (founder only)
  public shared ({ caller }) func createProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only founders can create products");
    };
    if (products.containsKey(product.id)) {
      Runtime.trap("Product already exists");
    };
    products.add(product.id, { product with createdAt = Time.now() });
  };

  // Update product (founder only)
  public shared ({ caller }) func updateProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only founders can update products");
    };
    if (not products.containsKey(product.id)) {
      Runtime.trap("Product not found");
    };
    products.add(product.id, { product with createdAt = Time.now() });
  };

  // Delete product (founder only)
  public shared ({ caller }) func deleteProduct(productId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only founders can delete products");
    };
    if (not products.containsKey(productId)) {
      Runtime.trap("Product not found");
    };
    products.remove(productId);
  };

  // Get product by id
  public query ({ caller }) func getProduct(productId : Text) : async Product {
    getProductById(productId);
  };

  // Get all products by category
  public query ({ caller }) func getProductsByCategory(category : ProductCategory) : async [Product] {
    products.values().toArray().filter(func(p) { p.category == category }).sort();
  };

  // Create founder offer (founder only)
  public shared ({ caller }) func createFounderOffer(offer : FounderOffer) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only founders can create founder offers");
    };
    founderOffers.add(offer.id, { offer with createdAt = Time.now() });
  };

  // Create customer offer (logged in users only)
  public shared ({ caller }) func createCustomerOffer(offer : CustomerOffer) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged in customers can create customer offers");
    };
    customerOffers.add(offer.id, { offer with createdAt = Time.now() });
  };

  // Get all offers
  public query ({ caller }) func getAllOffers() : async {
    founderOffers : [FounderOffer];
    customerOffers : [CustomerOffer];
  } {
    {
      founderOffers = founderOffers.values().toArray();
      customerOffers = customerOffers.values().toArray();
    };
  };

  // Add item to cart (logged in users only)
  public shared ({ caller }) func addToCart(productId : Text, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged in customers can add items to cart");
    };
    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?cart) { cart };
    };
    let updatedCart = cart.filter(func(item) { item.productId != productId });
    updatedCart.add({ productId; quantity });
    carts.add(caller, updatedCart);
  };

  // Remove item from cart
  public shared ({ caller }) func removeFromCart(productId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged in customers can remove items from cart");
    };
    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?cart) { cart };
    };
    let updatedCart = cart.filter(func(item) { item.productId != productId });
    carts.add(caller, updatedCart);
  };

  // Get cart
  public query ({ caller }) func getCart(userId : Principal) : async [CartItem] {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own cart");
    };
    switch (carts.get(userId)) {
      case (null) { [] };
      case (?cart) { cart.toArray().sort() };
    };
  };

  // Place order
  public shared ({ caller }) func placeOrder(order : Order) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged in customers can place orders");
    };
    if (order.customerId != caller) {
      Runtime.trap("Unauthorized: Cannot place order for another user");
    };
    orders.add(order.id, { order with createdAt = Time.now() });
  };

  // Get all orders (admin only)
  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  // Update order status (admin only)
  public shared ({ caller }) func updateOrderStatus(orderId : Text, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        orders.add(orderId, { order with status });
      };
    };
  };
};
