import { APP_ROLE } from "@magnisale/db/migrate";
import { prepareTestDatabase, TEST_OWNER_DATABASE_URL } from "@magnisale/db/testing";
import { installQueues } from "@magnisale/queue";

export default async function setup(): Promise<void> {
  await prepareTestDatabase();
  await installQueues({ ownerUrl: TEST_OWNER_DATABASE_URL, appRole: APP_ROLE });
}
