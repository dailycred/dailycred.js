(function() {
  $(function() {
    var baseUser, baseUser2, newUser, randomEmail, randomEmail2, secret, user_id;

    DC.init({
      clientId: "4133a23f-b9c3-47e4-8989-cfb30510079d"
    });
    user_id = "539cdef5-3bdc-4133-9f6c-34f68f1c54bc";
    randomEmail = "dctest" + (Math.floor(Math.random() * 11111)) + "@dailycred.com";
    randomEmail2 = "dctest" + (Math.floor(Math.random() * 11111)) + "@dailycred.com";
    secret = "a1c21e72-98d8-47c2-9e9a-1e2dcd363b2f-f353b2af-1f51-416c-ad4c-59e70721dfab";
    baseUser = new DC.User({
      email: randomEmail,
      password: "password"
    });
    baseUser2 = {
      email: randomEmail2,
      password: "password"
    };
    newUser = function() {
      return $.extend(true, {}, baseUser);
    };
    module("events");
    test("creating an event", function() {
      stop();
      return DC.event(user_id, "became awesome", null, function(e, user) {
        ok(!e);
        ok(user);
        return start();
      });
    });
    module("User class");
    test("sign up a user", function() {
      var user;

      stop();
      user = newUser();
      return user.signup(function(e, user) {
        ok(!e);
        ok(user);
        equals(randomEmail, user.email);
        return start();
      });
    });
    test("sign in a user", function() {
      var user;

      user = newUser();
      stop();
      return user.signin(function(e, user) {
        ok(!e);
        ok(user);
        equals(randomEmail, user.email);
        return start();
      });
    });
    test("failed login", function() {
      var user;

      user = newUser();
      user.password = "wrongpass";
      stop();
      return user.signin(function(e, user) {
        ok(e);
        ok(!user);
        equals(e.attribute, "form");
        return start();
      });
    });
    module("DC alias methods");
    test("sign up a user", function() {
      stop();
      return DC.signup(baseUser2, function(e, user) {
        ok(!e);
        ok(user);
        equals(randomEmail2, user.email);
        return start();
      });
    });
    test("sign in a user", function() {
      stop();
      return DC.signin(baseUser2, function(e, user) {
        ok(!e);
        ok(user);
        equals(randomEmail2, user.email);
        return start();
      });
    });
    return test("failed login", function() {
      stop();
      return DC.signin({
        email: randomEmail2,
        password: "wrongpass"
      }, function(e, user) {
        ok(e);
        ok(!user);
        equals(e.attribute, "form");
        return start();
      });
    });
  });

}).call(this);
