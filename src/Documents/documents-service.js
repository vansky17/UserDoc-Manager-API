const DocumentsService = {
  getAllDocs(knex) {
    return knex.select("*").from("documents");
  },
  getById(knex, id) {
    return knex
      .from("documents")
      .select("*")
      .where("id", id)
      .first();
  },
  insertDoc(knex, newDoc) {
    return knex
      .insert(newDoc)
      .into("documents")
      .returning("*")
      .then(rows => {
        return rows[0];
      });
  },
  deleteDoc(knex, id) {
    return knex("documents")
      .where({ id })
      .delete();
  },
  updateDoc(knex, id, newDocFields) {
    return knex("documents")
      .where({ id })
      .update(newDocFields);
  }
};
module.exports = DocumentsService;