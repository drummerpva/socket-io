var express = require("express");
var router = express.Router();
var path = require("path");
const _ = require("lodash");

function indexRouter({ db, io }) {
  io.on("connect", socket => {
    if (socket.handshake.query.match) {
      console.log(
        "Usuario conectado na partida: ",
        socket.handshake.query.match
      );
      socket.join("match-" + socket.handshake.query.match);
    } else {
      console.log("Novo cliente conectado!");
    }
  });

  /* GET home page. */
  router.get("/", function(req, res, next) {
    const matches = db.get("matches").value();
    res.render("index", { matches });
  });

  router.get("/match/:id", function(req, res, next) {
    const matches = db.get("matches").value();
    const match = db.get("matches['" + req.params.id + "']").value();
    match.bids = _.orderBy(match.bids, ["half", "time"], ["desc", "desc"]);
    const supportersA = match["team-a"].supporters;
    const supportersB = match["team-b"].supporters;
    const total = supportersA + supportersB;
    const porcentagem = {
      teamA: 50,
      teamB: 50
    };
    if (total > 0) {
      porcentagem.teamA = Math.trunc((supportersA / total) * 100);
      porcentagem.teamB = Math.trunc((supportersB / total) * 100);
    }
    match.porcentagem = porcentagem;

    res.render("match", { matches, match, id: req.params.id });
  });

  router.post("/match/:id/supporters", (req, res) => {
    const match = db.get("matches['" + req.params.id + "']").value();
    if (req.body.team === "a") {
      const newVal = match["team-a"].supporters + 1;
      db.set(
        "matches[" + req.params.id + "].team-a.supporters",
        newVal
      ).write();
    }
    if (req.body.team === "b") {
      const newVal = match["team-b"].supporters + 1;
      db.set(
        "matches[" + req.params.id + "].team-b.supporters",
        newVal
      ).write();
    }
    const supportersA = match["team-a"].supporters;
    const supportersB = match["team-b"].supporters;
    const total = supportersA + supportersB;
    const porcentagem = {
      teamA: 50,
      teamB: 50
    };
    if (total > 0) {
      porcentagem.teamA = Math.trunc((supportersA / total) * 100);
      porcentagem.teamB = Math.trunc((supportersB / total) * 100);
    }
    io.to("match-" + req.params.id).emit("supporters", porcentagem);

    res.send({ ok: true });
  });

  return router;
}

module.exports = indexRouter;
