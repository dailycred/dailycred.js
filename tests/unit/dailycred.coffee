$ ->
  module "dailycred SDK"

  DC.init
    clientId: "4337ed55-aaca-4e38-8824-6c016c59dd5b"
    oauth: false

  user_id = "97a85558-c5a6-47de-ab89-4e7de02c99bd"
  randomEmail = "dctest#{Math.floor(Math.random()*11111)}@dailycred.com"
  secret = "34f2ecc3-f955-4292-9747-39b876d91d8b-a4f7ad8e-f8a4-4573-b23d-686f6e28a820"

  baseUser = new DC.User
    email: randomEmail
    password: "password"

  newUser = ->
    $.extend true, {}, baseUser

  test "tagging a user", ->
    stop()
    DC.tag user_id, "loser", (e, user)->
      ok !e
      ok user
      ok(user.tags.indexOf('loser') > -1)
      start()

  test "untagging a user", ->
    stop()
    DC.untag user_id, "loser", (e, user)->
      ok !e
      ok user
      ok(!user.tags)
      start()

  test "creating an event", ->
    stop()
    DC.event user_id, "became awesome", null, (e, user)->
      ok !e
      ok user
      start()

  test "sign up a user", ->
    stop()
    user = newUser()
    user.signup (e, user) ->
      ok !e
      ok user
      equals randomEmail, user.email
      start()

  test "sign in a user", ->
    user = newUser()
    stop()
    user.signin (e, user) ->
      ok !e
      ok user
      equals randomEmail, user.email
      start()

  test "failed login", ->
    user = newUser()
    user.password = "wrongpass"
    stop()
    user.signin (e, user) ->
      ok e
      ok !user
      equals e.attribute, "form"
      start()

  test "delete user", ->
    stop()
    url = "#{DC.baseUrl()}/admin/test-delete?email=#{randomEmail}&key=#{secret}&id=#{DC.clientId}"
    $.ajax
      url: url
      success: (data)->
        equals data, "success"
        start()
      error: (e) ->
        ok false
        console.log "Delete user failed.","Total: ", details.total, " Failed: ", details.failed, " Passed: ", details.passed, " Runtime: ", details.runtime
        start()