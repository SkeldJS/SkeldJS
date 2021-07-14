## @skeldjs/dtls

😔

My sad, no-good implementation of the god-awful, disgusting, horrendous, hellspawn
of a dtls library https://github.com/willardf/Hazel-Networking/tree/master/Hazel/Dtls.

NEVER do I want to set foot into dtls territory again. Over 30 hours of grueling,
painful debugging.

Only does cipher suite TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256, feel free to add
another yourself, I personally will not. Ever.

Also only does curve x25519, which is perhaps the bane of my existence.

It should be secure, although I provide 0 guarantees and I refuse to check because
of how bad this is.

You can install it with `@skeldjs/dtls`, and it provides a `DtlsSocket` library.

Feel free to ruin the rest of my days with issues, if you encounter issues.

Some highlights:
https://github.com/SkeldJS/SkeldJS/blob/97a7154de35c786864ae9d1823dfbbbcea365fde/packages/dtls/lib/X25519EcdheRsaSha256.ts#L865
I couldn't find an alternative for `RSAPKCS1SignatureDeformatter` in nodejs, and whatever I tried didn't work.

https://github.com/SkeldJS/SkeldJS/blob/97a7154de35c786864ae9d1823dfbbbcea365fde/packages/dtls/lib/X25519EcdheRsaSha256.ts#L49
BigInt BigInt BigInt BigInt BigInt BigInt BigInt BigInt BigInt BigInt BigInt BigInt

https://github.com/SkeldJS/SkeldJS/blob/282c311c5539b8230bcabee7c5aae3dcb02da056/packages/dtls/lib/DtlsSocket.ts#L502
https://github.com/willardf/Hazel-Networking/blob/2a4a13eeb77b969743d656e114cd2de6479499e6/Hazel/Dtls/PrfSha256.cs#L11
master secert

https://github.com/SkeldJS/SkeldJS/blob/97a7154de35c786864ae9d1823dfbbbcea365fde/packages/dtls/lib/AeadAes128Gcm.ts#L29
This is NOT `aes-128-gcm`. Why does it work? Who knows.


![image](https://user-images.githubusercontent.com/60631511/124619267-6826aa80-de70-11eb-87ce-e5c84d2327b6.png)

Lots of helpful debugging with help from https://github.com/auproximity/GetAuthToken,
as well as [Impostor](https://github.com/Impostor/Impostor).
