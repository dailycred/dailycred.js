task :upload do
  #upload to s3
  require 'aws/s3'
  AWS::S3::Base.establish_connection!(
    :access_key_id     => ENV['DC_AWS_ACCESS_KEY'],
    :secret_access_key => ENV['DC_AWS_SECRET_KEY']
  )

  AWS::S3::S3Object.store(
    "js/dailycred.js",
    File.open("tests/js/dailycred.js"),
    'file.dailycred.com',
    :content_type => 'text/javascript')

  print "Uploaded.\n"
end

task :default => :upload

desc 'docs'
task :docs do
  require 'fileutils'
  require 'maruku'
  md = ""
  File.open("README.md", "r") do |infile|
    while (line = infile.gets)
      md += line
    end
  end
  doc = Maruku.new(md)
  File.open("/Users/hank/java/dailycred/app/views/tags/docs/javascriptsdk.html", 'w') {|f| f.write doc.to_html}
end