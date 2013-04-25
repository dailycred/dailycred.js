(function() {
  $(function() {
    var baseUser, newUser, randomEmail, secret, user_id;

    module("dailycred SDK");
    DC.init({
      clientId: "4133a23f-b9c3-47e4-8989-cfb30510079d"
    });
    user_id = "539cdef5-3bdc-4133-9f6c-34f68f1c54bc";
    randomEmail = "dctest" + (Math.floor(Math.random() * 11111)) + "@dailycred.com";
    secret = "a1c21e72-98d8-47c2-9e9a-1e2dcd363b2f-f353b2af-1f51-416c-ad4c-59e70721dfab";
    baseUser = new DC.User({
      email: randomEmail,
      password: "password"
    });
    newUser = function() {
      return $.extend(true, {}, baseUser);
    };
    test("tagging a user", function() {
      stop();
      return DC.tag(user_id, "loser", function(e, user) {
        ok(!e);
        ok(user);
        return start();
      });
    });
    test("untagging a user", function() {
      stop();
      return DC.untag(user_id, "loser", function(e, user) {
        ok(!e);
        ok(user);
        return start();
      });
    });
    test("creating an event", function() {
      stop();
      return DC.event(user_id, "became awesome", null, function(e, user) {
        ok(!e);
        ok(user);
        return start();
      });
    });
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
    return test("failed login", function() {
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
  });

}).call(this);
