// the main app file
import express from "express";
import authenticate from "./authentication"; // middleware for doing authentication
import permit from "./authorization"; // middleware for checking if user's role is permitted to make request
import loadDb from "./loadDb"; // dummy middleware to load db (sets request.db)

const app = express(),
    api = express.Router();

// first middleware will setup db connection
app.use(loadDb);

// authenticate each request
// will set `request.user`
app.use(authenticate);

// setup permission middleware,
// check `request.user.role` and decide if ok to continue 
app.use("/api/private", permit("admin"));
app.use(["/api/foo", "/api/bar"], permit("owner", "employee"));

// setup requests handlers
api.get("/private/whatever", (req, res) => res.json({ whatever: true }));
api.get("/foo", (req, res) => res.json({ currentUser: req.user }));
api.get("/bar", (req, res) => res.json({ currentUser: req.user }));

// setup permissions based on HTTP Method

// account creation is public
api.post("/account", (req, res) => res.json({ message: "created" }));

// account update & delete (PATCH & DELETE) are only available to account owner
api.patch("/account", permit('owner'), (req, res) => res.json({ message: "updated" }));
api.delete("/account", permit('owner'), (req, res) => res.json({ message: "deleted" }));

// viewing account "GET" available to account owner and account member
api.get("/account", permit('owner', 'employee'), (req, res) => res.json({ currentUser: req.user }));

// mount api router
app.use("/api", api);

// start 'er up
app.listen(process.env.PORT || 3000);