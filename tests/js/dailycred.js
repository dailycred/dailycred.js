(function() {
  var Dailycred, ModalTemplate, User, badRedirectUrl, baseUrl, connectUrl, customEventUrl, defaults, error, fixBools, map, methods, params, signInUrl, signUpUrl, tagUrl, templateUrl, toType, untagUrl,
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
    var e;

    try {
      return __indexOf.call(window, 'localStorage') >= 0 && window['localStorage'] !== null;
    } catch (_error) {
      e = _error;
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

    User.prototype.successCb = function(data, cb) {
      var user;

      if (data.worked) {
        if (DC.oauth) {
          document.location = data.redirect;
        }
        user = new User(data.user);
        user.accessToken = data.access_token;
        return cb(null, user);
      } else {
        return cb(data.errors[0], null);
      }
    };

    User.prototype.signup = function(cb) {
      var _this = this;

      return $.ajax({
        url: signUpUrl + "?" + this.serialize(),
        dataType: 'json',
        type: 'post',
        success: function(data) {
          return _this.successCb(data, cb);
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
        olark('api.chat.onMessageToVisitor', function(event) {
          return _this.event(userId, 'Olark Message Received', event.message.body);
        });
      }
      if (opts.hashChanged) {
        this.hashChangedCallback = opts.hashChanged;
        return $(window).one('hashchange', function() {
          return _this.handleHashChange(opts.hashChanged);
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
            return cb(error("Unable to fire event for user"));
          }
        },
        error: function() {
          return cb(error("Server error"));
        }
      });
    };

    Dailycred.prototype.handleHashChange = function(cb) {
      var accessToken, url;

      accessToken = this.getTokenFromHash();
      if (accessToken === null) {
        return;
      }
      if (cb.length === 1) {
        return cb(accessToken);
      } else {
        url = "https://www.dailycred.com/graph/me.json?client_id=" + this.clientId + "&access_token=" + accessToken;
        return $.ajax({
          url: url,
          dataType: 'json',
          success: function(data) {
            return cb(accessToken, new User(data));
          }
        });
      }
    };

    Dailycred.prototype.getTokenFromHash = function() {
      var accessToken, hash, param, params, parts, tokenQuery, _i, _len;

      hash = document.location.hash;
      accessToken = null;
      tokenQuery = document.location.hash.substring(1);
      params = tokenQuery.split("&");
      for (_i = 0, _len = params.length; _i < _len; _i++) {
        param = params[_i];
        parts = param.split("=");
        if (parts[0].indexOf("access_token") !== -1) {
          accessToken = parts[1];
        }
      }
      return accessToken;
    };

    Dailycred.prototype.tag = function(id, tag, cb) {
      return this.tagOrUntag(tagUrl, id, tag, cb);
    };

    Dailycred.prototype.untag = function(id, tag, cb) {
      return this.tagOrUntag(untagUrl, id, tag, cb);
    };

    Dailycred.prototype.signup = function(params, cb) {
      var user;

      user = new User(params);
      return user.signup(cb);
    };

    Dailycred.prototype.signin = function(params, cb) {
      var user;

      user = new User(params);
      return user.signin(cb);
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

  defaults = {
    site: "https://www.dailycred.com",
    style: 'oauth',
    method: 'signin',
    action: function() {
      return "/" + this.style + "/api/" + this.method + ".json";
    },
    error: function() {},
    success: function() {},
    after: function() {}
  };

  params = function(hash, $el) {
    var parms, str;

    parms = [];
    $.each(hash, function(k, v) {
      if (["client_id", "redirect_uri", "state"].indexOf(k) > -1) {
        return parms.push("" + k + "=" + v);
      }
    });
    str = parms.join("&") + ("&" + ($el.serialize().replace(/[^&]+=\.?(?:&|$)/g, '').replace(/&$/, '').replace(/\?$/, '')));
    if (str.length > 0) {
      str = "?" + str;
    }
    return str;
  };

  methods = {
    init: function(opts) {
      opts = opts || {};
      $.each(defaults, function(k, v) {
        return opts[k] = opts[k] || v;
      });
      this.data('dailycred', opts);
      this.submit(function(e) {
        methods['submit']($(e.target));
        return e.preventDefault();
      });
      this.find('input').keyup(function(e) {
        if (e.which === 13) {
          methods['submit']($(e.target).closest('form'));
          return e.preventDefault();
        }
      });
      return this;
    },
    submit: function($el) {
      var data, url;

      if (!$el) {
        $el = this;
      }
      data = $el.data('dailycred');
      url = "" + data.site + (data.action()) + (params(data, $el));
      $.ajax({
        url: url,
        dataType: 'json',
        type: 'post',
        success: function(response) {
          if (response.worked) {
            return data.after(void 0, response);
          } else {
            return data.after(response.errors[0]);
          }
        },
        error: function() {
          var e;

          e = {
            message: "Server Error.",
            attribute: "Form"
          };
          return data.after(e);
        }
      });
      return false;
    },
    method: function(action) {
      var data;

      data = this.data('dailycred');
      data.method = action;
      return this.data('dailycred', data);
    }
  };

  $.fn.dailycred = function(method, arg) {
    return this.each(function() {
      var $this;

      $this = $(this);
      if (methods[method]) {
        return methods[method].apply($this, [arg]);
      } else if (typeof method === 'object' || !method) {
        return methods.init.apply($this, [method]);
      } else {
        return $.error('Method ' + method + ' does not exist on jQuery.dailycred');
      }
    });
  };

}).call(this);
