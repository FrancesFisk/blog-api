const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {BlogPosts} = require('./models');

BlogPosts.create("How to learn code", "This is how you learn code. First, you learn it. Then, you do it", "Jane Doe");

router.get('/', (req, res) => {
    res.json(BlogPosts.get());
});

router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['title', 'content', 'author'];
    for(let i=0; i<requiredFields[i]; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`
            console.error(message);
            return res.status(400).send(message);
        }
    }

    const item = BlogPosts.create(req.body.title, req.body.content, req.body.author);
    res.status(201).json(item);
});

router.delete('/:id', (req, res) => {
    BlogPosts.delete(req.params.id);
    console.log(`Delete shopping list item \`${req.params.id}\``);
    res.status(204).end();
});

router.put('/:id', jsonParser, (req, res) => {
    const requiredFields = ['title', 'content', 'author'];
    // for (let i=0; i<requiredFields.length; i++) {
    //     const field = requiredFields[i];
    for(let field of requiredFields) {
        if(!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`
            console.error(message);
            return res.status(400).send(message);
        }
    }

    if (req.params.id !== req.body.id) {
        const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
        console.error(message);
        return res.status(400).send(message);
    }
    console.log(`Updating blog bost \`${req.params.id}\``);
    BlogPosts.update({
        id: req.params.id,
        title: req.body.title,
        content: req.body.content,
        author: req.body.author
    });
    res.status(204).end();
});

module.exports = router;