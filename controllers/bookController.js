const Book = require('../models/bookModel');


exports.addBook = async (req, res, next) => {
    try {
        console.log(req.body.name);
        const book = await Book.create({
            name: req.body.name,
            author: req.body.author
        });

        res.status(201).json({
            status: 'success',
            data: {
                book
            }
        });

    } catch (err) {
        next(err);
    }
};

exports.getAllBooks = async (req, res, next) => {
    try {
        const book = await Book.find();

        res.status(200).json({
            status: 'success',
            data: {
                book
            }
        });

    } catch (err) {
        next(err);
    }
};
