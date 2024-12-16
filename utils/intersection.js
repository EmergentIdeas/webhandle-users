function makeArray(val) {
	if(Array.isArray(val) == false) {
		val = [val]
	}
	
	return val
}

function intersection(one, two) {
	one = makeArray(one)
	two = makeArray(two)
	
	let outer 
	let inner
	
	if(one.length > two.length) {
		outer = one
		inner = two
	}
	else {
		outer = two
		inner = one
	}
	
	let intersection = []
	for(let o of outer) {
		if(inner.includes(o)) {
			intersection.push(o)
		}
	}
	
	return intersection
}

module.exports = intersection