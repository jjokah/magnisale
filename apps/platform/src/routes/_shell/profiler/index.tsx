import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "../../../modules/profiler/ProfilePage";

export const Route = createFileRoute("/_shell/profiler/")({ component: ProfilePage });
