/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";
const mongoose = require("mongoose");
mongoose.connect(
	process.env.DB,
	{ useNewUrlParser: true, useUnifiedTopology: true },
	() => {
		console.log("connected to DB");
	}
);

const Book = require("../models/Book");
const Comment = require("../models/Comment");

module.exports = function (app) {
	app
		.route("/api/books/")
		.get(async (req, res) => {
			//response will be array of book objects
			//json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
			try {
				let books = await Book.find();
				let response = [];
				for (let book of books) {
					response.push({
						_id: book._id,
						title: book.title,
						commentcount: (await Comment.find({ book_id: book._id })).length,
					});
				}
				res.json(response).status(200);
			} catch (error) {
				res.send(error.message).status(500);
			}
		})

		.post(async (req, res) => {
			//response will contain new book object including atleast _id and title
			if (!req.body.title)
				return res.send("missing required field title").status(400);
			let title = req.body.title;
			let book = new Book({
				title,
			});

			try {
				let result = await Book.create(book);
				res.json(result).status(200);
			} catch (error) {
				res.send(error.message).status(500);
			}
		})

		.delete(async (req, res) => {
			//if successful response will be 'complete delete successful'
			try {
				await Book.deleteMany({});
				await Comment.deleteMany({});
				res.send("complete delete successful").status(200);
			} catch (error) {
				res.send(error.message).status(500);
			}
		});

	app
		.route("/api/books/:_id")
		.get(async (req, res) => {
			//json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
			let _id = req.params._id;
			try {
				let result = (await Book.find({ _id }))[0];
				if (!result) return res.send("no book exists").status(400);
				let comments = (await Comment.find({ book_id: _id })).map(
					(comment) => comment.text
				);
				res.json({
					_id,
					title: result.title,
					comments,
				}).status(200);
			} catch (error) {
				res.send(error.message).status(500);
			}
		})

		.post(async (req, res) => {
			//json res format same as .get
			if (!req.body.comment)
				return res.send("missing required field comment").status(400);
			let book_id = req.params._id;
			let text = req.body.comment;
			let comment = new Comment({
				book_id,
				text,
			});

			try {
        let book = (await Book.find({ _id: book_id }))[0]
				if (!book) return res.send("no book exists").status(400);

				await Comment.create(comment);
        let comments = (await Comment.find({ book_id })).map(
					(comment) => comment.text
				);
				res.json({
          _id: book_id,
          comments,
          title: book.title,
          commentcount: comments.length
        }).status(200);
			} catch (error) {
				res.send(error.message).status(500);
			}
		})

		.delete(async (req, res) => {
			//if successful response will be 'delete successful'
			let _id = req.params._id;
			try {
				if (!(await Book.find({ _id }))[0])
					return res.send("no book exists").status(400);
				await Book.deleteOne({ _id });
				await Comment.deleteOne({ book_id: _id });
				res.send("delete successful").status(200);
			} catch (error) {
				res.send(error.message).status(500);
			}
		});
};
