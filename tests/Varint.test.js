const Varint = require('../types/Varint');

module.exports = (t) => {
	t.test('Varint', (t) => {
		const original = 42;
		const encoder = new Varint();
		const encoded = encoder.encode(original);
		t.equal(encoded.length, 1, 'Expecting 1 bytes for a small varint value');
		t.equal(encoder.last_bytes_encoded, 1, 'State reports 1 bytes');

		const bigger = 2048;
		const bigger_encoded = encoder.encode(bigger);
		t.equal(bigger_encoded.length, 2, 'Expecting 2 bytes for higher varint values');
		t.equal(encoder.last_bytes_encoded, 2, 'State reports 2 bytes');

		t.equal(encoder.decode(encoded), original, 'Proper 1 byte decode');
		t.equal(encoder.last_bytes_decoded, 1);
		t.equal(encoder.decode(bigger_encoded), bigger, 'Proper 2 byte decode');
		t.equal(encoder.last_bytes_decoded, 2);

		t.throws(() => {
			encoder.decode([255, 255]);
		}, 'Decoding invalid varints throws');

		t.throws(() => {
			encoder.decode([128/*, 16*/]);
		}, 'Decoding a partial buffer throws');

		t.throws(() => {
			encoder.decode([0, 128/*, 16*/], 1);
		}, 'Decoding outside of the buffer throws');

		t.throws(() => encoder.encode({}));
	});
}