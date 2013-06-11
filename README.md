# dailycred.js

This is a client side library for interacting with Dailycred.

## Installation

[Download the library](https://s3.amazonaws.com/file.dailycred.com/js/dailycred.js) and import it into your application:


    <script src="/assets/dailycred.js" type='text/javascript'></script>


Or if you prefer the s3-hosted version:


    <script src='https://s3.amazonaws.com/file.dailycred.com/js/dailycred.js' type='text/javascript'></script>


Then initialize the library with your [client_id](https://www.dailycred.com/admin/keys). Invoke the DC.init() method after the place you added the javascript tracking code:


    <script>
      DC.init({
        "clientId" : 'YOUR_CLIENT_ID', // your dailycred client_id, only required when not using the tracking script
        "callback" : 'http://your_callback_url.com/callback', //your OAuth callback URL. this is required if you specify OAuth == true
        "oauth"    : true, // defaults to false. Specifying OAuth to true will send all users to the specified callback URL after successfully signing in
        "hashChanged": function(accessToken, user){ alert("Hello "+user.email+"!");} // this callback will only be fired during the client-side Oauth flow. If an access_token parameter is present in the url's hash fragment, the user will be automatically fetched for you. If you don't specify a second parameter in this function, the user won't be fetched and the access token will be parsed and returned immediately.
      });
    </script>  


## Authentication


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


Calling `signup` with an existing user's credentials will successfully sign them in.

If you specify **oauth** to be true in `DC.init()`, then after calling `DC.signin()` or `DC.signup()`, if everything went successful, they will be redirected to your OAuth callback URL, so that you can keep all of your authentication login in one place. 

## Fire an Event

The `event` method requires a `user_id` and `key` parameter, with an optional `value` parameter.


	DC.event user.id, "Visiting Demo Page"

	DC.event "xxx-yyy-xxx-yyy", "Stopped Homepage Video", video.playbackTime
	
	DC.event user.id, "Donated", $('#donation').val()


## jQuery Plugin

### This library includes a jQuery plugin for building HTML forms with Dailycred.

Visit [the documentation on dailycred](https://www.dailycred.com/docs/jquery) for usage and tips.