const Review = require('../models/Review');

const dummyReviews = [
  {
    name: 'Pradum Kumar',
    role: 'MERN Stack Developer',
    rating: 4.8,
    comment: 'Avinash is an amazing developer to collaborate with! His skills in full-stack architecture and clean code are top-notch. He explains concepts clearly and implements robust solutions.',
    avatar_url: 'https://avatars.githubusercontent.com/u/10000001?v=4'
  },
  {
    name: 'Honey Atalkar',
    role: 'Software Engineering Student',
    rating: 4.2,
    comment: 'Collaborated with Avinash on a college project. His mastery over Data Structures and Algorithms is incredibly impressive. Always helpful, structured, and delivers high-performance logic!',
    avatar_url: 'https://avatars.githubusercontent.com/u/10000002?v=4'
  },
  {
    name: 'Parth Gupta',
    role: 'Frontend Developer',
    rating: 4.7,
    comment: 'Working with Avinash was an amazing experience! The clean APIs and backend integration he designed for the Dark Store made frontend development incredibly smooth.',
    avatar_url: 'https://avatars.githubusercontent.com/u/10000003?v=4'
  },
  {
    name: 'Om Singhal',
    role: 'Backend Developer',
    rating: 4.4,
    comment: 'Avinash has great system design and backend architecture skills. His MERN stack implementation for Spotify is secure, clean, and highly scalable.',
    avatar_url: 'https://avatars.githubusercontent.com/u/10000004?v=4'
  },
  {
    name: 'Aditya Kumar',
    role: 'Coding Mentor',
    rating: 4.2,
    comment: 'A brilliant student and developer. Avinash has solved over 590+ LeetCode problems and showcases great problem-solving aptitude and command over CS fundamentals.',
    avatar_url: 'https://avatars.githubusercontent.com/u/10000005?v=4'
  },
  {
    name: 'Akshat Sahu',
    role: 'Software Developer',
    rating: 4.9,
    comment: 'Excellent attention to detail. The UI responsiveness, glassmorphism aesthetics, and smooth page-turn micro-animations he built for this portfolio are absolutely stunning!',
    avatar_url: 'https://avatars.githubusercontent.com/u/10000006?v=4'
  }
];

/**
 * @desc    Get all reviews (seeds dummy reviews if collection is empty)
 * @route   GET /api/reviews
 * @access  Public
 */
async function getReviews(req, res, next) {
  try {
    let reviews = await Review.find().sort({ createdAt: -1 });
    
    // Seed dummy reviews if the database has none
    if (reviews.length === 0) {
      console.log('Seeding dummy reviews into the database...');
      await Review.insertMany(dummyReviews);
      reviews = await Review.find().sort({ createdAt: -1 });
    }
    
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Submit a new review
 * @route   POST /api/reviews
 * @access  Public
 */
async function submitReview(req, res, next) {
  try {
    const { name, role, rating, comment, avatar_url } = req.body;

    // 1. Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!role || !role.trim()) {
      return res.status(400).json({ success: false, message: 'Role or designation is required' });
    }
    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' });
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Review comment is required' });
    }

    if (name.length > 100) {
      return res.status(400).json({ success: false, message: 'Name cannot exceed 100 characters' });
    }
    if (role.length > 100) {
      return res.status(400).json({ success: false, message: 'Role cannot exceed 100 characters' });
    }
    if (comment.length > 1000) {
      return res.status(400).json({ success: false, message: 'Comment cannot exceed 1000 characters' });
    }

    // 2. Save to database
    const newReview = await Review.create({
      name: name.trim(),
      role: role.trim(),
      rating: Number(rating),
      comment: comment.trim(),
      avatar_url: avatar_url ? avatar_url.trim() : undefined
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! Thank you for your feedback.',
      data: newReview
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getReviews,
  submitReview
};
