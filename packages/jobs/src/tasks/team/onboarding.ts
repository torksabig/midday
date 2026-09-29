import { onboardTeamSchema } from "@jobs/schema";
import { shouldSendEmail } from "@jobs/utils/check-team-plan";
import {
  postOnboardTeam,
  teamJobsDelegationTarget,
} from "@jobs/utils/team-jobs-delegate";
import { resend } from "@jobs/utils/resend";
import { TrialActivationEmail } from "@midday/email/emails/trial-activation";
import { WelcomeEmail } from "@midday/email/emails/welcome";
import { render } from "@midday/email/render";
import { createClient } from "@midday/supabase/job";
import { logger, schemaTask, wait } from "@trigger.dev/sdk";

type OnboardUser = {
  id: string;
  full_name: string | null;
  email: string | null;
  team_id: string | null;
};

async function loadOnboardUser(userId: string): Promise<OnboardUser> {
  const target = teamJobsDelegationTarget("onboard-team");
  if (target) {
    try {
      const body = await postOnboardTeam({ userId }, target);
      if (!body.user) {
        throw new Error("User not found");
      }
      return {
        id: body.user.id,
        full_name: body.user.fullName,
        email: body.user.email,
        team_id: body.user.teamId,
      };
    } catch (error) {
      if (target.mode === "replacement") {
        throw error;
      }
      logger.warn("onboard-team rust failed; falling back to Supabase", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const supabase = createClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("id, full_name, email, team_id")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    team_id: user.team_id,
  };
}

/** Fresh plan + bank_connections check after wait.for (counts must not be stale). */
async function shouldSendTrialActivation(
  userId: string,
  teamId: string,
): Promise<boolean> {
  const target = teamJobsDelegationTarget("onboard-team");
  if (target) {
    try {
      const body = await postOnboardTeam({ userId }, target);
      return Boolean(
        body.shouldSendTrialEmail && body.bankConnectionCount === 0,
      );
    } catch (error) {
      if (target.mode === "replacement") {
        throw error;
      }
      logger.warn(
        "onboard-team rust trial check failed; falling back to Supabase",
        {
          error: error instanceof Error ? error.message : String(error),
        },
      );
    }
  }

  if (!(await shouldSendEmail(teamId))) {
    return false;
  }

  const supabase = createClient();
  const { count } = await supabase
    .from("bank_connections")
    .select("id", { count: "exact", head: true })
    .eq("team_id", teamId);

  return !count || count === 0;
}

export const onboardTeam = schemaTask({
  id: "onboard-team",
  schema: onboardTeamSchema,
  maxDuration: 300,
  run: async ({ userId }) => {
    const user = await loadOnboardUser(userId);

    if (!user.full_name || !user.email) {
      throw new Error("User data is missing");
    }

    const [firstName, lastName] = user.full_name.split(" ") ?? [];

    await resend.contacts.create({
      email: user.email,
      firstName,
      lastName,
      unsubscribed: false,
      audienceId: process.env.RESEND_AUDIENCE_ID!,
    });

    await resend.emails.send({
      to: user.email,
      subject: "Welcome to Midday",
      from: "Pontus from Midday <pontus@midday.ai>",
      html: await render(
        WelcomeEmail({
          fullName: user.full_name,
        }),
      ),
    });

    if (!user.team_id) {
      logger.info("User has no team, skipping onboarding");
      return;
    }

    // Day 3: Activation nudge — encourage bank connection
    await wait.for({ days: 3 });

    if (await shouldSendTrialActivation(userId, user.team_id)) {
      await resend.emails.send({
        from: "Pontus from Midday <pontus@midday.ai>",
        to: user.email,
        subject: "Connect your bank to see the full picture",
        html: await render(
          TrialActivationEmail({ fullName: user.full_name }),
        ),
      });
    }
  },
});
