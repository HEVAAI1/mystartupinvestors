import { getUser, getUserCredits as apiGetUserCredits } from "@/lib/api";

export async function getUserCredits() {
  const { user, error: userError } = await getUser();

  if (userError || !user) {
    return 0;
  }

  const { credits } = await apiGetUserCredits();

  return credits ?? 0;
}
