const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
	book_id: {
		type: String,
		required: true,
	},
	text: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model("Comment", commentSchema);
