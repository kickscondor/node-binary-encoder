const lib = require('../');

module.exports = (t) => {
	t.test('OneOf', (t) => {
		const MyUnion = lib.OneOf({
			A: lib.Uint32(),
			B: lib.Varint(),
		});

		const enc1 = MyUnion.encode({A: 1});
		t.equal(MyUnion.last_bytes_encoded, 5);
		const enc2 = MyUnion.encode({B: 2});
		t.equal(MyUnion.last_bytes_encoded, 2);
		t.throws(() => MyUnion.encode({A: 1, B: 2}));

		const dec1 = MyUnion.decode(enc1);
		t.equal(dec1.A, 1);
		const dec2 = MyUnion.decode(enc2);
		t.equal(dec2.B, 2);

		const enc3 = Buffer.concat([Buffer.from([0,0,0,0]), enc1]);
		t.equal(MyUnion.decode(enc3, 4).A, 1);

		t.throws(() => MyUnion.encode({C: 1}));
		enc2[0] = 0xFE;
		t.throws(() => MyUnion.decode(enc2));
	});
}