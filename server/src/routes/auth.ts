import { type Request, type Response, Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger.utils";
import { errorWrapper } from "../utils/error.util";
import { createToken } from "../utils/jwt.util";

const router: Router = Router();
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const URL = process.env.BACKEND_URL || "http://localhost:3000";
const FRONTEND_URL = process.env.CLIENT_URL || "http://localhost:5173";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${URL}/auth/google/callback`;
const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

router.get("/google", async (req: Request, res: Response): Promise<void> => {
  try {
    const authUrl = await oAuth2Client.generateAuthUrl({
      scope: ["profile", "email"],
      access_type: "offline",
    });
    res.json({ data: authUrl, error: null });
  } catch (error: unknown) {
    logger.error(`Google Auth Error: ${error}`);
    res.status(500).json({
      data: null,
      error: errorWrapper(error, "Failed to get auth url"),
    });
  }
});

router.get(
  "/google/callback",
  async (req: Request, res: Response): Promise<void> => {
    const { code } = req.query;
    if (!code) return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);

    try {
      const { tokens } = await oAuth2Client.getToken({
        code: code as string,
      });
      oAuth2Client.setCredentials(tokens);

      const userInfoResponse = await oAuth2Client.request({
        url: "https://www.googleapis.com/oauth2/v3/userinfo",
      });
      const { sub: email, name, picture }: any = userInfoResponse.data;

      const user = await prisma.user.upsert({
        where: { email: email! },
        update: {},
        create: {
          email: email!,
          name: name,
          image: picture,
        },
      });
      return res.redirect(
        `${FRONTEND_URL}/login?token=${createToken({
          email: user.email,
          name: user.name!,
          image: user.image!,
        })}`
      );
    } catch (error: unknown) {
      logger.error(`Google Auth Error: ${error}`);
      return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

// refresh token route

export default router;
