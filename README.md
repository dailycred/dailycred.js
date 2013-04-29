# dailycred.js

This is a client side library for interacting with Dailycred.



## Authentication

~~~javascript
DC.signup({
  email: "email@test.com",
  password: "password"
}, function(error, user){
  if (error) {
    console.log("Error on " + error.attribute + ": " + error.message);
  } else {
    // do something with your user!
    console.log("Signup successful", user);
  }
});

DC.signin({
  email: "email@test.com",
  password: "password"
}, function(error, user){
  if (error) {
    console.log("Error on " + error.attribute + ": " + error.message);
  } else {
    // do something with your user!
    console.log("Signin successful", user);
  }
});
~~~

**Calling `signup` with an existing user's credentials will successfully sign them in.**

## Fire an Event

The `event` method requires a `user_id` and `key` parameter, with an optional `value` parameter.

~~~javascript
DC.event user.id, "Visiting Demo Page"

DC.event "xxx-yyy-xxx-yyy", "Stopped Homepage Video", video.playbackTime

DC.event user.id, "Donated", $('#donation').val()
~~~

### Testing

To run tests, run `rackup` and visit [localhost:9292](http://localhost:9292)

To auto-compile coffeescript on the fly, run  `guard`.

![](https://www.dailycred.com/dc.gif?client_id=dailycred&title=js_repo "dailycred")