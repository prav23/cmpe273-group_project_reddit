const Member = require("../models/member");
const User = require("../models/User");
const Community = require("../models/community");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const kafka = require("../kafka/client");
const {
  createValidation,
  createManyValidation,
  updateValidation,
} = require("../validation/memberValidation");

exports.create = (req, res) => {
  const error = createValidation(req.body);
  if (error) {
    return res.status(400).send({
      message: "Invalid payload!" + error.toString(),
    });
  }

  const newMember = new Member({ ...req.body });
  newMember.save((saveError, data) => {
    if (saveError) {
      return res.status(400).send({
        message: saveError.toString(),
      });
    }

    return res.status(200).send({
      data,
      message: "Invite created successfully",
    });
  });
};

exports.createMany = (req, res) => {
  const error = createManyValidation(req.body);
  if (error) {
    return res.status(400).send({
      message: "Invalid payload!" + error.toString(),
    });
  }

  /* let msg = {
    route: "create",
    body: req.body,
  };
  kafka.make_request("invite", msg, (err, results) => {
    if (err) {
      return res.status(err.status).send({
        message: err.data,
      });
    }

    return res.status(results.status).send({
      data: results.data,
      message: "Invites created successfully",
    });
  }); */

  Member.insertMany(req.body, (err, data) => {
    if (err) {
      return res.status(400).send({
        message: err.toString(),
      });
    }

    return res.status(200).send({
      data,
      message: "Invites created successfully",
    });
  });
};

exports.getAllNewInvitesForUser = (req, res) => {
  if (!req.params.userId) {
    return res.status(400).send({
      message: "Id params missing",
    });
  }

  /* let msg = {
      route: "get_new_invites_for_user",
      params: req.params,
    };
    kafka.make_request("invite", msg, (err, results) => {
      if (err) {
        return res.status(err.status).send({
          message: err.data,
        });
      }
  
      return res.status(results.status).json(results.data);
    }); */

  Member.aggregate(
    [
      {
        $match: {
          userId: ObjectId(req.params.userId),
          status: "new",
        },
      },
      {
        $lookup: {
          from: Community.collection.name,
          localField: "groupId",
          foreignField: "_id",
          as: "community_info",
        },
      },
      {
        $unwind: {
          path: "$community_info",
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $project: {
          userId: 1,
          communityId: 1,
          "community_info.name": 1,
          "community_info.photo": 1,
          status: 1,
          createdAt: 1,
        },
      },
    ],
    (err, data) => {
      if (err) {
        return res.status(400).send({
          message: err.toString(),
        });
      }

      return res.status(200).json(data);
    }
  );
};

exports.getAllInvitesForUser = (req, res) => {
  if (!req.params.userId) {
    return res.status(400).send({
      message: "Id params missing",
    });
  }

  Member.find({ userId: req.params.userId }, (err, data) => {
    if (err) {
      return res.status(400).send({
        message: saveError.toString(),
      });
    }

    return res.status(200).json(data);
  });
};

exports.updateInvite = (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({
      message: "Id params missing",
    });
  }

  const error = updateValidation(req.body);
  if (error) {
    return res.status(400).send({
      message: "Invalid payload!" + error.toString(),
    });
  }

  let msg = {
    route: "update",
    params: req.params,
    body: req.body,
  };
  kafka.make_request("invite", msg, (err, results) => {
    if (err) {
      return res.status(err.status).send({
        message: err.data,
      });
    }

    return res.status(results.status).send({
      message: "Invite updated successfully",
    });
  });

  /* Invite.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      (err, data) => {
        if (err) {
          return res.status(400).send({
            message: saveError.toString(),
          });
        }
  
        return res.status(200).send({
          message: "Invite update successfully",
        });
      }
    ); */
};
