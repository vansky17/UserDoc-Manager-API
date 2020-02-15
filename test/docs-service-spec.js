const DocsService = require("../src/Documents/documents-service");
const knex = require("knex");
const app = require("../src/app");
const fixtures = require("./docs-fixtures");

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

  beforeEach(() => db("documents").truncate());

  afterEach(() => db("documents").truncate());

  context(`Given 'documents' has no data`, () => {
    it.skip(`getAllDocs() resolves an empty array`, () => {
      return DocumentsService.getAllDocs(db).then(actual => {
        expect(actual).to.eql([]);
      });
    });
    it(`responds with 200 and an empty list`, () => {
      return supertest(app)
        .get("/api/docs")
        .expect(200, []);
    });
  });
  context(`Given 'documents' has data`, () => {
    const testDocs = fixtures.makeDocsArray();

    it("insert documents", () => {
      return db.insert(testDocs).into("documents");
    });
    it.skip("responds with 200 and the specified doc", () => {
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
    });
   
  });
  
});