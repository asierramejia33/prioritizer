const router = require("express").Router();
const Proposal = require("../models/Proposal");
const withAuth = require('../utils/auth');
// route to get all Proposals
// router.get('/', async (req, res) => {

// const proposalData = await Proposal.findAll().catch((err) => {
//     res.json(err);
//   });
//     const proposals = proposalData.map((proposal) => proposal.get({ plain: true }));
//     res.render('homepage', { proposals });
//   });

router.get("/", withAuth, async(req, res) => {
    try {
        // Get all proposal
        const proposalData = await Proposal.findAll({});

        // Serialize data so the template can read it
        const proposals = proposalData.map((proposal) =>
            proposal.get({ plain: true })
        );

        // Pass serialized data and session flag into template
        res.render("homepage", {
            proposals,
            loggedIn: req.session.loggedIn,
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get create proposal page
router.get("/create-proposal", withAuth, (req, res) => {
    res.render("create-proposal", {
        loggedIn: req.session.loggedIn,
    });
});

// Get proposals page
// router.get("/proposals", (req, res) => {
//   res.render("proposals", {
//     logged_in: true,
//   });
// });

router.get("/proposals", withAuth, async(req, res) => {
    try {
        // Get all proposal
        const proposalData = await Proposal.findAll({});

        // Serialize data so the template can read it
        const proposals = proposalData.map((proposal) =>
            proposal.get({ plain: true })
        );

        // Pass serialized data and session flag into template
        res.render("proposals", {
            proposals,
            loggedIn: req.session.loggedIn,
        });
    } catch (err) {
        res.status(500).json(err);
    }
});





// Get votes page
router.get("/votes", withAuth, (req, res) => {
    res.render("votes", {
        loggedIn: req.session.loggedIn,
    });
});

router.get("/results", withAuth, (req, res) => {
    res.render("results", {
        loggedIn: req.session.loggedIn,
    });
});

router.get('/login', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/');
        return;
    }

    res.render('login');
});
module.exports = router;