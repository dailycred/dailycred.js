# dailycred.js

This is a client side library for interacting with Dailycred.

## Installation

[Download the library](https://raw.github.com/dailycred/dailycred.js/master/tests/js/dailycred.js) and import it into your application:

~~~HTML
<script src="/assets/dailycred.js" type='text/javascript'></script>
~~~

Or if you prefer the s3-hosted version:

~~~HTML
<script src='https://s3.amazonaws.com/file.dailycred.com/js/dailycred.js' type='text/javascript'></script>
~~~

Then initialize the library with your [client_id](https://www.dailycred.com/admin/keys). Invoke the DC.init() method after the place you added the javascript tracking code:

~~~HTML
<script>
  DC.init({
    "clientId" : 'YOUR_CLIENT_ID', // your dailycred client_id, only required when not using the tracking script
    "callback" : 'http://your_callback_url.com/callback', //your OAuth callback URL. this is required if you specify OAuth == true
    "showModal": true, //optional, whether you would like to get a template login form
    "modal"    : {
      "triggers" : ["#sign-up-btn", '.auth-link'] //optional, if you specify showModal to true, you can specify this array of css selectors to invoke the login dialogue on click.
    },
    "oauth"    : true // defaults to false. Specifying OAuth to true will send all users to the specified callback URL after successfully signing in
  });
</script>  
~~~

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

If you specify **oauth** to be true in `DC.init()`, then after calling `DC.signin()` or `DC.signup()`, if everything went successful, they will be redirected to your OAuth callback URL, so that you can keep all of your authentication login in one place. 

## Fire an Event

The `event` method requires a `user_id` and `key` parameter, with an optional `value` parameter.

~~~javascript
DC.event user.id, "Visiting Demo Page"

DC.event "xxx-yyy-xxx-yyy", "Stopped Homepage Video", video.playbackTime

DC.event user.id, "Donated", $('#donation').val()
~~~

## Testing the Library

To run tests, run `rackup` and visit [localhost:9292](http://localhost:9292)

To auto-compile coffeescript on the fly, run  `guard`.

![](https://www.dailycred.com/dc.gif?client_id=dailycred&title=js_repo "dailycred")