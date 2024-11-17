function decodeString(encodedStr) {
    // Remove the '3TB' suffix
    const base64Str = encodedStr.replace(/3TB$/, '');
    
    // Decode the Base64 string
    const decodedStr = atob(base64Str);
    
    return decodedStr;
}

// Sample encoded strings from your code
let WBSPMES = `YWxhbXMQWFAMTIzNDU23TB`;
// Add other encoded strings as needed

// Decode and print the results
console.log("Decoded WBSPMES:", decodeString(WBSPMES));

// Repeat for other encoded strings as needed
