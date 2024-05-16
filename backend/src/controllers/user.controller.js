import asyncHandler from "express-async-handler";

// @route   GET /user/me
// @access  Private
const me = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
  throw new Error("Internal Server Error");
});

export { me };
