function makeDocsArray() {
  return [
    {
      id: 1,
      name: "Documnet one",
      productid: 2,
      descr: "This is the description for doc one",
      reldate: "2019-11-08T02:17:20.397Z",
      vernum: 1,
      formattype: "PDF",
      author: "John doe",
      path: "google.com"
    },
    {
      id: 2,
      name: "Documnet two",
      productid: 2,
      descr: "This is the description for doc two",
      reldate: "2019-11-08T02:17:20.397Z",
      vernum: 1,
      formattype: "PDF",
      author: "John doe",
      path: "google.com"
    },
    {
      id: 3,
      name: "Documnet three",
      productid: 2,
      descr: "This is the description for doc three",
      reldate: "2019-11-08T02:17:20.397Z",
      vernum: 1,
      formattype: "PDF",
      author: "John doe",
      path: "google.com"
    } 
  ];
}

function makeMaliciousDoc() {
  const maliciousDoc = {
    id: 112,
    name: 'Danger!!! <script>alert("xss");</script>',
    productid: 72,
    descr: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    reldate: "2019-11-08T02:17:20.397Z",
    vernum: 1,
    formattype: "PDF",
    author: "John doe",
    path: "google.com"
  };
  const expectedDoc = {
    ...maliciousDoc,
    name:
      'Danger!!! &lt;script&gt;alert("xss");&lt;/script&gt;',
      descr: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
      reldate: "2019-11-08T02:17:20.397Z",
      vernum: 1,
      formattype: "PDF",
      author: "John doe",
      path: "google.com"
  };
  return {
    maliciousDoc,
    expectedDoc
  };
}

module.exports = {
  makeDocsArray,
  makeMaliciousDoc
};
