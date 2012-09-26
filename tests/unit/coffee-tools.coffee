$ ->
	module "coffee-tools"

	obj1 =
			name: 'hank'
			gender: 'male'
			skates: false
			skis: true

	test "basic mapping function", ->
		obj2 = 
			skis: false
		obj3 = obj1; obj3.skis = false
		_obj1 = obj1
		map _obj1, obj2
		deepEqual(_obj1, obj3, 'should only map one thing')

	test "map with exception", ->
		obj2 = 
			skis: false
			skates: true
		obj3 = obj1; obj3.skis = false
		_obj1 = obj1
		map _obj1, obj2, ['skates']
		deepEqual(_obj1, obj3, 'should only map one thing')
		ok(!_obj1.skates, 'shouldnt have mapped this')

	test "map with inclusion", ->
		obj2 = 
			skis: false
			skates: true
		obj3 = obj1; obj3.skis = false
		_obj1 = obj1
		map _obj1, obj2, [], ['skis']
		deepEqual(_obj1, obj3, 'should only map one thing')
		ok(!_obj1.skates, 'shouldnt have mapped this')

	test "map with multiple inclusion", ->
		obj2 = 
			skis: false
			skates: true
			gender: 'female'
		obj3 = obj1; obj3.skis = false; obj3.skates = true
		_obj1 = obj1
		map _obj1, obj2, [], ['skis', 'skates']
		deepEqual(_obj1, obj3, 'should only map one thing')
		deepEqual(_obj1.gender, 'male', 'shouldnt have mapped this')

	test "map with both", ->
		obj2 = 
			skis: false
			skates: true
		obj3 = obj1; obj3.skis = false
		_obj1 = obj1
		map _obj1, obj2, ['skates'], ['skis']
		deepEqual(_obj1, obj3, 'should only map one thing')
		#equal(_obj1.skates, false, 'shouldnt have mapped this')

	module("toType")

	test "correctly types objects", ->
		equal toType({}), 'object'
		equal toType([]), 'array'
		equal toType(""), 'string'
		equal toType(1), 'number'

	module "truncate"

	test "truncate long", ->
		long = 'hello world'
		short = 'hello'

		_long = truncate long, '10', '...'
		equal(_long, 'hello w...', 'should trucate correctly')
		_long = truncate long, '10', '..'
		equal(_long, 'hello wo..', 'should trucate correctly')

	test "truncate short", ->
		short = 'hello'
		_short = truncate short, 10, '...'
		equal(short, _short, 'should not truncate this')

	test "truncate works without custom ending", ->
		long = 'hello world'
		_long = truncate long, '10'
		equal(_long, 'hello w...', 'should trucate correctly')

	module "weird"

	test "weird function works", ->
		obj = 
			hello: 'world'
			do: ->
				console.log(whatup)

		result = """
		{"hello":"world","do":function () {
          return console.log(whatup);
        }}
		"""
		equal(wierd(obj), result, 'shouldnt weirdly print function')

	module "toTitleCase"

	test "toTitleCase", ->
		str = 'hello from mars'
		end = 'Hello From Mars'

		equal(toTitleCase(str), end, 'should capitalize properly')



