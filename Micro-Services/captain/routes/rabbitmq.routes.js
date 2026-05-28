const controller =
require("../controllers/rabbitmq.controller");

module.exports = {

   "isBlackList-captain":
      controller.isBlackListCaptain,

   "get-captain":
      controller.getCaptain,

   "notification-ride-ended":
      controller.notificationRideEnded,

   "get-captainInTheRadius":
      controller.getCaptainInTheRadius,

   "captain-update":
      controller.updateCaptain,

   "ride-cancelled":
      controller.rideCancelled,

   "CAPTAIN_CREATED":
      controller.createCaptain
};