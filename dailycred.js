(function() {
  var Dailycred, ModalTemplate, User, badRedirectUrl, baseUrl, connectUrl, customEventUrl, error, fixBools, map, signInUrl, signUpUrl, tagUrl, templateUrl, toType, untagUrl,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  baseUrl = (typeof dc_opts !== "undefined" && dc_opts !== null ? dc_opts.home : void 0) || "https://www.dailycred.com";

  signInUrl = "" + baseUrl + "/oauth/api/signin.json";

  signUpUrl = "" + baseUrl + "/oauth/api/signup.json";

  customEventUrl = "" + baseUrl + "/admin/api/customevent.json";

  tagUrl = "" + baseUrl + "/admin/api/user/tag.json";

  untagUrl = "" + baseUrl + "/admin/api/user/untag.json";

  templateUrl = "" + baseUrl + "/api/jstemplate";

  badRedirectUrl = "" + baseUrl + "/clients/badredirect";

  connectUrl = "" + baseUrl + "/connect";

  toType = function(obj) {
    return {}.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
  };

  map = function(model, obj, blocks, onlys) {
    var key, val, _results;
    if (blocks === void 0) {
      blocks = [];
    }
    if (onlys === void 0) {
      onlys = [];
    }
    _results = [];
    for (key in obj) {
      val = obj[key];
      if (Object.prototype.toString.call(val) === "[object Object]" && Object.prototype.toString.call(model[key]) === "[object Object]") {
        if (blocks.indexOf(key) === -1 && (onlys.indexOf(key) !== -1 || (onlys != null ? onlys.length : void 0) === 0)) {
          _results.push(map(model[key], obj[key], []));
        } else {
          _results.push(void 0);
        }
      } else {
        if (blocks.indexOf(key) === -1 && model[key] !== void 0 && (onlys.indexOf(key) !== -1 || (onlys != null ? onlys.length : void 0) === 0)) {
          _results.push(model[key] = val);
        } else {
          _results.push(void 0);
        }
      }
    }
    return _results;
  };

  fixBools = function(obj, keys) {
    var b, key, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = keys.length; _i < _len; _i++) {
      key = keys[_i];
      if (obj[key] === "true" || obj[key] === "false") {
        b = new Boolean;
        _results.push(obj[key] = b.valueOf(obj[key]));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  this.supports_html5_storage = function() {
    try {
      return __indexOf.call(window, 'localStorage') >= 0 && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  };

  User = (function() {

    function User(model) {
      this.username = this.email = this.password = this.verified = this.guest = this.admin = this.tags = this.subscribed = this.referred_by = this.id = null;
      map(this, model);
      fixBools(this, ['verified', 'guest', 'admin']);
    }

    User.prototype.serialize = function() {
      var params;
      params = [];
      params.push("email=" + this.email);
      params.push("pass=" + this.password);
      params.push("client_id=" + DC.clientId);
      if (DC.callback) {
        params.push("redirect_uri=" + DC.callback);
      }
      if (!DC.oauth) {
        params.push("ajax=true");
      }
      return params.join("&");
    };

    User.prototype.signup = function(cb) {
      var _this = this;
      return $.ajax({
        url: signUpUrl + "?" + this.serialize(),
        dataType: 'json',
        type: 'post',
        success: function(data) {
          if (data.worked) {
            if (DC.oauth) {
              document.location = data.redirect;
            }
            return cb(null, new User(data.user));
          } else {
            return cb(data.errors[0], null);
          }
        },
        error: function(e) {
          return cb(error("Server Error"));
        }
      });
    };

    User.prototype.signin = function(cb) {
      var _this = this;
      return $.ajax({
        url: "" + signInUrl + "?" + (this.serialize()),
        dataType: 'json',
        type: 'post',
        success: function(data) {
          if (data.worked) {
            if (DC.oauth) {
              document.location = data.redirect;
            }
            return cb(null, new User(data.user));
          } else {
            return cb(data.errors[0], null);
          }
        },
        error: function(e) {
          return cb(error("Server Error"));
        }
      });
    };

    return User;

  })();

  Dailycred = (function() {

    Dailycred.prototype.User = User;

    function Dailycred() {
      var opts;
      opts = window.dc_opts || {};
      map(this, opts);
    }

    Dailycred.prototype.init = function(opts) {
      var userId, _ref, _ref1,
        _this = this;
      opts = opts || {};
      opts.clientId = opts.clientId || ((_ref = window.dc_opts) != null ? _ref.clientId : void 0);
      this.oauth = opts.oauth || false;
      if (opts.clientId) {
        this.clientId = opts.clientId;
      } else {
        alert(this.clientIdRequired);
      }
      if (opts.callback) {
        this.callback = opts.callback;
      }
      if (opts.user) {
        this.currentUser = new User(opts.user);
      }
      if (opts.showModal) {
        $.ajax({
          url: "" + templateUrl + "?client_id=" + this.clientId,
          success: function(data) {
            return _this.modal = new ModalTemplate(data, opts.modal);
          },
          error: function(e) {
            if (e.status === 404) {
              return alert("It appears you have specified an invalid clientId. Please check your keys and try again");
            } else {
              return console.log("Something wrong happened while trying to get login form template from dailycred.");
            }
          }
        });
      }
      if (window.hasOwnProperty('olark')) {
        userId = ((_ref1 = DC.currentUser) != null ? _ref1.id : void 0) || null;
        olark('api.chat.onMessageToOperator', function(event) {
          return _this.event(userId, 'Olark Message Sent', event.message.body);
        });
        return olark('api.chat.onMessageToVisitor', function(event) {
          return _this.event(userId, 'Olark Message Received', event.message.body);
        });
      }
    };

    Dailycred.prototype.event = function(id, key, val, cb) {
      var url, valParam, valString;
      cb = cb || function() {};
      if (toType(val) === "function") {
        cb = val;
      }
      valParam = "valuestring";
      val = val || "";
      valString = "valuestring=" + val;
      if (toType(val) === "object") {
        valString = paramitizeObj(val, "valueobj");
      }
      url = "" + customEventUrl + "?";
      if (id !== null && id !== void 0) {
        url += "user_id=" + id + "&";
      }
      return $.ajax({
        url: "" + url + "key=" + key + "&" + valString + "&client_id=" + this.clientId,
        dataType: 'json',
        success: function(data) {
          var user;
          if (data.worked) {
            user = new User(data.user);
            return cb(null, user);
          } else {
            return cb(error("Unable to save user"));
          }
        },
        error: function() {
          return cb(error("Server error"));
        }
      });
    };

    Dailycred.prototype.tag = function(id, tag, cb) {
      return this.tagOrUntag(tagUrl, id, tag, cb);
    };

    Dailycred.prototype.untag = function(id, tag, cb) {
      return this.tagOrUntag(untagUrl, id, tag, cb);
    };

    Dailycred.prototype.tagOrUntag = function(url, id, tag, cb) {
      cb = cb || function() {};
      if (id === void 0 || tag === void 0) {
        throw "First two arguments are required (userId and tag)";
      }
      return $.ajax({
        url: "" + url + "?user_id=" + id + "&tag=" + tag + "&client_id=" + this.clientId,
        dataType: 'json',
        success: function(data) {
          if (data.worked) {
            return cb(null, new User(data.user));
          } else {
            return cb(error("Unable to save user"));
          }
        },
        error: function(e) {
          return cb(error("Server error"));
        }
      });
    };

    Dailycred.prototype.baseUrl = function() {
      return baseUrl;
    };

    Dailycred.prototype.connectWith = function(provider) {
      var params;
      params = ["client_id=" + this.client_id];
      if (this.callback) {
        params.push("redirect_uri=" + this.callback);
      }
      return document.location = "" + connectUrl + "?identity_provider=" + provider + "&client_id=" + this.clientId;
    };

    Dailycred.prototype.fbConnect = function() {
      return this.connectWith('facebook');
    };

    Dailycred.prototype.twitterConnect = function() {
      return this.connectWith('twitter');
    };

    Dailycred.prototype.googleConnect = function() {
      return this.connectWith('google');
    };

    return Dailycred;

  })();

  ModalTemplate = (function() {

    function ModalTemplate(data, opts) {
      var selector, _i, _len, _ref;
      this.template = data;
      this.render();
      dcModalInit();
      if (opts != null ? opts.triggers : void 0) {
        this.triggers = opts.triggers;
        _ref = this.triggers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          selector = _ref[_i];
          this.bindToEl($(selector));
        }
      }
    }

    ModalTemplate.prototype.render = function() {
      $(this.template).appendTo($('body'));
      return this.$el = $('#dc-modal');
    };

    ModalTemplate.prototype.bindToEl = function($el) {
      var _this = this;
      return $el.click(function() {
        _this.show();
        return false;
      });
    };

    ModalTemplate.prototype.show = function() {
      this.$el.dcModal('show');
      return setTimeout((function() {
        return $('#dc-form input[name="email"]').focus();
      }), 400);
    };

    ModalTemplate.prototype.hide = function() {
      return this.$el.dcModal('hide');
    };

    return ModalTemplate;

  })();

  error = function(message) {
    return {
      message: message,
      attribute: "form"
    };
  };

  this.DC = new Dailycred;

}).call(this);
