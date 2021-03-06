var charsToEscape = /[&<>\"\']/;
var escapeCharacters = [
  [/&/g, '&amp;'],
  [/</g, '&lt;'],
  [/>/g, '&gt;'],
  [/\"/g, '&quot;']
];
// closing syntax highlighting from quote "

module.exports = function(str) {
  if (charsToEscape.test(str)) {
    for (var i = 0; i < escapeCharacters.length; i++) {
      str = str.replace(escapeCharacters[i][0], escapeCharacters[i][1]);
    }
  }
  return str;
};
