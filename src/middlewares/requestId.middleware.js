import { v4 as uuid } from "uuid";

const requestIdMiddleware = (req, res, next) => {

    const requestId = uuid();

    req.requestId = requestId;

    res.setHeader("X-Request-Id", requestId);

    next();

};

export default requestIdMiddleware;