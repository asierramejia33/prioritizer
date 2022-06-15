const router = require("express").Router();
const Sequelize = require("sequelize");
const db = require("../../config/connection.js");
// Andres --> added/changed
// const User = require("../../models/User.js");
const { User } = require('../../models');

// Get all users
router.get("/", async(req, res) => {
    try {
        User.findAll().then((userData) => {
            res.json(userData);
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

// find one user by its `id` value
router.get("/:id", (req, res) => {
    try {
        User.findOne({
            where: {
                id: req.params.id,
            },
        }).then((userData) => {
            res.json(userData);
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

// // create a new user // Andres --> added/changed
// router.post("/:name", (req, res) => {
//   User.create({
//     name: req.params.name,
//   })
//     .then((newUser) => {
//       // Send the newly created row as a JSON object
//       res.json(newUser);
//     })
//     .catch((err) => {
//       res.json(err);
//     });
// });

// update a user's vote count -1 when vote is cast / by user `id` value
router.put("/castVote/:id", (req, res) => {
    User.update({
            votes_remaining: Sequelize.literal("User.votes_remaining - 1"),
        }, {
            where: {
                id: req.params.id,
            },
        })
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => res.json(err));
});

// CREATE new user // Andres --> added/changed
router.post('/', async(req, res) => {
    try {
        const dbUserData = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        });
        req.session.save(() => {
            req.session.loggedIn = true;
            res.status(200).json(dbUserData);
        });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// Login // Andres --> added/changed
router.post('/login', async(req, res) => {
    try {
        const dbUserData = await User.findOne({
            where: {
                email: req.body.email,
            },
        });
        if (!dbUserData) {
            res
                .status(400)
                .json({ message: 'Incorrect email or password. Please try again!' });
            return;
        }
        const validPassword = await dbUserData.checkPassword(req.body.password);
        if (!validPassword) {
            res
                .status(400)
                .json({ message: 'Incorrect email or password. Please try again!' });
            return;
        }
        req.session.save(() => {
            req.session.loggedIn = true;

            res
                .status(200)
                .json({ user: dbUserData, message: 'You are now logged in!' });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// Logout // Andres --> added/changed
router.post('/logout', (req, res) => {
    if (req.session.loggedIn) {
        req.session.destroy(() => {
            res.status(204).end();
        });
    } else {
        res.status(404).end();
    }
});

module.exports = router;