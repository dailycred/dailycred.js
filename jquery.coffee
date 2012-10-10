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
  _.each hash, (v,k) ->
    if _.contains ["client_id","redirect_uri","state"], k
      parms.push("#{k}=#{v}")
  str = parms.join("&") + "&#{$el.serialize().replace(/[^&]+=\.?(?:&|$)/g, '').replace(/&$/, '').replace(/\?$/,'')}"
  if str.length > 0
    str = "?#{str}"
  str

methods =
  init: (opts) ->
    opts = opts || {}
    _.each defaults, (v, k) ->
      opts[k] = opts[k] || v
    this.data('dailycred',opts)
    this.submit (e) ->
      methods['submit'](e)
    this.find('input').keypress (e) ->
      if e.which == 13
        methods['submit'](e)
  submit: (e) ->
    if !e
      $el = this
    else
      e.preventDefault()
      $el = $(e.target)
    data = $el.data('dailycred')
    url = "#{data.site}#{data.action()}#{params(data,$el)}"
    $.ajax
      url: url
      dataType: 'json'
      type: 'post'
      success: (response) ->
        if response.worked
          data.success(response)
          data.after response
        else
          data.error(response.errors[0])
          data.after response.errors[0]
      error: ->
        e =
          message: "Server Error."
          attribute: "Form"
        data.error e
        data.after e
    false
  action: (action) ->
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
      $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' )


$(document).ready ->
  $('#dailycred').dailycred
    redirect_uri: "http://www.localhost:9000"
    client_id: "dailycred"
    style: 'user'
    after: (obj) ->
      $('#dailycred-jq-response').html JSON.stringify(obj, undefined, 2)
      prettyPrint()
  $('#demo-signup').click ->
    $('#dailycred').dailycred('action','signup').dailycred('submit')
    false