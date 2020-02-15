const ProductsService = require("../src/Products/products-service");
const knex = require("knex");
const app = require("../src/app");
const fixtures = require("./products-fixtures");

describe(`Products service object`, function() {
  let db;
  before(() => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL
    });
    app.set("db", db);
  });

  after(() => db.destroy());

  /* beforeEach(() => db("products").truncate());

  afterEach(() => db("products").truncate()); */

  context(`Given 'products' has no data`, () => {
    it.skip(`getAllProducts() resolves an empty array`, () => {
      return ProductsService.getAllProducts(db).then(actual => {
        expect(actual).to.eql([]);
      });
    });
    it.skip(`responds with 200 and an empty list`, () => {
      return supertest(app)
        .get("/api/products")
        .expect(200, []);
    });
  });
  context(`Given 'products' has data`, () => {
    const testProducts = fixtures.makeProductsArray();

    it.skip("insert products", () => {
      return db.insert(testProducts).into("products");
    });
    it("responds with 200 and the specified product line", () => {
      const productId = 2;
      const expectedProduct = testProducts[productId-1];
      return supertest(app)
        .get(`/api/products/${productId}`)
        .expect(200)
        .expect(res => {
          expect(res.body.name).to.eql(expectedProduct.name)
        })
    });
  });
});