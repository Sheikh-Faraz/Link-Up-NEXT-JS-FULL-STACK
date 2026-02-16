import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

// Define the shape of your token payload
interface TokenPayload extends JwtPayload {
  userId: string;
}

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
};



// JS VERSION OF CODE
// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET;

// export const generateToken = (userId) => {
//   return jwt.sign({ userId }, JWT_SECRET, {
//     expiresIn: "7d",
//   });
// };

// export const verifyToken = (token) => {
//   try {
//     return jwt.verify(token, JWT_SECRET);
//   } catch {
//     return null;
//   }
// };
