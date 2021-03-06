(function() {
  $(function() {
    var FORM, baseUser, baseUser2, clientId, makeToken, newUser, randomEmail, randomEmail2, secret, user_id;

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
    makeToken = function() {
      var i, possible, text, _i;

      text = "";
      possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (i = _i = 0; _i <= 24; i = ++_i) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
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
        equal(randomEmail, user.email);
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
        equal(randomEmail, user.email);
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
        equal(e.attribute, "form");
        return start();
      });
    });
    module("DC alias methods");
    test("sign up a user", function() {
      stop();
      return DC.signup(baseUser2, function(e, user) {
        ok(!e);
        ok(user);
        equal(randomEmail2, user.email);
        return start();
      });
    });
    test("sign in a user", function() {
      stop();
      return DC.signin(baseUser2, function(e, user) {
        ok(!e);
        ok(user);
        equal(randomEmail2, user.email);
        return start();
      });
    });
    test("failed login", function() {
      stop();
      return DC.signin({
        email: randomEmail2,
        password: "wrongpass"
      }, function(e, user) {
        ok(e);
        ok(!user);
        equal(e.attribute, "form");
        return start();
      });
    });
    module("fragment callback method");
    test("parsing many access token responses", function() {
      var randomToken, testHashChange;

      document.location.hash = "";
      testHashChange = function(hash, expected, expected_user) {
        var failTimeout, t, timeout, timeoutSeconds;

        failTimeout = function() {
          ok(false, "Timeout while waiting for hashChanged callback.");
          return start();
        };
        timeout = null;
        t = function(s) {
          return timeout = setTimeout(failTimeout, s * 1000);
        };
        stop();
        document.location.hash = "";
        if (expected_user) {
          DC.init({
            clientId: "4133a23f-b9c3-47e4-8989-cfb30510079d",
            hashChanged: function(accessToken, user) {
              clearTimeout(timeout);
              ok(accessToken === expected, "access token should be returned correctly");
              ok(accessToken.indexOf("access_token") === -1, "access token should not include the words 'access_token'");
              ok(user, "user should be initialized");
              ok(user.email === baseUser2.email, "user should have correct email set");
              return start();
            }
          });
        } else {
          DC.init({
            clientId: "4133a23f-b9c3-47e4-8989-cfb30510079d",
            hashChanged: function(accessToken) {
              clearTimeout(timeout);
              equal(accessToken, expected, "access token should be returned correctly");
              ok(accessToken.indexOf("access_token") === -1, "access token should not include the words 'access_token'");
              return start();
            }
          });
        }
        document.location.hash = hash;
        timeoutSeconds = expected_user ? 10 : 5;
        return t(timeoutSeconds);
      };
      randomToken = makeToken();
      testHashChange("expires_in=2435391989&access_token=" + randomToken, randomToken);
      stop();
      return DC.signup(baseUser2, function(e, user) {
        var token;

        if (!user) {
          ok(false, "failed to create user");
          return;
        }
        token = user.accessToken;
        testHashChange("access_token=" + token, token, user);
        testHashChange("expires_in=never&access_token=" + token, token, user);
        return start();
      });
    });
    test("parsing hash function", function() {
      var testHashParse;

      testHashParse = function(hash, token) {
        document.location.hash = hash;
        return equal(DC.getTokenFromHash(), token);
      };
      testHashParse("access_token=blahblah", "blahblah");
      testHashParse("?access_token=blah&expires_in=25030282", "blah");
      return testHashParse("expires_in=2435391989&response_type=token&access_token=329jk-dsfjij1-2321", "329jk-dsfjij1-2321");
    });
    module("jquery plugin");
    clientId = 'd967453a-b8aa-444e-a8b5-f31d5431f73d';
    FORM = function() {
      return $('#qunit-fixture form');
    };
    test("should be defined on jquery object", function() {
      var form;

      form = FORM();
      return ok(form.dailycred());
    });
    test("should use defaults", function() {
      var data, form;

      form = FORM().dailycred();
      data = form.data()['dailycred'];
      equal(data.site, "https://www.dailycred.com");
      equal(data.style, 'oauth');
      equal(data.method, 'signin');
      equal(data.action(), "/oauth/api/signin.json");
      return ok(data.after);
    });
    test("overrides defaults", function() {
      var data, form;

      form = FORM().dailycred({
        method: 'signup',
        style: 'user'
      });
      data = form.data()['dailycred'];
      equal(data.method, 'signup');
      return equal(data.style, 'user');
    });
    test("signs in successfully", function() {
      var form;

      stop();
      form = FORM().dailycred({
        client_id: clientId,
        after: function(err, data) {
          deepEqual(err, void 0);
          ok(data);
          ok(data.redirect);
          return start();
        }
      });
      form.find('input[name="email"]').val('test@2.com');
      form.find('input[name="pass"]').val('password');
      return form.dailycred('submit');
    });
    test("signs up successfully", function() {
      var d, form;

      stop();
      form = FORM().dailycred({
        client_id: clientId,
        after: function(err, data) {
          deepEqual(err, void 0);
          ok(data);
          ok(data.redirect);
          return start();
        }
      });
      d = new Date();
      form.find('input[name="email"]').val("test" + (d.getTime()) + "@2.com");
      form.find('input[name="pass"]').val('password');
      return form.dailycred('method', 'signup').dailycred('submit');
    });
    test("signs in successfully from keyboard", function() {
      var e, form;

      stop();
      form = FORM().dailycred({
        client_id: clientId,
        after: function(err, data) {
          deepEqual(err, void 0);
          ok(data);
          return start();
        }
      });
      form.find('input[name="email"]').val('test@2.com');
      form.find('input[name="pass"]').val('password');
      e = $.Event("keyup");
      e.which = 13;
      return form.find('input[name="email"]').trigger(e);
    });
    test("signs up successfully from keyboard", function() {
      var d, e, form;

      stop();
      form = FORM().dailycred({
        client_id: clientId,
        after: function(err, data) {
          deepEqual(err, void 0);
          ok(data);
          return start();
        }
      });
      d = new Date();
      form.find('input[name="email"]').val("test" + (d.getTime()) + "@2.com");
      form.find('input[name="pass"]').val('password');
      e = $.Event("keyup");
      e.which = 13;
      return form.dailycred('method', 'signup').find('input[name="email"]').trigger(e);
    });
    test("errors with bad pass on signin", function() {
      var form;

      stop();
      form = FORM().dailycred({
        client_id: clientId,
        after: function(err, data) {
          ok(err);
          deepEqual(data, void 0);
          return start();
        }
      });
      form.find('input[name="email"]').val('test@2.com');
      form.find('input[name="pass"]').val('passwor');
      return form.dailycred('submit');
    });
    test("errors with bad pass on signup", function() {
      var d, form;

      stop();
      form = FORM().dailycred({
        client_id: clientId,
        after: function(err, data) {
          ok(err);
          deepEqual(data, void 0);
          return start();
        }
      });
      d = new Date();
      form.find('input[name="email"]').val("test" + d + "@2.com");
      form.find('input[name="pass"]').val('password');
      return form.dailycred('method', 'signup').dailycred('submit');
    });
    test("signs in successfully with user flow", function() {
      var form;

      stop();
      form = FORM().dailycred({
        client_id: clientId,
        style: 'user',
        after: function(err, data) {
          deepEqual(err, void 0);
          ok(data);
          ok(data.user);
          return start();
        }
      });
      form.find('input[name="email"]').val('test@2.com');
      form.find('input[name="pass"]').val('password');
      return form.dailycred('submit');
    });
    return test("signs up successfully with user flow", function() {
      var d, form;

      stop();
      form = FORM().dailycred({
        client_id: clientId,
        style: 'user',
        after: function(err, data) {
          deepEqual(err, void 0);
          ok(data);
          ok(data.user);
          return start();
        }
      });
      d = new Date();
      form.find('input[name="email"]').val("test" + (d.getTime()) + "@2.com");
      form.find('input[name="pass"]').val('password');
      return form.dailycred('method', 'signup').dailycred('submit');
    });
  });

}).call(this);
