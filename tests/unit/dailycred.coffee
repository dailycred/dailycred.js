$ ->

  DC.init
    clientId: "4133a23f-b9c3-47e4-8989-cfb30510079d"

  user_id = "539cdef5-3bdc-4133-9f6c-34f68f1c54bc"
  randomEmail = "dctest#{Math.floor(Math.random()*11111)}@dailycred.com"
  randomEmail2 = "dctest#{Math.floor(Math.random()*11111)}@dailycred.com"
  secret = "a1c21e72-98d8-47c2-9e9a-1e2dcd363b2f-f353b2af-1f51-416c-ad4c-59e70721dfab"

  baseUser = new DC.User
    email: randomEmail
    password: "password"

  baseUser2 = {
    email: randomEmail2
    password: "password"
  }

  newUser = ->
    $.extend true, {}, baseUser

  # test "tagging a user", ->
  #   stop()
  #   DC.tag user_id, "loser", (e, user)->
  #     ok !e
  #     ok user
  #     # ok(user.tags.indexOf('loser') > -1)
  #     start()

  # test "untagging a user", ->
  #   stop()
  #   DC.untag user_id, "loser", (e, user)->
  #     ok !e
  #     ok user
  #     # ok(!user.tags)
  #     start()

  module "events"

  test "creating an event", ->
    stop()
    DC.event user_id, "became awesome", null, (e, user)->
      ok !e
      ok user
      start()

  module "User class"

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

  ## Now use the DC shorthand methods
  module "DC alias methods"

  test "sign up a user", ->
    stop()
    DC.signup baseUser2, (e, user) ->
      ok !e
      ok user
      equals randomEmail2, user.email
      start()

  test "sign in a user", ->
    stop()
    DC.signin baseUser2, (e, user) ->
      ok !e
      ok user
      equals randomEmail2, user.email
      start()

  test "failed login", ->
    stop()
    DC.signin {email: randomEmail2, password: "wrongpass"}, (e, user) ->
      ok e
      ok !user
      equals e.attribute, "form"
      start()