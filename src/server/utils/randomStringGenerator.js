const randomStringGenerator = (length = 24) => {
  const result = [];
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + // Upper Case
    'abcdefghijklmnopqrstuvwxyz' + // Lower Case
    '0123456789' +                 // Numbers
    '!() -.? []_#~;: @#$%^&*+=';   // Specials Chars
  for (let i = 0; i < length; i++) {
    result.push(
      chars.charAt(
        Math.floor(
          Math.random() * chars.length
        )
      )
    );
  }
  return result.join('');
};

module.exports = randomStringGenerator;
