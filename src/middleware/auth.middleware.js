const { verifyToken } = require("../lib/Jwt");

const verifyAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const cookie = req.headers.cookie;

  try {
    if (!authHeader && !cookie) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (authHeader) {
      const token = authHeader.split(" ")[1];
      const decoded = verifyToken(token);
      req.user = decoded;
    } else if (cookie) {
      const tokenRegx = /(?<=token=)[\w-]+\.[\w-]+\.[\w-]+/;
      const token = cookie.match(tokenRegx)[0];
      const decoded = verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    console.log("error from verifyAuth", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { verifyAuth };
