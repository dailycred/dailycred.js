use Rack::Static, 
  :urls => ["/unit", "/vendor", "/js"],
  :root => "tests"

run lambda { |env|
  [
    200, 
    {
      'Content-Type'  => 'text/html', 
      'Cache-Control' => 'public, max-age=86400' 
    },
    File.open('test.html', File::RDONLY)
  ]
}