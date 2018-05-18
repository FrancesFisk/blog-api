const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

// this lets us use *expect* style syntax in our tests
// so we can do things like `expect(1 + 1).to.equal(2);`
// http://chaijs.com/api/bdd/
const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);


describe('Blog Posts', function() {

  // Before our tests run, we activate the server. Our `runServer`
  // function returns a promise, and we return the that promise by
  // doing `return runServer`. If we didn't return a promise here,
  // there's a possibility of a race condition where our tests start
  // running before our server has started.
  before(function() {
    return runServer();
  });

  // although we only have one test module at the moment, we'll
  // close our server at the end of these tests. Otherwise,
  // if we add another test module that also has a `before` block
  // that starts our server, it will cause an error because the
  // server would still be running from the previous tests.
  after(function() {
    return closeServer();
  });

  // test strategy:
  //   1. make request to `/blog-posts`
  //   2. inspect response object and prove has right code and have
  //   right keys in response object.
  it('should list blog posts on GET', function() {
    // for Mocha tests, when we're dealing with asynchronous operations,
    // we must either return a Promise object or else call a `done` callback
    // at the end of the test. The `chai.request(server).get...` call is asynchronous
    // and returns a Promise, so we just return it.
    return chai.request(app)
      .get('/blog-posts')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');

        // because we create three items on app load
        expect(res.body.length).to.be.at.least(1);
        // each item should be an object with key/value pairs
        // for `id`, `name` and `checked`.
        const expectedKeys = ['id', 'title', 'content', 'author', 'publishDate'];
        res.body.forEach(function(item) {
          expect(item).to.be.a('object');
          expect(item).to.include.keys(expectedKeys);
        });
      });
  });

  // test strategy:
  //  1. make a POST request with data for a new post
  //  2. inspect response object and prove it has right
  //  status code and that the returned object has an `id`
  it('should add a blog post on POST', function() {
    const newBlogPost = {
        title: 'Node.js in a nutshell', 
        content: 'Lorem ipsum hey hey hey', 
        author: 'Jane Dow'
    };

    //What is expectedKeys doing??
    const expectedKeys = ['id', 'publishDate'].concat(Object.keys(newBlogPost));

    return chai.request(app)
      .post('/blog-posts')
      .send(newBlogPost)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.all.keys(expectedKeys);
        expect(res.body.title).to.equal(newBlogPost.title);
        expect(res.body.content).to.equal(newBlogPost.content);
        expect(res.body.author).to.equal(newBlogPost.author)
      });
  });

    it('should error if POST missing expected values', function() {
        const badRequestData = {};
        return chai.request(app)
            .post('/blog-posts')
            .send(badRequestData)
            .catch(function(res) {
                expect(res).to.have.status(400);
            });
    });

  // test strategy:
  //  1. initialize some update data (we won't have an `id` yet)
  //  2. make a GET request so we can get an item to update
  //  3. add the `id` to `updateData`
  //  4. Make a PUT request with `updateData`
  //  5. Inspect the response object to ensure it
  //  has right status code and that we get back an updated
  //  item with the right data in it.
  it('should update blog posts on PUT', function() {
    return chai.request(app)
        .get('/blog-posts')
        .then(function(res) {
            const updatedPost = Object.assign(res.body[0], {
                title: 'How to Node.js',
                content: 'lorem ipsum ho ho ho',
                author: "Jane Doe"
            });
            return chai.request(app)
                .put(`/blog-posts/${res.body[0].id}`)
                .send(updatedPost)
                .then(function(res) {
                    expect(res).to.have.status(204);
                });
        });
  });

  // test strategy:
  //  1. GET blog posts so we can get ID of one
  //  to delete.
  //  2. DELETE a blog post and ensure we get back a status 204
  it('should delete blog posts on DELETE', function() {
    return chai.request(app)
      // first have to get so we have an `id` of blog post
      // to delete
      .get('/blog-posts')
      .then(function(res) {
        return chai.request(app)
          .delete(`/blog-posts/${res.body[0].id}`);
      })
      .then(function(res) {
        expect(res).to.have.status(204);
      });
  });
});