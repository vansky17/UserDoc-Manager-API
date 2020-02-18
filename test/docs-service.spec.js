const DocumentsService = require("../src/Documents/documents-service");
const knex = require("knex");
const app = require("../src/app");
const fixturesDocs = require("./docs-fixtures");
const fixturesProducts = require("./products-fixtures");

describe(`Docs service object`, function() {
  let db;
  before(() => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL
    });
    app.set("db", db);
  });

  after(() => db.destroy());
  
  before('clean the documents table', () =>
		db.raw('TRUNCATE documents, products RESTART IDENTITY CASCADE')
  );
  afterEach('cleanup', () =>
    db.raw('TRUNCATE documents, products RESTART IDENTITY CASCADE')
  );
  
  /*  */
  describe(`GET /api/docs`, () => {
		context(`Given no docs`, () => {
			it(`responds with 200 and an empty list`, () => {
				return supertest(app)
					.get('/api/docs')
					.expect(200, []);
			});
		});

		context('Given there are docs in the database', () => {
			const testProduct = fixturesProducts.makeProductsArray();
			const testDoc = fixturesDocs.makeDocsArray();

			beforeEach('insert doc', () => {
				return db
					.into('products')
					.insert(testProduct)
					.then(() => {
						return db.into('documents').insert(testDoc);
					});
			});

			it('responds with 200 and all of the docs', () => {
				return supertest(app)
					.get('/api/docs')
					.expect(res => {
						expect(res.body[0].name).to.eql(testDoc[0].name);
						expect(res.body[0]).to.have.property('id');
					});
			});
		});

		
	});
});




/* it("responds with 200 and the specified doc", () => {
  const docId = 2;
  const expectedDoc = testDocs[docId-1];
  return supertest(app)
    .get(`/api/docs/${docId}`)
    .expect(200)
    .expect(res => {
      expect(res.body.name).to.eql(expectedDoc.name)
      expect(res.body.partnum).to.eql(expectedDoc.partnum) 
      expect(res.body.vernum).to.eql(expectedDoc.vernum)
      expect(res.body.formattype).to.eql(expectedDoc.formattype)
      expect(res.body.reldate).to.eql(expectedDoc.reldate)
      expect(res.body.author).to.eql(expectedDoc.author)
      expect(res.body.productid).to.eql(expectedDoc.productid)
      expect(res.body.descr).to.eql(expectedDoc.descr)
      expect(res.body.path).to.eql(expectedDoc.path)
      expect(res.body.id).to.eql(expectedDoc.id)
    })
}); */