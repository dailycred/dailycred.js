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

  makeToken = ->
    text = ""
    possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    for i in [0..24]
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    text

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
      equal randomEmail, user.email
      start()

  test "sign in a user", ->
    user = newUser()
    stop()
    user.signin (e, user) ->
      ok !e
      ok user
      equal randomEmail, user.email
      start()

  test "failed login", ->
    user = newUser()
    user.password = "wrongpass"
    stop()
    user.signin (e, user) ->
      ok e
      ok !user
      equal e.attribute, "form"
      start()

  ## Now use the DC shorthand methods
  module "DC alias methods"

  test "sign up a user", ->
    stop()
    DC.signup baseUser2, (e, user) ->
      ok !e
      ok user
      equal randomEmail2, user.email
      start()

  test "sign in a user", ->
    stop()
    DC.signin baseUser2, (e, user) ->
      ok !e
      ok user
      equal randomEmail2, user.email
      start()

  test "failed login", ->
    stop()
    DC.signin {email: randomEmail2, password: "wrongpass"}, (e, user) ->
      ok e
      ok !user
      equal e.attribute, "form"
      start()

  module "fragment callback method"

  test "parsing many access token responses", ->
    document.location.hash = ""
    testHashChange = (hash, expected, expected_user) ->
      failTimeout = ->
        ok(false, "Timeout while waiting for hashChanged callback.")
        start()
      timeout = null
      t = (s) ->
        timeout = setTimeout failTimeout, s*1000
      stop()
      document.location.hash = ""
      if expected_user
        DC.init
          clientId: "4133a23f-b9c3-47e4-8989-cfb30510079d"
          hashChanged: (accessToken, user) ->
            clearTimeout(timeout)
            ok(accessToken == expected, "access token should be returned correctly")
            ok(accessToken.indexOf("access_token") == -1, "access token should not include the words 'access_token'")
            ok(user, "user should be initialized")
            ok(user.email == baseUser2.email, "user should have correct email set")
            start()
      else
        DC.init
          clientId: "4133a23f-b9c3-47e4-8989-cfb30510079d"
          hashChanged: (accessToken) ->
            clearTimeout(timeout)
            equal(accessToken, expected, "access token should be returned correctly")
            ok(accessToken.indexOf("access_token") == -1, "access token should not include the words 'access_token'")
            start()
      document.location.hash = hash
      timeoutSeconds = if expected_user then 10 else 5
      t(timeoutSeconds)
    randomToken = makeToken()
    testHashChange("expires_in=2435391989&access_token=#{randomToken}",randomToken)
    stop()
    DC.signup baseUser2, (e, user) ->
      unless user
        ok(false, "failed to create user")
        return
      token = user.accessToken
      testHashChange("access_token=#{token}",token, user)
      testHashChange("expires_in=never&access_token=#{token}",token, user)
      start()

  test "parsing hash function", ->
    testHashParse = (hash, token) ->
      document.location.hash = hash
      equal(DC.getTokenFromHash(), token)
    testHashParse("access_token=blahblah", "blahblah")
    testHashParse("?access_token=blah&expires_in=25030282", "blah")
    testHashParse("expires_in=2435391989&response_type=token&access_token=329jk-dsfjij1-2321","329jk-dsfjij1-2321")


  # test "callback returns the user from the access token", ->
  #   token = null
  #   stop()
  #   DC.signup baseUser2, (e, user) ->
  #     token = user.accessToken if user
  #     # ok(token instanceof String, "user gets access token set")
  #     document.location.hash = ""
  #     DC.init
  #       clientId: "4133a23f-b9c3-47e4-8989-cfb30510079d"
  #       hashChanged: (accessToken, user) ->
  #         clearTimeout(TIMEOUT)
  #         ok(accessToken == token, "access token should be returned correctly")
  #         ok(accessToken.indexOf("access_token") == -1, "access token should not include the words 'access_token'")
  #         ok(user, "user should be initialized")
  #         ok(user.email == baseUser2.email, "user should have correct email set")
  #         start()
  #     document.location.hash = "access_token=#{token}"
  #     t(10)


