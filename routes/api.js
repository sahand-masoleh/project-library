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
				res.status(200).json(response);
			} catch (error) {
				res.status(500).send(error.message);
			}
		})

		.post(async (req, res) => {
			//response will contain new book object including atleast _id and title
			if (!req.body.title)
				return res.status(400).send("missing required field title");
			let title = req.body.title;
			let book = new Book({
				title,
			});

			try {
				let result = await Book.create(book);
				res.status(200).json(result);
			} catch (error) {
				res.status(500).send(error.message);
			}
		})

		.delete(async (req, res) => {
			//if successful response will be 'complete delete successful'
			try {
				await Book.deleteMany({});
				await Comment.deleteMany({});
				res.status(200).send("complete delete successful");
			} catch (error) {
				res.status(500).send(error.message);
			}
		});

	app
		.route("/api/books/:_id")
		.get(async (req, res) => {
			//json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
			let _id = req.params._id;
			try {
				let result = (await Book.find({ _id }))[0];
				if (!result) return res.status(400).send("no book exists");
				let comments = (await Comment.find({ book_id: _id })).map(
					(comment) => comment.text
				);
				res.status(200).json({
					_id,
					title: result.title,
					comments,
				});
			} catch (error) {
				res.status(500).send(error.message);
			}
		})

		.post(async (req, res) => {
			//json res format same as .get
			if (!req.body.comment)
				return res.status(400).send("missing required field comment");
			let book_id = req.params._id;
			let text = req.body.comment;
			let comment = new Comment({
				book_id,
				text,
			});

			try {
				if (!(await Book.find({ _id: book_id }))[0])
					return res.status(400).send("no book exists");
				let result = await Comment.create(comment);
				res.status(200).json(result);
			} catch (error) {
				res.status(500).send(error.message);
			}
		})

		.delete(async (req, res) => {
			//if successful response will be 'delete successful'
			let _id = req.params._id;
			try {
				if (!(await Book.find({ _id }))[0])
					return res.status(400).send("no book exists");
				await Book.deleteOne({ _id });
				await Comment.deleteOne({ book_id: _id });
				res.status(200).send("delete successfull");
			} catch (error) {
				res.status(500).send(error.message);
			}
		});
};
