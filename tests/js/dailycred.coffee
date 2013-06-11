# URLS

baseUrl =  (dc_opts?.home) || "https://www.dailycred.com"
signInUrl = "#{baseUrl}/oauth/api/signin.json"
signUpUrl = "#{baseUrl}/oauth/api/signup.json"
customEventUrl = "#{baseUrl}/admin/api/customevent.json"
tagUrl = "#{baseUrl}/admin/api/user/tag.json"
untagUrl = "#{baseUrl}/admin/api/user/untag.json"
templateUrl = "#{baseUrl}/api/jstemplate"
badRedirectUrl = "#{baseUrl}/clients/badredirect"
connectUrl = "#{baseUrl}/connect"

# private Utils

# get the type of an object
toType = (obj) ->
  ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()

map = (model, obj, blocks, onlys) ->
  blocks = []  if blocks is undefined
  onlys = []  if onlys is undefined
  for key, val of obj
    if Object::toString.call(val) is "[object Object]" and Object::toString.call(model[key]) is "[object Object]"
      map model[key], obj[key], []  if blocks.indexOf(key) is -1 and (onlys.indexOf(key) isnt -1 or onlys?.length is 0)
    else model[key] = val  if blocks.indexOf(key) is -1 and model[key] isnt undefined and (onlys.indexOf(key) isnt -1 or onlys?.length is 0)

fixBools = (obj, keys) ->
  for key in keys
    if obj[key] == "true" || obj[key] == "false"
      b = new Boolean
      obj[key] = b.valueOf obj[key]

@supports_html5_storage = ->
  try
    return 'localStorage' in window && window['localStorage'] != null
  catch e
    return false

# The User model

# has:
    # username
    # email
    # password
    # verified
    # guest
    # admin
    # tags
    # subscribed
    # referred_by
    # id

class User

  constructor: (model) ->
    @username = @email = @password = @verified = @guest = @admin = @tags = @subscribed = @referred_by = @id = null
    map @, model
    fixBools @, ['verified', 'guest', 'admin']


  # utility for making url parameters
  # returns a string of parameters to append to a url
  # => "email=email@email.com&pass=password&client_id=..."
  serialize: ->
    params = []
    params.push "email=#{@email}"
    params.push "pass=#{@password}"
    params.push "client_id=#{DC.clientId}"
    if DC.callback
      params.push "redirect_uri=#{DC.callback}"
    if !DC.oauth
      params.push "ajax=true"
    params.join "&"

  successCb: (data, cb) ->
    if data.worked
      document.location = data.redirect if DC.oauth
      user = new User(data.user)
      user.accessToken = data.access_token
      cb null, user
    else
      cb data.errors[0], null

  #signup a user
  # cb is a function that takes and error
  # and a user object if successful, like
  # function(e, user){}
  signup: (cb) ->
    $.ajax
      url: signUpUrl + "?" + @serialize()
      dataType: 'json'
      type: 'post'
      success: (data) =>
        @successCb data, cb
      error: (e) =>
        cb error "Server Error"

  # see User#signin
  signin: (cb) ->
    $.ajax
      url: "#{signInUrl}?#{@serialize()}"
      dataType: 'json'
      type: 'post'
      success: (data) =>
        if data.worked
          document.location = data.redirect if DC.oauth
          cb null, new User(data.user)
        else
          cb data.errors[0], null
      error: (e) =>
          cb error "Server Error"

# ##Dailycred
  # an instance is already created, called 'DC'
  # have some function on every page that calls
  # DC.init(opts) where opts is an object
  # see Dailycred#init for details
class Dailycred
  User: User

  constructor: ->
    opts = window.dc_opts || {}
    map @, opts

  # opts:
    # clientId
    # callback
    # user
    # showModal
    # modal
    #   triggers
  init: (opts) ->
    opts = opts || {}
    opts.clientId = opts.clientId || window.dc_opts?.clientId
    @oauth = opts.oauth || false
    if opts.clientId
      @clientId = opts.clientId
    else
      alert @clientIdRequired
    if opts.callback
      @callback = opts.callback
    if opts.user
      @currentUser = new User opts.user
    if opts.showModal
      #get template from dailycred
      $.ajax
        url: "#{templateUrl}?client_id=#{@clientId}"
        success: (data) =>
          @modal = new ModalTemplate(data, opts.modal)
        error: (e) ->
          if e.status == 404
            alert "It appears you have specified an invalid clientId. Please check your keys and try again"
          else
            console.log "Something wrong happened while trying to get login form template from dailycred."
    if window.hasOwnProperty('olark')
      userId = DC.currentUser?.id || null
      olark 'api.chat.onMessageToOperator', (event) =>
        @event userId, 'Olark Message Sent', event.message.body
      olark 'api.chat.onMessageToVisitor', (event) =>
        @event userId, 'Olark Message Received', event.message.body
      #if opts.triggers
        #fire events on custom elements
    if opts.hashChanged
      @hashChangedCallback = opts.hashChanged
      $(window).one 'hashchange', =>
        @handleHashChange(opts.hashChanged)
        

  event: (id, key, val, cb)->
    cb = cb || ->
    if toType(val) == "function" then cb = val
    valParam = "valuestring"
    val = val || ""
    valString = "valuestring=#{val}"
    if toType(val) == "object" then valString = paramitizeObj val, "valueobj"
    url = "#{customEventUrl}?"
    if id != null and id != undefined
      url += "user_id=#{id}&"
    $.ajax
      url: "#{url}key=#{key}&#{valString}&client_id=#{@clientId}"
      dataType: 'json'
      success: (data) ->
        if data.worked
          user = new User data.user
          cb(null, user)
        else
          cb error("Unable to fire event for user")
      error: ->
        cb error "Server error"

  handleHashChange: (cb)->
    accessToken = @getTokenFromHash()
    return if accessToken == null
    if cb.length == 1
      cb(accessToken)
    else
      url = "https://www.dailycred.com/graph/me.json?client_id=#{@clientId}&access_token=#{accessToken}"
      $.ajax
        url: url
        dataType: 'json'
        success: (data) ->
          cb(accessToken, new User(data))

  getTokenFromHash: ->
    hash = document.location.hash
    accessToken = null
    tokenQuery = document.location.hash.substring(1)
    params = tokenQuery.split("&")
    for param in params
      parts = param.split("=")
      if parts[0].indexOf("access_token") != -1
        accessToken = parts[1]
    accessToken

  tag: (id, tag, cb) ->
    @tagOrUntag tagUrl, id, tag, cb

  untag: (id, tag, cb) ->
    @tagOrUntag untagUrl, id, tag, cb

  signup: (params, cb) ->
    user = new User(params)
    user.signup(cb)

  signin: (params, cb) ->
    user = new User(params)
    user.signin(cb)

  tagOrUntag: (url, id, tag, cb)->
    cb = cb || ->
    if id == undefined || tag == undefined
      throw "First two arguments are required (userId and tag)"
    $.ajax
      url: "#{url}?user_id=#{id}&tag=#{tag}&client_id=#{@clientId}"
      dataType: 'json'
      success: (data) ->
        if data.worked
          cb(null, new User(data.user))
        else
          cb error("Unable to save user")
      error: (e)->
        cb error "Server error"

  baseUrl: ->
    baseUrl


  # -------------
  # Social Connect
  # -------------

  connectWith: (provider) ->
    params = ["client_id=#{@client_id}"]
    if @callback
      params.push "redirect_uri=#{@callback}"
    document.location = "#{connectUrl}?identity_provider=#{provider}&client_id=#{@clientId}"

  fbConnect: ->
    @connectWith 'facebook'

  twitterConnect: ->
    @connectWith 'twitter'

  googleConnect: ->
    @connectWith 'google'


class ModalTemplate

  constructor: (data, opts) ->
    @template = data
    @render()
    dcModalInit()
    if opts?.triggers
      @triggers = opts.triggers
      for selector in @triggers
        @bindToEl $(selector)


  render: ->
    $(@template).appendTo $('body')
    @$el = $('#dc-modal')
    # @show()


  bindToEl: ($el) ->
    $el.click =>
      @show()
      false

  show: ->
    @$el.dcModal 'show'
    setTimeout (-> $('#dc-form input[name="email"]').focus()), 400

  hide: ->
    @$el.dcModal 'hide'




error = (message) ->
  {message: message, attribute: "form"}

@DC = new Dailycred

# Jquery plugin

defaults =
  site: "https://www.dailycred.com"
  style: 'oauth'
  method: 'signin'
  action: ->
    "/#{this.style}/api/#{this.method}.json"
  error: ->
  success: ->
  after: ->

params = (hash, $el) ->
  parms = []
  $.each hash, (k,v) ->
    if ["client_id","redirect_uri","state"].indexOf(k) > -1
      parms.push("#{k}=#{v}")
  str = parms.join("&") + "&#{$el.serialize().replace(/[^&]+=\.?(?:&|$)/g, '').replace(/&$/, '').replace(/\?$/,'')}"
  if str.length > 0
    str = "?#{str}"
  str

methods =
  init: (opts) ->
    opts = opts || {}
    $.each defaults, (k,v) ->
      opts[k] = opts[k] || v
    this.data('dailycred',opts)
    this.submit (e) ->
      methods['submit']($(e.target))
      e.preventDefault()
    this.find('input').keyup (e) ->
      if e.which == 13
        methods['submit']($(e.target).closest('form'))
        e.preventDefault()
    this
  submit: ($el) ->
    if !$el
      $el = this
    data = $el.data('dailycred')
    url = "#{data.site}#{data.action()}#{params(data,$el)}"
    $.ajax
      url: url
      dataType: 'json'
      type: 'post'
      success: (response) ->
        if response.worked
          data.after undefined, response
        else
          data.after response.errors[0]
      error: ->
        e =
          message: "Server Error."
          attribute: "Form"
        data.after e
    false
  method: (action) ->
    data = this.data('dailycred')
    data.method = action
    this.data('dailycred', data)
    
$.fn.dailycred = (method, arg)->
  this.each ->
    $this = $(this)
    if methods[method]
      return methods[method].apply( $this, [arg])
    else if typeof method == 'object' || ! method
      return methods.init.apply( $this, [method] )
    else
      $.error( 'Method ' +  method + ' does not exist on jQuery.dailycred' )




