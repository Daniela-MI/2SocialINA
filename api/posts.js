import express from 'express';
import auth from '../middleware/auth.js';
import Post from '../models/post.js';
import User from '../models/user.js';

import { check, validationResult } from 'express-validator';

const router = express.Router();

router.post(
	'/',
	[auth, check('text', 'Post content is required').not().isEmpty()],
	async (request, response) => {
		const errors = validationResult(request);
		if (!errors.isEmpty()) {
			return response.status(400).json({ errors: errors.array() });
		}

		try {
			const user = User.findById(request.user.id);
			const newPost = new Post({
				text: request.body.text,
				name: user.name,
				user: request.user.id,
			});

			const post = await newPost.save();
			response.json(post);
		} catch (error) {
			response.status(500).send('Server error!');
		}
	}
);

router.get('/', auth, async (request, response) => {
	try {
		const posts = await Post.find();
		response.json(posts);
	} catch (err) {
		response.status(500).send('Server error!');
	}
});

router.get('/:post_id', auth, async (request, response) => {
	// sort the post desceding by added date
	try {
		const post = await Post.findById(request.params.post_id);

		if (!post) {
			return response.status(404).json({ msg: 'Post not found' });
		}

		response.json(post);
	} catch (error) {
		console.error(error.message);
		// check if the id is in correct format
		if (error.kind == 'ObjectId') {
			return response.status(404).json({ msg: 'Post not found' });
		}
		response.status(500).send('Server error');
	}
});

router.delete('/:post_id', auth, async (request, response) => {
	// sort the post desceding by added date
	try {
		const post = await Post.findById(request.params.post_id);

		// check if the user that delete the post is the owner
		// post.user is not of type string, but ObjectId
		if (post.user.toString() !== request.user.id) {
			return response
				.status(401)
				.json({ msg: 'User not authorized to delete the post' });
		}

		await post.remove();

		response.json({ msg: 'Post removed' });
	} catch (error) {
		console.error(error.message);
		// check if the id is in correct format
		if (error.kind == 'ObjectId') {
			return response.status(404).json({ msg: 'Post not found' });
		}
		response.status(500).send('Server error');
	}
});

router.put('/like/:post_id', auth, async (request, response) => {
	try {
		const post = await Post.findById(request.params.post_id);
		// a user can like only once a post
		if (
			post.likes.filter((like) => like.user.toString() == request.user.id)
				.length > 0
		) {
			return response.status(400).json({ msg: 'Post already liked' });
		}

		post.likes.unshift({ user: request.user.id });
		await post.save();

		return response.json(post.likes);
	} catch (error) {
		console.log(error.message);
		response.status(500).send('Server error');
	}
});

router.put('/unlike/:post_id', auth, async (request, response) => {
	try {
		const post = await Post.findById(request.params.post_id);
		// a user can like only once a post
		if (
			post.likes.filter((like) => like.user.toString() == request.user.id)
				.length === 0
		) {
			return response.status(400).json({ msg: 'Post has not been liked yet' });
		}

		// get the remove index
		const removeIndex = post.likes
			.map((like) => like.user.toString())
			.indexOf(request.user.id);

		post.likes.splice(removeIndex, 1);

		await post.save();

		return response.json(post.likes);
	} catch (error) {
		console.log(error.message);
		response.status(500).send('Server error');
	}
});

router.post(
	'/comments/:post_id',
	[auth, [check('text', 'Comment content is required').not().isEmpty()]],
	async (request, response) => {
		const errors = validationResult(request);
		if (!errors.isEmpty()) {
			return response.status(400).json({ errors: errors.array() });
		}

		try {
			const user = await User.findById(request.user.id).select('-password');
			const post = await Post.findById(request.params.post_id);
			const newComment = {
				text: request.body.text,
				name: user.name,
				avatar: user.avatar,
				user: request.user.id,
			};

			post.comments.unshift(newComment);
			await post.save();

			response.json(post.comments);
		} catch (error) {
			console.error(error.message);
			response.status(500).send('');
		}
	}
);

router.delete(
	'/comments/:post_id/:comment_id',
	auth,
	async (request, response) => {
		try {
			const post = await Post.findById(request.params.post_id);

			// get the comment from the post
			const comment = post.comments.find(
				(comment) => comment.id === request.params.comment_id
			);

			if (!comment) {
				return response.status(404).json({ msg: 'Comment does not exists' });
			}

			// check user that deletes the comment is the owner
			if (comment.user.toString() !== request.user.id) {
				return response
					.status(401)
					.json({ msg: 'User is not authorized to delete the comment' });
			}

			// get the remove index
			const removeIndex = post.comments
				.map((comment) => comment.user.toString())
				.indexOf(request.user.id);

			post.comments.splice(removeIndex, 1);

			await post.save();

			return response.json(post.comments);
		} catch (error) {
			console.error(error.message);
			response.status(500).send('Server error');
		}
	}
);

export default router;
