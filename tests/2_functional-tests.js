const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

after(function () {
  chai.request(server).get("/api");
});

chai.use(chaiHttp);

suite('Functional Tests', function(done) {

        test("Viewing one stock: GET request to /api/stock-prices/", function (done) {
            chai
            .request(server)
            .keepOpen()
            .get("/api/stock-prices?stock=goog")
            .end(function (err, res) {
            assert.equal(res.status, 200, "status must be 200");
            assert.isObject(res.body, "response should be an object");
            done();
            });
        });
        
        
        test("Viewing one stock and liking it: GET request to /api/stock-prices/", function (done) {
            chai
            .request(server)
            .keepOpen()
            .get("/api/stock-prices?stock=GOOG&like=true")
            .end(function (err, res) {
            assert.equal(res.status, 200, "status must be 200");
            assert.isObject(res.body, "response should be an object");
            done();    
            });
        });
        
        
        test("Viewing the same stock and liking it again: GET request to /api/stock-prices/", function (done) {
            chai
            .request(server)
            .keepOpen()
            .get("/api/stock-prices?stock=GOOG&like=true")
            .end(function (err, res) {
            assert.equal(res.status, 200, "status must be 200");
            assert.isObject(res.body, "response should be an object");
            done();
            });
        });

        test("Viewing two stocks: GET request to /api/stock-prices/", function (done) {
            chai
            .request(server)
            .keepOpen()
            .get("/api/stock-prices?stock=GOOG&stock=MSFT")
            .end(function (err, res) {
            assert.equal(res.status, 200, "status must be 200");
            assert.isObject(res.body, "response should be an object");
            done();
            });
        });
    
    
        test("Viewing two stocks and liking them: GET request to /api/stock-prices/", function (done) {
            chai
            .request(server)
            .keepOpen()
            .get("/api/stock-prices?stock=GOOG&stock=MSFT&like=true")
            .end(function (err, res) {
            assert.equal(res.status, 200, "status must be 200");
            assert.isObject(res.body, "response should be an object");
            done();
            });
        });

    });