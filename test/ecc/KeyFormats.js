import { Aes, PrivateKey, PublicKey, Address } from "../../lib";
import assert from "assert";
import {ChainConfig} from "@r-squared/rsquared-js-ws";

var test = function(key) {
    describe("KeyFormats", function() {
        before(function() {
            ChainConfig.reset();
        });

        describe("Key Formats", function() {

            it("Calculates public key from private key", function() {
                var private_key = PrivateKey.fromHex(key.private_key);
                var public_key = private_key.toPublicKey();
                assert.equal(key.public_key, public_key.toPublicKeyString());
            });

            it("Create REV short address", function() {
                var public_key = PublicKey.fromPublicKeyString(key.public_key);
                assert.equal(key.rqrx_address, public_key.toAddressString());
            })

            it("Blockchain Address", function() {
                var public_key = PublicKey.fromPublicKeyString(key.public_key);
                assert.equal(key.blockchain_address, public_key.toBlockchainAddress().toString('hex'));
            });

            it("REV public key import / export", function() {
                var public_key = PublicKey.fromPublicKeyString(key.public_key);
                assert.equal(key.public_key, public_key.toPublicKeyString());
            });

            it("PTS", function() {
                var private_key = PrivateKey.fromHex(key.private_key);
                var public_key = private_key.toPublicKey();
                assert.equal(key.pts_address, public_key.toPtsAddy());
            });

            it("To WIF", function() {
                var private_key = PrivateKey.fromHex(key.private_key);
                assert.equal(key.private_key_WIF_format, private_key.toWif());
            });

            it("From WIF", function() {
                var private_key = PrivateKey.fromWif(key.private_key_WIF_format);
                assert.equal(private_key.toHex(), key.private_key);
            });

            it("Calc public key", function() {
                var private_key = PrivateKey.fromHex(key.private_key);
                var public_key = private_key.toPublicKey();
                assert.equal(key.rqrx_address, public_key.toAddressString());
            });

            it("Decrypt private key", function() {
                var aes = Aes.fromSeed("Password00");
                var d = aes.decryptHex(key.encrypted_private_key);
                assert.equal(key.private_key, d);
            });

            it("REV/BTC uncompressed", function() {
                var public_key = PublicKey.fromPublicKeyString(key.public_key);
                var address = Address.fromPublic(public_key, false, 0);
                assert.equal(key.Uncompressed_BTC, address.toString());
            });

            it("REV/BTC compressed", function() {
                var public_key = PublicKey.fromPublicKeyString(key.public_key);
                var address = Address.fromPublic(public_key, true, 0);
                assert.equal(key.Compressed_BTC, address.toString());
            });

            it("REV/PTS uncompressed", function() {
                var public_key = PublicKey.fromPublicKeyString(key.public_key);
                var address = Address.fromPublic(public_key, false, 56);
                assert.equal(key.Uncompressed_PTS, address.toString());
            });

            it("REV/PTS compressed", function() {
                var public_key = PublicKey.fromPublicKeyString(key.public_key);
                var address = Address.fromPublic(public_key, true, 56);
                assert.equal(key.Compressed_PTS, address.toString());
            });

            it("Null public key to/from buffer", function() {
                var public_key = PublicKey.fromStringOrThrow(key.null_public_key);
                var buffer = public_key.toBuffer();
                var new_public_key = PublicKey.fromBuffer(buffer);
                assert.equal(new_public_key.toPublicKeyString(), key.null_public_key);
            });
        });
    });
};

test({
    public_key: "CBA7jDPoMwyjVH5obFmqzFNp4Ffp7G2nvC7FKFkrMBpo7Sy4uq5Mj",
    private_key: "20991828d456b389d0768ed7fb69bf26b9bb87208dd699ef49f10481c20d3e18",
    private_key_WIF_format: "5J4eFhjREJA7hKG6KcvHofHMXyGQZCDpQE463PAaKo9xXY6UDPq",
    bts_address: "CBA8DvGQqzbgCR5FHiNsFf8kotEXr8VKD3mR",
    pts_address: "Po3mqkgMzBL4F1VXJArwQxeWf3fWEpxUf3",
    encrypted_private_key: "5e1ae410919c450dce1c476ae3ed3e5fe779ad248081d85b3dcf2888e698744d0a4b60efb7e854453bec3f6883bcbd1d",
    blockchain_address: "4f3a560442a05e4fbb257e8dc5859b736306bace",
    Uncompressed_BTC:	"CBALAFmEtM8as1mbmjVcj5dphLdPguXquimn",
    Compressed_BTC:	"CBAANNTSEaUviJgWLzJBersPmyFZBY4jJETY",
    Uncompressed_PTS:	"CBAEgj7RM6FBwSoccGaESJLC3Mi18785bM3T",
    Compressed_PTS:	"CBAD5rYtofD6D4UHJH6mo953P5wpBfMhdMEi",
    null_public_key: "CBA1111111111111111111111111111111114T1Anm"
});
