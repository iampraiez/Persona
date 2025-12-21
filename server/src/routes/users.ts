import { type Response, Router } from "express";
import { prisma } from "../lib/prisma";
import { errorWrapper } from "../utils/error.util";
import { logger } from "../utils/logger.utils";

const router: Router = Router();

router.get("/", async (req, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.user },
      select: {
        events: true,
        goals: true,
        notifications: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found", error: null });
      return;
    }

    res.json({ data: user, error: null });
  } catch (error: unknown) {
    res
      .status(500)
      .json({ data: null, error: errorWrapper(error, "Failed to get user") });
  }
});

router.put("/", async (req, res) => {
  try {
    const { name, image } = req.body;
    const dataToUpdate = {
      ...(name !== undefined && { name }),
      ...(image !== undefined && { image }),
    };
    await prisma.user.update({
      where: { email: req.user },
      data: dataToUpdate,
    });

    res.json({ data: "User updated", error: null });
  } catch (error) {
    logger.error(`Error updating user: ${error}`);
    res.status(500).json({
      data: null,
      error: errorWrapper(error, "Failed to update user"),
    });
  }
});

export default router;
